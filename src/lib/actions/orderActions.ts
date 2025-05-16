
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

// Ensure this interface is exported and matches what the client expects
export interface OrderActionResult {
  success: boolean;
  error?: string;
  orderId?: string;
  newStatus?: OrderStatus;
}

export async function updateOrderStatusAction(formData: FormData): Promise<OrderActionResult> {
  console.log("[OrderAction] Entered updateOrderStatusAction.");
  let actionResult: OrderActionResult;

  try { // Super catch-all for the entire action
    const rawData = {
      orderId: formData.get('orderId') as string,
      status: formData.get('status') as OrderStatus,
    };
    
    console.log("[OrderAction] Received rawData for order status update:", JSON.stringify(rawData));

    const validation = UpdateOrderStatusSchema.safeParse(rawData);

    if (!validation.success) {
      const errorMessages = validation.error.flatten().fieldErrors;
      const flatErrors = Object.values(errorMessages).flat().join(' ');
      console.error("[OrderAction] Update Order Status Validation Error:", JSON.stringify(errorMessages));
      actionResult = { 
        success: false, 
        error: "Invalid order status data. " + (flatErrors || "Unknown validation error.")
      };
      console.log("[OrderAction] FINAL ACTION RESULT (Validation Error):", JSON.stringify(actionResult));
      return actionResult;
    }

    const { orderId, status } = validation.data;
    console.log("[OrderAction] Validated data for update:", JSON.stringify({ orderId, status }));

    const success = await updateOrderStatusInFirestore(orderId, status);

    if (success) {
      console.log(`[OrderAction] Successfully updated status for order ${orderId} to ${status}. Revalidating paths.`);
      revalidatePath('/admin/orders');
      revalidatePath(`/admin/orders/${orderId}`);
      actionResult = { success: true, orderId, newStatus: status };
      console.log("[OrderAction] FINAL ACTION RESULT (Success):", JSON.stringify(actionResult));
      return actionResult;
    } else {
      console.error(`[OrderAction] Firestore update failed for order ${orderId}. updateOrderStatusInFirestore returned false.`);
      actionResult = { success: false, error: "Failed to update order status in the database.", orderId };
      console.log("[OrderAction] FINAL ACTION RESULT (Firestore Update Failure):", JSON.stringify(actionResult));
      return actionResult;
    }
  } catch (error: unknown) { // Catch any unexpected error during the action's execution
    console.error("[OrderAction] Unexpected error in updateOrderStatusAction:", error);
    let errorMessage = "An unknown server error occurred during action execution.";
    if (error instanceof Error) {
        errorMessage = error.message;
    } else if (typeof error === 'string') {
        errorMessage = error;
    }
    actionResult = { success: false, error: `Server action error: ${errorMessage}` };
    console.log("[OrderAction] FINAL ACTION RESULT (Caught Exception):", JSON.stringify(actionResult));
    return actionResult;
  }
}

