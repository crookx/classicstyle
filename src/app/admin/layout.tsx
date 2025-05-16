
'use client';

import { type ReactNode, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation'; // Added usePathname
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { SiteLogo } from '@/components/layout/SiteLogo'; // Kept for potential use in sidebar header
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
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
  useSidebar, // To potentially control sidebar from within the layout if needed
} from '@/components/ui/sidebar'; // Assuming sidebar.tsx is correctly set up

const navItems = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/products', label: 'Products', icon: Package },
  { href: '/admin/orders', label: 'Orders', icon: ShoppingCart, disabled: true }, // Placeholder
  { href: '/admin/customers', label: 'Customers', icon: Users, disabled: true }, // Placeholder
  { href: '/admin/analytics', label: 'Analytics', icon: BarChart3, disabled: true }, // Placeholder
  { href: '/admin/settings', label: 'Settings', icon: Settings, disabled: true }, // Placeholder
];

export default function AdminLayout({ children }: { children: ReactNode }) {
  const { currentUser, loading, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname(); // Get current path
  const { toast } = useToast();

  useEffect(() => {
    if (!loading && !currentUser) {
      router.push(`/login?redirect=${pathname}`); // Redirect to login with current path
    }
  }, [currentUser, loading, router, pathname]);

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
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <p className="text-muted-foreground">Redirecting to login...</p>
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
                  isActive={pathname === item.href}
                  tooltip={item.label}
                  disabled={item.disabled}
                  className={item.disabled ? "cursor-not-allowed opacity-50" : ""}
                >
                  <Link href={item.disabled ? "#" : item.href}>
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
          <div className="md:hidden"> {/* Show trigger only on mobile where sidebar is initially hidden */}
             <SidebarTrigger />
          </div>
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search products, orders, customers..."
              className="w-full rounded-lg bg-muted pl-8 md:w-[300px] lg:w-[400px] h-9 shadow-none"
              disabled // Placeholder search
            />
          </div>
          {/* Potentially add user avatar or other quick actions here */}
        </header>
        <main className="flex-1 p-6 md:p-8 overflow-auto">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
