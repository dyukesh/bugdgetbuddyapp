import { NextResponse } from "next/server";
import Stripe from "stripe";

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error("Missing STRIPE_SECRET_KEY");
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2025-02-24.acacia",
});

export async function POST() {
  try {
    // Create a simple checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: "Support BudgetBuddy",
              description: "One-time donation",
            },
            unit_amount: 500,
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      submit_type: "donate",
      billing_address_collection: "auto",
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/about?success=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/about?canceled=true`,
      payment_intent_data: {
        description: "BudgetBuddy Donation",
        statement_descriptor: "BUDGETBUDDY",
      },
    });

    if (!session.url) {
      throw new Error("Failed to generate checkout URL");
    }

    return NextResponse.json({ url: session.url });
  } catch (error: any) {
    console.error("Error creating checkout session:", error);

    // Return a more specific error message
    const errorMessage = error.message || "Failed to create checkout session";
    return NextResponse.json(
      { error: errorMessage },
      { status: error.statusCode || 500 }
    );
  }
}
