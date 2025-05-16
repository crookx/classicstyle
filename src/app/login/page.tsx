
'use client';
import { useState, useEffect } from 'react';
import { useForm, FormProvider } from 'react-hook-form'; // Ensured FormProvider is available if Form is an alias
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Form as ShadcnForm, // Renamed to avoid conflict if FormProvider is also used as Form
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Separator } from '@/components/ui/separator';
import { Loader2 } from 'lucide-react';

const loginSchema = z.object({
  email: z.string().email({ message: 'Invalid email address.' }),
  password: z.string().min(6, {
    message: 'Password must be at least 6 characters.',
  }),
});

const signupSchema = z
  .object({
    email: z.string().email({ message: 'Invalid email address.' }),
    password: z.string().min(6, {
      message: 'Password must be at least 6 characters.',
    }),
    confirmPassword: z.string().min(6, {
      message: 'Password must be at least 6 characters.',
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

type LoginFormValues = z.infer<typeof loginSchema>;
type SignupFormValues = z.infer<typeof signupSchema>;

export default function LoginPage() {
  const { login, signup, currentUser, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectPath = searchParams.get('redirect') || '/';

  const [isLoginView, setIsLoginView] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loginForm = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const signupForm = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: { email: '', password: '', confirmPassword: '' },
  });

  useEffect(() => {
    if (!authLoading && currentUser) {
      router.push(redirectPath);
    }
  }, [currentUser, authLoading, router, redirectPath]);

  async function onLoginSubmit(values: LoginFormValues) {
    setAuthError(null);
    setIsSubmitting(true);
    try {
      await login(values.email, values.password);
      toast({
        title: 'Login Successful!',
        description: 'Welcome back.',
      });
      // Redirect is handled by useEffect
    } catch (error: any) {
      handleAuthError(error, 'Login Failed');
    } finally {
      setIsSubmitting(false);
    }
  }

  async function onSignupSubmit(values: SignupFormValues) {
    setAuthError(null);
    setIsSubmitting(true);
    try {
      await signup(values.email, values.password);
      toast({
        title: 'Signup Successful!',
        description: 'Welcome! Your account has been created. Please log in.',
      });
      setIsLoginView(true);
      loginForm.setValue('email', values.email);
      loginForm.resetField('password');
      signupForm.reset({ email: '', password: '', confirmPassword: '' });
    } catch (error: any) {
      handleAuthError(error, 'Signup Failed');
    } finally {
      setIsSubmitting(false);
    }
  }

  const handleAuthError = (
    error: any,
    type: 'Login Failed' | 'Signup Failed'
  ) => {
    let message = 'An unexpected error occurred. Please try again.';
    if (error.code) {
      switch (error.code) {
        case 'auth/user-not-found':
        case 'auth/wrong-password':
        case 'auth/invalid-credential':
          message = 'Invalid email or password.';
          break;
        case 'auth/email-already-in-use':
          message = 'This email is already registered. Please log in.';
          break;
        case 'auth/invalid-email':
          message = 'Please enter a valid email address.';
          break;
        case 'auth/weak-password':
          message = 'Password is too weak. It should be at least 6 characters.';
          break;
        default:
          message = error.message || message;
      }
    }
    setAuthError(message);
  };

  const toggleView = () => {
    setIsLoginView(!isLoginView);
    setAuthError(null);
    // Reset forms to their default values and clear errors
    loginForm.reset({ email: '', password: '' }, { keepValues: false, keepDirty: false, keepErrors: false, keepTouched: false, keepIsValid: false });
    signupForm.reset({ email: '', password: '', confirmPassword: '' }, { keepValues: false, keepDirty: false, keepErrors: false, keepTouched: false, keepIsValid: false });
    setIsSubmitting(false);
  };
  
  if (authLoading && !currentUser) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)]">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <p className="text-lg text-muted-foreground">
          Loading authentication...
        </p>
      </div>
    );
  }

  if (!authLoading && currentUser) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)]">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <p className="text-lg text-muted-foreground">Redirecting...</p>
      </div>
    );
  }

  // Using ShadcnForm as Form from react-hook-form is FormProvider
  const RHFForm = FormProvider; 

  return (
    <div className="flex items-center justify-center py-12 px-4">
      <Card className="w-full max-w-md shadow-xl rounded-xl">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-serif">
            {isLoginView ? 'Welcome Back' : 'Create Account'}
          </CardTitle>
          <CardDescription>
            {isLoginView
              ? 'Log in to continue to ClassicStyle.'
              : 'Sign up to discover timeless elegance.'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoginView ? (
            <RHFForm {...loginForm} >
              <form
                key="login-html-form" // Added key to HTML form
                onSubmit={loginForm.handleSubmit(onLoginSubmit)}
                className="space-y-6"
              >
                <FormField
                  control={loginForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="you@example.com"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={loginForm.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          placeholder="••••••••"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {authError && isLoginView && (
                  <p className="text-sm font-medium text-destructive">
                    {authError}
                  </p>
                )}
                <Button
                  type="submit"
                  className="w-full text-lg"
                  disabled={isSubmitting}
                >
                  {isSubmitting && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
                  {isSubmitting ? 'Logging in...' : 'Log In'}
                </Button>
              </form>
            </RHFForm>
          ) : (
            <RHFForm {...signupForm}>
              <form
                key="signup-html-form" // Added key to HTML form
                onSubmit={signupForm.handleSubmit(onSignupSubmit)}
                className="space-y-6"
              >
                <FormField
                  control={signupForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="you@example.com"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={signupForm.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          placeholder="Create a password (min. 6 characters)"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={signupForm.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Confirm Password</FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          placeholder="Confirm your password"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {authError && !isLoginView && (
                  <p className="text-sm font-medium text-destructive">
                    {authError}
                  </p>
                )}
                <Button
                  type="submit"
                  className="w-full text-lg"
                  disabled={isSubmitting}
                >
                  {isSubmitting && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
                  {isSubmitting ? 'Signing up...' : 'Sign Up'}
                </Button>
              </form>
            </RHFForm>
          )}
        </CardContent>
        <CardFooter className="flex flex-col items-center">
          <Separator className="my-4" />
          <Button variant="link" onClick={toggleView}>
            {isLoginView
              ? "Don't have an account? Sign Up"
              : 'Already have an account? Log In'}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
