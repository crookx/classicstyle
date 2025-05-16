
'use server';

import { revalidatePath } from 'next/cache';
import type { OrderStatus, UserCartItem } from '@/types'; // Added UserCartItem
import { z } from 'zod';
import admin from 'firebase-admin';
// Ensure this path is correct relative to the location of this actions file
// If serviceAccountKey.json is in the project root, and this file is src/lib/actions/
// then the path should be ../../../serviceAccountKey.json
import serviceAccount from '../../../serviceAccountKey.json';
import { runStockUpdateTransaction } from '../firebase/firestoreService'; // Added

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

try {
  if (!admin.apps.length) {
    console.log("[OrderAction] Initializing Firebase Admin SDK...");
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
    });
    console.log("[OrderAction] Firebase Admin SDK initialized successfully.");
  } else {
    console.log("[OrderAction] Firebase Admin SDK already initialized.");
  }
} catch (initError: any) {
  console.error("[OrderAction] Firebase Admin SDK Initialization Error:", initError.message);
}

const adminDb = admin.firestore();

export async function updateOrderStatusAction(formData: FormData): Promise<OrderActionResult> {
  console.log("[OrderAction] updateOrderStatusAction called.");
  let actionResult: OrderActionResult;

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

  try {
    if (!adminDb) {
      const adminInitErrorMsg = "Firebase Admin SDK is not properly initialized. Cannot update order.";
      console.error("[OrderAction]", adminInitErrorMsg);
      actionResult = { success: false, error: adminInitErrorMsg, orderId };
      console.log("[OrderAction] FINAL ACTION RESULT (Admin SDK Init Error):", JSON.stringify(actionResult));
      return actionResult;
    }

    const orderRef = adminDb.collection('orders').doc(orderId);
    await orderRef.update({
      status: status,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    console.log(`[OrderAction] Successfully updated status for order ${orderId} to ${status}. Revalidating paths.`);
    revalidatePath('/admin/orders');
    revalidatePath(`/admin/orders/${orderId}`);
    actionResult = { success: true, orderId, newStatus: status };
    console.log("[OrderAction] FINAL ACTION RESULT (Success):", JSON.stringify(actionResult));
    return actionResult;

  } catch (error: any) {
    let errorMessage = "An unexpected server error occurred while updating status.";
     if (error.code && typeof error.code === 'string') {
        errorMessage = `Firebase Admin Error (${error.code}): ${error.message}`;
    } else if (error.message) {
        errorMessage = error.message;
    }
    console.error(`[OrderAction] Error during order status update for order '${orderId}'. Raw Error:`, error);
    console.error("[OrderAction] Generated error message for client:", errorMessage);
    actionResult = { success: false, error: errorMessage, orderId };
    console.log("[OrderAction] FINAL ACTION RESULT (Caught Exception in Action):", JSON.stringify(actionResult));
    return actionResult;
  }
}


// New action for decrementing stock
const DecrementStockSchema = z.array(
  z.object({
    productId: z.string(),
    quantity: z.number().int().positive(),
  })
);

export async function decrementStockForOrderAction(
  orderItemsData: { productId: string; quantity: number }[]
): Promise<{ success: boolean; error?: string }> {
  console.log("[OrderAction] decrementStockForOrderAction called with items:", orderItemsData);

  const validation = DecrementStockSchema.safeParse(orderItemsData);
  if (!validation.success) {
    console.error("[OrderAction] Decrement Stock Validation Error:", validation.error.flatten().fieldErrors);
    return { success: false, error: "Invalid order items data for stock decrement." };
  }

  try {
    await runStockUpdateTransaction(validation.data);
    console.log("[OrderAction] Stock successfully decremented for order items.");
    // Revalidate product paths if needed, though stock changes frequently
    // revalidatePath('/products');
    // validation.data.forEach(item => revalidatePath(`/products/${item.productId}`));
    return { success: true };
  } catch (error: any) {
    console.error("[OrderAction] Error decrementing stock:", error);
    return { success: false, error: error.message || "Failed to update stock." };
  }
}
