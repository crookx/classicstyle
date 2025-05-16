
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { addUserProfileAction } from '@/lib/actions/customerActions';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Loader2 } from 'lucide-react';
import type { UserProfile } from '@/types';


const AddUserProfileSchema = z.object({
  email: z.string().email({ message: "Invalid email address." }),
  displayName: z.string().min(2, { message: "Display name must be at least 2 characters." }).optional(),
  firstName: z.string().min(2, { message: "First name must be at least 2 characters." }).optional(),
  lastName: z.string().min(2, { message: "Last name must be at least 2 characters." }).optional(),
  phone: z.string().optional(),
});

type AddUserProfileFormValues = z.infer<typeof AddUserProfileSchema>;

export default function AddNewCustomerPage() {
  const { toast } = useToast();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<AddUserProfileFormValues>({
    resolver: zodResolver(AddUserProfileSchema),
    defaultValues: {
      email: '',
      displayName: '',
      firstName: '',
      lastName: '',
      phone: '',
    },
  });

  async function onSubmit(data: AddUserProfileFormValues) {
    setIsSubmitting(true);
    try {
      const result = await addUserProfileAction(data);
      if (result.success && result.data) {
        toast({
          title: "Customer Record Added!",
          description: `Profile for ${result.data.email} has been successfully created.`,
        });
        router.push('/admin/customers');
        router.refresh(); 
      } else {
        toast({
          title: "Error Adding Customer Record",
          description: result.error || "An unexpected error occurred.",
          variant: "destructive",
        });
        if (result.fieldErrors) {
          Object.entries(result.fieldErrors).forEach(([field, errors]) => {
            if (errors && errors.length > 0) {
              form.setError(field as keyof AddUserProfileFormValues, { type: 'manual', message: errors.join(', ') });
            }
          });
        }
      }
    } catch (error) {
      console.error("Add customer profile submission error:", error);
      toast({
        title: "Submission Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="space-y-8 max-w-2xl mx-auto">
      <div className="flex items-center gap-4">
        <Link href="/admin/customers" passHref>
          <Button variant="outline" size="icon">
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Back to Customers</span>
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-serif font-bold">Add New Customer Record</h1>
          <p className="text-muted-foreground">Create a customer profile in Firestore.</p>
        </div>
      </div>
      <Card className="shadow-xl rounded-xl">
        <CardHeader>
          <CardTitle>Customer Information</CardTitle>
          <CardDescription>
            Fill in the details below. This creates a customer record in the database but does NOT create a login account for them. For login, users must sign up themselves via the main site.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField control={form.control} name="email" render={({ field }) => (
                <FormItem><FormLabel>Email</FormLabel><FormControl><Input placeholder="customer@example.com" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="displayName" render={({ field }) => (
                <FormItem><FormLabel>Display Name (Optional)</FormLabel><FormControl><Input placeholder="e.g., John Doe" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField control={form.control} name="firstName" render={({ field }) => (
                  <FormItem><FormLabel>First Name (Optional)</FormLabel><FormControl><Input placeholder="e.g., John" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="lastName" render={({ field }) => (
                  <FormItem><FormLabel>Last Name (Optional)</FormLabel><FormControl><Input placeholder="e.g., Doe" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
              </div>
              <FormField control={form.control} name="phone" render={({ field }) => (
                <FormItem><FormLabel>Phone (Optional)</FormLabel><FormControl><Input type="tel" placeholder="+254 7XX XXX XXX" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <div className="flex justify-end">
                <Button type="submit" size="lg" disabled={isSubmitting}>
                  {isSubmitting && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
                  {isSubmitting ? 'Saving...' : 'Add Customer Record'}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
