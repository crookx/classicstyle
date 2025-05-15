
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
import { useCart } from '@/contexts/CartContext';
import Image from 'next/image';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext'; // Added
import { useRouter } from 'next/navigation'; // Added
import { useEffect } from 'react'; // Added
import { Loader2 } from 'lucide-react';


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


export default function CheckoutPage() {
  const { cart, totalPrice, totalItems, clearCart } = useCart();
  const { toast } = useToast();
  const { currentUser, loading: authLoading } = useAuth(); // Added
  const router = useRouter(); // Added

  const form = useForm<z.infer<typeof checkoutSchema>>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      email: currentUser?.email || '', // Pre-fill email if user is logged in
      firstName: '',
      lastName: '',
      address: '',
      apartment: '',
      city: '',
      country: 'United States', 
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
    if (currentUser && !form.getValues('email')) {
       form.setValue('email', currentUser.email || '');
    }
  }, [currentUser, authLoading, router, toast, form]);


  function onSubmit(values: z.infer<typeof checkoutSchema>) {
    console.log('Checkout submitted:', values);
    toast({
      title: "Order Placed!",
      description: "Thank you for your purchase. Your order is being processed.",
    });
    clearCart();
    router.push('/'); // Navigate to home after order confirmation (or a dedicated confirmation page)
  }
  
  if (authLoading) {
    return (
      <div className="py-12 text-center flex flex-col items-center justify-center min-h-[calc(100vh-200px)]">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <h1 className="text-2xl font-bold font-serif">Loading Checkout</h1>
        <p className="text-muted-foreground">Please wait while we prepare your checkout page.</p>
      </div>
    );
  }

  if (!currentUser) {
    // This state should ideally be brief due to the redirect in useEffect
    return (
         <div className="py-12 text-center">
            <h1 className="text-xl font-bold">Redirecting to login...</h1>
        </div>
    )
  }
  
  if (cart.length === 0) {
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
                  <FormField name="firstName" render={({ field }) => ( <FormItem><FormLabel>First Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem> )} />
                  <FormField name="lastName" render={({ field }) => ( <FormItem><FormLabel>Last Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem> )} />
                </div>
                <FormField name="address" render={({ field }) => ( <FormItem><FormLabel>Address</FormLabel><FormControl><Input placeholder="123 Main St" {...field} /></FormControl><FormMessage /></FormItem> )} />
                <FormField name="apartment" render={({ field }) => ( <FormItem><FormLabel>Apartment, suite, etc. (optional)</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem> )} />
                <div className="grid sm:grid-cols-3 gap-4">
                  <FormField name="city" render={({ field }) => ( <FormItem><FormLabel>City</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem> )} />
                  <FormField name="country" render={({ field }) => ( <FormItem><FormLabel>Country</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem> )} />
                  <FormField name="postalCode" render={({ field }) => ( <FormItem><FormLabel>Postal Code</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem> )} />
                </div>
                <FormField name="phone" render={({ field }) => ( <FormItem><FormLabel>Phone (optional)</FormLabel><FormControl><Input type="tel" {...field} /></FormControl><FormDescription>For shipping updates.</FormDescription><FormMessage /></FormItem> )} />
              </CardContent>
            </Card>

            <Card className="shadow-lg rounded-xl">
                <CardHeader>
                    <CardTitle className="text-2xl font-serif">Payment Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <FormField name="cardholderName" render={({ field }) => ( <FormItem><FormLabel>Name on Card</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem> )} />
                    <FormField name="cardNumber" render={({ field }) => ( <FormItem><FormLabel>Card Number</FormLabel><FormControl><Input placeholder="•••• •••• •••• ••••" {...field} /></FormControl><FormMessage /></FormItem> )} />
                    <div className="grid sm:grid-cols-2 gap-4">
                        <FormField name="expiryDate" render={({ field }) => ( <FormItem><FormLabel>Expiry Date</FormLabel><FormControl><Input placeholder="MM/YY" {...field} /></FormControl><FormMessage /></FormItem> )} />
                        <FormField name="cvc" render={({ field }) => ( <FormItem><FormLabel>CVC</FormLabel><FormControl><Input placeholder="123" {...field} /></FormControl><FormMessage /></FormItem> )} />
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
                    <Image src={item.imageUrl} alt={item.name} width={40} height={50} className="rounded object-cover" />
                    <div>
                      <p className="font-medium line-clamp-1">{item.name}</p>
                      <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                    </div>
                  </div>
                  <p>${(item.price * item.quantity).toFixed(2)}</p>
                </div>
              ))}
              <Separator />
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span>${totalPrice.toFixed(2)}</span>
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
                <span>${totalPrice.toFixed(2)}</span>
              </div>
            </CardContent>
            <CardFooter className="p-0 pt-6">
              <Button type="submit" size="lg" className="w-full text-lg" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Processing...
                  </>
                ) : 'Place Order'}
              </Button>
            </CardFooter>
          </Card>
        </form>
      </Form>
    </div>
  );
}
