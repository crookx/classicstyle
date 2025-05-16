// /app/api/stripe-webhooks/route.ts
import {NextRequest, NextResponse} from 'next/server';
import Stripe from 'stripe';
import {initializeApp, cert, getApps, ServiceAccount} from 'firebase-admin/app';
import {getFirestore, FieldValue} from 'firebase-admin/firestore';

// --- Firebase Admin Initialization ---
let serviceAccount: ServiceAccount;
try {
  const base64ServiceAccount = process.env.FIREBASE_SERVICE_ACCOUNT_KEY_JSON;
  if (!base64ServiceAccount) {
    throw new Error('FIREBASE_SERVICE_ACCOUNT_KEY_JSON environment variable is not set or is empty.');
  }
  const decodedServiceAccountJson = Buffer.from(base64ServiceAccount, 'base64').toString('utf-8');
  serviceAccount = JSON.parse(decodedServiceAccountJson);
} catch (e: any) {
  console.error("Failed to parse FIREBASE_SERVICE_ACCOUNT_KEY_JSON:", e.message);
  // @ts-ignore
  serviceAccount = {}; 
}

if (!getApps().length) {
  try {
    initializeApp({
      credential: cert(serviceAccount),
    });
    console.log("Firebase Admin SDK initialized successfully for Vercel function.");
  } catch (e: any) {
     console.error("Firebase Admin SDK initialization error in Vercel function:", e.message);
  }
}
const db = getFirestore();
// --- End Firebase Admin Initialization ---

// --- Stripe Initialization ---
const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET_VERCEL; 

if (!stripeSecretKey) {
  console.error("Stripe secret_key is not set in environment variables for Vercel.");
}
if (!webhookSecret) {
  console.error("Stripe webhook_secret (STRIPE_WEBHOOK_SECRET_VERCEL) is not set for Vercel environment variables.");
}

// @ts-ignore
const stripe = new Stripe(stripeSecretKey, {
  apiVersion: "2023-10-16", 
  typescript: true,
});
// --- End Stripe Initialization ---

export async function POST(request: NextRequest) {
  if (!webhookSecret) {
    console.error("Webhook Error: Webhook signing secret not configured on Vercel.");
    return NextResponse.json({error: "Webhook server error: Signing secret missing."}, {status: 500});
  }
  if (!stripeSecretKey) {
    console.error("Webhook Error: Stripe Secret Key not configured on Vercel.");
    return NextResponse.json({error: "Webhook server error: Stripe secret key missing."}, {status: 500});
  }


  const sig = request.headers.get('stripe-signature') as string;
  if (!sig) {
    console.warn("Vercel Webhook Error: Missing stripe-signature header");
    return NextResponse.json({error: "Webhook Error: Missing stripe-signature header"}, {status: 400});
  }

  const rawBody = await request.text();

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(rawBody, sig, webhookSecret);
  } catch (err: any) {
    console.error(`Vercel Webhook signature verification failed: ${err.message}`);
    return NextResponse.json({error: `Webhook Error: ${err.message}`}, {status: 400});
  }

  console.log("Received Stripe event on Vercel API route:", {
    id: event.id,
    type: event.type,
  });

  try {
    switch (event.type) {
      case "payment_intent.succeeded": {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        console.log(
          `PaymentIntent ${paymentIntent.id} succeeded on Vercel.`,
          {metadata: paymentIntent.metadata},
        );
        
        const ordersQuery = db
            .collection("orders")
            .where("paymentIntentId", "==", paymentIntent.id);
        const querySnapshot = await ordersQuery.get();

        if (querySnapshot.empty) {
          console.warn(
            `No order found with paymentIntentId: ${paymentIntent.id} on Vercel. This might happen if client-side order creation failed or was delayed.`,
          );
          // Optional: Create order here if it's missing and you have enough info from paymentIntent.
          // This would make it more robust if client-side creation fails.
          // For now, we log and proceed.
        } else {
          const batch = db.batch();
          querySnapshot.forEach((doc) => {
            console.log(
              `Updating order ${doc.id} to 'Processing' due to payment_intent.succeeded on Vercel.`,
            );
            batch.update(doc.ref, {
              status: "Processing",
              updatedAt: FieldValue.serverTimestamp(),
            });
          });
          await batch.commit();
          console.log(`Batch update for order(s) with PI ${paymentIntent.id} to 'Processing' committed.`);
        }
        break;
      }
      case "payment_intent.payment_failed": {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        console.log(
          `PaymentIntent ${paymentIntent.id} failed on Vercel. Reason: ${paymentIntent.last_payment_error?.message}`,
        );
        
        const ordersQuery = db
            .collection("orders")
            .where("paymentIntentId", "==", paymentIntent.id);
        const querySnapshot = await ordersQuery.get();

        if (querySnapshot.empty) {
          console.warn(
            `No order found with paymentIntentId: ${paymentIntent.id} for payment_failed event on Vercel.`,
          );
        } else {
          const batch = db.batch();
          querySnapshot.forEach((doc) => {
            console.log(
              `Updating order ${doc.id} to 'PaymentFailed' on Vercel.`,
            );
            batch.update(doc.ref, {
              status: "PaymentFailed",
              updatedAt: FieldValue.serverTimestamp(),
            });
          });
          await batch.commit();
           console.log(`Batch update for order(s) with PI ${paymentIntent.id} to 'PaymentFailed' committed.`);
        }
        break;
      }
      default:
        console.log(`Unhandled event type on Vercel: ${event.type}`);
    }
  } catch (error: any) {
      console.error(
        `Error processing event ${event.type} for PI ${('paymentIntent' in event.data.object && event.data.object.paymentIntent) || event.id} on Vercel:`,
        error.message,
        error.stack
      );
      // Return 500 to Stripe so it retries (if applicable for the error)
      return NextResponse.json({error: 'Internal server error processing webhook event.'}, {status: 500});
  }

  return NextResponse.json({received: true});
}

// Optional: Edge runtime configuration if preferred, though Node.js is fine.
// export const runtime = 'edge';
