"use server";

import { Stripe } from "stripe";
import { getDB, safeDBOperation, isBrowser } from "@/lib/db";
import { revalidatePath } from "next/cache";

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-02-24.acacia",
});

// Create a Stripe setup intent for bank account linking
export async function createSetupIntent(userId: string) {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error("Stripe secret key is not configured");
  }

  try {
    // Create a setup intent without requiring customer ID initially
    const setupIntent = await stripe.setupIntents.create({
      payment_method_types: ["card"],
      usage: "off_session",
    });

    if (!setupIntent.client_secret) {
      throw new Error("Failed to get client secret from Stripe");
    }

    return {
      clientSecret: setupIntent.client_secret,
      setupIntentId: setupIntent.id,
    };
  } catch (error: any) {
    console.error("Error creating setup intent:", error);
    if (error.type === "StripeCardError") {
      throw new Error(
        "There was an issue with the payment method: " + error.message
      );
    } else if (error.type === "StripeInvalidRequestError") {
      throw new Error("Invalid request to Stripe: " + error.message);
    } else if (error.type === "StripeAPIError") {
      throw new Error("Stripe API error: " + error.message);
    }
    throw new Error(error.message || "Failed to initialize payment setup");
  }
}

// Link a payment method to a user
export async function linkPaymentMethod(
  userId: string,
  paymentMethodId: string
) {
  try {
    // Get user's Stripe customer ID or create new customer
    const profileResult = await safeDBOperation(async (db) => {
      return await db.profiles.where({ userId }).first();
    });

    let customerId: string;

    if (profileResult.success && profileResult.data?.stripeCustomerId) {
      customerId = profileResult.data.stripeCustomerId;
    } else {
      // Create a new customer in Stripe
      const customer = await stripe.customers.create({
        metadata: { userId },
      });
      customerId = customer.id;

      // Update or create profile with Stripe customer ID
      await safeDBOperation(async (db) => {
        if (profileResult.data) {
          await db.profiles.update(profileResult.data.id!, {
            stripeCustomerId: customerId,
            updatedAt: new Date(),
          });
        } else {
          await db.profiles.add({
            userId,
            fullName: "",
            currency: "USD",
            stripeCustomerId: customerId,
            updatedAt: new Date(),
          });
        }
      });
    }

    // Get payment method details
    const paymentMethod = await stripe.paymentMethods.retrieve(paymentMethodId);

    // Attach payment method to customer
    await stripe.paymentMethods.attach(paymentMethodId, {
      customer: customerId,
    });

    // Get card details
    const card = paymentMethod.card;
    if (!card) {
      throw new Error("Card information not found");
    }

    // Add card to database
    const addCardResult = await safeDBOperation(async (db) => {
      await db.bankAccounts.add({
        userId,
        name: `${card.brand} Card`,
        type: "credit",
        lastFour: card.last4,
        balance: 0,
        institution: card.brand,
        color: getCardColor(card.brand),
        isConnected: true,
        stripePaymentMethodId: paymentMethodId,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    });

    if (!addCardResult.success) {
      throw new Error("Failed to save card to database");
    }

    revalidatePath("/accounts");
    return { success: true };
  } catch (error) {
    console.error("Error linking payment method:", error);
    throw new Error(
      error instanceof Error ? error.message : "Failed to link payment method"
    );
  }
}

// Sync transactions for a payment method
export async function syncTransactions(userId: string, accountId: number) {
  try {
    const accountResult = await safeDBOperation(async (db) => {
      return await db.bankAccounts.get(accountId);
    });

    if (!accountResult.success || !accountResult.data?.stripePaymentMethodId) {
      throw new Error("Account not found or not linked to Stripe");
    }

    const account = accountResult.data;

    // In a real implementation, you would:
    // 1. Use Stripe Financial Connections or a similar service to fetch real transactions
    // 2. Process and categorize the transactions
    // 3. Save them to your database

    // For demo purposes, we'll create some sample transactions
    const today = new Date();

    const sampleTransactions = [
      {
        userId,
        accountId,
        amount: 45.99,
        description: "Grocery Store",
        category: "food",
        date: new Date(today.getTime() - 2 * 24 * 60 * 60 * 1000),
        type: "expense" as const,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        userId,
        accountId,
        amount: 9.99,
        description: "Streaming Service",
        category: "entertainment",
        date: new Date(today.getTime() - 5 * 24 * 60 * 60 * 1000),
        type: "expense" as const,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        userId,
        accountId,
        amount: 35.5,
        description: "Gas Station",
        category: "transportation",
        date: new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000),
        type: "expense" as const,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    // Add transactions to database
    const addTransactionsResult = await safeDBOperation(async (db) => {
      await Promise.all(
        sampleTransactions.map((transaction) =>
          db.transactions.add(transaction)
        )
      );

      // Update account balance
      const totalExpenses = sampleTransactions.reduce(
        (sum, t) => sum + t.amount,
        0
      );
      await db.bankAccounts.update(accountId, {
        balance: account.balance - totalExpenses,
        updatedAt: new Date(),
      });
    });

    if (!addTransactionsResult.success) {
      throw new Error("Failed to save transactions to database");
    }

    revalidatePath("/transactions");
    revalidatePath("/accounts");
    return { success: true, count: sampleTransactions.length };
  } catch (error) {
    console.error("Error syncing transactions:", error);
    throw new Error(
      error instanceof Error ? error.message : "Failed to sync transactions"
    );
  }
}

// Helper function to format date
function formatDate(date: Date): string {
  return date.toISOString().split("T")[0];
}

// Helper function to get a color for a card brand
function getCardColor(brand: string): string {
  const colors: Record<string, string> = {
    visa: "#1A1F71",
    mastercard: "#EB001B",
    amex: "#006FCF",
    discover: "#FF6000",
    jcb: "#0E4C96",
    diners: "#0079BE",
    unionpay: "#D10429",
    default: "#6366F1",
  };

  return colors[brand.toLowerCase()] || colors.default;
}
