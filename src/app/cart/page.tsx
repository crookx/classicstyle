'use client';
import Image from 'next/image';
import Link from 'next/link';
import { useCart, type CartItem } from '@/contexts/CartContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Minus, Plus, Trash2, ShoppingBag } from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

export default function CartPage() {
  const { cart, removeFromCart, updateQuantity, totalItems, totalPrice, clearCart } = useCart();

  const handleQuantityChange = (productId: string, newQuantity: number) => {
    if (newQuantity >= 0) {
      updateQuantity(productId, newQuantity);
    }
  };

  if (cart.length === 0) {
    return (
      <div className="py-8 text-center">
        <div className="text-center py-16 border border-dashed border-border rounded-lg bg-card">
            <ShoppingBag className="mx-auto h-16 w-16 text-muted-foreground mb-6" />
            <h1 className="text-3xl font-bold font-serif mb-3">Your Cart is Empty</h1>
            <p className="text-muted-foreground mb-6">
                Add some beautiful items to your cart to get started.
            </p>
            <Link href="/products">
                <Button size="lg">Continue Shopping</Button>
            </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="py-8">
      <div className="mb-10 text-center">
        <h1 className="text-4xl font-bold font-serif mb-2">Your Shopping Cart</h1>
        <p className="text-lg text-muted-foreground">Review your items and proceed to checkout.</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-8 items-start">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-6">
          {cart.map((item: CartItem) => (
            <Card key={item.id} className="flex flex-col sm:flex-row items-center p-4 gap-4 shadow-md rounded-lg">
              <Link href={`/products/${item.id}`} className="shrink-0">
                <Image
                  src={item.imageUrl}
                  alt={item.name}
                  width={100}
                  height={120}
                  className="rounded-md object-cover aspect-[5/6]"
                />
              </Link>
              <div className="flex-grow">
                <Link href={`/products/${item.id}`}>
                  <h2 className="text-lg font-semibold font-serif hover:text-primary">{item.name}</h2>
                </Link>
                <p className="text-sm text-muted-foreground">{item.category}</p>
                <p className="text-md font-medium text-primary">${item.price.toFixed(2)}</p>
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                  disabled={item.quantity <= 1}
                  className="h-8 w-8"
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <Input
                  type="number"
                  value={item.quantity}
                  onChange={(e) => handleQuantityChange(item.id, parseInt(e.target.value))}
                  min="1"
                  className="w-16 h-8 text-center"
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                  className="h-8 w-8"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => removeFromCart(item.id)}
                className="text-muted-foreground hover:text-destructive"
              >
                <Trash2 className="h-5 w-5" />
              </Button>
            </Card>
          ))}
           {cart.length > 0 && (
            <div className="text-right mt-4">
              <Button variant="outline" onClick={clearCart} className="text-destructive border-destructive hover:bg-destructive/10">
                <Trash2 className="mr-2 h-4 w-4" /> Clear Cart
              </Button>
            </div>
          )}
        </div>

        {/* Order Summary */}
        <Card className="lg:col-span-1 sticky top-24 shadow-xl rounded-xl p-6">
          <CardHeader className="p-0 pb-6">
            <CardTitle className="text-2xl font-serif">Order Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 p-0">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Subtotal ({totalItems} items)</span>
              <span>${totalPrice.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Shipping</span>
              <span>Free</span> {/* Or calculate dynamically */}
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Tax</span>
              <span>Calculated at checkout</span>
            </div>
            <Separator />
            <div className="flex justify-between text-xl font-bold">
              <span>Total</span>
              <span>${totalPrice.toFixed(2)}</span>
            </div>
          </CardContent>
          <CardFooter className="p-0 pt-6">
            <Link href="/checkout" className="w-full">
              <Button size="lg" className="w-full text-lg">
                Proceed to Checkout
              </Button>
            </Link>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
