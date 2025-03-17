"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  CardNumberElement,
  CardExpiryElement,
  CardCvcElement,
  Elements,
  useElements,
  useStripe,
} from "@stripe/react-stripe-js";
import { toast } from "sonner";
import { useTranslations } from "@/lib/hooks/use-translations";
import { type TranslationKey } from "@/lib/translations";
import { loadStripe } from "@stripe/stripe-js";
import { Lock, CreditCard, Calendar, Shield, AlertCircle } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";

const cardElementStyle = {
  style: {
    base: {
      fontSize: "16px",
      fontFamily: '"Inter", system-ui, sans-serif',
      color: "var(--foreground)",
      "::placeholder": {
        color: "var(--muted-foreground)",
      },
      iconColor: "var(--foreground)",
    },
    invalid: {
      color: "var(--destructive)",
      iconColor: "var(--destructive)",
    },
  },
};

const DonationForm = ({ onClose }: { onClose: () => void }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const { t } = useTranslations([
    "about.donate",
    "about.donateSuccess",
    "about.donateFailed",
    "common.error",
  ] as const satisfies readonly TranslationKey[]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setLoading(true);

    try {
      const { error } = await stripe.createPaymentMethod({
        type: "card",
        card: elements.getElement(CardNumberElement)!,
      });

      if (error) {
        throw new Error(error.message);
      }

      // In test mode, always show the test mode message
      toast.info(
        "This project is in test mode. No actual charges will be made.",
        {
          duration: 5000,
        }
      );
      onClose();
    } catch (error) {
      console.error("Payment failed:", error);
      toast.error(error instanceof Error ? error.message : t("common.error"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Alert className="bg-yellow-500/10 text-yellow-600 dark:text-yellow-400">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          This project is in test mode. You can enter card details, but no
          actual charges will be made.
        </AlertDescription>
      </Alert>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-medium">Card Information</h3>
            <p className="text-sm text-muted-foreground">
              Enter your card details securely
            </p>
          </div>
          <Lock className="h-5 w-5 text-muted-foreground" />
        </div>

        <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
          <div className="p-6 space-y-4">
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <CreditCard className="h-4 w-4" />
                Card Number
              </Label>
              <div className="rounded-md border bg-background px-3 py-2">
                <CardNumberElement options={cardElementStyle} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Expiry Date
                </Label>
                <div className="rounded-md border bg-background px-3 py-2">
                  <CardExpiryElement options={cardElementStyle} />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  CVC
                </Label>
                <div className="rounded-md border bg-background px-3 py-2">
                  <CardCvcElement options={cardElementStyle} />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-lg border bg-muted/50 p-4">
          <div className="flex items-center gap-3">
            <Lock className="h-4 w-4 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              Your payment information is securely processed by Stripe
            </p>
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-3">
        <Button type="button" variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={!stripe || loading}
          className="min-w-[100px] bg-gradient-to-r from-pink-500 to-violet-500 hover:from-pink-600 hover:to-violet-600"
        >
          {loading ? (
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
              <span>Processing...</span>
            </div>
          ) : (
            t("about.donate")
          )}
        </Button>
      </div>
    </form>
  );
};

export function DonationDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[450px]">
        <DialogHeader>
          <DialogTitle className="text-2xl">Support BudgetBuddy</DialogTitle>
          <p className="text-muted-foreground">
            Make a $5 donation to support our open-source project
          </p>
        </DialogHeader>
        <Elements
          stripe={loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)}
        >
          <DonationForm onClose={() => onOpenChange(false)} />
        </Elements>
      </DialogContent>
    </Dialog>
  );
}
