
'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart, Eye, Loader2, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getOrders as fetchOrdersFromDB } from '@/lib/firebase/firestoreService';
import type { Order } from '@/types';
import { format } from 'date-fns';
import Link from "next/link";
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { currentUser, loading: authLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && !currentUser) {
      router.push('/login?redirect=/admin/orders');
      return;
    }

    if (currentUser) {
      const loadOrders = async () => {
        setIsLoading(true);
        setError(null);
        try {
          const fetchedOrders = await fetchOrdersFromDB();
          setOrders(fetchedOrders);
        } catch (e: any) {
          console.error("Error fetching orders:", e);
          setError("Failed to load orders. " + (e.message.includes("permission") ? "Check Firestore permissions." : e.message));
        } finally {
          setIsLoading(false);
        }
      };
      loadOrders();
    }
  }, [currentUser, authLoading, router]);

  if (authLoading || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="ml-4 text-lg text-muted-foreground">Loading orders...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-serif font-bold">Manage Orders</h1>
          <p className="text-muted-foreground">View and process customer orders from Firestore.</p>
        </div>
      </div>
      <Card className="shadow-xl rounded-xl">
        <CardHeader>
          <CardTitle className="flex items-center">
            <ShoppingCart className="mr-3 h-6 w-6 text-primary" />
            Recent Orders
          </CardTitle>
          <CardDescription>
            {error ? (
                <span className="text-destructive flex items-center"><AlertTriangle className="mr-2 h-4 w-4" />{error}</span>
            ) : (
                `A list of ${orders.length} customer orders fetched from Firestore.`
            )}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!error && orders.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order ID</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead className="hidden md:table-cell">Date</TableHead>
                  <TableHead className="hidden sm:table-cell">Total</TableHead>
                  <TableHead className="text-center">Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium truncate max-w-[100px] sm:max-w-[150px]">{order.id}</TableCell>
                    <TableCell>
                      <div>{order.customerName}</div>
                      <div className="text-xs text-muted-foreground hidden lg:block">{order.customerEmail}</div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      {order.orderDate ? format(new Date(order.orderDate), 'PPP') : 'N/A'}
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">KSh {order.totalAmount.toFixed(2)}</TableCell>
                    <TableCell className="text-center">
                      <Badge
                        variant={
                          order.status === "Shipped" ? "default" :
                          order.status === "Processing" ? "secondary" :
                          order.status === "Delivered" ? "default" :
                          order.status === "Cancelled" ? "destructive" :
                          "outline"
                        }
                        className={order.status === "Delivered" ? "bg-green-600 text-white dark:bg-green-700 dark:text-primary-foreground" : ""}
                      >
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
            !error && (
              <div className="text-center py-12 text-muted-foreground">
                <ShoppingCart className="h-16 w-16 mx-auto mb-4 opacity-50" />
                <p className="text-lg">No orders found in the database.</p>
              </div>
            )
          )}
        </CardContent>
      </Card>
    </div>
  );
}
