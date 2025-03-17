"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useDatabase } from "@/lib/database-context";
import { useLanguage } from "@/lib/language-context";
import { useCurrency } from "@/lib/currency-context";
import { formatCurrencyWithLocale } from "@/lib/utils/currency";
import { startOfMonth, endOfMonth } from "date-fns";
import { TrendingUp, TrendingDown, PiggyBank } from "lucide-react";
import type { Transaction } from "@/lib/database-context";

export function SavingsOverview() {
  const { db } = useDatabase();
  const { language } = useLanguage();
  const { currency } = useCurrency();
  const [monthlyIncome, setMonthlyIncome] = useState(0);
  const [monthlyExpenses, setMonthlyExpenses] = useState(0);
  const [savings, setSavings] = useState(0);
  const [savingsPercentage, setSavingsPercentage] = useState(0);

  useEffect(() => {
    const calculateSavings = async () => {
      const now = new Date();
      const start = startOfMonth(now);
      const end = endOfMonth(now);

      // Get all transactions for the current month
      const transactions = await db.getMonthlyTransactions(start, end);

      // Calculate total income and expenses
      const income = transactions
        .filter((tx: Transaction) => tx.type === "income")
        .reduce((sum: number, tx: Transaction) => sum + tx.amount, 0);

      const expenses = transactions
        .filter((tx: Transaction) => tx.type === "expense")
        .reduce((sum: number, tx: Transaction) => sum + tx.amount, 0);

      const savingsAmount = income - expenses;
      const percentage = income > 0 ? (savingsAmount / income) * 100 : 0;

      setMonthlyIncome(income);
      setMonthlyExpenses(expenses);
      setSavings(savingsAmount);
      setSavingsPercentage(percentage);
    };

    calculateSavings();
  }, [db]);

  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Monthly Income</CardTitle>
          <TrendingUp className="h-4 w-4 text-green-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {formatCurrencyWithLocale(monthlyIncome, currency, language)}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Monthly Expenses
          </CardTitle>
          <TrendingDown className="h-4 w-4 text-red-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {formatCurrencyWithLocale(monthlyExpenses, currency, language)}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Monthly Savings</CardTitle>
          <PiggyBank className="h-4 w-4 text-blue-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {formatCurrencyWithLocale(savings, currency, language)}
          </div>
          <p className="text-xs text-muted-foreground">
            {savingsPercentage.toFixed(1)}% of income
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
