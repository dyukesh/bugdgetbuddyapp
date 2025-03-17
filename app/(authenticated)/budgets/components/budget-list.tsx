"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth";
import { safeDBOperation, type Budget, type Transaction } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/components/ui/use-toast";
import { AlertCircle, Edit2, Trash2, PlusCircle, Save } from "lucide-react";
import Link from "next/link";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useTranslations } from "@/lib/hooks/use-translations";
import { useLanguage } from "@/lib/language-context";
import { useCurrency } from "@/lib/currency-context";
import { type TranslationKey } from "@/lib/translations";
import { expenseCategories } from "@/lib/categories";
import { Input } from "@/components/ui/input";
import { formatCurrencyWithLocale } from "@/lib/utils/currency";
import { useDatabase } from "@/lib/database-context";
import { startOfMonth, endOfMonth } from "date-fns";

interface BudgetListProps {
  onBudgetUpdate?: () => void;
}

export function BudgetList({ onBudgetUpdate }: BudgetListProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const { language } = useLanguage();
  const { currency } = useCurrency();
  const { db } = useDatabase();
  const { t } = useTranslations([
    "budgets.list.empty" as TranslationKey,
    "budgets.list.title" as TranslationKey,
    "budgets.list.add" as TranslationKey,
    "budgets.list.spent" as TranslationKey,
    "budgets.list.remaining" as TranslationKey,
    "budgets.list.overBudget" as TranslationKey,
    "budgets.delete.title" as TranslationKey,
    "budgets.delete.description" as TranslationKey,
    "budgets.delete.success" as TranslationKey,
    "budgets.delete.error" as TranslationKey,
    "common.delete" as TranslationKey,
    "common.cancel" as TranslationKey,
  ]);
  const [budgets, setBudgets] = useState<Record<string, number>>({});
  const [expenses, setExpenses] = useState<Record<string, number>>({});
  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [budgetToDelete, setBudgetToDelete] = useState<Budget | null>(null);

  useEffect(() => {
    loadBudgets();
  }, [user]);

  useEffect(() => {
    const loadBudgets = async () => {
      const budgetData = await db.budgets.toArray();
      const budgetMap: Record<string, number> = {};
      budgetData.forEach((budget) => {
        budgetMap[budget.category] = budget.amount;
      });

      // Set default budgets for categories without budgets
      expenseCategories.forEach((category) => {
        if (!budgetMap[category.id]) {
          budgetMap[category.id] = category.defaultBudget || 0;
        }
      });

      setBudgets(budgetMap);
    };

    const loadExpenses = async () => {
      const now = new Date();
      const start = startOfMonth(now);
      const end = endOfMonth(now);

      const transactions = await db.transactions.toArray();
      const expenseMap: Record<string, number> = {};

      transactions
        .filter((tx) => {
          const txDate = new Date(tx.date);
          return tx.type === "expense" && txDate >= start && txDate <= end;
        })
        .forEach((tx) => {
          expenseMap[tx.category] = (expenseMap[tx.category] || 0) + tx.amount;
        });

      setExpenses(expenseMap);
    };

    loadBudgets();
    loadExpenses();
  }, [db]);

  async function loadBudgets() {
    if (!user) return;

    try {
      const result = await safeDBOperation(async (db) => {
        const budgets = await db.budgets.where({ userId: user.id }).toArray();
        const transactions = await db.transactions
          .where({ userId: user.id })
          .toArray();

        return budgets.map((budget) => {
          const now = new Date();
          const start = startOfMonth(now);
          const end = endOfMonth(now);

          const spent = transactions
            .filter((t) => {
              const txDate = new Date(t.date);
              return txDate >= start && txDate <= end && t.type === "expense";
            })
            .reduce((sum, t) => sum + t.amount, 0);

          return {
            ...budget,
            spent,
          };
        });
      });

      if (result.success && result.data) {
        setBudgets(
          result.data.reduce((acc, budget) => {
            acc[budget.category] = budget.amount;
            return acc;
          }, {} as Record<string, number>)
        );
      }
    } catch (error) {
      console.error("Error loading budgets:", error);
      toast({
        title: "Error",
        description: "Failed to load budgets",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  async function handleDeleteBudget() {
    if (!budgetToDelete || !user) return;

    try {
      const result = await safeDBOperation(async (db) => {
        await db.budgets.delete(budgetToDelete.id!);
      });

      if (result.success) {
        toast({
          title: "Success",
          description: t("budgets.delete.success" as TranslationKey),
        });
        loadBudgets();
      }
    } catch (error) {
      console.error("Error deleting budget:", error);
      toast({
        title: "Error",
        description: t("budgets.delete.error" as TranslationKey),
        variant: "destructive",
      });
    } finally {
      setDeleteDialogOpen(false);
      setBudgetToDelete(null);
    }
  }

  const saveBudget = async (categoryId: string) => {
    const amount = parseFloat(editValue);
    if (isNaN(amount)) return;

    const now = new Date();
    await db.budgets.put({
      category: categoryId,
      amount,
      createdAt: now,
      updatedAt: now,
    });

    setBudgets((prev) => ({ ...prev, [categoryId]: amount }));
    setEditingCategory(null);
    if (onBudgetUpdate) onBudgetUpdate();
  };

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

  if (Object.keys(budgets).length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center">
        <p className="text-muted-foreground mb-4">
          {t("budgets.list.empty" as TranslationKey)}
        </p>
        <Button asChild variant="outline">
          <Link href="/budgets/new" className="inline-flex items-center">
            <PlusCircle className="mr-2 h-4 w-4" />
            {t("budgets.list.add" as TranslationKey)}
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">
          {t("budgets.list.title" as TranslationKey)}
        </h2>
        <Button asChild>
          <Link href="/budgets/new">
            <PlusCircle className="mr-2 h-4 w-4" />
            {t("budgets.list.add" as TranslationKey)}
          </Link>
        </Button>
      </div>

      <div className="space-y-4">
        {expenseCategories.map((category) => {
          const budget = budgets[category.id] || 0;
          const spent = expenses[category.id] || 0;
          const progress = budget > 0 ? (spent / budget) * 100 : 0;
          const isOverBudget = spent > budget;

          return (
            <Card key={category.id} className="p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="font-medium">
                    {t(`categories.${category.id}` as TranslationKey)}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {editingCategory === category.id ? (
                    <>
                      <Input
                        type="number"
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        className="w-24"
                      />
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => saveBudget(category.id)}
                      >
                        <Save className="h-4 w-4" />
                      </Button>
                    </>
                  ) : (
                    <>
                      <span>
                        {formatCurrencyWithLocale(budget, currency, language)}
                      </span>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          setEditValue(budget.toString());
                          setEditingCategory(category.id);
                        }}
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                    </>
                  )}
                </div>
              </div>
              <div className="space-y-1">
                <Progress
                  value={Math.min(progress, 100)}
                  className={isOverBudget ? "bg-red-100" : ""}
                  indicatorClassName={isOverBudget ? "bg-red-500" : ""}
                />
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>
                    {formatCurrencyWithLocale(spent, currency, language)} spent
                  </span>
                  <span>{Math.round(progress)}%</span>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {t("budgets.delete.title" as TranslationKey)}
            </DialogTitle>
            <DialogDescription>
              {t("budgets.delete.description" as TranslationKey)}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setDeleteDialogOpen(false);
                setBudgetToDelete(null);
              }}
            >
              {t("common.cancel" as TranslationKey)}
            </Button>
            <Button variant="destructive" onClick={handleDeleteBudget}>
              {t("common.delete" as TranslationKey)}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
