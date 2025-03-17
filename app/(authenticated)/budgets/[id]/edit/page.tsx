"use client";

import { BudgetForm } from "../../components/budget-form";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { safeDBOperation, type Budget } from "@/lib/db";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useTranslations } from "@/lib/hooks/use-translations";
import { type TranslationKey } from "@/lib/translations";

export default function EditBudgetPage() {
  const params = useParams();
  const router = useRouter();
  const { user, loading } = useAuth();
  const [budget, setBudget] = useState<Budget | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { t } = useTranslations([
    "budgets.edit",
    "budgets.editDescription",
    "common.failedToLoad",
    "budgets.notFound",
    "budgets.backToList",
  ] as const satisfies readonly TranslationKey[]);

  useEffect(() => {
    async function loadBudget() {
      if (user) {
        try {
          const id = Number(params.id);
          if (isNaN(id)) {
            router.push("/budgets");
            return;
          }

          const result = await safeDBOperation(async (db) => {
            return await db.budgets.get(id);
          });

          if (result.success && result.data && result.data.userId === user.id) {
            setBudget(result.data);
          } else {
            router.push("/budgets");
          }
        } catch (error) {
          console.error("Error loading budget:", error);
          setError(
            error instanceof Error ? error.message : t("common.failedToLoad")
          );
          router.push("/budgets");
        } finally {
          setIsLoading(false);
        }
      }
    }

    if (!loading) {
      if (!user) {
        router.push("/login");
      } else {
        loadBudget();
      }
    }
  }, [params.id, user, loading, router, t]);

  if (loading || isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <div className="h-12 w-12 rounded-full bg-primary/20"></div>
          <div className="h-4 w-24 rounded bg-primary/20"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-500 mb-4">{error}</p>
        <Button asChild>
          <Link href="/budgets">{t("budgets.backToList")}</Link>
        </Button>
      </div>
    );
  }

  if (!budget) {
    return (
      <div className="text-center py-8">
        <p>{t("budgets.notFound")}</p>
        <Button asChild className="mt-4">
          <Link href="/budgets">{t("budgets.backToList")}</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          {t("budgets.edit")}
        </h1>
        <p className="text-muted-foreground">{t("budgets.editDescription")}</p>
      </div>

      <BudgetForm budget={budget} />
    </div>
  );
}
