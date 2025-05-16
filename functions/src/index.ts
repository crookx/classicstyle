
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
    apiVersion: "2023-10-16", // Matched to common SDK expectations
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
    } catch (err: unknown) {
      let message = "An unknown error occurred during webhook signature verification.";
      if (err instanceof Error) {
        message = err.message;
      } else if (typeof err === "string") {
        message = err;
      }
      console.error(`Webhook signature verification failed: ${message}`);
      res.status(400).send(`Webhook Error: ${message}`);
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
        } else {
          querySnapshot.forEach(async (doc) => {
            functions.logger.info(
              `Updating order ${doc.id} status to 'Processing' due to payment_intent.succeeded.`,
            );
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
    default:
      functions.logger.info(`Unhandled event type: ${event.type}`);
    }

    res.status(200).json({ received: true });
  },
);

export const webhooks = functions.region("us-central1").https.onRequest(app);

// Illustrative Email Functions (Conceptual - for future email service integration)
// const STORE_NAME_EMAIL = "ClassicStyle eStore";
// const SUPPORT_EMAIL_CONTACT = "support@classicstyle.com";
// const STORE_PRIMARY_COLOR_EMAIL = "#DAA520";

// export const onNewOrderSendConfirmationEmailIllustrative = functions.firestore
//   .document("orders/{orderId}")
//   .onCreate(async (snap) => {
//     const orderData = snap.data();
//     if (!orderData || !orderData.customerEmail) {
//       functions.logger.error("Order data or customerEmail missing for illustrative email.");
//       return null;
//     }
//     functions.logger.info(`ILLUSTRATIVE: Order confirmation email for ${orderData.customerEmail}`);
//     return null;
//   });

// export const onNewUserSendWelcomeEmailIllustrative = functions.auth.user().onCreate(async (user) => {
//   const email = user.email;
//   functions.logger.info(`ILLUSTRATIVE: Welcome email for ${email}`);
// });
