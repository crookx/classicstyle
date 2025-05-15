
'use client';

import { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { LogOut, UserCircle } from 'lucide-react';

export default function AccountPage() {
  const { currentUser, logout, loading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    if (!loading && !currentUser) {
      router.push('/login?redirect=/account');
    }
  }, [currentUser, loading, router]);

  const handleLogout = async () => {
    try {
      await logout();
      toast({ title: 'Logged Out', description: 'You have been successfully logged out.' });
      router.push('/');
    } catch (error) {
      toast({ title: 'Logout Failed', description: 'Could not log out. Please try again.', variant: 'destructive' });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
        <p className="text-lg text-muted-foreground">Loading account details...</p>
      </div>
    );
  }

  if (!currentUser) {
    // This case should ideally be handled by the useEffect redirect,
    // but as a fallback:
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
        <p className="text-lg text-muted-foreground">Please log in to view your account.</p>
      </div>
    );
  }

  return (
    <div className="py-12">
      <div className="max-w-2xl mx-auto">
        <Card className="shadow-xl rounded-xl">
          <CardHeader className="text-center">
            <UserCircle className="mx-auto h-16 w-16 text-primary mb-4" />
            <CardTitle className="text-3xl font-serif">My Account</CardTitle>
            <CardDescription>Manage your account details and preferences.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <h3 className="font-semibold text-lg">Account Information</h3>
              <div className="p-4 bg-muted/50 rounded-md">
                <p className="text-sm text-muted-foreground">Email Address</p>
                <p className="text-foreground">{currentUser.email}</p>
              </div>
            </div>
            
            {/* Placeholder for more account details */}
            {/* 
            <div>
              <h3 className="font-semibold text-lg">Order History</h3>
              <p className="text-sm text-muted-foreground">You have no orders yet.</p>
            </div>
            <div>
              <h3 className="font-semibold text-lg">Saved Addresses</h3>
              <p className="text-sm text-muted-foreground">No addresses saved.</p>
            </div> 
            */}

            <Button onClick={handleLogout} variant="destructive" className="w-full text-lg">
              <LogOut className="mr-2 h-5 w-5" />
              Log Out
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
