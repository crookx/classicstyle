
'use client';

import { useEffect, useState, useCallback } from 'react';
import { getOrderById } from '@/lib/firebase/firestoreService';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import type { Order, OrderStatus } from '@/types';
import UpdateOrderStatusForm from './UpdateOrderStatusForm';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2, AlertTriangle, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

const statusColors: Record<OrderStatus, string> = {
  Pending: "bg-yellow-500/20 text-yellow-700 border-yellow-500/50",
  Processing: "bg-blue-500/20 text-blue-700 border-blue-500/50",
  Shipped: "bg-sky-500/20 text-sky-700 border-sky-500/50",
  Delivered: "bg-green-500/20 text-green-700 border-green-500/50",
  Cancelled: "bg-red-500/20 text-red-700 border-red-500/50",
  PaymentFailed: "bg-destructive/20 text-destructive border-destructive/50",
};

export default function OrderDetailPage() {
  const params = useParams();
  const orderId = params.orderId as string;
  
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const { currentUser, isAdmin, loading: authLoading } = useAuth();
  const router = useRouter();

  const fetchOrder = useCallback(async () => {
    if (!orderId) return;
    setIsLoading(true);
    setError(null);
    try {
      const fetchedOrder = await getOrderById(orderId);
      if (fetchedOrder) {
        setOrder(fetchedOrder);
      } else {
        setError("Order not found.");
      }
    } catch (e: any) {
      console.error("Error fetching order:", e);
      setError("Failed to load order details. " + (e.message.includes("permission") ? "Check Firestore permissions." : e.message));
    } finally {
      setIsLoading(false);
    }
  }, [orderId]);

  useEffect(() => {
    if (!authLoading) {
      if (!currentUser || !isAdmin) {
        router.push(`/login?redirect=/admin/orders/${orderId}`);
        return;
      }
      if (currentUser && isAdmin) {
        fetchOrder();
      }
    }
  }, [currentUser, isAdmin, authLoading, orderId, router, fetchOrder]);

  const handleStatusUpdateSuccess = (newStatus: OrderStatus) => {
    setOrder(prevOrder => prevOrder ? { ...prevOrder, status: newStatus, updatedAt: new Date().toISOString() } : null);
  };


  if (authLoading || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="ml-4 text-lg text-muted-foreground">Loading order details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)] text-center">
        <AlertTriangle className="h-12 w-12 text-destructive mb-4" />
        <h2 className="text-xl font-semibold text-destructive">Error Loading Order</h2>
        <p className="text-muted-foreground">{error}</p>
        <Button onClick={() => router.push('/admin/orders')} variant="outline" className="mt-4">
          Back to Orders
        </Button>
      </div>
    );
  }

  if (!order) {
    return (
         <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)] text-center">
            <AlertTriangle className="h-12 w-12 text-muted-foreground mb-4" />
            <h2 className="text-xl font-semibold">Order Not Found</h2>
            <p className="text-muted-foreground">The requested order could not be found.</p>
             <Button onClick={() => router.push('/admin/orders')} variant="outline" className="mt-4">
                Back to Orders
            </Button>
        </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
       <div className="flex items-center gap-4">
        <Link href="/admin/orders" passHref>
          <Button variant="outline" size="icon">
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Back to Orders</span>
          </Button>
        </Link>
        <div className="flex-grow">
          <h1 className="text-3xl font-serif font-bold">Order Details</h1>
          <p className="text-muted-foreground">Order ID: {order.id}</p>
        </div>
        <Badge className={`px-3 py-1 text-sm ${statusColors[order.status] || 'bg-muted text-muted-foreground'}`}>
          {order.status}
        </Badge>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <Card className="md:col-span-2 shadow-lg rounded-xl">
          <CardHeader>
            <CardTitle className="text-xl font-serif">Order Items ({order.items.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-4">
              {order.items.map((item, index) => (
                <li key={index} className="flex items-center gap-4 p-3 bg-muted/50 rounded-md">
                  <Image
                    src={item.imageUrl || 'https://placehold.co/80x80.png'}
                    alt={item.name}
                    width={60}
                    height={60}
                    className="rounded-md object-cover aspect-square"
                  />
                  <div className="flex-grow">
                    <p className="font-medium">{item.name}</p>
                    <p className="text-sm text-muted-foreground">
                      Qty: {item.quantity} &times; KSh {item.price.toFixed(2)}
                    </p>
                  </div>
                  <p className="font-semibold">KSh {(item.quantity * item.price).toFixed(2)}</p>
                </li>
              ))}
            </ul>
          </CardContent>
          <CardFooter className="justify-end pt-4 border-t">
             <p className="text-lg font-bold">Total: KSh {order.totalAmount.toFixed(2)}</p>
          </CardFooter>
        </Card>

        <div className="space-y-6">
          <Card className="shadow-lg rounded-xl">
            <CardHeader>
              <CardTitle className="text-lg font-serif">Customer Information</CardTitle>
            </CardHeader>
            <CardContent className="text-sm space-y-1">
              <p><strong>Name:</strong> {order.customerName}</p>
              <p><strong>Email:</strong> {order.customerEmail}</p>
              {order.userId && <p className="text-xs text-muted-foreground">User ID: {order.userId}</p>}
            </CardContent>
          </Card>

          {order.shippingAddress && (
            <Card className="shadow-lg rounded-xl">
              <CardHeader>
                <CardTitle className="text-lg font-serif">Shipping Address</CardTitle>
              </CardHeader>
              <CardContent className="text-sm space-y-1">
                <p>{order.shippingAddress.address}</p>
                <p>{order.shippingAddress.city}, {order.shippingAddress.postalCode}</p>
                <p>{order.shippingAddress.country}</p>
              </CardContent>
            </Card>
          )}

          <Card className="shadow-lg rounded-xl">
            <CardHeader>
              <CardTitle className="text-lg font-serif">Order Information</CardTitle>
            </CardHeader>
            <CardContent className="text-sm space-y-1">
              <p><strong>Order Date:</strong> {order.orderDate ? format(new Date(order.orderDate), 'PPP p') : 'N/A'}</p>
              <p><strong>Last Updated:</strong> {order.updatedAt ? format(new Date(order.updatedAt), 'PPP p') : 'N/A'}</p>
              {order.paymentIntentId && <p className="text-xs text-muted-foreground">Payment ID: {order.paymentIntentId}</p>}
            </CardContent>
          </Card>
        </div>
      </div>
      
      <Card className="shadow-lg rounded-xl">
        <CardHeader>
            <CardTitle className="text-xl font-serif">Update Order Status</CardTitle>
            <CardDescription>Change the current status of this order.</CardDescription>
        </CardHeader>
        <CardContent>
            <UpdateOrderStatusForm 
              orderId={order.id} 
              currentStatus={order.status} 
              onStatusUpdateSuccess={handleStatusUpdateSuccess}
            />
        </CardContent>
      </Card>

    </div>
  );
}
