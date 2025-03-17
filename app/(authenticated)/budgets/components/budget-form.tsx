"use client";

import type React from "react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { expenseCategories } from "@/lib/categories";
import { toast } from "sonner";
import { safeDBOperation, type Budget } from "@/lib/db";
import { useAuth } from "@/lib/auth";
import { useCurrency } from "@/lib/currency-context";
import { useTranslations } from "@/lib/hooks/use-translations";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import * as z from "zod";
import { TranslationKey } from "@/lib/translations";

const formSchema = z.object({
  category: z.string().min(1, "validation.category.required"),
  amount: z.number().min(0, "validation.amount.positive"),
});

type BudgetFormValues = z.infer<typeof formSchema>;

interface BudgetFormProps {
  budget?: Budget;
}

export function BudgetForm({ budget }: BudgetFormProps) {
  const router = useRouter();
  const { user } = useAuth();
  const { currency, getCurrencySymbol, formatAmount } = useCurrency();
  const { t } = useTranslations([
    "amount",
    "category",
    "loadingStates.saving",
    "budgets.create",
    "budgets.update",
    "categories.housing",
    "categories.food",
    "categories.transportation",
    "categories.utilities",
    "categories.entertainment",
    "categories.healthcare",
    "categories.shopping",
    "categories.other",
    "validation.amount.positive",
    "validation.category.required",
  ] as const);

  const [loading, setLoading] = useState(false);

  const form = useForm<BudgetFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      category: budget?.category || "",
      amount: budget?.amount || 0,
    },
  });

  const onSubmit = async (values: BudgetFormValues) => {
    setLoading(true);

    try {
      if (!user) {
        throw new Error("You must be logged in to create a budget");
      }

      const result = await safeDBOperation(async (db) => {
        if (budget?.id) {
          await db.budgets.update(budget.id, {
            amount: values.amount,
            category: values.category,
            updatedAt: new Date(),
          });
        } else {
          await db.budgets.add({
            userId: user.id,
            amount: values.amount,
            category: values.category,
            createdAt: new Date(),
            updatedAt: new Date(),
          });
        }
      });

      if (result.success) {
        toast.success(budget?.id ? "Budget updated" : "Budget created");
        router.push("/budgets");
        router.refresh();
      } else {
        toast.error("Failed to save budget");
      }
    } catch (error) {
      console.error("Error saving budget:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to save budget"
      );
    } finally {
      setLoading(false);
    }
  };

  const categories = [
    "housing",
    "food",
    "transportation",
    "utilities",
    "entertainment",
    "healthcare",
    "shopping",
    "other",
  ] as const;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="category"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("category")}</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {t(`categories.${category}` as TranslationKey)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage>
                {form.formState.errors.category?.message &&
                  t(form.formState.errors.category.message as TranslationKey)}
              </FormMessage>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="amount"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("amount")}</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  step="0.01"
                  value={field.value}
                  onChange={(e) => {
                    const value = parseFloat(e.target.value);
                    field.onChange(isNaN(value) ? 0 : value);
                  }}
                  onBlur={(e) => {
                    if (field.value > 0) {
                      const formatted = formatAmount(field.value);
                      e.currentTarget.value = formatted;
                    }
                  }}
                />
              </FormControl>
              <FormMessage>
                {form.formState.errors.amount?.message &&
                  t(form.formState.errors.amount.message as TranslationKey)}
              </FormMessage>
            </FormItem>
          )}
        />

        <Button type="submit" disabled={loading}>
          {loading
            ? t("loadingStates.saving")
            : budget
            ? t("budgets.update")
            : t("budgets.create")}
        </Button>
      </form>
    </Form>
  );
}
