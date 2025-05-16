
'use client'; // Add this directive

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { BarChart3, DollarSign, Users, ShoppingCart, TrendingUp, AlertTriangle } from "lucide-react";
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from "@/components/ui/chart";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer, Pie, PieChart, Cell } from "recharts";
import { useEffect, useState } from "react"; // Import useEffect and useState

// Keep mockSalesData generation here. It will run once when the client module loads.
// For more complex scenarios or to avoid potential hydration issues if this data were truly dynamic
// based on client-side state before initial render, consider moving generation into useEffect.
const generateMockSalesData = () => [
  { month: "Jan", sales: Math.floor(Math.random() * 3000) + 1000 },
  { month: "Feb", sales: Math.floor(Math.random() * 3000) + 1000 },
  { month: "Mar", sales: Math.floor(Math.random() * 3000) + 1000 },
  { month: "Apr", sales: Math.floor(Math.random() * 3000) + 1000 },
  { month: "May", sales: Math.floor(Math.random() * 3000) + 1000 },
  { month: "Jun", sales: Math.floor(Math.random() * 3000) + 2000 },
];

const mockCategoryData = [
  { name: "Men", value: 400, fill: "hsl(var(--chart-1))" },
  { name: "Women", value: 300, fill: "hsl(var(--chart-2))" },
  { name: "Kids", value: 200, fill: "hsl(var(--chart-3))" },
  { name: "Accessories", value: 278, fill: "hsl(var(--chart-4))" },
];

const chartConfig = {
  sales: { label: "Sales", color: "hsl(var(--chart-1))" },
  revenue: { label: "Revenue", color: "hsl(var(--chart-2))" },
};

export default function AdminAnalyticsPage() {
  const [salesData, setSalesData] = useState<Array<{month: string; sales: number}>>([]);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    // Ensure this runs only on the client after hydration
    setSalesData(generateMockSalesData());
    setIsClient(true); // Indicate that component has mounted on client
  }, []);

  if (!isClient) {
    // Optional: Render a loading state or null until client-side mount to avoid hydration issues with charts
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-serif font-bold">Store Analytics</h1>
          <p className="text-muted-foreground">Loading analytics data...</p>
        </div>
      </div>
    ); 
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-serif font-bold">Store Analytics</h1>
        <p className="text-muted-foreground">Insights into your store's performance.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="shadow-lg rounded-xl">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">$45,231.89</div>
            <p className="text-xs text-muted-foreground pt-1">+20.1% from last month</p>
          </CardContent>
        </Card>
        <Card className="shadow-lg rounded-xl">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">New Customers</CardTitle>
            <Users className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">+235</div>
            <p className="text-xs text-muted-foreground pt-1">+18.3% from last month</p>
          </CardContent>
        </Card>
        <Card className="shadow-lg rounded-xl">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Orders This Month</CardTitle>
            <ShoppingCart className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">1,256</div>
            <p className="text-xs text-muted-foreground pt-1">+12.5% from last month</p>
          </CardContent>
        </Card>
         <Card className="shadow-lg rounded-xl">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
            <TrendingUp className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">3.2%</div>
            <p className="text-xs text-muted-foreground pt-1">+0.5% from last month</p>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="shadow-xl rounded-xl">
          <CardHeader>
            <CardTitle className="flex items-center">
              <BarChart3 className="mr-3 h-6 w-6 text-primary" />
              Sales Over Time (Mock Data)
            </CardTitle>
            <CardDescription>
              Monthly sales trend. (Dynamic data and more chart options coming soon)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={salesData} margin={{ top: 5, right: 20, left: -20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={8} />
                  <YAxis tickLine={false} axisLine={false} tickMargin={8} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="sales" fill="var(--color-sales)" radius={4} />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card className="shadow-xl rounded-xl">
          <CardHeader>
            <CardTitle className="flex items-center">
              <BarChart3 className="mr-3 h-6 w-6 text-primary" />
              Sales by Category (Mock Data)
            </CardTitle>
            <CardDescription>
              Distribution of sales across product categories.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex items-center justify-center">
            <ChartContainer config={chartConfig} className="h-[300px] w-full max-w-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <ChartTooltip content={<ChartTooltipContent nameKey="name" />} />
                  <Pie data={mockCategoryData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
                    {mockCategoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <ChartLegend content={<ChartLegendContent nameKey="name" />} />
                </PieChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-xl rounded-xl">
        <CardHeader>
          <CardTitle className="flex items-center text-amber-600">
            <AlertTriangle className="mr-3 h-6 w-6" />
            Important Note
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            The analytics data displayed here is currently **static mock data** for demonstration purposes. 
            Real-time analytics and dynamic report generation will be implemented with database integration.
            Features like customizable reports, advanced customer behavior tracking, and inventory insights are planned for future updates.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
