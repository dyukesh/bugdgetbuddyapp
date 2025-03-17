"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth";
import { safeDBOperation } from "@/lib/db";
import type { Transaction } from "@/lib/db";
import { BudgetOverview } from "./components/budget-overview";
import { RecentTransactions } from "./components/recent-transactions";
import { SavingsOverview } from "./components/savings-overview";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { PlusCircle } from "lucide-react";
import { useTranslations } from "@/lib/hooks/use-translations";
import { type TranslationKey } from "@/lib/translations";

export default function DashboardPage() {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [error, setError] = useState<string | null>(null);
  const { t } = useTranslations([
    "nav.dashboard",
    "transaction.add",
    "common.error",
  ] as const satisfies readonly TranslationKey[]);

  useEffect(() => {
    async function loadTransactions() {
      if (!user) return;

      try {
        const result = await safeDBOperation(async (db) => {
          return await db.transactions
            .where({ userId: user.id })
            .reverse()
            .limit(5)
            .toArray();
        });

        if (result.success) {
          setTransactions(result.data || []);
        } else {
          setError(t("common.error"));
        }
      } catch (error) {
        console.error("Error loading transactions:", error);
        setError(t("common.error"));
      }
    }

    loadTransactions();
  }, [user, t]);

  if (error) {
    return (
      <div className="container mx-auto py-8">
        <div className="bg-destructive/10 text-destructive p-4 rounded-lg">
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/50 bg-clip-text text-transparent">
          {t("nav.dashboard")}
        </h1>
        <Button asChild>
          <Link href="/transactions/new" className="inline-flex items-center">
            <PlusCircle className="mr-2 h-4 w-4" />
            {t("transaction.add")}
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-8">
          <div className="bg-gradient-to-br from-primary/5 to-primary/10 rounded-xl p-6">
            <SavingsOverview />
          </div>
        </div>
        <div className="space-y-8">
          <div className="bg-gradient-to-br from-primary/5 to-primary/10 rounded-xl p-6">
            <RecentTransactions transactions={transactions} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-8">
          <div className="bg-gradient-to-br from-primary/5 to-primary/10 rounded-xl p-6">
            <BudgetOverview />
          </div>
        </div>
      </div>
    </div>
  );
}
