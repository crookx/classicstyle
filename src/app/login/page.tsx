
'use client';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Separator } from '@/components/ui/separator';

const loginSchema = z.object({
  email: z.string().email({ message: "Invalid email address." }),
  password: z.string().min(6, { message: "Password must be at least 6 characters." }),
});

const signupSchema = z.object({
  email: z.string().email({ message: "Invalid email address." }),
  password: z.string().min(6, { message: "Password must be at least 6 characters." }),
  confirmPassword: z.string().min(6, {message: "Password must be at least 6 characters."})
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"], // path of error
});


type LoginFormValues = z.infer<typeof loginSchema>;
type SignupFormValues = z.infer<typeof signupSchema>;

export default function LoginPage() {
  const { login, signup, currentUser } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectPath = searchParams.get('redirect') || '/';

  const [isLoginView, setIsLoginView] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);

  const loginForm = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const signupForm = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: { email: '', password: '', confirmPassword: '' },
  });

  async function onLoginSubmit(values: LoginFormValues) {
    setAuthError(null);
    try {
      await login(values.email, values.password);
      toast({ title: "Login Successful!", description: "Welcome back." });
      router.push(redirectPath);
    } catch (error: any) {
      handleAuthError(error);
    }
  }
  
  async function onSignupSubmit(values: SignupFormValues) {
    setAuthError(null);
    try {
      await signup(values.email, values.password);
      toast({ title: "Signup Successful!", description: "Welcome! Please log in." });
      setIsLoginView(true); // Switch to login view after signup
      loginForm.reset(); // Reset login form if needed
      signupForm.reset();
      router.push(redirectPath); // Or redirect to login with a message
    } catch (error: any) {
      handleAuthError(error);
    }
  }

  const handleAuthError = (error: any) => {
    let message = "An unexpected error occurred. Please try again.";
    if (error.code) {
      switch (error.code) {
        case "auth/user-not-found":
        case "auth/wrong-password":
          message = "Invalid email or password.";
          break;
        case "auth/email-already-in-use":
          message = "This email is already registered. Please log in.";
          break;
        case "auth/invalid-email":
          message = "Please enter a valid email address.";
          break;
        case "auth/weak-password":
          message = "Password is too weak. It should be at least 6 characters.";
          break;
        default:
          message = error.message || message;
      }
    }
    setAuthError(message);
    toast({ title: isLoginView ? "Login Failed" : "Signup Failed", description: message, variant: "destructive" });
  }

  if (currentUser) {
    router.push('/'); // Already logged in
    return null;
  }


  return (
    <div className="flex items-center justify-center py-12">
      <Card className="w-full max-w-md shadow-xl rounded-xl">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-serif">{isLoginView ? "Welcome Back" : "Create Account"}</CardTitle>
          <CardDescription>{isLoginView ? "Log in to continue to ClassicStyle." : "Sign up to discover timeless elegance."}</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoginView ? (
            <Form {...loginForm}>
              <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-6">
                <FormField control={loginForm.control} name="email" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl><Input placeholder="you@example.com" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={loginForm.control} name="password" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl><Input type="password" placeholder="••••••••" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                 {authError && <p className="text-sm font-medium text-destructive">{authError}</p>}
                <Button type="submit" className="w-full text-lg" disabled={loginForm.formState.isSubmitting}>
                  {loginForm.formState.isSubmitting ? 'Logging in...' : 'Log In'}
                </Button>
              </form>
            </Form>
          ) : (
            <Form {...signupForm}>
              <form onSubmit={signupForm.handleSubmit(onSignupSubmit)} className="space-y-6">
                <FormField control={signupForm.control} name="email" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl><Input placeholder="you@example.com" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={signupForm.control} name="password" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl><Input type="password" placeholder="Create a password" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={signupForm.control} name="confirmPassword" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirm Password</FormLabel>
                    <FormControl><Input type="password" placeholder="Confirm your password" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                {authError && <p className="text-sm font-medium text-destructive">{authError}</p>}
                <Button type="submit" className="w-full text-lg" disabled={signupForm.formState.isSubmitting}>
                 {signupForm.formState.isSubmitting ? 'Signing up...' : 'Sign Up'}
                </Button>
              </form>
            </Form>
          )}
        </CardContent>
        <CardFooter className="flex flex-col items-center space-y-2">
           <Separator className="my-4" />
           <Button variant="link" onClick={() => {
             setIsLoginView(!isLoginView);
             setAuthError(null);
             loginForm.reset();
             signupForm.reset();
            }}>
            {isLoginView ? "Don't have an account? Sign Up" : "Already have an account? Log In"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
