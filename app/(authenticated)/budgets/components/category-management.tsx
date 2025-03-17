"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth";
import { db, type Transaction, type Category } from "@/lib/db";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { PlusCircle, Edit2, Trash2, AlertCircle } from "lucide-react";
import { useTranslations } from "@/lib/hooks/use-translations";
import { useLanguage } from "@/lib/language-context";
import { type TranslationKey } from "@/lib/translations";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

interface CategoryWithSpent extends Category {
  spent: number;
}

export function CategoryManagement() {
  const { user } = useAuth();
  const { formatCurrency } = useLanguage();
  const { toast } = useToast();
  const [categories, setCategories] = useState<CategoryWithSpent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingCategory, setEditingCategory] =
    useState<CategoryWithSpent | null>(null);

  const { t } = useTranslations([
    "categories.title",
    "categories.add",
    "categories.edit",
    "categories.delete",
    "categories.name",
    "categories.budget",
    "categories.spent",
    "categories.remaining",
    "categories.progress",
    "categories.overBudget",
    "common.save",
    "common.cancel",
    "common.delete",
  ] as const satisfies readonly TranslationKey[]);

  useEffect(() => {
    loadCategories();
  }, [user]);

  async function loadCategories() {
    if (!user || !db) return;

    try {
      const userCategories = await db.categories
        .where("userId")
        .equals(user.id)
        .toArray();

      const transactions = await db.transactions
        .where("userId")
        .equals(user.id)
        .toArray();

      const categoriesWithSpent = userCategories.map((category: Category) => ({
        ...category,
        spent: transactions
          .filter(
            (t: Transaction) =>
              t.category === category.id && t.type === "expense"
          )
          .reduce((sum, t) => sum + t.amount, 0),
      }));

      setCategories(categoriesWithSpent);
    } catch (error) {
      console.error("Error loading categories:", error);
      toast({
        title: "Error",
        description: "Failed to load categories",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  async function handleSaveCategory(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const name = formData.get("name") as string;
    const budget = parseFloat(formData.get("budget") as string);
    const color = formData.get("color") as string;

    if (!user || !db) return;

    try {
      if (editingCategory) {
        await db.categories.update(editingCategory.id, {
          name,
          budget,
          color,
          updatedAt: new Date(),
        });
      } else {
        await db.categories.add({
          id: crypto.randomUUID(),
          userId: user.id,
          name,
          budget,
          color,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      }

      toast({
        title: "Success",
        description: editingCategory
          ? "Category updated successfully"
          : "Category added successfully",
      });
      loadCategories();
      setShowAddDialog(false);
      setEditingCategory(null);
    } catch (error) {
      console.error("Error saving category:", error);
      toast({
        title: "Error",
        description: "Failed to save category",
        variant: "destructive",
      });
    }
  }

  async function handleDeleteCategory(categoryId: string) {
    if (!user || !db) return;

    try {
      await db.categories.delete(categoryId);
      toast({
        title: "Success",
        description: "Category deleted successfully",
      });
      loadCategories();
    } catch (error) {
      console.error("Error deleting category:", error);
      toast({
        title: "Error",
        description: "Failed to delete category",
        variant: "destructive",
      });
    }
  }

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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">{t("categories.title")}</h2>
        <Button onClick={() => setShowAddDialog(true)}>
          <PlusCircle className="mr-2 h-4 w-4" />
          {t("categories.add")}
        </Button>
      </div>

      <div className="grid gap-4">
        {categories.map((category) => {
          const progress = (category.spent / category.budget) * 100;
          const remaining = category.budget - category.spent;
          const isOverBudget = remaining < 0;

          return (
            <Card key={category.id}>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: category.color }}
                    />
                    <h3 className="font-medium">{category.name}</h3>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        setEditingCategory(category);
                        setShowAddDialog(true);
                      }}
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteCategory(category.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">
                      {t("categories.progress")}
                    </span>
                    <span className="font-medium">{Math.round(progress)}%</span>
                  </div>
                  <Progress
                    value={progress}
                    className="h-2"
                    indicatorClassName={
                      isOverBudget ? "bg-destructive" : undefined
                    }
                  />
                </div>

                <div className="grid grid-cols-3 gap-4 mt-4">
                  <div>
                    <p className="text-sm text-muted-foreground">
                      {t("categories.budget")}
                    </p>
                    <p className="font-medium">
                      {formatCurrency(category.budget)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">
                      {t("categories.spent")}
                    </p>
                    <p className="font-medium">
                      {formatCurrency(category.spent)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">
                      {isOverBudget
                        ? t("categories.overBudget")
                        : t("categories.remaining")}
                    </p>
                    <p
                      className={`font-medium ${
                        isOverBudget ? "text-destructive" : ""
                      }`}
                    >
                      {formatCurrency(Math.abs(remaining))}
                    </p>
                  </div>
                </div>

                {isOverBudget && (
                  <div className="flex items-center gap-2 mt-4 text-destructive text-sm">
                    <AlertCircle className="h-4 w-4" />
                    <span>{t("categories.overBudget")}</span>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingCategory ? t("categories.edit") : t("categories.add")}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSaveCategory}>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">{t("categories.name")}</Label>
                <Input
                  id="name"
                  name="name"
                  defaultValue={editingCategory?.name}
                  required
                />
              </div>
              <div>
                <Label htmlFor="budget">{t("categories.budget")}</Label>
                <Input
                  id="budget"
                  name="budget"
                  type="number"
                  min="0"
                  step="0.01"
                  defaultValue={editingCategory?.budget}
                  required
                />
              </div>
              <div>
                <Label htmlFor="color">Color</Label>
                <Input
                  id="color"
                  name="color"
                  type="color"
                  defaultValue={editingCategory?.color ?? "#000000"}
                  required
                />
              </div>
            </div>
            <DialogFooter className="mt-6">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowAddDialog(false);
                  setEditingCategory(null);
                }}
              >
                {t("common.cancel")}
              </Button>
              <Button type="submit">
                {editingCategory ? t("common.save") : t("categories.add")}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
