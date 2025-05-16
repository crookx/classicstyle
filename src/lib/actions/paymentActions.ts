
'use server';

import { stripe } from '@/lib/stripe';
import { z } from 'zod';

const CreatePaymentIntentSchema = z.object({
  amount: z.number().positive('Amount must be positive'),
  currency: z.string().length(3, 'Currency must be a 3-letter code').default('kes'), // Default to KES
  customerEmail: z.string().email().optional(),
  customerName: z.string().optional(),
});

interface PaymentIntentResult {
  success: boolean;
  clientSecret?: string | null;
  error?: string;
  paymentIntentId?: string;
}

export async function createPaymentIntentAction(
  data: { amount: number; currency?: string; customerEmail?: string; customerName?: string }
): Promise<PaymentIntentResult> {
  console.log('[PaymentAction] createPaymentIntentAction called with data:', data);

  const validation = CreatePaymentIntentSchema.safeParse(data);
  if (!validation.success) {
    const errorMessages = validation.error.flatten().fieldErrors;
    const flatErrors = Object.values(errorMessages).flat().join(' ');
    const errorMessage = "Invalid payment intent data. " + (flatErrors || "Unknown validation error.");
    console.error("[PaymentAction] Payment Intent Validation Error:", errorMessages);
    return { success: false, error: errorMessage };
  }

  const { amount, currency, customerEmail, customerName } = validation.data;

  try {
    // Amount should be in the smallest currency unit (e.g., cents for USD, or KES directly if Stripe treats KES as primary unit)
    // For KES, Stripe treats it as a zero-decimal currency, so amount is directly in KES.
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert KES to cents as Stripe expects amount in smallest currency unit if not zero-decimal. Stripe treats KES as zero-decimal. Let's stick to cents for broader compatibility in case their API changes or for other currencies. The example amount 2500 for 25.00 KES.
      currency: currency.toLowerCase(),
      automatic_payment_methods: {
        enabled: true,
      },
      receipt_email: customerEmail,
      description: customerName ? `Order for ${customerName}` : 'Order from ClassicStyle eStore',
      // You can add metadata here if needed
      // metadata: { order_id: 'some_internal_order_id' }
    });

    console.log('[PaymentAction] Payment Intent created successfully. ID:', paymentIntent.id);
    return {
      success: true,
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    };
  } catch (error: any) {
    let errorMessage = "Failed to create Payment Intent.";
    if (error instanceof Stripe.errors.StripeError) {
      errorMessage = `Stripe Error: ${error.message}`;
      console.error('[PaymentAction] Stripe Error:', error.type, error.code, error.message);
    } else {
      console.error('[PaymentAction] Unknown Error creating Payment Intent:', error);
      errorMessage = error.message || errorMessage;
    }
    return { success: false, error: errorMessage };
  }
}
