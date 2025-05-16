
import ProductForm from '@/components/admin/ProductForm';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { getProductById } from '@/lib/firebase/firestoreService';
import { notFound } from 'next/navigation';

interface EditProductPageProps {
  params: { productId: string };
}

export default async function EditProductPage({ params }: EditProductPageProps) {
  const product = await getProductById(params.productId);

  if (!product) {
    notFound();
  }

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div>
        <h1 className="text-3xl font-serif font-bold">Edit Product</h1>
        <p className="text-muted-foreground">Modify the details for "{product.name}".</p>
      </div>
      <Card className="shadow-xl rounded-xl">
        <CardHeader>
          <CardTitle>Product Information</CardTitle>
          <CardDescription>
            Update the product details below. Changes will be saved to Firestore.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ProductForm productToEdit={product} />
        </CardContent>
      </Card>
    </div>
  );
}
