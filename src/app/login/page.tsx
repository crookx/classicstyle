
'use client';
import { useState, useEffect } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Form as ShadcnForm, // Renamed to avoid conflict
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
import { auth } from '@/lib/firebase'; // Import auth for password reset
import { sendPasswordResetEmail } from 'firebase/auth';

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

const resetPasswordSchema = z.object({
  email: z.string().email({ message: 'Invalid email address.' }),
});

type LoginFormValues = z.infer<typeof loginSchema>;
type SignupFormValues = z.infer<typeof signupSchema>;
type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;

const RHFForm = FormProvider; // Alias for react-hook-form's FormProvider

type AuthView = 'login' | 'signup' | 'resetPassword';

export default function LoginPage() {
  const { login, signup, currentUser, isAdmin, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectPath = searchParams.get('redirect') || '/';

  const [authView, setAuthView] = useState<AuthView>('login');
  const [authError, setAuthError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);

  useEffect(() => {
    if (!authLoading && currentUser && isAdmin !== null) {
      setIsRedirecting(true);
      if (isAdmin) {
        router.push(redirectPath.startsWith('/admin') ? redirectPath : '/admin');
      } else {
        router.push(redirectPath === '/admin' ? '/' : redirectPath);
      }
    }
  }, [currentUser, isAdmin, authLoading, router, redirectPath]);

  const handleAuthError = (
    error: any,
    type: 'Login Failed' | 'Signup Failed' | 'Password Reset Failed'
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
    toast({ title: type, description: message, variant: 'destructive' });
  };
  
  async function onLoginSubmit(values: LoginFormValues) {
    setAuthError(null);
    setIsSubmitting(true);
    try {
      await login(values.email, values.password);
      toast({
        title: 'Login Successful!',
        description: 'Welcome back. Redirecting...',
      });
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
      setAuthView('login');
      loginForm.setValue('email', values.email);
      loginForm.resetField('password');
      signupForm.reset({ email: '', password: '', confirmPassword: '' });
    } catch (error: any) {
      handleAuthError(error, 'Signup Failed');
    } finally {
      setIsSubmitting(false);
    }
  }

  async function onResetPasswordSubmit(values: ResetPasswordFormValues) {
    setAuthError(null);
    setIsSubmitting(true);
    try {
      await sendPasswordResetEmail(auth, values.email);
      toast({
        title: 'Password Reset Email Sent',
        description: 'If an account exists for this email, a password reset link has been sent. Please check your inbox (and spam folder).',
      });
      setAuthView('login'); // Go back to login view
      resetPasswordForm.reset();
    } catch (error: any) {
      // Firebase often doesn't reveal if an email exists for security reasons.
      // So, a generic success message is usually best even on error, unless it's a clear network issue.
      if (error.code === 'auth/user-not-found') {
         toast({
          title: 'Password Reset Email Sent',
          description: 'If an account exists for this email, a password reset link has been sent. Please check your inbox (and spam folder).',
        });
      } else {
        handleAuthError(error, 'Password Reset Failed');
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  const loginForm = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const signupForm = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: { email: '', password: '', confirmPassword: '' },
  });

  const resetPasswordForm = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { email: '' },
  });

  const toggleView = (view: AuthView) => {
    setAuthView(view);
    setAuthError(null);
    loginForm.reset({ email: '', password: '' });
    signupForm.reset({ email: '', password: '', confirmPassword: '' });
    resetPasswordForm.reset({ email: ''});
    setIsSubmitting(false);
  };

  if (authLoading || isRedirecting) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)]">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <p className="text-lg text-muted-foreground">
          {isRedirecting ? 'Redirecting...' : 'Loading authentication...'}
        </p>
      </div>
    );
  }

  if (!authLoading && currentUser && !isRedirecting) {
    setIsRedirecting(true);
    return null;
  }

  return (
    <div className="flex items-center justify-center py-12 px-4">
      <Card className="w-full max-w-md shadow-xl rounded-xl">
        {authView === 'login' && (
          <>
            <CardHeader className="text-center">
              <CardTitle className="text-3xl font-serif">Welcome Back</CardTitle>
              <CardDescription>Log in to continue to ClassicStyle.</CardDescription>
            </CardHeader>
            <CardContent>
              <RHFForm {...loginForm}>
                <form
                  key="login-html-form" // Added key
                  onSubmit={loginForm.handleSubmit(onLoginSubmit)}
                  className="space-y-6"
                >
                  <FormField
                    control={loginForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl><Input type="email" placeholder="you@example.com" {...field} /></FormControl>
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
                        <FormControl><Input type="password" placeholder="••••••••" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  {authError && authView === 'login' && (
                    <p className="text-sm font-medium text-destructive">{authError}</p>
                  )}
                  <Button type="submit" className="w-full text-lg" disabled={isSubmitting}>
                    {isSubmitting ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : null}
                    {isSubmitting ? 'Logging in...' : 'Log In'}
                  </Button>
                </form>
              </RHFForm>
              <div className="mt-4 text-center text-sm">
                <Button variant="link" onClick={() => toggleView('resetPassword')} className="px-0">
                  Forgot Password?
                </Button>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col items-center">
              <Separator className="my-4" />
              <Button variant="link" onClick={() => toggleView('signup')}>
                Don't have an account? Sign Up
              </Button>
            </CardFooter>
          </>
        )}

        {authView === 'signup' && (
          <>
            <CardHeader className="text-center">
              <CardTitle className="text-3xl font-serif">Create Account</CardTitle>
              <CardDescription>Sign up to discover timeless elegance.</CardDescription>
            </CardHeader>
            <CardContent>
              <RHFForm {...signupForm}>
                <form
                  key="signup-html-form" // Added key
                  onSubmit={signupForm.handleSubmit(onSignupSubmit)}
                  className="space-y-6"
                >
                  <FormField
                    control={signupForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl><Input type="email" placeholder="you@example.com" {...field} /></FormControl>
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
                        <FormControl><Input type="password" placeholder="Create a password (min. 6 characters)" {...field} /></FormControl>
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
                        <FormControl><Input type="password" placeholder="Confirm your password" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  {authError && authView === 'signup' && (
                    <p className="text-sm font-medium text-destructive">{authError}</p>
                  )}
                  <Button type="submit" className="w-full text-lg" disabled={isSubmitting}>
                    {isSubmitting ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : null}
                    {isSubmitting ? 'Signing up...' : 'Sign Up'}
                  </Button>
                </form>
              </RHFForm>
            </CardContent>
            <CardFooter className="flex flex-col items-center">
              <Separator className="my-4" />
              <Button variant="link" onClick={() => toggleView('login')}>
                Already have an account? Log In
              </Button>
            </CardFooter>
          </>
        )}
        
        {authView === 'resetPassword' && (
          <>
            <CardHeader className="text-center">
              <CardTitle className="text-3xl font-serif">Reset Password</CardTitle>
              <CardDescription>Enter your email to receive a password reset link.</CardDescription>
            </CardHeader>
            <CardContent>
              <RHFForm {...resetPasswordForm}>
                <form
                  key="reset-password-html-form"
                  onSubmit={resetPasswordForm.handleSubmit(onResetPasswordSubmit)}
                  className="space-y-6"
                >
                  <FormField
                    control={resetPasswordForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email Address</FormLabel>
                        <FormControl><Input type="email" placeholder="you@example.com" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  {authError && authView === 'resetPassword' && (
                    <p className="text-sm font-medium text-destructive">{authError}</p>
                  )}
                  <Button type="submit" className="w-full text-lg" disabled={isSubmitting}>
                    {isSubmitting ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : null}
                    {isSubmitting ? 'Sending...' : 'Send Reset Link'}
                  </Button>
                </form>
              </RHFForm>
            </CardContent>
            <CardFooter className="flex flex-col items-center">
              <Separator className="my-4" />
              <Button variant="link" onClick={() => toggleView('login')}>
                Back to Log In
              </Button>
            </CardFooter>
          </>
        )}
      </Card>
    </div>
  );
}

    