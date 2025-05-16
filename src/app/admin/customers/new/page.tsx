
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function AddNewCustomerPage() {
  return (
    <div className="space-y-8 max-w-2xl mx-auto">
      <div className="flex items-center gap-4">
        <Link href="/admin/customers" passHref>
          <Button variant="outline" size="icon">
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Back to Customers</span>
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-serif font-bold">Add New Customer</h1>
          <p className="text-muted-foreground">Customer account creation guidance.</p>
        </div>
      </div>
      <Card className="shadow-xl rounded-xl">
        <CardHeader>
          <CardTitle>Important Note on Customer Creation</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-foreground/80">
            Currently, new customer accounts (including Firebase Authentication credentials) should be created through the main website's signup page. This ensures that users set their own passwords securely.
          </p>
          <p className="text-foreground/80">
            Once a user signs up on the main site, their profile information will automatically appear in the "Manage Customers" list if the system is configured correctly.
          </p>
          <p className="text-muted-foreground text-sm">
            Directly creating authenticated users from the admin panel is a complex feature typically reserved for specific internal use cases and requires careful security considerations. This functionality may be added in a future update.
          </p>
          <div className="pt-4">
            <Link href="/login" passHref>
                <Button variant="secondary">Go to Signup/Login Page</Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
