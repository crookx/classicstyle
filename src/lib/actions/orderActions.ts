
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
  console.log("[OrderAction] Entered updateOrderStatusAction.");
  const rawData = {
    orderId: formData.get('orderId') as string,
    status: formData.get('status') as OrderStatus,
  };
  
  console.log("[OrderAction] Received rawData for order status update:", JSON.stringify(rawData));

  try { // Outer try-catch for the entire action logic
    const validation = UpdateOrderStatusSchema.safeParse(rawData);

    if (!validation.success) {
      const errorMessages = validation.error.flatten().fieldErrors;
      console.error("[OrderAction] Update Order Status Validation Error:", JSON.stringify(errorMessages));
      const flatErrors = Object.values(errorMessages).flat().join(' ');
      const result: OrderActionResult = { 
        success: false, 
        error: "Invalid order status data. " + (flatErrors || "Unknown validation error.")
      };
      console.log("[OrderAction] Returning validation error:", JSON.stringify(result));
      return result;
    }

    const { orderId, status } = validation.data;
    console.log("[OrderAction] Validated data for update:", JSON.stringify({ orderId, status }));

    const success = await updateOrderStatusInFirestore(orderId, status);

    if (success) {
      console.log(`[OrderAction] Successfully updated status for order ${orderId} to ${status}. Revalidating paths.`);
      revalidatePath('/admin/orders');
      revalidatePath(`/admin/orders/${orderId}`);
      const result: OrderActionResult = { success: true, orderId, newStatus: status };
      console.log("[OrderAction] Returning success result:", JSON.stringify(result));
      return result;
    } else {
      console.error(`[OrderAction] Firestore update failed for order ${orderId}. updateOrderStatusInFirestore returned false.`);
      const result: OrderActionResult = { success: false, error: "Failed to update order status in the database.", orderId };
      console.log("[OrderAction] Returning Firestore update failure:", JSON.stringify(result));
      return result;
    }
  } catch (error) {
    console.error("[OrderAction] Unexpected error in updateOrderStatusAction:", error);
    const errorMessage = error instanceof Error ? error.message : "An unknown server error occurred during action execution.";
    const result: OrderActionResult = { success: false, error: `Server action error: ${errorMessage}` };
    console.log("[OrderAction] Returning caught exception:", JSON.stringify(result));
    return result;
  }
}
