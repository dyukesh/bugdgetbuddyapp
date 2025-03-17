"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth";
import { CategoryManagement } from "./components/category-management";
import { BudgetList } from "./components/budget-list";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useTranslations } from "@/lib/hooks/use-translations";
import { type TranslationKey } from "@/lib/translations";

export default function BudgetsPage() {
  const { user } = useAuth();
  const { t } = useTranslations([
    "budgets.list.title",
    "categories.title",
  ] as const satisfies readonly TranslationKey[]);

  if (!user) {
    return null;
  }

  return (
    <div className="container py-6">
      <Tabs defaultValue="budgets" className="space-y-6">
        <TabsList>
          <TabsTrigger value="budgets">{t("budgets.list.title")}</TabsTrigger>
          <TabsTrigger value="categories">{t("categories.title")}</TabsTrigger>
        </TabsList>

        <TabsContent value="budgets" className="space-y-6">
          <BudgetList />
        </TabsContent>

        <TabsContent value="categories" className="space-y-6">
          <CategoryManagement />
        </TabsContent>
      </Tabs>
    </div>
  );
}
