"use client";

import { useRouter } from "next/navigation";
import { TransactionForm } from "../components/transaction-form";
import { useTranslations } from "@/lib/hooks/use-translations";
import { type TranslationKey } from "@/lib/translations";
import { useAuth } from "@/lib/auth";
import { safeDBOperation } from "@/lib/db";
import { toast } from "sonner";

export default function NewTransactionPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { t } = useTranslations([
    "transaction.add",
    "transaction.description",
    "common.error",
    "common.success",
    "transaction.failedToDelete",
  ] as const satisfies readonly TranslationKey[]);

  const handleSubmit = async (data: {
    amount: number;
    description: string;
    type: "income" | "expense";
    date: Date;
    category: string;
  }) => {
    if (!user) return;

    try {
      const result = await safeDBOperation(async (db) => {
        await db.transactions.add({
          userId: user.id,
          amount: data.amount,
          description: data.description,
          type: data.type,
          date: data.date,
          category: data.category,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      });

      if (result.success) {
        toast.success(t("common.success"));
        router.push("/transactions");
      } else {
        toast.error(t("transaction.failedToDelete"));
      }
    } catch (error) {
      console.error("Error creating transaction:", error);
      toast.error(t("transaction.failedToDelete"));
    }
  };

  const handleCancel = () => {
    router.push("/transactions");
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          {t("transaction.add")}
        </h1>
        <p className="text-muted-foreground">{t("transaction.description")}</p>
      </div>

      <TransactionForm onSubmit={handleSubmit} onCancel={handleCancel} />
    </div>
  );
}
