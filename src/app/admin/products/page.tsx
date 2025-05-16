
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { mockProducts } from '@/data/mock-data'; // We'll read from this for display
import type { Product } from '@/types';
import Image from 'next/image';
import { PlusCircle, Edit, Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

// For this page, we'll just display mockProducts. 
// Real applications would fetch this data from a database.

export default function AdminProductsPage() {
  const products: Product[] = mockProducts; // In a real app, this would be a fetch call

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
          <CardDescription>A total of {products.length} products found.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[80px]">Image</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>SKU</TableHead>
                <TableHead>Category</TableHead>
                <TableHead className="text-right">Price</TableHead>
                <TableHead className="text-center">Stock</TableHead> {/* Placeholder */}
                <TableHead className="text-center">Status</TableHead> {/* Placeholder */}
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.map((product) => (
                <TableRow key={product.id}>
                  <TableCell>
                    <Image 
                      src={product.imageUrl || 'https://placehold.co/100x100.png'} 
                      alt={product.name} 
                      width={60} 
                      height={60} 
                      className="rounded-md object-cover aspect-square" 
                    />
                  </TableCell>
                  <TableCell className="font-medium">{product.name}</TableCell>
                  <TableCell>{product.sku || 'N/A'}</TableCell>
                  <TableCell>{product.category || 'N/A'}</TableCell>
                  <TableCell className="text-right">${product.price.toFixed(2)}</TableCell>
                  <TableCell className="text-center">N/A</TableCell> {/* Placeholder */}
                  <TableCell className="text-center">
                    <Badge variant="default">Published</Badge> {/* Placeholder */}
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button variant="outline" size="icon" asChild disabled> {/* Edit disabled for now */}
                      <Link href={`/admin/products/${product.id}/edit`}>
                        <Edit className="h-4 w-4" />
                        <span className="sr-only">Edit</span>
                      </Link>
                    </Button>
                    <Button variant="destructive" size="icon" disabled> {/* Delete disabled for now */}
                      <Trash2 className="h-4 w-4" />
                      <span className="sr-only">Delete</span>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {products.length === 0 && (
            <p className="text-center text-muted-foreground py-8">No products found. Add your first product!</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
