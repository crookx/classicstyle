
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart, MoreVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { getOrders } from '@/lib/firebase/firestoreService';
import type { Order } from '@/types';
import { format } from 'date-fns'; // For formatting dates

export default async function AdminOrdersPage() {
  const orders: Order[] = await getOrders(); // Fetch orders from Firestore

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-serif font-bold">Manage Orders</h1>
          <p className="text-muted-foreground">View and process customer orders from Firestore.</p>
        </div>
        <Button disabled>
            <ShoppingCart className="mr-2 h-5 w-5" /> Create New Order (Coming Soon)
        </Button>
      </div>
      <Card className="shadow-xl rounded-xl">
        <CardHeader>
          <CardTitle className="flex items-center">
            <ShoppingCart className="mr-3 h-6 w-6 text-primary" />
            Recent Orders
          </CardTitle>
          <CardDescription>
            A list of {orders.length} customer orders fetched from Firestore. Full functionality coming soon.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {orders.length > 0 ? (
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
                    <TableCell className="font-medium truncate max-w-[100px]">{order.id}</TableCell>
                    <TableCell>
                      <div>{order.customerName}</div>
                      <div className="text-xs text-muted-foreground hidden lg:block">{order.customerEmail}</div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      {/* Assuming orderDate is a string like 'YYYY-MM-DD' */}
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
                        className={order.status === "Delivered" ? "bg-green-600 text-white" : ""}
                      >
                        {order.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" disabled>
                            <MoreVertical className="h-4 w-4" />
                            <span className="sr-only">Order Actions</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem disabled>View Details</DropdownMenuItem>
                          <DropdownMenuItem disabled>Update Status</DropdownMenuItem>
                          <DropdownMenuItem disabled className="text-destructive">Cancel Order</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <ShoppingCart className="h-16 w-16 mx-auto mb-4 opacity-50" />
              <p className="text-lg">No orders found in the database.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
