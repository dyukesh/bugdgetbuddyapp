"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth";
import { safeDBOperation } from "@/lib/db";
import { AlertCircle, X } from "lucide-react";
import { useLanguage } from "@/lib/language-context";
import { useTranslations } from "@/lib/hooks/use-translations";
import { type TranslationKey } from "@/lib/translations";

export function BudgetAlert() {
  const { user } = useAuth();
  const { formatCurrency } = useLanguage();
  const [overBudgetItems, setOverBudgetItems] = useState<
    Array<{
      category: string;
      amount: number;
      budget: number;
      overspent: number;
    }>
  >([]);
  const [isVisible, setIsVisible] = useState(true);

  const { t } = useTranslations([
    "budgets.alert.title",
    "budgets.alert.message",
    "budgets.alert.close",
  ] as const satisfies readonly TranslationKey[]);

  useEffect(() => {
    const userId = user?.id;
    if (!userId) return;

    async function checkBudgets() {
      try {
        const result = await safeDBOperation(async (db) => {
          const budgets = await db.budgets.where({ userId }).toArray();
          const transactions = await db.transactions
            .where({ userId })
            .toArray();

          const currentDate = new Date();
          const startOfMonth = new Date(
            currentDate.getFullYear(),
            currentDate.getMonth(),
            1
          );
          const endOfMonth = new Date(
            currentDate.getFullYear(),
            currentDate.getMonth() + 1,
            0
          );

          const overBudget = budgets
            .map((budget) => {
              const spent = transactions
                .filter(
                  (t) =>
                    t.category === budget.category &&
                    t.type === "expense" &&
                    new Date(t.date) >= startOfMonth &&
                    new Date(t.date) <= endOfMonth
                )
                .reduce((sum, t) => sum + t.amount, 0);

              return {
                category: budget.category,
                amount: spent,
                budget: budget.amount,
                overspent: spent > budget.amount ? spent - budget.amount : 0,
              };
            })
            .filter((item) => item.overspent > 0);

          return overBudget;
        });

        if (result.success && result.data) {
          setOverBudgetItems(result.data);
          // If there are over budget items, make the alert visible
          if (result.data.length > 0) {
            setIsVisible(true);
          }
        }
      } catch (error) {
        console.error("Error checking budgets:", error);
      }
    }

    // Initial check
    checkBudgets();

    // Check every minute
    const interval = setInterval(checkBudgets, 60 * 1000);
    return () => clearInterval(interval);
  }, [user]);

  if (!isVisible || !user?.id || overBudgetItems.length === 0) {
    return null;
  }

  return (
    <div className="fixed top-4 right-4 z-50 max-w-md">
      <div className="bg-destructive/10 border border-destructive rounded-lg p-4 shadow-lg">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-destructive" />
            <h3 className="font-semibold text-destructive">
              {t("budgets.alert.title")}
            </h3>
          </div>
          <button
            onClick={() => setIsVisible(false)}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="mt-2">
          <p className="text-sm text-muted-foreground mb-2">
            {t("budgets.alert.message")}
          </p>
          <div className="space-y-2">
            {overBudgetItems.map((item, index) => (
              <div key={index} className="text-sm bg-background/50 p-2 rounded">
                <p className="font-medium">
                  {item.category}: {formatCurrency(item.overspent)} over budget
                </p>
                <div className="text-xs text-muted-foreground">
                  Spent: {formatCurrency(item.amount)} / Budget:{" "}
                  {formatCurrency(item.budget)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
