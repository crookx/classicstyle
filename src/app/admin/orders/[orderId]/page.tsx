
import { getOrderById } from '@/lib/firebase/firestoreService';
import { notFound } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { format } from 'date-fns';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import type { OrderStatus } from '@/types';
import UpdateOrderStatusForm from './UpdateOrderStatusForm'; // Client component for form

interface OrderDetailPageProps {
  params: { orderId: string };
}

const statusColors: Record<OrderStatus, string> = {
  Pending: "bg-yellow-500/20 text-yellow-700 border-yellow-500/50",
  Processing: "bg-blue-500/20 text-blue-700 border-blue-500/50",
  Shipped: "bg-sky-500/20 text-sky-700 border-sky-500/50",
  Delivered: "bg-green-500/20 text-green-700 border-green-500/50",
  Cancelled: "bg-red-500/20 text-red-700 border-red-500/50",
};


export default async function OrderDetailPage({ params }: OrderDetailPageProps) {
  const order = await getOrderById(params.orderId);

  if (!order) {
    notFound();
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex justify-between items-center">
        <div>
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
            <UpdateOrderStatusForm orderId={order.id} currentStatus={order.status} />
        </CardContent>
      </Card>

    </div>
  );
}
