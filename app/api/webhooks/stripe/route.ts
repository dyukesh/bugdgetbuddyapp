import { type NextRequest, NextResponse } from "next/server";
import { Stripe } from "stripe";
import { db } from "@/lib/db";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-02-24.acacia",
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

export async function POST(req: NextRequest) {
  try {
    const body = await req.text();
    const signature = req.headers.get("stripe-signature") as string;

    if (!webhookSecret) {
      return NextResponse.json(
        { error: "Webhook secret not configured" },
        { status: 500 }
      );
    }

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err: any) {
      return NextResponse.json(
        { error: `Webhook signature verification failed: ${err.message}` },
        { status: 400 }
      );
    }

    // Handle the event
    switch (event.type) {
      case "payment_intent.succeeded":
        // Handle successful payment
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        await handleSuccessfulPayment(paymentIntent);
        break;

      case "charge.succeeded":
        // Handle successful charge
        const charge = event.data.object as Stripe.Charge;
        await handleSuccessfulCharge(charge);
        break;

      case "account.external_account.created":
        const createdAccount = event.data.object as Stripe.BankAccount;
        await handleExternalAccountCreated(createdAccount);
        break;

      case "account.external_account.deleted":
        const deletedAccount = event.data.object as Stripe.BankAccount;
        await handleExternalAccountDeleted(deletedAccount);
        break;

      case "account.external_account.updated":
        const updatedAccount = event.data.object as Stripe.BankAccount;
        await handleExternalAccountUpdated(updatedAccount);
        break;

      case "account.updated":
        const account = event.data.object as Stripe.Account;
        await handleAccountUpdated(account);
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Error handling webhook:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

async function handleSuccessfulPayment(paymentIntent: Stripe.PaymentIntent) {
  // In a real application, you would:
  // 1. Find the user associated with this payment
  // 2. Record the transaction in your database
  // 3. Update account balances

  if (paymentIntent.customer && paymentIntent.payment_method) {
    try {
      // Find user by Stripe customer ID
      const profile = await db.profiles
        .where({ stripeCustomerId: paymentIntent.customer })
        .first();

      if (profile) {
        // Find the account associated with this payment method
        const account = await db.bankAccounts
          .where({
            userId: profile.userId,
            stripePaymentMethodId: paymentIntent.payment_method,
          })
          .first();

        if (account) {
          // Record the transaction
          await db.transactions.add({
            userId: profile.userId,
            accountId: account.id,
            amount: paymentIntent.amount / 100, // Convert from cents
            description: paymentIntent.description || "Payment",
            category: determineCategory(paymentIntent.description || ""),
            date: new Date().toISOString().split("T")[0],
            type: "expense",
            isRecurring: false,
            createdAt: new Date(),
          });

          // Update account balance
          await db.bankAccounts.update(account.id!, {
            balance: account.balance - paymentIntent.amount / 100,
            updatedAt: new Date(),
          });
        }
      }
    } catch (error) {
      console.error("Error processing payment webhook:", error);
    }
  }
}

async function handleSuccessfulCharge(charge: Stripe.Charge) {
  // Similar to handleSuccessfulPayment but for charges
  if (charge.customer && charge.payment_method) {
    try {
      // Find user by Stripe customer ID
      const profile = await db.profiles
        .where({ stripeCustomerId: charge.customer })
        .first();

      if (profile) {
        // Find the account associated with this payment method
        const account = await db.bankAccounts
          .where({
            userId: profile.userId,
            stripePaymentMethodId: charge.payment_method,
          })
          .first();

        if (account) {
          // Record the transaction
          await db.transactions.add({
            userId: profile.userId,
            accountId: account.id,
            amount: charge.amount / 100, // Convert from cents
            description: charge.description || "Charge",
            category: determineCategory(charge.description || ""),
            date: new Date().toISOString().split("T")[0],
            type: "expense",
            isRecurring: false,
            createdAt: new Date(),
          });

          // Update account balance
          await db.bankAccounts.update(account.id!, {
            balance: account.balance - charge.amount / 100,
            updatedAt: new Date(),
          });
        }
      }
    } catch (error) {
      console.error("Error processing charge webhook:", error);
    }
  }
}

async function handleExternalAccountCreated(bankAccount: Stripe.BankAccount) {
  try {
    // Find the associated user profile
    const profile = await db.profiles
      .where({ stripeCustomerId: bankAccount.account })
      .first();

    if (profile) {
      // Add the new bank account to our database
      await db.bankAccounts.add({
        userId: profile.userId,
        name: bankAccount.bank_name || "Bank Account",
        type: "checking",
        lastFour: bankAccount.last4,
        balance: 0,
        institution: bankAccount.bank_name || "Unknown Bank",
        color: "#2563eb", // Default blue color
        isConnected: true,
        stripePaymentMethodId: bankAccount.id,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }
  } catch (error) {
    console.error("Error handling external account creation:", error);
  }
}

async function handleExternalAccountDeleted(bankAccount: Stripe.BankAccount) {
  try {
    // Find and delete the bank account from our database
    const account = await db.bankAccounts
      .where({ stripePaymentMethodId: bankAccount.id })
      .first();

    if (account) {
      await db.bankAccounts.delete(account.id!);
    }
  } catch (error) {
    console.error("Error handling external account deletion:", error);
  }
}

async function handleExternalAccountUpdated(bankAccount: Stripe.BankAccount) {
  try {
    // Find and update the bank account in our database
    const account = await db.bankAccounts
      .where({ stripePaymentMethodId: bankAccount.id })
      .first();

    if (account) {
      await db.bankAccounts.update(account.id!, {
        name: bankAccount.bank_name || account.name,
        updatedAt: new Date(),
      });
    }
  } catch (error) {
    console.error("Error handling external account update:", error);
  }
}

async function handleAccountUpdated(account: Stripe.Account) {
  try {
    // Find and update the user profile
    const profile = await db.profiles
      .where({ stripeCustomerId: account.id })
      .first();

    if (profile) {
      // Update any relevant account information
      // This depends on what account information you want to track
      await db.profiles.update(profile.id!, {
        updatedAt: new Date(),
      });
    }
  } catch (error) {
    console.error("Error handling account update:", error);
  }
}

// Helper function to determine transaction category based on description
function determineCategory(description: string): string {
  description = description.toLowerCase();

  if (
    description.includes("restaurant") ||
    description.includes("food") ||
    description.includes("cafe")
  ) {
    return "food";
  } else if (
    description.includes("gas") ||
    description.includes("uber") ||
    description.includes("lyft")
  ) {
    return "transportation";
  } else if (
    description.includes("netflix") ||
    description.includes("spotify") ||
    description.includes("movie")
  ) {
    return "entertainment";
  } else if (description.includes("rent") || description.includes("mortgage")) {
    return "housing";
  } else if (
    description.includes("electric") ||
    description.includes("water") ||
    description.includes("internet")
  ) {
    return "utilities";
  } else {
    return "other";
  }
}
