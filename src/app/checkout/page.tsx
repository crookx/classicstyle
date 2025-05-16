
'use client';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useCart, type DisplayCartItem } from '@/contexts/CartContext';
import Image from 'next/image';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Loader2, AlertTriangle } from 'lucide-react';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { decrementStockForOrderAction } from '@/lib/actions/orderActions';
import { createPaymentIntentAction } from '@/lib/actions/paymentActions';

import { loadStripe, StripeElementsOptions } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

const shippingSchema = z.object({
  email: z.string().email({ message: "Invalid email address." }),
  firstName: z.string().min(1, { message: "First name is required." }),
  lastName: z.string().min(1, { message: "Last name is required." }),
  address: z.string().min(1, { message: "Address is required." }),
  apartment: z.string().optional(),
  city: z.string().min(1, { message: "City is required." }),
  country: z.string().min(1, { message: "Country is required." }),
  postalCode: z.string().min(1, { message: "Postal code is required." }),
  phone: z.string().optional(),
});

const checkoutSchema = shippingSchema;

interface OrderDetailsForEmail {
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  items: DisplayCartItem[];
  totalAmount: number;
  shippingAddress: {
    firstName: string;
    lastName: string;
    address: string;
    apartment?: string;
    city: string;
    country: string;
    postalCode: string;
  };
  estimatedDelivery?: string;
}

async function initiateOrderConfirmationEmail(orderDetails: OrderDetailsForEmail) {
  console.log('--- SIMULATING INITIATION OF ORDER CONFIRMATION EMAIL ---');
  console.log('Order Details Prepared:', JSON.stringify(orderDetails, null, 2));
  // In a real app, you might call a Firebase Cloud Function here:
  // try {
  //   const response = await fetch('/api/send-order-confirmation', { // Or your Cloud Function HTTP endpoint
  //     method: 'POST',
  //     headers: { 'Content-Type': 'application/json' },
  //     body: JSON.stringify(orderDetails),
  //   });
  //   if (!response.ok) console.error('Failed to trigger order confirmation email:', await response.text());
  //   else console.log('Order confirmation email trigger successful.');
  // } catch (error) {
  //   console.error('Error triggering order confirmation email:', error);
  // }
  console.log('--- END OF ORDER CONFIRMATION SIMULATION ---');
}

function CheckoutForm() {
  const { cart, totalPrice, totalItems, clearCart } = useCart();
  const { toast } = useToast();
  const { currentUser, loading: authLoading } = useAuth();
  const router = useRouter();
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [paymentError, setPaymentError] = useState<string | null>(null);

  const stripe = useStripe();
  const elements = useElements();

  const form = useForm<z.infer<typeof checkoutSchema>>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      email: '',
      firstName: '',
      lastName: '',
      address: '',
      apartment: '',
      city: '',
      country: 'Kenya',
      postalCode: '',
      phone: '',
    },
  });

  useEffect(() => {
    if (currentUser && !form.getValues('email')) {
      form.setValue('email', currentUser.email || '');
      form.setValue('firstName', currentUser.displayName?.split(' ')[0] || '');
      form.setValue('lastName', currentUser.displayName?.split(' ').slice(1).join(' ') || '');
    }
  }, [currentUser, form]);

  useEffect(() => {
    if (totalPrice > 0 && currentUser) {
      createPaymentIntentAction({ 
        amount: totalPrice, 
        currency: 'kes',
        customerEmail: currentUser.email || undefined,
        customerName: `${form.getValues('firstName')} ${form.getValues('lastName')}`.trim() || undefined,
      })
        .then(data => {
          if (data.success && data.clientSecret) {
            setClientSecret(data.clientSecret);
          } else {
            console.error("Failed to create PaymentIntent:", data.error);
            setPaymentError(data.error || "Could not initialize payment.");
            toast({ title: "Payment Error", description: data.error || "Could not initialize payment. Please try refreshing.", variant: "destructive"});
          }
        })
        .catch(err => {
          console.error("Error creating PaymentIntent:", err);
          setPaymentError("Could not initialize payment. Please try refreshing.");
          toast({ title: "Payment Error", description: "Could not initialize payment. Please try refreshing.", variant: "destructive"});
        });
    }
  }, [totalPrice, currentUser, form]);

  async function onSubmit(values: z.infer<typeof checkoutSchema>) {
    if (!stripe || !elements || !clientSecret) {
      toast({ title: "Error", description: "Payment system is not ready. Please try again.", variant: "destructive" });
      return;
    }
    if (!currentUser) {
      toast({ title: "Error", description: "You must be logged in to place an order.", variant: "destructive" });
      router.push('/login?redirect=/checkout');
      return;
    }

    setIsProcessingPayment(true);
    setPaymentError(null);

    const { error: submitError } = await elements.submit();
    if (submitError) {
      setPaymentError(submitError.message || "An error occurred during payment submission.");
      toast({ title: "Payment Error", description: submitError.message || "An error occurred during payment submission.", variant: "destructive" });
      setIsProcessingPayment(false);
      return;
    }
    
    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      clientSecret,
      confirmParams: {
        return_url: `${window.location.origin}/checkout/thank-you`, 
        receipt_email: values.email,
        shipping: {
            name: `${values.firstName} ${values.lastName}`,
            address: {
                line1: values.address,
                line2: values.apartment || undefined,
                city: values.city,
                postal_code: values.postalCode,
                country: values.country.length === 2 ? values.country : 'KE', // Stripe expects 2-letter country code
            },
            phone: values.phone || undefined,
        }
      },
      redirect: 'if_required', 
    });

    if (error) {
      setPaymentError(error.message || "An unexpected payment error occurred.");
      toast({ title: "Payment Failed", description: error.message || "An unexpected payment error occurred.", variant: "destructive" });
      // Optionally, create an order with 'PaymentFailed' status
      // This helps track failed attempts, especially if using webhooks
      try {
        const orderItemsForDb = cart.map(item => ({
          productId: item.id, name: item.name, quantity: item.quantityInCart, price: item.price, imageUrl: item.imageUrl,
        }));
        const failedOrderData = {
          customerName: `${values.firstName} ${values.lastName}`, customerEmail: values.email, userId: currentUser.uid,
          orderDate: serverTimestamp(), totalAmount: totalPrice, status: 'PaymentFailed' as const, items: orderItemsForDb,
          shippingAddress: { address: values.address, city: values.city, postalCode: values.postalCode, country: values.country },
          paymentIntentId: clientSecret.split('_secret_')[0], // Extract PI ID from client secret
          createdAt: serverTimestamp(), updatedAt: serverTimestamp(),
        };
        await addDoc(collection(db, "orders"), failedOrderData);
        console.log("Logged failed payment attempt as order:", failedOrderData.paymentIntentId);
      } catch (dbError) {
        console.error("Error logging failed payment attempt to DB:", dbError);
      }
      setIsProcessingPayment(false);
      return;
    }

    if (paymentIntent && paymentIntent.status === 'succeeded') {
      toast({ title: "Payment Successful!", description: "Processing your order..." });

      const orderItemsForDb = cart.map(item => ({
        productId: item.id, name: item.name, quantity: item.quantityInCart, price: item.price, imageUrl: item.imageUrl,
      }));

      const newOrderData = {
        customerName: `${values.firstName} ${values.lastName}`, customerEmail: values.email, userId: currentUser.uid,
        orderDate: serverTimestamp(), totalAmount: totalPrice, status: 'Pending' as const, items: orderItemsForDb,
        shippingAddress: { address: values.address, city: values.city, postalCode: values.postalCode, country: values.country },
        paymentIntentId: paymentIntent.id, 
        createdAt: serverTimestamp(), updatedAt: serverTimestamp(),
      };

      try {
        const orderRef = await addDoc(collection(db, "orders"), newOrderData);
        const orderNumber = orderRef.id;

        const stockUpdateItems = cart.map(item => ({ productId: item.id, quantity: item.quantityInCart }));
        const stockUpdateResult = await decrementStockForOrderAction(stockUpdateItems);
        if (!stockUpdateResult.success) console.error("Stock update failed:", stockUpdateResult.error);

        const orderDetailsForEmail: OrderDetailsForEmail = {
          orderNumber, customerName: `${values.firstName} ${values.lastName}`, customerEmail: values.email, items: cart,
          totalAmount: totalPrice,
          shippingAddress: { firstName: values.firstName, lastName: values.lastName, address: values.address, apartment: values.apartment, city: values.city, country: values.country, postalCode: values.postalCode },
          estimatedDelivery: "3-5 business days (Kenya)",
        };
        await initiateOrderConfirmationEmail(orderDetailsForEmail);

        toast({ title: "Order Placed!", description: `Thank you, ${values.firstName}! Your order #${orderNumber} is being processed.` });
        await clearCart();
        router.push('/'); // Or a dedicated "Thank You" page like `/checkout/thank-you?orderId=${orderNumber}`
      } catch (orderError) {
        console.error("Error placing order or updating stock after payment:", orderError);
        toast({ title: "Order Processing Failed", description: "Payment was successful, but there was an error creating your order. Please contact support.", variant: "destructive", duration: 10000 });
      }
    } else if (paymentIntent) {
        toast({ title: "Payment Incomplete", description: `Payment status: ${paymentIntent.status}. Please try again or contact support.`, variant: "destructive" });
    } else {
      // Handle cases where paymentIntent might be null if redirect happened but confirmation failed.
      // This scenario might not be hit if `redirect: 'if_required'` successfully redirects.
      toast({ title: "Payment Status Unknown", description: "Could not confirm payment status. Please check your orders or contact support.", variant: "destructive" });
    }

    setIsProcessingPayment(false);
  }

  if (authLoading && !currentUser) {
    return ( <div className="py-12 text-center flex flex-col items-center justify-center min-h-[calc(100vh-200px)]"> <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" /> <h1 className="text-2xl font-bold font-serif">Loading Checkout</h1> <p className="text-muted-foreground">Please wait...</p> </div> );
  }
  if (!currentUser && !authLoading) {
    router.push('/login?redirect=/checkout');
    return ( <div className="py-12 text-center"><h1 className="text-xl font-bold">Redirecting to login...</h1></div> );
  }
  if (cart.length === 0 && currentUser) {
    return ( <div className="py-8 text-center"> <h1 className="text-3xl font-bold font-serif mb-4">Your Cart is Empty</h1> <p className="text-muted-foreground mb-6">Add items before checkout.</p> <Link href="/products"><Button size="lg">Continue Shopping</Button></Link> </div> );
  }
  if (!clientSecret && totalPrice > 0) {
    return ( <div className="py-12 text-center flex flex-col items-center justify-center min-h-[calc(100vh-200px)]"> <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" /> <h1 className="text-2xl font-bold font-serif">Initializing Payment</h1> <p className="text-muted-foreground">Please wait...</p> {paymentError && <p className="text-destructive mt-2">{paymentError}</p>} </div> );
  }


  const options: StripeElementsOptions = {
    clientSecret,
    appearance: { theme: 'stripe' },
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="grid lg:grid-cols-3 gap-8 items-start">
        <div className="lg:col-span-2 space-y-8">
          <Card className="shadow-lg rounded-xl">
            <CardHeader><CardTitle className="text-2xl font-serif">Shipping Information</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <FormField control={form.control} name="email" render={({ field }) => ( <FormItem><FormLabel>Email</FormLabel><FormControl><Input placeholder="you@example.com" {...field} /></FormControl><FormMessage /></FormItem> )} />
              <div className="grid sm:grid-cols-2 gap-4">
                <FormField control={form.control} name="firstName" render={({ field }) => ( <FormItem><FormLabel>First Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem> )} />
                <FormField control={form.control} name="lastName" render={({ field }) => ( <FormItem><FormLabel>Last Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem> )} />
              </div>
              <FormField control={form.control} name="address" render={({ field }) => ( <FormItem><FormLabel>Address</FormLabel><FormControl><Input placeholder="123 Main St" {...field} /></FormControl><FormMessage /></FormItem> )} />
              <FormField control={form.control} name="apartment" render={({ field }) => ( <FormItem><FormLabel>Apartment, suite, etc. (optional)</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem> )} />
              <div className="grid sm:grid-cols-3 gap-4">
                <FormField control={form.control} name="city" render={({ field }) => ( <FormItem><FormLabel>City</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem> )} />
                <FormField control={form.control} name="country" render={({ field }) => ( <FormItem><FormLabel>Country</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem> )} /> {/* TODO: Make this a select with country codes */}
                <FormField control={form.control} name="postalCode" render={({ field }) => ( <FormItem><FormLabel>Postal Code</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem> )} />
              </div>
              <FormField control={form.control} name="phone" render={({ field }) => ( <FormItem><FormLabel>Phone (optional)</FormLabel><FormControl><Input type="tel" {...field} /></FormControl><FormDescription>For shipping updates.</FormDescription><FormMessage /></FormItem> )} />
            </CardContent>
          </Card>

          <Card className="shadow-lg rounded-xl">
            <CardHeader><CardTitle className="text-2xl font-serif">Payment Details</CardTitle></CardHeader>
            <CardContent>
              {clientSecret ? (
                <PaymentElement id="payment-element" options={{layout: "tabs"}} />
              ) : (
                <div className="text-center text-muted-foreground py-4">Initializing payment form...</div>
              )}
              {paymentError && <p className="text-sm font-medium text-destructive mt-4">{paymentError}</p>}
            </CardContent>
          </Card>
        </div>

        <Card className="lg:col-span-1 sticky top-24 shadow-xl rounded-xl p-6">
          <CardHeader className="p-0 pb-4"><CardTitle className="text-xl font-serif">Order Summary</CardTitle></CardHeader>
          <CardContent className="space-y-3 p-0">
            {cart.map(item => (
              <div key={item.id} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <Image src={item.imageUrl || 'https://placehold.co/40x50.png'} alt={item.name} width={40} height={50} className="rounded object-cover" data-ai-hint={item.dataAiHint || 'product'} />
                  <div> <p className="font-medium line-clamp-1">{item.name}</p> <p className="text-xs text-muted-foreground">Qty: {item.quantityInCart}</p> </div>
                </div>
                <p>KSh {(item.price * item.quantityInCart).toFixed(2)}</p>
              </div>
            ))}
            <Separator />
            <div className="flex justify-between text-sm"> <span className="text-muted-foreground">Subtotal</span> <span>KSh {totalPrice.toFixed(2)}</span> </div>
            <div className="flex justify-between text-sm"> <span className="text-muted-foreground">Shipping</span> <span>Free</span> </div>
            <div className="flex justify-between text-sm"> <span className="text-muted-foreground">Taxes</span> <span>Calculated next step</span> </div>
            <Separator />
            <div className="flex justify-between font-bold text-lg"> <span>Total</span> <span>KSh {totalPrice.toFixed(2)}</span> </div>
          </CardContent>
          <CardFooter className="p-0 pt-6">
            <Button type="submit" size="lg" className="w-full text-lg" disabled={isProcessingPayment || !stripe || !elements || !clientSecret || cart.length === 0}>
              {isProcessingPayment ? ( <> <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Processing... </> ) : `Pay KSh ${totalPrice.toFixed(2)}`}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </Form>
  );
}

export default function CheckoutPage() {
  const { toast } = useToast();
  const [stripePk, setStripePk] = useState<string | null>(null);

  useEffect(() => {
    const pk = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
    if (!pk) {
      toast({
        title: "Configuration Error",
        description: "Stripe publishable key is not configured. Payment cannot proceed.",
        variant: "destructive",
        duration: Infinity,
      });
      console.error("Stripe publishable key is not set in environment variables (NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY).");
    }
    setStripePk(pk || null);
  }, [toast]);


  if (!stripePk) {
     return (
      <div className="py-12 text-center flex flex-col items-center justify-center min-h-[calc(100vh-200px)]">
        <AlertTriangle className="h-12 w-12 text-destructive mb-4" />
        <h1 className="text-2xl font-bold font-serif text-destructive">Payment System Error</h1>
        <p className="text-muted-foreground">Stripe configuration is missing. Please contact support.</p>
      </div>
    );
  }
  
  return (
    <div className="py-8">
      <div className="mb-10 text-center">
        <h1 className="text-4xl font-bold font-serif mb-2">Checkout</h1>
      </div>
       <Elements stripe={stripePromise} options={{locale: 'en'}}>
        <CheckoutForm />
      </Elements>
    </div>
  );
}
