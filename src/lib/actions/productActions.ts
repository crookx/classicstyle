
'use server';

import { revalidatePath } from 'next/cache';
import type { Product, ProductColor } from '@/types';
import { z } from 'zod';
import { addProduct as addProductToFirestore, updateProduct as updateProductInFirestore, deleteProduct as deleteProductFromFirestore } from '@/lib/firebase/firestoreService';

const productFormSchemaBase = z.object({
  name: z.string().min(3, { message: "Product name must be at least 3 characters." }),
  price: z.coerce.number().positive({ message: "Price must be a positive number." }),
  originalPrice: z.coerce.number().optional().default(0).transform(val => val || null),
  imageUrl: z.string().url({ message: "Please enter a valid image URL." }).or(z.literal('')),
  dataAiHint: z.string().optional().transform(val => val || null),
  category: z.string().min(2, { message: "Category is required." }),
  subCategory: z.string().optional().transform(val => val || null),
  description: z.string().min(10, { message: "Description must be at least 10 characters." }),
  details: z.string().optional().transform(val => val ? val.split(/\\n|\n/).map(d => d.trim()).filter(d => d) : null),
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

const AddProductSchema = productFormSchemaBase; // For adding, ID is not present
const UpdateProductSchema = productFormSchemaBase.extend({
  id: z.string().min(1, { message: "Product ID is required for updates." }),
});


interface ActionResult<T = Product> {
  success: boolean;
  data?: T;
  error?: string;
  fieldErrors?: Record<string, string[] | undefined>;
}

export async function addProductAction(
  formData: unknown
): Promise<ActionResult<Product>> {
  const validation = AddProductSchema.safeParse(formData);

  if (!validation.success) {
    console.error("Add Product Validation Error:", validation.error.flatten().fieldErrors);
    return { 
      success: false, 
      error: "Invalid product data.",
      fieldErrors: validation.error.flatten().fieldErrors,
    };
  }

  try {
    const productDataForFirestore: Omit<Product, 'id' | 'rating' | 'reviewCount'> = {
      ...validation.data,
    };

    const newProduct = await addProductToFirestore(productDataForFirestore);

    if (newProduct) {
      revalidatePath('/admin/products');
      revalidatePath('/products');
      revalidatePath('/');
      if (newProduct.category) {
        revalidatePath(`/collections/${newProduct.category.toLowerCase().replace(/\s+/g, '-')}`);
      }
      return { success: true, data: newProduct };
    } else {
      return { success: false, error: "Failed to add product to the database." };
    }
  } catch (error) {
    console.error("Error in addProductAction:", error);
    const errorMessage = error instanceof Error ? error.message : "An unknown server error occurred.";
    return { success: false, error: `Failed to add product: ${errorMessage}` };
  }
}

export async function updateProductAction(
  formData: unknown
): Promise<ActionResult<Product>> {
  const validation = UpdateProductSchema.safeParse(formData);

  if (!validation.success) {
    console.error("Update Product Validation Error:", validation.error.flatten().fieldErrors);
    return { 
      success: false, 
      error: "Invalid product data for update.",
      fieldErrors: validation.error.flatten().fieldErrors,
    };
  }
  
  const { id, ...productDataToUpdate } = validation.data;

  try {
    const success = await updateProductInFirestore(id, productDataToUpdate);

    if (success) {
      revalidatePath('/admin/products');
      revalidatePath(`/admin/products/${id}/edit`);
      revalidatePath(`/products/${id}`);
      revalidatePath('/products');
      revalidatePath('/');
      if (productDataToUpdate.category) {
         revalidatePath(`/collections/${productDataToUpdate.category.toLowerCase().replace(/\s+/g, '-')}`);
      }
      return { success: true, data: { id, ...productDataToUpdate } as Product };
    } else {
      return { success: false, error: "Failed to update product in the database." };
    }
  } catch (error) {
    console.error("Error in updateProductAction:", error);
    const errorMessage = error instanceof Error ? error.message : "An unknown server error occurred.";
    return { success: false, error: `Failed to update product: ${errorMessage}` };
  }
}

export async function deleteProductAction(productId: string): Promise<ActionResult<null>> {
  if (!productId) {
    return { success: false, error: "Product ID is required for deletion." };
  }
  try {
    const success = await deleteProductFromFirestore(productId);
    if (success) {
      revalidatePath('/admin/products');
      revalidatePath('/products');
      revalidatePath('/');
      // Potentially revalidate collection pages if you know the product's category
      return { success: true, data: null };
    } else {
      return { success: false, error: "Failed to delete product from the database." };
    }
  } catch (error) {
    console.error("Error in deleteProductAction:", error);
    const errorMessage = error instanceof Error ? error.message : "An unknown server error occurred.";
    return { success: false, error: `Failed to delete product: ${errorMessage}` };
  }
}
