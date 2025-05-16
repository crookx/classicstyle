
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
  orderId?: string;
  newStatus?: OrderStatus;
}

export async function updateOrderStatusAction(formData: FormData): Promise<OrderActionResult> {
  const rawData = {
    orderId: formData.get('orderId') as string,
    status: formData.get('status') as OrderStatus,
  };
  
  console.log("[OrderAction] Received rawData for order status update:", rawData);

  const validation = UpdateOrderStatusSchema.safeParse(rawData);

  if (!validation.success) {
    const errorMessages = validation.error.flatten().fieldErrors;
    console.error("[OrderAction] Update Order Status Validation Error:", errorMessages);
    const flatErrors = Object.values(errorMessages).flat().join(' ');
    return { 
      success: false, 
      error: "Invalid order status data. " + (flatErrors || "Unknown validation error.")
    };
  }

  const { orderId, status } = validation.data;
  console.log("[OrderAction] Validated data for update:", { orderId, status });

  try {
    const success = await updateOrderStatusInFirestore(orderId, status);

    if (success) {
      console.log(`[OrderAction] Successfully updated status for order ${orderId} to ${status}.`);
      revalidatePath('/admin/orders');
      revalidatePath(`/admin/orders/${orderId}`);
      return { success: true, orderId, newStatus: status };
    } else {
      console.error(`[OrderAction] Firestore update failed for order ${orderId}. updateOrderStatusInFirestore returned false.`);
      return { success: false, error: "Failed to update order status in the database.", orderId };
    }
  } catch (error) {
    console.error("[OrderAction] Error in updateOrderStatusAction:", error);
    const errorMessage = error instanceof Error ? error.message : "An unknown server error occurred.";
    return { success: false, error: `Failed to update order status: ${errorMessage}`, orderId };
  }
}
