
// /app/api/stripe-webhooks/route.ts
import {NextRequest, NextResponse} from 'next/server';
import Stripe from 'stripe';
import {initializeApp, cert, getApps, ServiceAccount} from 'firebase-admin/app';
import {getFirestore, FieldValue} from 'firebase-admin/firestore';

// --- Firebase Admin Initialization ---
let serviceAccount: ServiceAccount;
let db: FirebaseFirestore.Firestore;
let adminAppInitialized = false;

// This block will run when the Vercel function instance starts or during build analysis
try {
  if (!getApps().length) {
    const base64ServiceAccount = process.env.FIREBASE_SERVICE_ACCOUNT_KEY_JSON;
    if (!base64ServiceAccount) {
      console.warn("FIREBASE_SERVICE_ACCOUNT_KEY_JSON environment variable is not set or is empty. Firebase Admin SDK will not initialize at module load.");
    } else {
      let decodedServiceAccountJson: string;
      try {
        decodedServiceAccountJson = Buffer.from(base64ServiceAccount, 'base64').toString('utf-8');
      } catch (e: any) {
        console.error("Failed to decode Base64 service account key at module load:", e.message);
        throw new Error('Failed to decode FIREBASE_SERVICE_ACCOUNT_KEY_JSON. Ensure it is a valid Base64 string.');
      }

      try {
        serviceAccount = JSON.parse(decodedServiceAccountJson);
      } catch (e: any) {
        console.error("Failed to parse service account JSON at module load:", e.message);
        throw new Error('Failed to parse FIREBASE_SERVICE_ACCOUNT_KEY_JSON. Ensure it is valid JSON.');
      }

      if (!serviceAccount || typeof serviceAccount.project_id !== 'string' || !serviceAccount.project_id) {
          console.error("Parsed service account is missing 'project_id' or it's not a string at module load. Service Account content (first 200 chars):", JSON.stringify(serviceAccount).substring(0, 200) + "...");
          throw new Error('Service account object must contain a string "project_id" property.');
      }

      initializeApp({
        credential: cert(serviceAccount),
      });
      console.log("Firebase Admin SDK initialized successfully for Vercel function (module load).");
      adminAppInitialized = true;
      db = getFirestore();
    }
  } else {
    console.log("Firebase Admin SDK already initialized for Vercel function (module load).");
    adminAppInitialized = true; // Already initialized
    db = getFirestore();
  }
} catch (e: any) {
  console.error("CRITICAL: Firebase Admin SDK initialization error in Vercel function (module load):", e.message, e.stack);
  // adminAppInitialized remains false
}
// --- End Firebase Admin Initialization ---

// --- Stripe Initialization ---
// Initialize Stripe SDK. It's okay if the key is undefined here at module load;
// we'll critically check it at runtime in the POST handler.
const stripeSecretKeyFromEnv = process.env.STRIPE_SECRET_KEY;
let stripe: Stripe | null = null;

if (stripeSecretKeyFromEnv) {
  try {
    stripe = new Stripe(stripeSecretKeyFromEnv, {
      apiVersion: "2024-06-20",
      typescript: true,
    });
    console.log("Stripe SDK initialized at module load.");
  } catch (e: any) {
    console.error("Error initializing Stripe SDK at module load (key might be invalid format):", e.message);
    stripe = null; // Ensure stripe is null if initialization fails
  }
} else {
  console.warn("Stripe secret_key is not set in environment variables at module load time (Vercel). Will check at runtime.");
}
// --- End Stripe Initialization ---

export async function POST(request: NextRequest) {
  // Runtime check for Firebase Admin SDK
  if (!adminAppInitialized || !db) {
    // Attempt re-initialization if it failed at module load, only if env var is present
    if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY_JSON && !getApps().length) {
        try {
            console.log("Attempting runtime Firebase Admin SDK re-initialization...");
            const base64ServiceAccount = process.env.FIREBASE_SERVICE_ACCOUNT_KEY_JSON;
            const decodedServiceAccountJson = Buffer.from(base64ServiceAccount, 'base64').toString('utf-8');
            serviceAccount = JSON.parse(decodedServiceAccountJson);
            initializeApp({ credential: cert(serviceAccount) });
            db = getFirestore();
            adminAppInitialized = true;
            console.log("Runtime Firebase Admin SDK re-initialization successful.");
        } catch (e: any) {
            console.error("Runtime Firebase Admin SDK re-initialization failed:", e.message);
            return NextResponse.json({error: "Webhook server error: Firebase Admin not available (runtime init failed)."}, {status: 500});
        }
    } else if (!adminAppInitialized) {
        console.error("Webhook Error: Firebase Admin SDK not initialized and cannot re-initialize. Cannot process event.");
        return NextResponse.json({error: "Webhook server error: Firebase Admin not available."}, {status: 500});
    }
  }

  // Runtime check for Stripe keys and re-initialize Stripe instance if needed
  const currentStripeSecretKey = process.env.STRIPE_SECRET_KEY;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET_VERCEL;

  if (!currentStripeSecretKey) {
    console.error("Webhook Error: Stripe Secret Key not configured at runtime on Vercel.");
    return NextResponse.json({error: "Webhook server error: Stripe secret key missing."}, {status: 500});
  }

  // If stripe was not initialized at module load, try now with runtime env var
  if (!stripe) {
    try {
      stripe = new Stripe(currentStripeSecretKey, {
        apiVersion: "2024-06-20",
        typescript: true,
      });
      console.log("Stripe SDK initialized at runtime.");
    } catch (e: any) {
        console.error("Error initializing Stripe SDK at runtime:", e.message);
        return NextResponse.json({error: "Webhook server error: Stripe SDK could not be initialized."}, {status: 500});
    }
  }
  
  // This stripe should now be the valid instance
  if (!stripe) { // Should not happen if the above logic is correct and key is valid
    console.error("Webhook Error: Stripe SDK is unexpectedly null at runtime.");
    return NextResponse.json({error: "Webhook server error: Stripe SDK unavailable."}, {status: 500});
  }


  if (!webhookSecret) {
    console.error("Webhook Error: Webhook signing secret (STRIPE_WEBHOOK_SECRET_VERCEL) not configured at runtime on Vercel.");
    return NextResponse.json({error: "Webhook server error: Signing secret missing."}, {status: 500});
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
        `Error processing event ${event.type} for PI ${('paymentIntent' in event.data.object && (event.data.object as Stripe.PaymentIntent).id) || event.id} on Vercel:`,
        error.message,
        error.stack
      );
      return NextResponse.json({error: 'Internal server error processing webhook event.'}, {status: 500});
  }

  return NextResponse.json({received: true});
}
    
