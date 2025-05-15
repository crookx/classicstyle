'use client';
import Link from 'next/link';
import { SiteLogo } from './SiteLogo';
import { Button } from '@/components/ui/button';
import { Heart, ShoppingCart, User, Search, Menu } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { useWishlist } from '@/contexts/WishlistContext';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { useState } from 'react';

const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/products', label: 'Products' },
  { href: '/collections', label: 'Collections' },
];

export default function Header() {
  const { cart } = useCart();
  const { wishlist } = useWishlist();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const wishlistItemCount = wishlist.length;

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
        <div className="flex items-center space-x-3 md:space-x-4">
          <Button variant="ghost" size="icon" className="hover:bg-accent/50">
            <Search className="h-5 w-5" />
            <span className="sr-only">Search</span>
          </Button>
          <Link href="/wishlist" passHref>
            <Button variant="ghost" size="icon" className="relative hover:bg-accent/50">
              <Heart className="h-5 w-5" />
              {wishlistItemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs rounded-full h-4 w-4 flex items-center justify-center">
                  {wishlistItemCount}
                </span>
              )}
              <span className="sr-only">Wishlist</span>
            </Button>
          </Link>
          <Link href="/cart" passHref>
            <Button variant="ghost" size="icon" className="relative hover:bg-accent/50">
              <ShoppingCart className="h-5 w-5" />
              {cartItemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs rounded-full h-4 w-4 flex items-center justify-center">
                  {cartItemCount}
                </span>
              )}
              <span className="sr-only">Cart</span>
            </Button>
          </Link>
          <Button variant="ghost" size="icon" className="hover:bg-accent/50">
            <User className="h-5 w-5" />
            <span className="sr-only">Account</span>
          </Button>
          <div className="md:hidden">
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="hover:bg-accent/50">
                  <Menu className="h-6 w-6" />
                  <span className="sr-only">Open menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[280px] bg-background p-6">
                <div className="mt-8 flex flex-col space-y-4">
                <SiteLogo />
                  {navLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      className="text-lg text-foreground hover:text-primary transition-colors font-medium py-2"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      {link.label}
                    </Link>
                  ))}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}
