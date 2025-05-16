
'use client';

import { useEffect, useState, useCallback } from 'react';
import { getUserById, getOrdersByUserId } from '@/lib/firebase/firestoreService';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import type { UserProfile, Order } from '@/types';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2, AlertTriangle, Mail, UserCircle, ShoppingBag, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';

const statusColors: Record<Order['status'], string> = {
  Pending: "bg-yellow-500/20 text-yellow-700 border-yellow-500/50",
  Processing: "bg-blue-500/20 text-blue-700 border-blue-500/50",
  Shipped: "bg-sky-500/20 text-sky-700 border-sky-500/50",
  Delivered: "bg-green-500/20 text-green-700 border-green-500/50",
  Cancelled: "bg-red-500/20 text-red-700 border-red-500/50",
};

export default function CustomerDetailPage() {
  const params = useParams();
  const customerId = params.customerId as string;
  
  const [customer, setCustomer] = useState<UserProfile | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const { currentUser, isAdmin, loading: authLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const fetchCustomerAndOrders = useCallback(async () => {
    if (!customerId) return;
    setIsLoading(true);
    setError(null);
    try {
      const fetchedCustomer = await getUserById(customerId);
      if (fetchedCustomer) {
        setCustomer(fetchedCustomer);
        const fetchedOrders = await getOrdersByUserId(customerId); // Assuming userId in Order matches customerId (UserProfile id)
        setOrders(fetchedOrders);
      } else {
        setError("Customer profile not found.");
      }
    } catch (e: any) {
      console.error("Error fetching customer details or orders:", e);
      setError("Failed to load customer details. " + (e.message.includes("permission") ? "Check Firestore permissions." : e.message));
    } finally {
      setIsLoading(false);
    }
  }, [customerId]);

  useEffect(() => {
    if (!authLoading) {
      if (!currentUser || !isAdmin) {
        router.push(`/login?redirect=/admin/customers/${customerId}`);
        return;
      }
      if (currentUser && isAdmin) {
        fetchCustomerAndOrders();
      }
    }
  }, [currentUser, isAdmin, authLoading, customerId, router, fetchCustomerAndOrders]);
  
  const handleSendEmail = (customerEmail: string) => {
    window.location.href = `mailto:${customerEmail}`;
    toast({
      title: 'Opening Email Client',
      description: `Preparing to send email to ${customerEmail}.`,
    });
  };

  if (authLoading || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="ml-4 text-lg text-muted-foreground">Loading customer details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)] text-center">
        <AlertTriangle className="h-12 w-12 text-destructive mb-4" />
        <h2 className="text-xl font-semibold text-destructive">Error Loading Customer</h2>
        <p className="text-muted-foreground">{error}</p>
        <Button onClick={() => router.push('/admin/customers')} variant="outline" className="mt-4">
          Back to Customers
        </Button>
      </div>
    );
  }

  if (!customer) {
    return (
         <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)] text-center">
            <AlertTriangle className="h-12 w-12 text-muted-foreground mb-4" />
            <h2 className="text-xl font-semibold">Customer Not Found</h2>
            <p className="text-muted-foreground">The requested customer could not be found.</p>
             <Button onClick={() => router.push('/admin/customers')} variant="outline" className="mt-4">
                Back to Customers
            </Button>
        </div>
    );
  }

  return (
    <div className="space-y-8">
        <div className="flex items-center gap-4">
            <Link href="/admin/customers" passHref>
            <Button variant="outline" size="icon">
                <ArrowLeft className="h-4 w-4" />
                <span className="sr-only">Back to Customers</span>
            </Button>
            </Link>
            <div>
            <h1 className="text-3xl font-serif font-bold">Customer Profile</h1>
            <p className="text-muted-foreground">Details for {customer.displayName || customer.email}</p>
            </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <Card className="md:col-span-1 shadow-lg rounded-xl">
          <CardHeader className="items-center text-center">
            <Avatar className="h-24 w-24 mb-4 border-2 border-primary">
              {customer.photoURL && <AvatarImage src={customer.photoURL} alt={customer.displayName || customer.email} />}
              <AvatarFallback className="text-3xl">
                {customer.displayName ? customer.displayName.substring(0, 2).toUpperCase() : customer.email.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <CardTitle className="text-2xl font-serif">{customer.displayName || `${customer.firstName || ''} ${customer.lastName || ''}`.trim() || 'N/A'}</CardTitle>
            <CardDescription>{customer.email}</CardDescription>
             {customer.phone && <CardDescription>{customer.phone}</CardDescription>}
          </CardHeader>
          <CardContent className="text-sm space-y-2">
            <p><strong>Joined:</strong> {customer.createdAt ? format(new Date(customer.createdAt), 'PPP') : 'N/A'}</p>
            <p><strong>User ID:</strong> {customer.id}</p>
            <Button onClick={() => handleSendEmail(customer.email)} variant="outline" className="w-full mt-4">
                <Mail className="mr-2 h-4 w-4" /> Send Email
            </Button>
            {/* Placeholder for more actions */}
            {/* <Button variant="secondary" className="w-full mt-2" disabled>Edit Profile</Button> */}
          </CardContent>
        </Card>

        <div className="md:col-span-2 space-y-6">
          <Card className="shadow-lg rounded-xl">
            <CardHeader>
              <CardTitle className="text-xl font-serif flex items-center">
                <ShoppingBag className="mr-3 h-5 w-5 text-primary" />
                Order History ({orders.length})
              </CardTitle>
              <CardDescription>Orders placed by this customer.</CardDescription>
            </CardHeader>
            <CardContent>
              {orders.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Order ID</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Total</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">View</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {orders.map(order => (
                      <TableRow key={order.id}>
                        <TableCell className="font-medium truncate max-w-[100px]">{order.id}</TableCell>
                        <TableCell>{format(new Date(order.orderDate), 'PP')}</TableCell>
                        <TableCell>KSh {order.totalAmount.toFixed(2)}</TableCell>
                        <TableCell>
                           <Badge className={`px-2 py-0.5 text-xs ${statusColors[order.status] || 'bg-muted text-muted-foreground'}`}>
                            {order.status}
                           </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Link href={`/admin/orders/${order.id}`} passHref legacyBehavior>
                            <Button variant="ghost" size="icon" asChild title="View Order Details">
                              <a><Eye className="h-4 w-4" /></a>
                            </Button>
                          </Link>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <p className="text-muted-foreground text-center py-6">No orders found for this customer.</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

