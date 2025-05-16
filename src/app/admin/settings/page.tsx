
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Settings, Store, CreditCard, Truck, Shield,Palette } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";

export default function AdminSettingsPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-serif font-bold">Store Settings</h1>
        <p className="text-muted-foreground">Configure your e-commerce store.</p>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Left Column for Main Settings */}
        <div className="lg:col-span-2 space-y-8">
          <Card className="shadow-xl rounded-xl">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Store className="mr-3 h-6 w-6 text-primary" />
                Store Details
              </CardTitle>
              <CardDescription>
                Manage basic information about your store. (Functionality is illustrative)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="storeName">Store Name</Label>
                <Input id="storeName" defaultValue="ClassicStyle eStore" disabled />
              </div>
              <div className="space-y-2">
                <Label htmlFor="storeEmail">Contact Email</Label>
                <Input id="storeEmail" type="email" defaultValue="support@classicstyle.com" disabled />
              </div>
              <div className="space-y-2">
                <Label htmlFor="storePhone">Phone Number</Label>
                <Input id="storePhone" type="tel" defaultValue="+1 (555) 123-4567" disabled />
              </div>
              <div className="space-y-2">
                <Label htmlFor="storeAddress">Store Address</Label>
                <Input id="storeAddress" defaultValue="123 Elegance Avenue, New York, NY" disabled />
              </div>
              <Button disabled>Save Store Details</Button>
            </CardContent>
          </Card>

          <Card className="shadow-xl rounded-xl">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Palette className="mr-3 h-6 w-6 text-primary" />
                Theme & Appearance (Coming Soon)
              </CardTitle>
              <CardDescription>
                Customize the look and feel of your storefront.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="darkMode">Enable Dark Mode for Storefront</Label>
                <Switch id="darkMode" disabled />
              </div>
              <p className="text-sm text-muted-foreground">More theme options, logo upload, and color palette customization will be available here.</p>
              <Button variant="outline" disabled>Customize Theme</Button>
            </CardContent>
          </Card>
        </div>

        {/* Right Column for Other Settings */}
        <div className="space-y-8">
          <Card className="shadow-lg rounded-xl">
            <CardHeader>
              <CardTitle className="flex items-center">
                <CreditCard className="mr-3 h-5 w-5 text-primary" />
                Payment Gateways
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">Connect and manage payment providers. (Illustrative)</p>
              <Button variant="outline" className="w-full" disabled>Connect Stripe</Button>
              <Button variant="outline" className="w-full mt-2" disabled>Connect PayPal</Button>
            </CardContent>
          </Card>

          <Card className="shadow-lg rounded-xl">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Truck className="mr-3 h-5 w-5 text-primary" />
                Shipping Options
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">Configure shipping zones and rates. (Illustrative)</p>
              <Button variant="outline" className="w-full" disabled>Manage Shipping Zones</Button>
            </CardContent>
          </Card>
          
          <Card className="shadow-lg rounded-xl">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Shield className="mr-3 h-5 w-5 text-primary" />
                Security &amp; Backup
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">Manage site security and data backups. (Illustrative)</p>
              <Button variant="outline" className="w-full" disabled>Configure Backups</Button>
            </CardContent>
          </Card>
        </div>
      </div>

       <Card className="shadow-xl rounded-xl mt-8">
        <CardHeader>
          <CardTitle className="flex items-center text-amber-600">
             <Settings className="mr-3 h-6 w-6" />
            Settings Development Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            The settings displayed are for **illustrative purposes** to show the structure of the admin panel.
            Actual functionality for saving these settings requires database integration and backend logic.
            Features like theme customization, payment gateway integration, and detailed shipping configurations are planned.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
