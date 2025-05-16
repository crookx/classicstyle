
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import type { Product, ProductColor } from '@/types';
import { addProductAction, updateProductAction } from '@/lib/actions/productActions';
import { useRouter } from 'next/navigation';
import { Checkbox } from '../ui/checkbox';
import { useState } from 'react';
import { Loader2 } from 'lucide-react';

// Base schema without ID, used for validation and transformation
const productFormSchemaBase = z.object({
  name: z.string().min(3, { message: "Product name must be at least 3 characters." }),
  price: z.coerce.number().positive({ message: "Price must be a positive number." }),
  originalPrice: z.coerce.number().optional().transform(val => val || undefined), // Store as undefined if empty
  stock: z.coerce.number().int().min(0, { message: "Stock must be a non-negative integer." }), // Added stock
  imageUrl: z.string().url({ message: "Please enter a valid image URL." }).or(z.literal('')),
  dataAiHint: z.string().optional(),
  category: z.string().min(2, { message: "Category is required." }),
  subCategory: z.string().optional(),
  description: z.string().min(10, { message: "Description must be at least 10 characters." }),
  details: z.string().optional(), // Comma or newline separated string for input
  colors: z.string().optional(), // Format: Name1:HEX1,Name2:HEX2
  sizes: z.string().optional(),  // Comma separated string
  tags: z.string().optional(),   // Comma separated string
  sku: z.string().optional(),
  isFeatured: z.boolean().default(false).optional(),
});

// For the form, we don't necessarily need the ID for validation if it's handled by initialData
type ProductFormValues = z.infer<typeof productFormSchemaBase>;

interface ProductFormProps {
  productToEdit?: Product | null;
}

export default function ProductForm({ productToEdit }: ProductFormProps) {
  const { toast } = useToast();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isEditMode = !!productToEdit;

  const defaultValues: ProductFormValues = productToEdit ? {
    name: productToEdit.name || '',
    price: productToEdit.price || 0,
    originalPrice: productToEdit.originalPrice || undefined,
    stock: productToEdit.stock || 0, // Added stock
    imageUrl: productToEdit.imageUrl || '',
    dataAiHint: productToEdit.dataAiHint || '',
    category: productToEdit.category || '',
    subCategory: productToEdit.subCategory || '',
    description: productToEdit.description || '',
    details: productToEdit.details?.join('\\n') || '', // Join by newline for textarea
    colors: productToEdit.colors?.map(c => `${c.name}:${c.hex}`).join(', ') || '',
    sizes: productToEdit.sizes?.join(', ') || '',
    tags: productToEdit.tags?.join(', ') || '',
    sku: productToEdit.sku || '',
    isFeatured: productToEdit.isFeatured || false,
  } : {
    name: '',
    price: 0,
    originalPrice: undefined,
    stock: 0, // Added stock
    imageUrl: '',
    dataAiHint: '',
    category: '',
    subCategory: '',
    description: '',
    details: '',
    colors: '',
    sizes: '',
    tags: '',
    sku: '',
    isFeatured: false,
  };

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productFormSchemaBase),
    defaultValues: defaultValues,
  });

  async function onSubmit(data: ProductFormValues) {
    setIsSubmitting(true);

    const submissionData = isEditMode && productToEdit ? { ...data, id: productToEdit.id } : data;

    try {
      const result = isEditMode
        ? await updateProductAction(submissionData)
        : await addProductAction(submissionData);

      if (result.success && result.data) {
        toast({
          title: isEditMode ? "Product Updated!" : "Product Added!",
          description: `${result.data.name} has been successfully ${isEditMode ? 'updated' : 'added'}.`,
        });
        router.push('/admin/products');
        router.refresh(); // Ensure the product list page re-fetches
      } else {
        toast({
          title: "Error",
          description: result.error || `Failed to ${isEditMode ? 'update' : 'add'} product.`,
          variant: "destructive",
        });
         if (result.fieldErrors) {
          Object.entries(result.fieldErrors).forEach(([field, errors]) => {
            if (errors && errors.length > 0) {
              form.setError(field as keyof ProductFormValues, { type: 'manual', message: errors.join(', ') });
            }
          });
        }
      }
    } catch (error) {
      console.error("Product form submission error:", error);
      toast({
        title: "Submission Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField control={form.control} name="name" render={({ field }) => (
            <FormItem><FormLabel>Product Name</FormLabel><FormControl><Input placeholder="e.g., Classic Silk Scarf" {...field} /></FormControl><FormMessage /></FormItem>
          )} />
          <FormField control={form.control} name="sku" render={({ field }) => (
            <FormItem><FormLabel>SKU (Optional)</FormLabel><FormControl><Input placeholder="e.g., CS-SLK-SCR-001" {...field} /></FormControl><FormMessage /></FormItem>
          )} />
        </div>

        <FormField control={form.control} name="description" render={({ field }) => (
          <FormItem><FormLabel>Description</FormLabel><FormControl><Textarea placeholder="Detailed product description..." {...field} rows={4} /></FormControl><FormMessage /></FormItem>
        )} />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <FormField control={form.control} name="price" render={({ field }) => (
            <FormItem><FormLabel>Price (KSh)</FormLabel><FormControl><Input type="number" step="0.01" placeholder="e.g., 1500.00" {...field} /></FormControl><FormMessage /></FormItem>
          )} />
          <FormField control={form.control} name="originalPrice" render={({ field }) => (
            <FormItem><FormLabel>Original Price (KSh) (Optional)</FormLabel><FormControl><Input type="number" step="0.01" placeholder="e.g., 2000.00" {...field} value={field.value ?? ''} /></FormControl><FormDescription>If the product is on sale.</FormDescription><FormMessage /></FormItem>
          )} />
           <FormField control={form.control} name="stock" render={({ field }) => (
            <FormItem><FormLabel>Stock Quantity</FormLabel><FormControl><Input type="number" step="1" placeholder="e.g., 100" {...field} /></FormControl><FormMessage /></FormItem>
          )} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField control={form.control} name="category" render={({ field }) => (
            <FormItem><FormLabel>Category</FormLabel><FormControl><Input placeholder="e.g., Accessories" {...field} /></FormControl><FormMessage /></FormItem>
          )} />
          <FormField control={form.control} name="subCategory" render={({ field }) => (
            <FormItem><FormLabel>Sub-Category (Optional)</FormLabel><FormControl><Input placeholder="e.g., Scarves" {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>
          )} />
        </div>

        <FormField control={form.control} name="imageUrl" render={({ field }) => (
          <FormItem><FormLabel>Image URL</FormLabel><FormControl><Input placeholder="https://placehold.co/600x800.png" {...field} /></FormControl><FormMessage /></FormItem>
        )} />
        <FormField control={form.control} name="dataAiHint" render={({ field }) => (
          <FormItem><FormLabel>Image AI Hint (Optional)</FormLabel><FormControl><Input placeholder="e.g., silk scarf pattern" {...field} value={field.value ?? ''} /></FormControl><FormDescription>Keywords for AI image search if placeholder is used.</FormDescription><FormMessage /></FormItem>
        )} />

        <FormField control={form.control} name="details" render={({ field }) => (
          <FormItem><FormLabel>Product Details (Optional)</FormLabel><FormControl><Textarea placeholder="100% Mulberry Silk\\nHand-rolled edges\\nMade in Kenya" {...field} rows={4} value={field.value ?? ''} /></FormControl><FormDescription>Enter each detail on a new line (use \\n for new lines).</FormDescription><FormMessage /></FormItem>
        )} />

        <FormField control={form.control} name="colors" render={({ field }) => (
          <FormItem><FormLabel>Colors (Optional)</FormLabel><FormControl><Input placeholder="e.g., Ruby Red:#E0115F, Emerald Green:#50C878" {...field} value={field.value ?? ''} /></FormControl><FormDescription>Comma-separated, format: Name:HEX (e.g., Blue:#0000FF, Green:#00FF00).</FormDescription><FormMessage /></FormItem>
        )} />

        <FormField control={form.control} name="sizes" render={({ field }) => (
          <FormItem><FormLabel>Sizes (Optional)</FormLabel><FormControl><Input placeholder="S, M, L, XL" {...field} value={field.value ?? ''} /></FormControl><FormDescription>Comma-separated values (e.g., S, M, L, 30W, 32W).</FormDescription><FormMessage /></FormItem>
        )} />

        <FormField control={form.control} name="tags" render={({ field }) => (
          <FormItem><FormLabel>Tags (Optional)</FormLabel><FormControl><Input placeholder="e.g., silk, luxury, gift, featured" {...field} value={field.value ?? ''} /></FormControl><FormDescription>Comma-separated values.</FormDescription><FormMessage /></FormItem>
        )} />

        <FormField
          control={form.control}
          name="isFeatured"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 shadow">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>
                  Feature this product?
                </FormLabel>
                <FormDescription>
                  Featured products may appear on the homepage or special sections.
                </FormDescription>
              </div>
            </FormItem>
          )}
        />

        <div className="flex justify-end">
          <Button type="submit" size="lg" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
            {isSubmitting ? 'Saving...' : (isEditMode ? 'Save Changes' : 'Add Product')}
          </Button>
        </div>
        <p className="text-sm text-muted-foreground text-center">
            Product data is managed in Firestore.
        </p>
      </form>
    </Form>
  );
}
