
'use server';

import { revalidatePath } from 'next/cache';
import type { OrderStatus } from '@/types';
import { updateOrderStatus as updateOrderStatusInFirestore } from '@/lib/firebase/firestoreService';
import { z } from 'zod';

const UpdateOrderStatusSchema = z.object({
  orderId: z.string().min(1, "Order ID is required."),
  status: z.enum(['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled']),
});

interface OrderActionResult {
  success: boolean;
  error?: string;
}

export async function updateOrderStatusAction(formData: FormData): Promise<OrderActionResult> {
  const rawData = {
    orderId: formData.get('orderId'),
    status: formData.get('status'),
  };
  
  const validation = UpdateOrderStatusSchema.safeParse(rawData);

  if (!validation.success) {
    console.error("Update Order Status Validation Error:", validation.error.flatten().fieldErrors);
    return { 
      success: false, 
      error: "Invalid order status data. " + Object.values(validation.error.flatten().fieldErrors).flat().join(' ')
    };
  }

  const { orderId, status } = validation.data;

  try {
    const success = await updateOrderStatusInFirestore(orderId, status);

    if (success) {
      revalidatePath('/admin/orders');
      revalidatePath(`/admin/orders/${orderId}`);
      return { success: true };
    } else {
      return { success: false, error: "Failed to update order status in the database." };
    }
  } catch (error) {
    console.error("Error in updateOrderStatusAction:", error);
    const errorMessage = error instanceof Error ? error.message : "An unknown server error occurred.";
    return { success: false, error: `Failed to update order status: ${errorMessage}` };
  }
}
