
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

export interface OrderActionResult {
  success: boolean;
  error?: string;
  orderId?: string;
  newStatus?: OrderStatus;
}

export async function updateOrderStatusAction(formData: FormData): Promise<OrderActionResult> {
  console.log("[OrderAction] Entered updateOrderStatusAction.");
  let actionResult: OrderActionResult;

  try {
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

    await updateOrderStatusInFirestore(orderId, status); // This will now throw on failure

    console.log(`[OrderAction] Successfully updated status for order ${orderId} to ${status}. Revalidating paths.`);
    revalidatePath('/admin/orders');
    revalidatePath(`/admin/orders/${orderId}`);
    actionResult = { success: true, orderId, newStatus: status };
    console.log("[OrderAction] FINAL ACTION RESULT (Success):", JSON.stringify(actionResult));
    return actionResult;

  } catch (error: unknown) { // Catch errors from updateOrderStatusInFirestore or other unexpected issues
    console.error("[OrderAction] Error during order status update process:", error);
    let errorMessage = "An unexpected server error occurred while updating status.";
    if (error instanceof Error) {
        errorMessage = error.message; // This will now include the specific Firebase error
    } else if (typeof error === 'string') {
        errorMessage = error;
    }
    
    // Extract orderId if available from formData for better error reporting
    const orderIdFromForm = formData.get('orderId') as string | undefined;

    actionResult = { 
        success: false, 
        error: errorMessage, 
        orderId: orderIdFromForm 
    };
    console.log("[OrderAction] FINAL ACTION RESULT (Caught Exception in Action):", JSON.stringify(actionResult));
    return actionResult;
  }
}
