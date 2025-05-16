
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Settings } from "lucide-react";

export default function AdminSettingsPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-serif font-bold">Store Settings</h1>
        <p className="text-muted-foreground">Configure your e-commerce store.</p>
      </div>
      <Card className="shadow-xl rounded-xl">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Settings className="mr-3 h-6 w-6 text-primary" />
            Settings Overview
          </CardTitle>
          <CardDescription>
            This section will allow you to manage store settings, payment gateways, shipping options, and more.
            Functionality coming soon.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 text-muted-foreground">
            <Settings className="h-16 w-16 mx-auto mb-4 opacity-50" />
            <p className="text-lg">Store settings features are under development.</p>
            <p>You'll soon be able to customize various aspects of your store here.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
