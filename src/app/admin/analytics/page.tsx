
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { BarChart3 } from "lucide-react";

export default function AdminAnalyticsPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-serif font-bold">Store Analytics</h1>
        <p className="text-muted-foreground">Insights into your store's performance.</p>
      </div>
      <Card className="shadow-xl rounded-xl">
        <CardHeader>
          <CardTitle className="flex items-center">
            <BarChart3 className="mr-3 h-6 w-6 text-primary" />
            Analytics Overview
          </CardTitle>
          <CardDescription>
            This section will display key metrics, sales trends, and customer behavior reports.
            Functionality coming soon.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 text-muted-foreground">
            <BarChart3 className="h-16 w-16 mx-auto mb-4 opacity-50" />
            <p className="text-lg">Analytics features are under development.</p>
            <p>You'll soon be able to track sales, revenue, popular products, and more.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
