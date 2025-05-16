
'use server';

import { revalidatePath } from 'next/cache';
import type { OrderStatus } from '@/types';
import { updateOrderStatus as updateOrderStatusInFirestore } from '@/lib/firebase/firestoreService';
import { z } from 'zod';

const UpdateOrderStatusSchema = z.object({
  orderId: z.string().min(1, "Order ID is required."),
  status: z.enum(['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'], {
    errorMap: () => ({ message: "Invalid status value." })
  }),
});

interface OrderActionResult {
  success: boolean;
  error?: string;
}

export async function updateOrderStatusAction(formData: FormData): Promise<OrderActionResult> {
  const rawData = {
    orderId: formData.get('orderId') as string, // Ensure it's treated as string
    status: formData.get('status') as OrderStatus, // Ensure it's treated as OrderStatus
  };
  
  console.log("[Action] Received rawData for order status update:", rawData);

  const validation = UpdateOrderStatusSchema.safeParse(rawData);

  if (!validation.success) {
    console.error("[Action] Update Order Status Validation Error:", validation.error.flatten().fieldErrors);
    return { 
      success: false, 
      error: "Invalid order status data. " + Object.values(validation.error.flatten().fieldErrors).flat().join(' ')
    };
  }

  const { orderId, status } = validation.data;
  console.log("[Action] Validated data:", { orderId, status });

  try {
    const success = await updateOrderStatusInFirestore(orderId, status);

    if (success) {
      console.log(`[Action] Successfully updated status for order ${orderId} to ${status}.`);
      revalidatePath('/admin/orders');
      revalidatePath(`/admin/orders/${orderId}`);
      return { success: true };
    } else {
      console.error(`[Action] Firestore update failed for order ${orderId}.`);
      return { success: false, error: "Failed to update order status in the database." };
    }
  } catch (error) {
    console.error("[Action] Error in updateOrderStatusAction:", error);
    const errorMessage = error instanceof Error ? error.message : "An unknown server error occurred.";
    return { success: false, error: `Failed to update order status: ${errorMessage}` };
  }
}
