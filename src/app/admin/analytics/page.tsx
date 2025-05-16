
'use client'; 

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { BarChart3, DollarSign, Users, ShoppingCart, TrendingUp, AlertTriangle } from "lucide-react";
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from "@/components/ui/chart";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer, Pie, PieChart, Cell } from "recharts";
import { useEffect, useState } from "react"; 

const generateMockSalesData = () => [
  { month: "Jan", sales: Math.floor(Math.random() * 300000) + 100000 }, // KES values
  { month: "Feb", sales: Math.floor(Math.random() * 300000) + 100000 },
  { month: "Mar", sales: Math.floor(Math.random() * 300000) + 100000 },
  { month: "Apr", sales: Math.floor(Math.random() * 300000) + 100000 },
  { month: "May", sales: Math.floor(Math.random() * 300000) + 100000 },
  { month: "Jun", sales: Math.floor(Math.random() * 300000) + 200000 },
];

const mockCategoryData = [
  { name: "Men", value: 40000, fill: "hsl(var(--chart-1))" }, // KES values
  { name: "Women", value: 30000, fill: "hsl(var(--chart-2))" },
  { name: "Kids", value: 20000, fill: "hsl(var(--chart-3))" },
  { name: "Accessories", value: 27800, fill: "hsl(var(--chart-4))" },
];

const chartConfig = {
  sales: { label: "Sales (KSh)", color: "hsl(var(--chart-1))" },
  revenue: { label: "Revenue (KSh)", color: "hsl(var(--chart-2))" },
};

export default function AdminAnalyticsPage() {
  const [salesData, setSalesData] = useState<Array<{month: string; sales: number}>>([]);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setSalesData(generateMockSalesData());
    setIsClient(true); 
  }, []);

  if (!isClient) {
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
            <div className="text-3xl font-bold">KSh 4,523,189.00</div>
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
              Sales Over Time (Mock Data - KES)
            </CardTitle>
            <CardDescription>
              Monthly sales trend.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={salesData} margin={{ top: 5, right: 20, left: -20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={8} />
                  <YAxis tickLine={false} axisLine={false} tickMargin={8} tickFormatter={(value) => `KSh ${value/1000}k`} />
                  <ChartTooltip content={<ChartTooltipContent formatter={(value: any) => `KSh ${value.toLocaleString()}`} />} />
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
              Sales by Category (Mock Data - KES)
            </CardTitle>
            <CardDescription>
              Distribution of sales across product categories.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex items-center justify-center">
            <ChartContainer config={chartConfig} className="h-[300px] w-full max-w-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <ChartTooltip content={<ChartTooltipContent nameKey="name" formatter={(value: any) => `KSh ${value.toLocaleString()}`} />} />
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
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
