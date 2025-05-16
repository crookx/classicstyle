
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Package, Users, ShoppingCart } from "lucide-react"; // Example icons

export default function AdminDashboardPage() {
  return (
    <div className="space-y-8">
      <h1 className="text-4xl font-serif font-bold">Admin Dashboard</h1>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="shadow-lg rounded-xl">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Products</CardTitle>
            <Package className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">18</div> {/* Placeholder value */}
            <p className="text-xs text-muted-foreground">
              Manage all your products
            </p>
          </CardContent>
        </Card>
        
        <Card className="shadow-lg rounded-xl">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">5</div> {/* Placeholder value */}
            <p className="text-xs text-muted-foreground">
              View registered users
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-lg rounded-xl">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Orders</CardTitle>
            <ShoppingCart className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div> {/* Placeholder value */}
            <p className="text-xs text-muted-foreground">
              Process incoming orders
            </p>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-xl rounded-xl">
        <CardHeader>
          <CardTitle className="text-xl font-serif">Welcome to ClassicStyle Admin</CardTitle>
          <CardDescription>
            This is your central hub for managing the e-commerce store. Use the navigation on the left to manage products, view users, and process orders.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            More features like order management, user management, and site analytics will be added soon.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
