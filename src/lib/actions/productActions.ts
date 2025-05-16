
'use server';

import { revalidatePath } from 'next/cache';
import type { Product, ProductColor } from '@/types';
import { z } from 'zod';
import { addProduct as addProductToFirestore } from '@/lib/firebase/firestoreService';

// Schema for adding a product, matches ProductFormValues and Firestore structure
const AddProductSchema = z.object({
  name: z.string().min(3, { message: "Product name must be at least 3 characters." }),
  price: z.coerce.number().positive({ message: "Price must be a positive number." }),
  originalPrice: z.coerce.number().optional().default(0).transform(val => val || null), // Firestore prefers null
  imageUrl: z.string().url({ message: "Please enter a valid image URL." }).or(z.literal('')),
  dataAiHint: z.string().optional().transform(val => val || null),
  category: z.string().min(2, { message: "Category is required." }),
  subCategory: z.string().optional().transform(val => val || null),
  description: z.string().min(10, { message: "Description must be at least 10 characters." }),
  details: z.string().optional().transform(val => val ? val.split('\\n').map(d => d.trim()).filter(d => d) : null),
  colors: z.string().optional().transform(val => {
    if (!val) return null;
    return val.split(',').map(c => {
      const parts = c.split(':');
      return { name: parts[0]?.trim(), hex: parts[1]?.trim() };
    }).filter(c => c.name && c.hex) as ProductColor[];
  }),
  sizes: z.string().optional().transform(val => val ? val.split(',').map(s => s.trim()).filter(s => s) : null),
  tags: z.string().optional().transform(val => val ? val.split(',').map(t => t.trim()).filter(t => t) : null),
  sku: z.string().optional().transform(val => val || null),
  isFeatured: z.boolean().default(false).optional(),
});

interface ActionResult {
  success: boolean;
  product?: Product;
  error?: string;
}

export async function addProductAction(
  formData: unknown // Changed from specific type to allow raw form data parsing
): Promise<ActionResult> {
  // We expect formData to be the raw data from the form. Let Zod parse it.
  const validation = AddProductSchema.safeParse(formData);

  if (!validation.success) {
    console.error("Add Product Validation Error:", validation.error.flatten().fieldErrors);
    return { 
      success: false, 
      error: "Invalid product data. " + Object.values(validation.error.flatten().fieldErrors).flat().join(' ') 
    };
  }

  try {
    // The validated and transformed data is in validation.data
    const productDataForFirestore: Omit<Product, 'id' | 'rating' | 'reviewCount'> = {
      ...validation.data,
      // rating and reviewCount are not part of the form, will be undefined or set by Firestore logic if any
    };

    const newProduct = await addProductToFirestore(productDataForFirestore);

    if (newProduct) {
      revalidatePath('/admin/products');
      revalidatePath('/products');
      revalidatePath('/');
      // Revalidate specific collection pages if applicable based on category
      if (newProduct.category) {
        // This is a simplification; ideally, slugify category for path
        revalidatePath(`/collections/${newProduct.category.toLowerCase().replace(/\s+/g, '-')}`);
      }
      return { success: true, product: newProduct };
    } else {
      return { success: false, error: "Failed to add product to the database." };
    }
  } catch (error) {
    console.error("Error in addProductAction:", error);
    const errorMessage = error instanceof Error ? error.message : "An unknown server error occurred.";
    return { success: false, error: `Failed to add product: ${errorMessage}` };
  }
}
