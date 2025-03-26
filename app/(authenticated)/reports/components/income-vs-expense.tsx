"use client";

import { useState, useEffect } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useDatabase } from "@/lib/database-context";
import { useCurrency } from "@/lib/currency-context";
import { useLanguage } from "@/lib/language-context";
import { formatCurrencyWithLocale } from "@/lib/utils/currency";
import { startOfMonth, endOfMonth, subMonths, format } from "date-fns";

export function IncomeVsExpense() {
  const { db } = useDatabase();
  const { currency } = useCurrency();
  const { language } = useLanguage();
  const [data, setData] = useState<
    Array<{
      month: string;
      income: number;
      expenses: number;
      savings: number;
    }>
  >([]);

  useEffect(() => {
    const loadData = async () => {
      const now = new Date();
      const months = Array.from({ length: 6 }, (_, i) => {
        const date = subMonths(now, 5 - i);
        return {
          start: startOfMonth(date),
          end: endOfMonth(date),
          label: format(date, "MMM yyyy"),
        };
      });

      const transactions = await db.transactions.toArray();

      const monthlyData = months.map(({ start, end, label }) => {
        const monthTransactions = transactions.filter((tx) => {
          const txDate = new Date(tx.date);
          return txDate >= start && txDate <= end;
        });

        const income = monthTransactions
          .filter((tx) => tx.type === "income")
          .reduce((sum, tx) => sum + tx.amount, 0);

        const expenses = monthTransactions
          .filter((tx) => tx.type === "expense")
          .reduce((sum, tx) => sum + tx.amount, 0);

        return {
          month: label,
          income,
          expenses,
          savings: income - expenses,
        };
      });

      setData(monthlyData);
    };

    loadData();
  }, [db]);

  // Calculate totals from actual data
  const totalIncome = data.reduce((sum, month) => sum + month.income, 0);
  const totalExpenses = data.reduce((sum, month) => sum + month.expenses, 0);
  const totalSavings = data.reduce((sum, month) => sum + month.savings, 0);

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Income</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrencyWithLocale(totalIncome, currency, language)}
            </div>
            <p className="text-xs text-muted-foreground">Last 6 months</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Total Expenses
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrencyWithLocale(totalExpenses, currency, language)}
            </div>
            <p className="text-xs text-muted-foreground">Last 6 months</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Savings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrencyWithLocale(totalSavings, currency, language)}
            </div>
            <p className="text-xs text-muted-foreground">Last 6 months</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Income vs. Expenses</CardTitle>
          <CardDescription>
            Compare your income and expenses over time
          </CardDescription>
        </CardHeader>
        <CardContent className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              margin={{
                top: 20,
                right: 30,
                left: 20,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip
                formatter={(value) =>
                  formatCurrencyWithLocale(value as number, currency, language)
                }
              />
              <Legend />
              <Bar dataKey="income" name="Income" fill="#4ade80" />
              <Bar dataKey="expenses" name="Expenses" fill="#f87171" />
              <Bar dataKey="savings" name="Savings" fill="#60a5fa" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
