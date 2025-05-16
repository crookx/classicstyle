
'use client';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useCart, type DisplayCartItem } from '@/contexts/CartContext'; // Updated type
import Image from 'next/image';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import type { User } from 'firebase/auth';
import { decrementStockForOrderAction } from '@/lib/actions/orderActions'; // New action for stock
import { addDoc, collection, serverTimestamp } from 'firebase/firestore'; // For creating order
import { db } from '@/lib/firebase'; // For creating order

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

const paymentSchema = z.object({
    cardNumber: z.string().min(16, "Invalid card number").max(19, "Invalid card number").regex(/^\d+$/, "Card number must be digits only"),
    expiryDate: z.string().regex(/^(0[1-9]|1[0-2])\/\d{2}$/, "Invalid expiry date (MM/YY)"),
    cvc: z.string().min(3, "Invalid CVC").max(4, "Invalid CVC").regex(/^\d+$/, "CVC must be digits only"),
    cardholderName: z.string().min(1, "Cardholder name is required"),
});

const checkoutSchema = shippingSchema.merge(paymentSchema);

interface OrderDetailsForEmail {
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  items: DisplayCartItem[]; // Updated to use DisplayCartItem for email
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
  console.log('Next Step: Call a backend API/Cloud Function (e.g., a Firebase Cloud Function listening to new orders) to process and send the actual email using an email service.');
  console.log('--- END OF ORDER CONFIRMATION SIMULATION ---');
}


export default function CheckoutPage() {
  const { cart, totalPrice, totalItems, clearCart } = useCart();
  const { toast } = useToast();
  const { currentUser, loading: authLoading } = useAuth();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<z.infer<typeof checkoutSchema>>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      email: '', // Will be set from currentUser
      firstName: '',
      lastName: '',
      address: '',
      apartment: '',
      city: '',
      country: 'Kenya',
      postalCode: '',
      phone: '',
      cardNumber: '',
      expiryDate: '',
      cvc: '',
      cardholderName: '',
    },
  });

  useEffect(() => {
    if (!authLoading && !currentUser) {
      toast({ title: "Authentication Required", description: "Please log in to proceed to checkout.", variant: "destructive" });
      router.push('/login?redirect=/checkout');
    }
    if (currentUser && !form.getValues('email')) { // Set email only if not already set (e.g. by user typing)
       form.setValue('email', currentUser.email || '');
    }
  }, [currentUser, authLoading, router, toast, form]);

  async function onSubmit(values: z.infer<typeof checkoutSchema>) {
    if (!currentUser) {
        toast({ title: "Error", description: "You must be logged in to place an order.", variant: "destructive" });
        return;
    }
    setIsSubmitting(true);
    console.log('Checkout submitted with form values:', values);

    // This is a mock order placement.
    // In a real app, you would integrate a payment gateway here.
    // After successful payment, you save the order to your database.

    const orderItemsForDb = cart.map(item => ({
        productId: item.id,
        name: item.name,
        quantity: item.quantityInCart,
        price: item.price,
        imageUrl: item.imageUrl,
    }));

    const newOrderData = {
        customerName: `${values.firstName} ${values.lastName}`,
        customerEmail: values.email,
        userId: currentUser.uid,
        orderDate: serverTimestamp(), // Firestore server timestamp
        totalAmount: totalPrice,
        status: 'Pending' as const, // Initial status
        items: orderItemsForDb,
        shippingAddress: {
            address: values.address,
            city: values.city,
            postalCode: values.postalCode,
            country: values.country,
            // apartment: values.apartment, // Add if needed
        },
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
    };

    try {
        // 1. Save order to Firestore
        const orderRef = await addDoc(collection(db, "orders"), newOrderData);
        const mockOrderNumber = orderRef.id; // Use Firestore doc ID as order number
        console.log("Order successfully created in Firestore with ID:", mockOrderNumber);

        // 2. Decrement stock
        const stockUpdateItems = cart.map(item => ({ productId: item.id, quantity: item.quantityInCart }));
        const stockUpdateResult = await decrementStockForOrderAction(stockUpdateItems);

        if (!stockUpdateResult.success) {
            console.error("Stock update failed:", stockUpdateResult.error);
            // Decide on error handling: Rollback order? Notify admin?
            // For now, we'll proceed but log the error.
            toast({
                title: "Order Placed (Stock Issue)",
                description: `Your order #${mockOrderNumber} is placed, but there was an issue updating stock: ${stockUpdateResult.error}. We will resolve this.`,
                variant: "destructive",
                duration: 10000,
            });
        } else {
            console.log("Stock updated successfully for order:", mockOrderNumber);
        }

        // 3. Prepare details for conceptual email
        const orderDetailsForEmail: OrderDetailsForEmail = {
            orderNumber: mockOrderNumber,
            customerName: `${values.firstName} ${values.lastName}`,
            customerEmail: values.email,
            items: cart, // Pass DisplayCartItem array
            totalAmount: totalPrice,
            shippingAddress: {
                firstName: values.firstName,
                lastName: values.lastName,
                address: values.address,
                apartment: values.apartment,
                city: values.city,
                country: values.country,
                postalCode: values.postalCode,
            },
            estimatedDelivery: "3-5 business days (Kenya)", // Placeholder
        };

        await initiateOrderConfirmationEmail(orderDetailsForEmail);

        toast({
            title: "Order Placed!",
            description: `Thank you, ${values.firstName}! Your order #${mockOrderNumber} is being processed.`,
        });

        await clearCart(); // Clear Firestore cart
        router.push('/');

    } catch (error) {
        console.error("Error placing order or updating stock:", error);
        toast({
            title: "Order Placement Failed",
            description: "There was an error processing your order. Please try again or contact support.",
            variant: "destructive",
        });
    } finally {
        setIsSubmitting(false);
    }
  }

  if (authLoading && !currentUser) { // Show loading only if auth is loading AND there's no user yet
    return (
      <div className="py-12 text-center flex flex-col items-center justify-center min-h-[calc(100vh-200px)]">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <h1 className="text-2xl font-bold font-serif">Loading Checkout</h1>
        <p className="text-muted-foreground">Please wait while we prepare your checkout page.</p>
      </div>
    );
  }

  if (!currentUser && !authLoading) { // Explicitly redirect if not logged in and auth is done loading
    return (
         <div className="py-12 text-center">
            <h1 className="text-xl font-bold">Redirecting to login...</h1>
        </div>
    )
  }

  if (cart.length === 0 && currentUser) { // Only show empty cart message if user is logged in
    return (
         <div className="py-8 text-center">
            <h1 className="text-3xl font-bold font-serif mb-4">Your Cart is Empty</h1>
            <p className="text-muted-foreground mb-6">Please add items to your cart before proceeding to checkout.</p>
            <Link href="/products">
                <Button size="lg">Continue Shopping</Button>
            </Link>
        </div>
    )
  }

  return (
    <div className="py-8">
      <div className="mb-10 text-center">
        <h1 className="text-4xl font-bold font-serif mb-2">Checkout</h1>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="grid lg:grid-cols-3 gap-8 items-start">
          <div className="lg:col-span-2 space-y-8">
            <Card className="shadow-lg rounded-xl">
              <CardHeader>
                <CardTitle className="text-2xl font-serif">Shipping Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl><Input placeholder="you@example.com" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid sm:grid-cols-2 gap-4">
                  <FormField control={form.control} name="firstName" render={({ field }) => ( <FormItem><FormLabel>First Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem> )} />
                  <FormField control={form.control} name="lastName" render={({ field }) => ( <FormItem><FormLabel>Last Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem> )} />
                </div>
                <FormField control={form.control} name="address" render={({ field }) => ( <FormItem><FormLabel>Address</FormLabel><FormControl><Input placeholder="123 Main St" {...field} /></FormControl><FormMessage /></FormItem> )} />
                <FormField control={form.control} name="apartment" render={({ field }) => ( <FormItem><FormLabel>Apartment, suite, etc. (optional)</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem> )} />
                <div className="grid sm:grid-cols-3 gap-4">
                  <FormField control={form.control} name="city" render={({ field }) => ( <FormItem><FormLabel>City</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem> )} />
                  <FormField control={form.control} name="country" render={({ field }) => ( <FormItem><FormLabel>Country</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem> )} />
                  <FormField control={form.control} name="postalCode" render={({ field }) => ( <FormItem><FormLabel>Postal Code</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem> )} />
                </div>
                <FormField control={form.control} name="phone" render={({ field }) => ( <FormItem><FormLabel>Phone (optional)</FormLabel><FormControl><Input type="tel" {...field} /></FormControl><FormDescription>For shipping updates.</FormDescription><FormMessage /></FormItem> )} />
              </CardContent>
            </Card>

            <Card className="shadow-lg rounded-xl">
                <CardHeader>
                    <CardTitle className="text-2xl font-serif">Payment Details (Mock)</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground">Payment integration is not yet live. These are placeholder fields.</p>
                    <FormField control={form.control} name="cardholderName" render={({ field }) => ( <FormItem><FormLabel>Name on Card</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem> )} />
                    <FormField control={form.control} name="cardNumber" render={({ field }) => ( <FormItem><FormLabel>Card Number</FormLabel><FormControl><Input placeholder="•••• •••• •••• ••••" {...field} /></FormControl><FormMessage /></FormItem> )} />
                    <div className="grid sm:grid-cols-2 gap-4">
                        <FormField control={form.control} name="expiryDate" render={({ field }) => ( <FormItem><FormLabel>Expiry Date</FormLabel><FormControl><Input placeholder="MM/YY" {...field} /></FormControl><FormMessage /></FormItem> )} />
                        <FormField control={form.control} name="cvc" render={({ field }) => ( <FormItem><FormLabel>CVC</FormLabel><FormControl><Input placeholder="123" {...field} /></FormControl><FormMessage /></FormItem> )} />
                    </div>
                </CardContent>
            </Card>
          </div>

          <Card className="lg:col-span-1 sticky top-24 shadow-xl rounded-xl p-6">
            <CardHeader className="p-0 pb-4">
              <CardTitle className="text-xl font-serif">Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 p-0">
              {cart.map(item => (
                <div key={item.id} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <Image src={item.imageUrl || 'https://placehold.co/40x50.png'} alt={item.name} width={40} height={50} className="rounded object-cover" data-ai-hint={item.dataAiHint || 'product'} />
                    <div>
                      <p className="font-medium line-clamp-1">{item.name}</p>
                      <p className="text-xs text-muted-foreground">Qty: {item.quantityInCart}</p>
                    </div>
                  </div>
                  <p>KSh {(item.price * item.quantityInCart).toFixed(2)}</p>
                </div>
              ))}
              <Separator />
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span>KSh {totalPrice.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Shipping</span>
                <span>Free</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Taxes</span>
                <span>Calculated next step</span>
              </div>
              <Separator />
              <div className="flex justify-between font-bold text-lg">
                <span>Total</span>
                <span>KSh {totalPrice.toFixed(2)}</span>
              </div>
            </CardContent>
            <CardFooter className="p-0 pt-6">
              <Button type="submit" size="lg" className="w-full text-lg" disabled={isSubmitting || cart.length === 0}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Processing...
                  </>
                ) : 'Place Order (Mock)'}
              </Button>
            </CardFooter>
          </Card>
        </form>
      </Form>
    </div>
  );
}
