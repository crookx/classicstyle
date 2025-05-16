
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ShoppingCart } from "lucide-react";

export default function AdminOrdersPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-serif font-bold">Manage Orders</h1>
        <p className="text-muted-foreground">View and process customer orders.</p>
      </div>
      <Card className="shadow-xl rounded-xl">
        <CardHeader>
          <CardTitle className="flex items-center">
            <ShoppingCart className="mr-3 h-6 w-6 text-primary" />
            Orders Overview
          </CardTitle>
          <CardDescription>
            This section will display a list of all orders, their statuses, and options to manage them.
            Functionality coming soon.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 text-muted-foreground">
            <ShoppingCart className="h-16 w-16 mx-auto mb-4 opacity-50" />
            <p className="text-lg">Order management features are under development.</p>
            <p>You'll soon be able to view order details, update statuses, and manage shipments here.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
