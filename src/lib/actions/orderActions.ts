
'use server';

import { revalidatePath } from 'next/cache';
import type { OrderStatus } from '@/types';
import { z } from 'zod';
import admin from 'firebase-admin';
import serviceAccount from '../../../serviceAccountKey.json'; // Adjusted path assuming actions is in src/lib/actions

// Define the schema for validating form data
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

// Initialize Firebase Admin SDK if not already initialized
try {
  if (!admin.apps.length) {
    console.log("[OrderAction] Initializing Firebase Admin SDK...");
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
    console.log("[OrderAction] Firebase Admin SDK initialized successfully.");
  } else {
    console.log("[OrderAction] Firebase Admin SDK already initialized.");
  }
} catch (initError: any) {
  console.error("[OrderAction] Firebase Admin SDK Initialization Error:", initError);
  // If admin SDK fails to init, subsequent Firestore operations will fail.
  // We might want to throw here or handle it in a way that actions relying on it know it's unavailable.
}

const adminDb = admin.firestore();
console.log("[OrderAction] Admin Firestore instance obtained.");

export async function updateOrderStatusAction(formData: FormData): Promise<OrderActionResult> {
  console.log("[OrderAction] updateOrderStatusAction called.");
  let actionResult: OrderActionResult;

  try {
    const rawData = {
      orderId: formData.get('orderId') as string,
      status: formData.get('status') as OrderStatus,
    };
    console.log("[OrderAction] Received rawData for status update:", JSON.stringify(rawData));

    const validation = UpdateOrderStatusSchema.safeParse(rawData);

    if (!validation.success) {
      const errorMessages = validation.error.flatten().fieldErrors;
      const flatErrors = Object.values(errorMessages).flat().join(' ');
      const errorMessage = "Invalid order status data. " + (flatErrors || "Unknown validation error.");
      console.error("[OrderAction] Update Order Status Validation Error:", JSON.stringify(errorMessages));
      actionResult = { success: false, error: errorMessage };
      console.log("[OrderAction] FINAL ACTION RESULT (Validation Error):", JSON.stringify(actionResult));
      return actionResult;
    }

    const { orderId, status } = validation.data;
    const dataToUpdate = {
      status: status,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(), // Use Admin SDK serverTimestamp
    };

    console.log(`[OrderAction] Attempting to update Firestore order '${orderId}' with data:`, JSON.stringify(dataToUpdate));
    
    if (!adminDb) {
        const adminInitErrorMsg = "Firebase Admin SDK is not initialized. Cannot update order.";
        console.error("[OrderAction]", adminInitErrorMsg);
        actionResult = { success: false, error: adminInitErrorMsg, orderId };
        console.log("[OrderAction] FINAL ACTION RESULT (Admin SDK Init Error):", JSON.stringify(actionResult));
        return actionResult;
    }
    
    await adminDb.collection('orders').doc(orderId).update(dataToUpdate);

    console.log(`[OrderAction] Successfully updated status for order ${orderId} to ${status}. Revalidating paths.`);
    revalidatePath('/admin/orders');
    revalidatePath(`/admin/orders/${orderId}`);
    actionResult = { success: true, orderId, newStatus: status };
    console.log("[OrderAction] FINAL ACTION RESULT (Success):", JSON.stringify(actionResult));
    return actionResult;

  } catch (error: any) {
    let errorMessage = "An unexpected server error occurred while updating status.";
    const orderIdFromForm = formData.get('orderId') as string | undefined;

    console.error(`[OrderAction] Error during order status update process for orderId '${orderIdFromForm}'. Raw Error:`, error);

    if (error.code && typeof error.code === 'string') { // Firebase Admin SDK errors often have a code
        errorMessage = `Firebase Admin Error (${error.code}): ${error.message}`;
    } else if (error.message) {
        errorMessage = error.message;
    } else {
        errorMessage = String(error); // Fallback
    }
    
    console.error("[OrderAction] Generated error message for client:", errorMessage);

    actionResult = { success: false, error: errorMessage, orderId: orderIdFromForm };
    console.log("[OrderAction] FINAL ACTION RESULT (Caught Exception in Action):", JSON.stringify(actionResult));
    return actionResult;
  }
}
