
'use server';

import { revalidatePath } from 'next/cache';
import { mockProducts } from '@/data/mock-data'; // Assuming mockProducts is exportable and mutable (let)
import type { Product } from '@/types';
import { z } from 'zod';

// Basic schema for adding a product (can be expanded)
// Note: This schema matches closely with ProductFormValues from ProductForm.tsx for consistency
const AddProductSchema = z.object({
  name: z.string().min(3),
  price: z.number().positive(),
  originalPrice: z.number().optional(),
  imageUrl: z.string().url().or(z.literal('')),
  dataAiHint: z.string().optional(),
  category: z.string().min(2),
  subCategory: z.string().optional(),
  description: z.string().min(10),
  details: z.array(z.string()).optional(),
  colors: z.array(z.object({ name: z.string(), hex: z.string() })).optional(),
  sizes: z.array(z.string()).optional(),
  tags: z.array(z.string()).optional(),
  sku: z.string().optional(),
  isFeatured: z.boolean().optional().default(false),
});

interface ActionResult {
  success: boolean;
  product?: Product;
  error?: string;
}

export async function addProductAction(
  data: Omit<Product, 'id' | 'rating' | 'reviewCount'>
): Promise<ActionResult> {
  // IMPORTANT CAVEAT:
  // This action modifies an in-memory array (mockProducts).
  // These changes WILL NOT PERSIST if the server restarts or across different server instances.
  // A real database (e.g., Firebase Firestore, Supabase, MongoDB) is required for persistent storage.
  
  const validation = AddProductSchema.safeParse(data);

  if (!validation.success) {
    console.error("Add Product Validation Error:", validation.error.flatten().fieldErrors);
    return { 
      success: false, 
      error: "Invalid product data. " + Object.values(validation.error.flatten().fieldErrors).flat().join(' ') 
    };
  }

  try {
    const newProduct: Product = {
      ...validation.data, // Use validated and transformed data
      id: `prod-${Date.now().toString()}-${Math.random().toString(36).substring(2, 7)}`, // Simple unique ID
      // rating and reviewCount would typically be managed elsewhere or start at 0/null
      rating: undefined, // Or some default like 0 or null
      reviewCount: undefined, // Or some default like 0 or null
    };

    mockProducts.unshift(newProduct); // Add to the beginning of the array

    revalidatePath('/admin/products'); // Revalidate the product list page
    revalidatePath('/products'); // Revalidate public products page
    revalidatePath('/'); // Revalidate home page if featured products might change

    return { success: true, product: newProduct };
  } catch (error) {
    console.error("Error adding product:", error);
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
    return { success: false, error: `Failed to add product: ${errorMessage}` };
  }
}

// Placeholder for future actions
// export async function updateProductAction(productId: string, data: Partial<Product>): Promise<ActionResult> {
//   // Find product by ID and update
//   // Revalidate paths
//   return { success: false, error: "Update not implemented yet." };
// }

// export async function deleteProductAction(productId: string): Promise<{ success: boolean; error?: string }> {
//   // Filter out product by ID
//   // Revalidate paths
//   return { success: false, error: "Delete not implemented yet." };
// }

