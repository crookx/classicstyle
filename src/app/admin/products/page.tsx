
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { getProducts } from '@/lib/firebase/firestoreService';
import type { Product } from '@/types';
import Image from 'next/image';
import { PlusCircle, Edit, Trash2, Eye } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

// This component fetches data on the server.
export default async function AdminProductsPage() {
  const products: Product[] = await getProducts(); 

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-serif font-bold">Manage Products</h1>
          <p className="text-muted-foreground">View, add, edit, or delete products in your store.</p>
        </div>
        <Link href="/admin/products/new">
          <Button>
            <PlusCircle className="mr-2 h-5 w-5" /> Add New Product
          </Button>
        </Link>
      </div>

      <Card className="shadow-xl rounded-xl">
        <CardHeader>
          <CardTitle>Product List</CardTitle>
          <CardDescription>A total of {products.length} products found. Data fetched from Firestore.</CardDescription>
        </CardHeader>
        <CardContent>
          {products.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[60px] hidden sm:table-cell">Image</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead className="hidden md:table-cell">SKU</TableHead>
                  <TableHead className="hidden lg:table-cell">Category</TableHead>
                  <TableHead className="text-right">Price</TableHead>
                  <TableHead className="text-center hidden md:table-cell">Status</TableHead>
                  <TableHead className="text-right w-[150px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell className="hidden sm:table-cell">
                      <Image 
                        src={product.imageUrl || 'https://placehold.co/100x100.png'} 
                        alt={product.name} 
                        width={48} 
                        height={48} 
                        className="rounded-md object-cover aspect-square" 
                        data-ai-hint={product.dataAiHint || product.category || 'product image'}
                      />
                    </TableCell>
                    <TableCell className="font-medium">{product.name}</TableCell>
                    <TableCell className="hidden md:table-cell">{product.sku || 'N/A'}</TableCell>
                    <TableCell className="hidden lg:table-cell">{product.category || 'N/A'}</TableCell>
                    <TableCell className="text-right">${product.price.toFixed(2)}</TableCell>
                    <TableCell className="text-center hidden md:table-cell">
                      <Badge variant={product.isFeatured ? "default" : "outline"}>
                        {product.isFeatured ? "Featured" : "Active"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right space-x-1">
                      <Link href={`/products/${product.id}`} passHref legacyBehavior>
                        <Button variant="ghost" size="icon" asChild title="View Product">
                          <a><Eye className="h-4 w-4" /></a>
                        </Button>
                      </Link>
                      {/* Edit and Delete actions would require server actions and forms/modals */}
                      <Button variant="ghost" size="icon" disabled title="Edit Product (coming soon)">
                        <Edit className="h-4 w-4" />
                        <span className="sr-only">Edit</span>
                      </Button>
                      <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive hover:bg-destructive/10" disabled title="Delete Product (coming soon)">
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only">Delete</span>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
             <p className="text-center text-muted-foreground py-8">No products found in the database.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
