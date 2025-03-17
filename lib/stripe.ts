import { loadStripe } from "@stripe/stripe-js";
import { Stripe } from "stripe";

// Initialize Stripe on the client side
const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;

if (!publishableKey) {
  throw new Error(
    "Stripe publishable key is not configured in environment variables"
  );
}

export const stripePromise = loadStripe(publishableKey);

// Initialize Stripe on the server side (for API routes)
let stripeInstance: Stripe | null = null;

export function getStripe() {
  if (!stripeInstance && process.env.STRIPE_SECRET_KEY) {
    stripeInstance = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: "2025-02-24.acacia",
    });
  }
  return stripeInstance;
}
