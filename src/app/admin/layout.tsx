
'use client';

import { type ReactNode, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { SiteLogo } from '@/components/layout/SiteLogo';
import { Separator } from '@/components/ui/separator';
import { LayoutDashboard, Package, LogOut, Home, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function AdminLayout({ children }: { children: ReactNode }) {
  const { currentUser, loading, logout } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    if (!loading && !currentUser) {
      router.push('/login?redirect=/admin');
    }
  }, [currentUser, loading, router]);

  const handleLogout = async () => {
    try {
      await logout();
      toast({ title: 'Logged Out', description: 'You have been successfully logged out from admin.' });
      router.push('/login');
    } catch (error) {
      toast({ title: 'Logout Failed', description: 'Could not log out. Please try again.', variant: 'destructive' });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (!currentUser) {
    // This state should ideally be brief due to the redirect in useEffect
    return (
         <div className="flex items-center justify-center h-screen bg-background">
            <p className="text-muted-foreground">Redirecting to login...</p>
        </div>
    );
  }

  const navItems = [
    { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/admin/products', label: 'Products', icon: Package },
    // Add more admin navigation items here
  ];

  return (
    <div className="flex min-h-screen bg-muted/40">
      <aside className="w-64 bg-background border-r border-border p-6 flex flex-col">
        <div className="mb-8">
          <SiteLogo />
           <p className="text-sm text-muted-foreground mt-1">Admin Panel</p>
        </div>
        <nav className="flex-grow space-y-2">
          {navItems.map((item) => (
            <Button
              key={item.label}
              variant={router.pathname === item.href ? 'secondary' : 'ghost'}
              className="w-full justify-start text-base"
              asChild
            >
              <Link href={item.href}>
                <item.icon className="mr-3 h-5 w-5" />
                {item.label}
              </Link>
            </Button>
          ))}
        </nav>
        <Separator className="my-6" />
        <Button variant="outline" className="w-full justify-start text-base mb-2" asChild>
             <Link href="/">
                <Home className="mr-3 h-5 w-5" />
                Back to Site
            </Link>
        </Button>
        <Button variant="ghost" className="w-full justify-start text-base text-destructive hover:text-destructive hover:bg-destructive/10" onClick={handleLogout}>
            <LogOut className="mr-3 h-5 w-5" />
            Logout
        </Button>
      </aside>
      <main className="flex-1 p-8 overflow-auto">
        {children}
      </main>
    </div>
  );
}
