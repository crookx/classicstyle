
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart, MoreVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

const mockOrders = [
  { id: "ORD001", customer: "Alice Wonderland", email: "alice@example.com", date: "2024-03-10", total: "$125.50", status: "Shipped", items: 3 },
  { id: "ORD002", customer: "Bob The Builder", email: "bob@example.com", date: "2024-03-11", total: "$78.00", status: "Processing", items: 2 },
  { id: "ORD003", customer: "Charlie Brown", email: "charlie@example.com", date: "2024-03-12", total: "$210.75", status: "Delivered", items: 5 },
  { id: "ORD004", customer: "Diana Prince", email: "diana@example.com", date: "2024-03-13", total: "$45.20", status: "Pending Payment", items: 1 },
  { id: "ORD005", customer: "Edward Scissorhands", email: "edward@example.com", date: "2024-03-14", total: "$99.99", status: "Cancelled", items: 2 },
];

export default function AdminOrdersPage() {
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-serif font-bold">Manage Orders</h1>
          <p className="text-muted-foreground">View and process customer orders.</p>
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
            A list of recent customer orders. Full functionality coming soon.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {mockOrders.length > 0 ? (
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
                {mockOrders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium">{order.id}</TableCell>
                    <TableCell>
                      <div>{order.customer}</div>
                      <div className="text-xs text-muted-foreground hidden lg:block">{order.email}</div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">{order.date}</TableCell>
                    <TableCell className="hidden sm:table-cell">{order.total}</TableCell>
                    <TableCell className="text-center">
                      <Badge 
                        variant={
                          order.status === "Shipped" ? "default" :
                          order.status === "Processing" ? "secondary" :
                          order.status === "Delivered" ? "default" : // Could be a success variant
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
              <p className="text-lg">No orders found currently.</p>
              <p>Order management features are under development.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
