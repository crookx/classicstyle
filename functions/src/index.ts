
import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import Stripe from "stripe";
import express = require("express");
import cors = require("cors");

// Initialize Firebase Admin SDK only once
if (!admin.apps.length) {
  admin.initializeApp();
}
const db = admin.firestore();

// IMPORTANT: Store your Stripe Secret Key and Webhook Secret in Firebase Functions config
// Run these commands in your terminal in your project's root directory (not inside functions folder):
// firebase functions:config:set stripe.secret_key="sk_test_YOUR_STRIPE_SECRET_KEY"
// After deploying this function and getting the webhook URL, create an endpoint in Stripe Dashboard,
// then get the Webhook Signing Secret from Stripe and run:
// firebase functions:config:set stripe.webhook_secret="whsec_YOUR_STRIPE_WEBHOOK_SIGNING_SECRET"

const stripeSecretKey = functions.config().stripe?.secret_key;
const webhookSecret = functions.config().stripe?.webhook_secret;

let stripeInstance: Stripe | null = null;

if (stripeSecretKey) {
  stripeInstance = new Stripe(stripeSecretKey, {
    apiVersion: "2024-06-20", // Use the same API version as your app
    typescript: true,
  });
} else {
  console.error(
    "Stripe secret_key is not set in Firebase Functions config. Webhook handler will not work correctly for Stripe events.",
  );
}


const app = express();

// Use CORS middleware. Configure for your specific frontend URL in production.
app.use(cors({ origin: true }));

// Middleware to parse raw body for Stripe signature verification
app.post(
  "/stripe-webhooks",
  express.raw({ type: "application/json" }),
  async (req: express.Request, res: express.Response): Promise<void> => {
    if (!stripeInstance) {
      console.error("Stripe instance not initialized due to missing secret key.");
      res.status(500).send("Webhook server error: Stripe not configured.");
      return;
    }
    if (!webhookSecret) {
      console.error("Webhook Error: Webhook signing secret not configured.");
      res.status(500).send("Webhook server error: Signing secret missing.");
      return;
    }

    const sig = req.headers["stripe-signature"] as string;
    if (!sig) {
      console.warn("Webhook Error: Missing stripe-signature header");
      res.status(400).send("Webhook Error: Missing stripe-signature header");
      return;
    }

    let event: Stripe.Event;

    try {
      event = stripeInstance.webhooks.constructEvent(req.body, sig, webhookSecret);
    } catch (err: any) {
      console.error(`Webhook signature verification failed: ${err.message}`);
      res.status(400).send(`Webhook Error: ${err.message}`);
      return;
    }

    functions.logger.info("Received Stripe event:", {
      id: event.id,
      type: event.type,
    });

    // Handle the event
    switch (event.type) {
    case "payment_intent.succeeded": {
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      functions.logger.info(
        `PaymentIntent ${paymentIntent.id} succeeded.`,
        { metadata: paymentIntent.metadata },
      );
      try {
        const ordersQuery = db
          .collection("orders")
          .where("paymentIntentId", "==", paymentIntent.id);
        const querySnapshot = await ordersQuery.get();

        if (querySnapshot.empty) {
          functions.logger.warn(
            `No order found with paymentIntentId: ${paymentIntent.id} for succeeded event. This might mean client-side order creation failed or was delayed.`,
          );
          // TODO: Consider creating a new order here if critical, or alerting.
          // This depends on your business logic for handling such discrepancies.
        } else {
          querySnapshot.forEach(async (doc) => {
            functions.logger.info(
              `Updating order ${doc.id} status to 'Processing' due to payment_intent.succeeded.`,
            );
            // Update order status to 'Processing' or 'Pending' based on your flow.
            // If the client already set it to 'Pending', you might just confirm or move to 'Processing'.
            await doc.ref.update({
              status: "Processing",
              updatedAt: admin.firestore.FieldValue.serverTimestamp(),
            });
          });
        }
      } catch (error) {
        functions.logger.error(
          `Error handling payment_intent.succeeded for ${paymentIntent.id}:`,
          error,
        );
      }
      break;
    }
    case "payment_intent.payment_failed": {
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      functions.logger.warn( // Use warn for failed payments as it's an expected outcome
        `PaymentIntent ${paymentIntent.id} failed. Reason: ${paymentIntent.last_payment_error?.message}`,
      );
      try {
        const ordersQuery = db
          .collection("orders")
          .where("paymentIntentId", "==", paymentIntent.id);
        const querySnapshot = await ordersQuery.get();

        if (querySnapshot.empty) {
          functions.logger.warn(
            `No order found with paymentIntentId: ${paymentIntent.id} for payment_failed event.`,
          );
        } else {
          querySnapshot.forEach(async (doc) => {
            functions.logger.info(
              `Updating order ${doc.id} status to 'PaymentFailed'.`,
            );
            await doc.ref.update({
              status: "PaymentFailed",
              updatedAt: admin.firestore.FieldValue.serverTimestamp(),
            });
          });
        }
      } catch (error) {
        functions.logger.error(
          `Error handling payment_intent.payment_failed for ${paymentIntent.id}:`,
          error,
        );
      }
      break;
    }
    // Add more event types as needed
    // case 'charge.succeeded':
    //   // Handle charge.succeeded
    //   break;
    // case 'customer.subscription.created':
    //   // Handle subscription creation
    //   break;
    default:
      functions.logger.info(`Unhandled event type: ${event.type}`);
    }

    // Return a response to acknowledge receipt of the event
    res.status(200).json({ received: true });
  },
);

// Expose Express API as a single Cloud Function:
export const webhooks = functions.region("us-central1").https.onRequest(app); // Specify region if needed

// --- Example of an Order Confirmation Email (Illustrative, if you want to trigger from here) ---
// You might have this triggered by client or another function.
// const STORE_NAME = "ClassicStyle eStore";
// const SUPPORT_EMAIL = "support@classicstyle.com";
// const STORE_PRIMARY_COLOR = "#DAA520";

// export const onNewOrderSendConfirmationEmail = functions.firestore
//   .document("orders/{orderId}")
//   .onCreate(async (snap) => {
//     const orderData = snap.data();
//     if (!orderData || !orderData.customerEmail) {
//       functions.logger.error("Order data or customerEmail missing.");
//       return null;
//     }
//     // ... (rest of your email sending logic using SendGrid or other service)
//     functions.logger.info(`Simulating order confirmation email for ${orderData.customerEmail}`);
//     return null;
//   });

// --- Welcome Email on New User Signup ---
// export const onNewUserSendWelcomeEmail = functions.auth.user().onCreate(async (user) => {
//   const email = user.email;
//   // ... (rest of your welcome email logic)
//   functions.logger.info(`Simulating welcome email for ${email}`);
// });
