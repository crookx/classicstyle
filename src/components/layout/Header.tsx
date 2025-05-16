
'use client';
import Link from 'next/link';
import { SiteLogo } from './SiteLogo';
import { Button } from '@/components/ui/button';
import { Heart, ShoppingCart, User, Search, Menu, LogIn, LogOut } from 'lucide-react'; // Removed ShieldCheck
import { useCart } from '@/contexts/CartContext';
import { useWishlist } from '@/contexts/WishlistContext';
import { useAuth } from '@/contexts/AuthContext';
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { Separator } from '@/components/ui/separator';

const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/products', label: 'Products' },
  { href: '/collections', label: 'Collections' },
];

export default function Header() {
  const { cart } = useCart();
  const { wishlist } = useWishlist();
  const { currentUser, logout, loading } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const wishlistItemCount = wishlist.length;

  const handleLogout = async () => {
    try {
      await logout();
      toast({ title: 'Logged Out', description: 'You have been successfully logged out.' });
      setMobileMenuOpen(false);
      router.push('/');
    } catch (error) {
      toast({ title: 'Logout Failed', description: 'Could not log out. Please try again.', variant: 'destructive' });
    }
  };

  return (
    <header className="bg-background/80 backdrop-blur-md sticky top-0 z-50 border-b border-border/70">
      <div className="container mx-auto px-4 h-20 flex items-center justify-between">
        <SiteLogo />
        <nav className="hidden md:flex items-center space-x-6">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-foreground hover:text-primary transition-colors font-medium"
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center space-x-1 md:space-x-2">
          {/* Desktop Icons */}
          <Button variant="ghost" size="icon" className="hidden md:inline-flex hover:bg-accent/50">
            <Search className="h-5 w-5" />
            <span className="sr-only">Search</span>
          </Button>
          <Button variant="ghost" size="icon" asChild className="hidden md:inline-flex relative hover:bg-accent/50">
            <Link href="/wishlist">
              <Heart className="h-5 w-5" />
              {wishlistItemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs rounded-full h-4 w-4 flex items-center justify-center">
                  {wishlistItemCount}
                </span>
              )}
              <span className="sr-only">Wishlist</span>
            </Link>
          </Button>
          <Button variant="ghost" size="icon" asChild className="hidden md:inline-flex relative hover:bg-accent/50">
            <Link href="/cart">
              <ShoppingCart className="h-5 w-5" />
              {cartItemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs rounded-full h-4 w-4 flex items-center justify-center">
                  {cartItemCount}
                </span>
              )}
              <span className="sr-only">Cart</span>
            </Link>
          </Button>
          
          {!loading && (
            currentUser ? (
              <Button variant="ghost" size="icon" asChild className="hidden md:inline-flex hover:bg-accent/50">
                <Link href="/account">
                  <User className="h-5 w-5" />
                  <span className="sr-only">Account</span>
                </Link>
              </Button>
            ) : (
              <Button variant="ghost" size="icon" asChild className="hidden md:inline-flex hover:bg-accent/50">
                <Link href="/login">
                  <LogIn className="h-5 w-5" />
                  <span className="sr-only">Login</span>
                </Link>
              </Button>
            )
          )}
          {loading && (
             <Button variant="ghost" size="icon" className="hidden md:inline-flex hover:bg-accent/50" disabled>
                <User className="h-5 w-5 animate-pulse" />
                <span className="sr-only">Loading User</span>
            </Button>
          )}

          {/* Mobile Menu Trigger */}
          <div className="md:hidden">
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="hover:bg-accent/50">
                  <Menu className="h-6 w-6" />
                  <span className="sr-only">Open menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[280px] bg-background p-0 flex flex-col">
                <SheetHeader className="p-6 border-b">
                  <SiteLogo />
                  <SheetTitle className="sr-only">Main Menu</SheetTitle>
                </SheetHeader>
                
                <nav className="flex-grow p-6 space-y-3">
                  {navLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      className="block text-lg text-foreground hover:text-primary transition-colors font-medium py-2"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      {link.label}
                    </Link>
                  ))}
                </nav>
                <Separator />
                <div className="p-6 space-y-3">
                  <Link href="/wishlist" className="flex items-center text-lg text-foreground hover:text-primary transition-colors font-medium py-2" onClick={() => setMobileMenuOpen(false)}>
                    <Heart className="mr-3 h-5 w-5" /> Wishlist 
                    {wishlistItemCount > 0 && <span className="ml-auto bg-primary text-primary-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center">{wishlistItemCount}</span>}
                  </Link>
                  <Link href="/cart" className="flex items-center text-lg text-foreground hover:text-primary transition-colors font-medium py-2" onClick={() => setMobileMenuOpen(false)}>
                    <ShoppingCart className="mr-3 h-5 w-5" /> Cart
                    {cartItemCount > 0 && <span className="ml-auto bg-primary text-primary-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center">{cartItemCount}</span>}
                  </Link>
                  <Separator />
                  {!loading && (
                    currentUser ? (
                      <>
                        <Link href="/account" className="flex items-center text-lg text-foreground hover:text-primary transition-colors font-medium py-2" onClick={() => setMobileMenuOpen(false)}>
                          <User className="mr-3 h-5 w-5" /> My Account
                        </Link>
                        <Button variant="ghost" className="w-full justify-start text-lg text-destructive hover:text-destructive px-0 py-2 font-medium" onClick={handleLogout}>
                          <LogOut className="mr-3 h-5 w-5" /> Logout
                        </Button>
                      </>
                    ) : (
                      <Link href="/login" className="flex items-center text-lg text-foreground hover:text-primary transition-colors font-medium py-2" onClick={() => setMobileMenuOpen(false)}>
                        <LogIn className="mr-3 h-5 w-5" /> Login / Sign Up
                      </Link>
                    )
                  )}
                  {loading && (
                    <div className="flex items-center text-lg text-muted-foreground font-medium py-2">
                        <User className="mr-3 h-5 w-5 animate-pulse" /> Loading...
                    </div>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}
