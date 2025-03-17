"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth";
import { safeDBOperation } from "@/lib/db";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import Link from "next/link";
import { PlusCircle, TrendingUp, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslations } from "@/lib/hooks/use-translations";
import { useLanguage } from "@/lib/language-context";
import { useCurrency } from "@/lib/currency-context";
import { type TranslationKey } from "@/lib/translations";
import { formatCurrencyWithLocale } from "@/lib/utils/currency";

interface BudgetData {
  total: number;
  spent: number;
}

export function BudgetOverview() {
  const { user } = useAuth();
  const { language } = useLanguage();
  const { currency } = useCurrency();
  const [budgetData, setBudgetData] = useState<BudgetData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { t } = useTranslations([
    "noBudgets",
    "budgets.create",
    "dashboard.monthlyBudget",
    "budgets.list.overBudget",
    "dashboard.progress",
    "budgets.list.spent",
    "budgets.list.remaining",
    "loadingStates.loading",
  ] as const satisfies readonly TranslationKey[]);

  useEffect(() => {
    async function loadBudgetData() {
      if (!user) return;

      try {
        const result = await safeDBOperation(async (db) => {
          const budgets = await db.budgets.where({ userId: user.id }).toArray();

          const transactions = await db.transactions
            .where({ userId: user.id })
            .toArray();

          const total = budgets.reduce((sum, budget) => sum + budget.amount, 0);
          const spent = transactions.reduce(
            (sum, transaction) =>
              transaction.type === "expense"
                ? sum + transaction.amount
                : sum - transaction.amount,
            0
          );

          return { total, spent };
        });

        if (result.success && result.data) {
          setBudgetData(result.data);
        }
      } catch (error) {
        console.error("Error loading budget data:", error);
      } finally {
        setIsLoading(false);
      }
    }

    loadBudgetData();
  }, [user]);

  const progress = budgetData?.total
    ? (budgetData.spent / budgetData.total) * 100
    : 0;
  const remaining = budgetData?.total ? budgetData.total - budgetData.spent : 0;
  const isOverBudget = remaining < 0;

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse space-y-4">
          <div className="h-4 w-3/4 rounded bg-primary/20"></div>
          <div className="h-2 w-full rounded bg-primary/20"></div>
          <div className="h-4 w-1/2 rounded bg-primary/20"></div>
        </div>
      </div>
    );
  }

  if (!budgetData || budgetData.total === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center">
        <div className="rounded-full bg-primary/10 p-3 mb-4">
          <PlusCircle className="h-6 w-6 text-primary" />
        </div>
        <p className="text-muted-foreground mb-4">{t("noBudgets")}</p>
        <Button asChild variant="outline">
          <Link href="/budgets/new" className="inline-flex items-center">
            <PlusCircle className="mr-2 h-4 w-4" />
            {t("budgets.create")}
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium">
              {t("dashboard.monthlyBudget")}
            </span>
          </div>
          <p className="text-2xl font-bold">
            {formatCurrencyWithLocale(budgetData.total, currency, language)}
          </p>
        </div>
        {isOverBudget && (
          <div className="flex items-center gap-2 text-destructive">
            <AlertCircle className="h-4 w-4" />
            <span className="text-sm font-medium">
              {t("budgets.list.overBudget")}
            </span>
          </div>
        )}
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">
            {t("dashboard.progress")}
          </span>
          <span className="font-medium">{Math.round(progress)}%</span>
        </div>
        <Progress
          value={progress}
          className="h-2"
          indicatorClassName={isOverBudget ? "bg-destructive" : undefined}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Card className="p-4 border-none bg-primary/5">
          <CardContent className="p-0">
            <p className="text-sm text-muted-foreground">
              {t("budgets.list.spent")}
            </p>
            <p className="text-lg font-semibold mt-1">
              {formatCurrencyWithLocale(budgetData.spent, currency, language)}
            </p>
          </CardContent>
        </Card>

        <Card
          className={`p-4 border-none ${
            isOverBudget ? "bg-destructive/5" : "bg-primary/5"
          }`}
        >
          <CardContent className="p-0">
            <p className="text-sm text-muted-foreground">
              {isOverBudget
                ? t("budgets.list.overBudget")
                : t("budgets.list.remaining")}
            </p>
            <p
              className={`text-lg font-semibold mt-1 ${
                isOverBudget ? "text-destructive" : ""
              }`}
            >
              {formatCurrencyWithLocale(
                Math.abs(remaining),
                currency,
                language
              )}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
