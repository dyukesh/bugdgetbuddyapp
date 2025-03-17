"use client";

import { useState } from "react";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/components/ui/use-toast";
import { db } from "@/lib/db";
import { useTranslations } from "@/lib/hooks/use-translations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { incomeCategories, expenseCategories } from "@/lib/categories";
import { type TranslationKey } from "@/lib/translations";

interface TransactionFormProps {
  onSubmit: (data: {
    amount: number;
    description: string;
    type: "income" | "expense";
    date: Date;
    category: string;
  }) => void;
  onCancel: () => void;
}

export function TransactionForm({ onSubmit, onCancel }: TransactionFormProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const { t } = useTranslations([
    "transaction.form.amount",
    "transaction.form.description",
    "transaction.form.date",
    "transaction.form.type",
    "transaction.form.income",
    "transaction.form.expense",
    "transaction.form.category",
    "transaction.form.selectCategory",
    "common.save",
    "common.cancel",
    "common.loading",
    "common.error",
    ...incomeCategories.map((cat) => `categories.${cat.id}` as TranslationKey),
    ...expenseCategories.map((cat) => `categories.${cat.id}` as TranslationKey),
  ] as const);

  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    amount: "",
    description: "",
    type: "expense" as "income" | "expense",
    date: new Date().toISOString().split("T")[0],
    category: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.amount || !formData.description || !formData.category) {
      toast({
        title: t("common.error"),
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    onSubmit({
      amount: parseFloat(formData.amount),
      description: formData.description,
      type: formData.type,
      date: new Date(formData.date),
      category: formData.category,
    });
  };

  const availableCategories =
    formData.type === "income" ? incomeCategories : expenseCategories;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="amount">{t("transaction.form.amount")}</Label>
        <Input
          id="amount"
          type="number"
          step="0.01"
          value={formData.amount}
          onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">{t("transaction.form.description")}</Label>
        <Input
          id="description"
          value={formData.description}
          onChange={(e) =>
            setFormData({ ...formData, description: e.target.value })
          }
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="type">{t("transaction.form.type")}</Label>
        <Select
          value={formData.type}
          onValueChange={(value: "income" | "expense") =>
            setFormData({ ...formData, type: value, category: "" })
          }
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="income">
              {t("transaction.form.income")}
            </SelectItem>
            <SelectItem value="expense">
              {t("transaction.form.expense")}
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="category">{t("transaction.form.category")}</Label>
        <Select
          value={formData.category}
          onValueChange={(value) =>
            setFormData({ ...formData, category: value })
          }
        >
          <SelectTrigger>
            <SelectValue placeholder={t("transaction.form.selectCategory")} />
          </SelectTrigger>
          <SelectContent>
            {availableCategories.map((category) => (
              <SelectItem key={category.id} value={category.id}>
                {t(`categories.${category.id}` as TranslationKey)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="date">{t("transaction.form.date")}</Label>
        <Input
          id="date"
          type="date"
          value={formData.date}
          onChange={(e) => setFormData({ ...formData, date: e.target.value })}
          required
        />
      </div>

      <div className="flex justify-end space-x-2">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={loading}
        >
          {t("common.cancel")}
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {t("common.loading")}
            </>
          ) : (
            t("common.save")
          )}
        </Button>
      </div>
    </form>
  );
}
