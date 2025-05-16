
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Users } from "lucide-react";

export default function AdminCustomersPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-serif font-bold">Manage Customers</h1>
        <p className="text-muted-foreground">View customer profiles and their history.</p>
      </div>
      <Card className="shadow-xl rounded-xl">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Users className="mr-3 h-6 w-6 text-primary" />
            Customer Overview
          </CardTitle>
          <CardDescription>
            This section will display a list of all registered customers and their details.
            Functionality coming soon.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 text-muted-foreground">
            <Users className="h-16 w-16 mx-auto mb-4 opacity-50" />
            <p className="text-lg">Customer management features are under development.</p>
            <p>You'll soon be able to view customer details, order history, and manage accounts.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
