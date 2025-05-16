
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Package, Users, ShoppingCart, DollarSign, BarChart3 } from "lucide-react";
import { getProductsCount } from '@/lib/firebase/firestoreService'; // Updated to use Firestore
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function AdminDashboardPage() {
  const totalProducts = await getProductsCount();
  // Placeholder data - in a real app, other stats would come from Firestore/API
  const totalSales = "125,000.00"; // Example string for KES
  const pendingOrders = 5; // Example number, will fetch dynamically later
  const totalUsers = 23; // Example number, will fetch dynamically later

  const dashboardCards = [
    { title: "Total Sales", value: `KSh ${totalSales}`, icon: DollarSign, description: "+20.1% from last month", color: "text-green-600" },
    { title: "Pending Orders", value: pendingOrders.toString(), icon: ShoppingCart, description: "Awaiting processing", color: "text-orange-500", href: "/admin/orders" },
    { title: "Total Products", value: totalProducts.toString(), icon: Package, description: "Currently in store", href: "/admin/products" },
    { title: "Registered Users", value: totalUsers.toString(), icon: Users, description: "Active and inactive", href: "/admin/customers" },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-serif font-bold">Admin Dashboard</h1>
        <p className="text-muted-foreground">Welcome back, Admin! Here's an overview of your store.</p>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {dashboardCards.map((card) => (
          <Card key={card.title} className="shadow-lg rounded-xl hover:shadow-xl transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
              <card.icon className={`h-5 w-5 ${card.color || 'text-muted-foreground'}`} />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{card.value}</div>
              <p className="text-xs text-muted-foreground pt-1">
                {card.description}
              </p>
              {card.href && (
                <Link href={card.disabled ? "#" : card.href} className="mt-3 block">
                  <Button variant="outline" size="sm" className="text-xs w-full" disabled={card.disabled}>
                    View {card.title.split(' ')[1] || card.title}
                  </Button>
                </Link>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="shadow-xl rounded-xl">
          <CardHeader>
            <CardTitle className="text-xl font-serif flex items-center">
                <BarChart3 className="mr-3 h-6 w-6 text-primary"/>
                Recent Activity
            </CardTitle>
            <CardDescription>
              A quick look at recent store events. (Placeholder)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3 text-sm text-muted-foreground">
                <li>New order #ORDMOCK1 placed by customer@example.com.</li>
                <li>Product "Classic Silk Scarf" stock updated.</li>
                <li>New user signed up: newuser@example.com.</li>
                <li>"Men's Wardrobe Essentials" collection viewed 50 times today.</li>
            </ul>
          </CardContent>
        </Card>
        <Card className="shadow-xl rounded-xl">
          <CardHeader>
            <CardTitle className="text-xl font-serif">Quick Actions</CardTitle>
            <CardDescription>
              Common tasks at your fingertips.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-4">
            <Link href="/admin/products/new" passHref>
                <Button variant="default" className="w-full">Add New Product</Button>
            </Link>
            <Button variant="outline" className="w-full" disabled>Manage Discounts</Button>
            <Button variant="outline" className="w-full" disabled>View Reports</Button>
            <Button variant="outline" className="w-full" disabled>Site Settings</Button>
          </CardContent>
        </Card>
      </div>
      
      <Card className="shadow-xl rounded-xl">
        <CardHeader>
          <CardTitle className="text-xl font-serif">Welcome to ClassicStyle Admin Panel</CardTitle>
          <CardDescription>
            This is your central hub for managing the e-commerce store. Use the navigation on the left to manage products, view users, and process orders.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            This panel now fetches product counts from Firestore. Other dynamic data and features will be added progressively.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
