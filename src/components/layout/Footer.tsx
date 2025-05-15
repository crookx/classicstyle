import Link from 'next/link';
import { SiteLogo } from './SiteLogo';

export default function Footer() {
  const currentYear = new Date().getFullYear();
  return (
    <footer className="bg-secondary text-secondary-foreground border-t border-border/50">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <SiteLogo />
            <p className="mt-2 text-sm opacity-80">
              Timeless elegance for the modern individual.
            </p>
          </div>
          <div>
            <h3 className="font-serif text-lg font-semibold mb-3">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/about" className="hover:text-primary transition-colors">About Us</Link></li>
              <li><Link href="/contact" className="hover:text-primary transition-colors">Contact</Link></li>
              <li><Link href="/faq" className="hover:text-primary transition-colors">FAQ</Link></li>
              <li><Link href="/shipping-returns" className="hover:text-primary transition-colors">Shipping &amp; Returns</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="font-serif text-lg font-semibold mb-3">Connect</h3>
            <ul className="space-y-2 text-sm">
              <li><a href="#" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">Instagram</a></li>
              <li><a href="#" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">Facebook</a></li>
              <li><a href="#" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">Pinterest</a></li>
            </ul>
          </div>
        </div>
        <div className="mt-10 pt-8 border-t border-secondary-foreground/20 text-center text-sm opacity-70">
          <p>&copy; {currentYear} ClassicStyle eStore. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
