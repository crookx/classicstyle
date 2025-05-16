
import ProductForm from '@/components/admin/ProductForm';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

export default function AddNewProductPage() {
  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div>
        <h1 className="text-3xl font-serif font-bold">Add New Product</h1>
        <p className="text-muted-foreground">Fill in the details below to add a new product to your store.</p>
      </div>
      <Card className="shadow-xl rounded-xl">
        <CardHeader>
          <CardTitle>Product Information</CardTitle>
          <CardDescription>
            Provide all the necessary information for the new product.
            Remember that data modification is in-memory for this demo.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ProductForm />
        </CardContent>
      </Card>
    </div>
  );
}
