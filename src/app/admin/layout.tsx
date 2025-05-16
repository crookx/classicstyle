
'use client';

import { type ReactNode, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { SiteLogo } from '@/components/layout/SiteLogo';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button'; // Added missing import
import {
  LayoutDashboard,
  Package,
  LogOut,
  Home,
  Loader2,
  ShoppingCart,
  Users,
  BarChart3,
  Settings,
  Search,
  ShieldAlert, // For unauthorized message
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarTrigger,
  SidebarInset,
} from '@/components/ui/sidebar';

const navItems = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/products', label: 'Products', icon: Package },
  { href: '/admin/orders', label: 'Orders', icon: ShoppingCart },
  { href: '/admin/customers', label: 'Customers', icon: Users },
  { href: '/admin/analytics', label: 'Analytics', icon: BarChart3 },
  { href: '/admin/settings', label: 'Settings', icon: Settings },
];

export default function AdminLayout({ children }: { children: ReactNode }) {
  const { currentUser, isAdmin, loading, logout, refreshAuthToken } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const { toast } = useToast();

  useEffect(() => {
    if (!loading && currentUser) {
      // Manually refresh token to ensure claims are up-to-date after login
      // This helps if claims were set just before login
      refreshAuthToken();
    }
  }, [currentUser, loading, refreshAuthToken]);


  useEffect(() => {
    if (!loading) {
      if (!currentUser) {
        router.push(`/login?redirect=${pathname}`);
      } else if (isAdmin === false) { // Explicitly check for false after loading isAdmin status
        // Don't redirect if isAdmin is null (still loading claims)
        // Only redirect if definitely not an admin
      }
    }
  }, [currentUser, isAdmin, loading, router, pathname]);


  const handleLogout = async () => {
    try {
      await logout();
      toast({ title: 'Logged Out', description: 'You have been successfully logged out from admin.' });
      router.push('/login');
    } catch (error) {
      toast({ title: 'Logout Failed', description: 'Could not log out. Please try again.', variant: 'destructive' });
    }
  };

  if (loading || isAdmin === null) { // Also wait for isAdmin to be determined
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="ml-4 text-lg">Loading admin panel...</p>
      </div>
    );
  }

  if (!currentUser) {
     // This case should be caught by the useEffect, but as a fallback:
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <p className="text-muted-foreground">Redirecting to login...</p>
      </div>
    );
  }
  
  if (isAdmin === false) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-background p-6 text-center">
        <ShieldAlert className="h-16 w-16 text-destructive mb-6" />
        <h1 className="text-3xl font-serif font-bold mb-4">Access Denied</h1>
        <p className="text-lg text-muted-foreground mb-6">
          You do not have permission to access the admin panel.
        </p>
        <div className="space-x-4">
          <Link href="/" passHref>
            <Button variant="outline">Go to Homepage</Button>
          </Link>
          <Button onClick={handleLogout} variant="destructive">Logout</Button>
        </div>
      </div>
    );
  }


  return (
    <SidebarProvider defaultOpen>
      <Sidebar collapsible="icon" className="border-r border-border/70">
        <SidebarHeader className="p-4 border-b border-border/70">
          <div className="flex items-center gap-2">
            <SiteLogo />
            <span className="font-semibold text-lg group-data-[collapsible=icon]:hidden">Admin</span>
          </div>
        </SidebarHeader>
        <SidebarContent className="p-2">
          <SidebarMenu>
            {navItems.map((item) => (
              <SidebarMenuItem key={item.label}>
                <SidebarMenuButton
                  asChild
                  isActive={pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href))}
                  tooltip={item.label}
                >
                  <Link href={item.href}>
                    <item.icon />
                    <span>{item.label}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarContent>
        <SidebarFooter className="p-2 border-t border-border/70">
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild tooltip="Back to Site">
                <Link href="/">
                  <Home />
                  <span>Back to Site</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton onClick={handleLogout} className="text-destructive hover:bg-destructive/10 hover:text-destructive" tooltip="Logout">
                <LogOut />
                <span>Logout</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>

      <SidebarInset>
        <header className="sticky top-0 z-40 flex h-14 items-center gap-4 border-b bg-background/80 backdrop-blur-sm px-6 shadow-sm">
          <div className="md:hidden">
             <SidebarTrigger />
          </div>
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search products, orders, customers..."
              className="w-full rounded-lg bg-muted pl-8 md:w-[300px] lg:w-[400px] h-9 shadow-none"
              disabled
            />
          </div>
        </header>
        <main className="flex-1 p-6 md:p-8 overflow-auto">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
