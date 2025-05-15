'use client';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Mail, Phone, MapPin } from 'lucide-react';

const contactSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  email: z.string().email({ message: "Invalid email address." }),
  subject: z.string().min(5, { message: "Subject must be at least 5 characters." }),
  message: z.string().min(10, { message: "Message must be at least 10 characters." }),
});

export default function ContactPage() {
  const { toast } = useToast();
  const form = useForm<z.infer<typeof contactSchema>>({
    resolver: zodResolver(contactSchema),
    defaultValues: { name: '', email: '', subject: '', message: '' },
  });

  function onSubmit(values: z.infer<typeof contactSchema>) {
    console.log('Contact form submitted:', values);
    toast({
      title: "Message Sent!",
      description: "Thank you for contacting us. We'll get back to you shortly.",
    });
    form.reset();
  }

  return (
    <div className="py-12">
      <div className="text-center mb-12">
        <h1 className="text-5xl font-bold font-serif mb-4">Get In Touch</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          We'd love to hear from you. Whether you have a question about our products, an order, or anything else, our team is ready to answer all your questions.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-12">
        <Card className="shadow-xl rounded-xl">
          <CardHeader>
            <CardTitle className="text-2xl font-serif">Send us a Message</CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField control={form.control} name="name" render={({ field }) => (
                  <FormItem><FormLabel>Full Name</FormLabel><FormControl><Input placeholder="Your Name" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="email" render={({ field }) => (
                  <FormItem><FormLabel>Email Address</FormLabel><FormControl><Input type="email" placeholder="you@example.com" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="subject" render={({ field }) => (
                  <FormItem><FormLabel>Subject</FormLabel><FormControl><Input placeholder="Question about an order" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="message" render={({ field }) => (
                  <FormItem><FormLabel>Message</FormLabel><FormControl><Textarea placeholder="Your message..." {...field} rows={5} /></FormControl><FormMessage /></FormItem>
                )} />
                <Button type="submit" size="lg" className="w-full" disabled={form.formState.isSubmitting}>
                  {form.formState.isSubmitting ? 'Sending...' : 'Send Message'}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        <div className="space-y-8">
          <Card className="shadow-lg rounded-xl">
            <CardHeader>
              <CardTitle className="text-xl font-serif">Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-4">
                <Mail className="h-6 w-6 text-primary mt-1 shrink-0" />
                <div>
                  <h3 className="font-semibold">Email Us</h3>
                  <a href="mailto:support@classicstyle.com" className="text-foreground/80 hover:text-primary transition-colors">support@classicstyle.com</a>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <Phone className="h-6 w-6 text-primary mt-1 shrink-0" />
                <div>
                  <h3 className="font-semibold">Call Us</h3>
                  <p className="text-foreground/80">+1 (555) 123-4567</p>
                  <p className="text-xs text-muted-foreground">Mon - Fri, 9am - 5pm EST</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <MapPin className="h-6 w-6 text-primary mt-1 shrink-0" />
                <div>
                  <h3 className="font-semibold">Visit Us</h3>
                  <p className="text-foreground/80">123 Elegance Avenue, Suite 100<br/>New York, NY 10001, USA</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
