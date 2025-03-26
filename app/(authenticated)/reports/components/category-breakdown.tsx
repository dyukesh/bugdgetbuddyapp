"use client";

import { useState, useEffect } from "react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from "recharts";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useTranslations } from "@/lib/hooks/use-translations";
import { expenseCategories } from "@/lib/categories";
import { type TranslationKey } from "@/lib/translations";
import { useDatabase } from "@/lib/database-context";
import { useCurrency } from "@/lib/currency-context";
import { useLanguage } from "@/lib/language-context";
import { formatCurrencyWithLocale } from "@/lib/utils/currency";
import { startOfMonth, endOfMonth, subMonths } from "date-fns";

const COLORS = [
  "#0088FE",
  "#00C49F",
  "#FFBB28",
  "#FF8042",
  "#8884d8",
  "#82ca9d",
  "#ffc658",
  "#ff7300",
];

export function CategoryBreakdown() {
  const { db } = useDatabase();
  const { currency } = useCurrency();
  const { language } = useLanguage();
  const { t } = useTranslations(
    expenseCategories.map((cat) => cat.translationKey as TranslationKey)
  );
  const [timeframe, setTimeframe] = useState("1");
  const [data, setData] = useState<
    Array<{
      name: string;
      value: number;
      id: string;
    }>
  >([]);

  useEffect(() => {
    const loadData = async () => {
      const now = new Date();
      const months = parseInt(timeframe, 10);
      const start = startOfMonth(subMonths(now, months - 1));
      const end = endOfMonth(now);

      const transactions = await db.transactions.toArray();

      const categoryTotals = transactions
        .filter((tx) => {
          const txDate = new Date(tx.date);
          return tx.type === "expense" && txDate >= start && txDate <= end;
        })
        .reduce((acc, tx) => {
          acc[tx.category] = (acc[tx.category] || 0) + tx.amount;
          return acc;
        }, {} as Record<string, number>);

      const categoryData = expenseCategories
        .map((category) => ({
          id: category.id,
          name: t(category.translationKey as TranslationKey),
          value: categoryTotals[category.id] || 0,
        }))
        .filter((item) => item.value > 0)
        .sort((a, b) => b.value - a.value);

      setData(categoryData);
    };

    loadData();
  }, [db, timeframe, t]);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <div className="grid w-full max-w-sm items-center gap-1.5">
          <Label htmlFor="timeframe">Time Period</Label>
          <Select value={timeframe} onValueChange={setTimeframe}>
            <SelectTrigger id="timeframe">
              <SelectValue placeholder="Select timeframe" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">Last Month</SelectItem>
              <SelectItem value="3">Last 3 Months</SelectItem>
              <SelectItem value="6">Last 6 Months</SelectItem>
              <SelectItem value="12">Last Year</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="h-[400px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={150}
              fill="#8884d8"
              label={({ name, value }) =>
                `${name}: ${formatCurrencyWithLocale(
                  value,
                  currency,
                  language
                )}`
              }
            >
              {data.map((_, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[index % COLORS.length]}
                />
              ))}
            </Pie>
            <Tooltip
              formatter={(value) =>
                formatCurrencyWithLocale(value as number, currency, language)
              }
            />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
