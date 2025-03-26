"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useDatabase } from "@/lib/database-context";
import { useCurrency } from "@/lib/currency-context";
import { useLanguage } from "@/lib/language-context";
import { formatCurrencyWithLocale } from "@/lib/utils/currency";
import { startOfMonth, endOfMonth, subMonths, format } from "date-fns";

export function SavingsRate() {
  const { db } = useDatabase();
  const { currency } = useCurrency();
  const { language } = useLanguage();
  const [data, setData] = useState<
    Array<{
      month: string;
      rate: number;
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

        const savings = income - expenses;
        const rate = income > 0 ? (savings / income) * 100 : 0;

        return {
          month: label,
          rate: Number(rate.toFixed(1)),
          savings,
        };
      });

      setData(monthlyData);
    };

    loadData();
  }, [db]);

  // Calculate average rate from actual data
  const averageRate =
    data.length > 0
      ? (
          data.reduce((sum, month) => sum + month.rate, 0) / data.length
        ).toFixed(1)
      : "0.0";

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Average Savings Rate: {averageRate}%</CardTitle>
          <CardDescription>
            Your savings rate is the percentage of your income that you save
          </CardDescription>
        </CardHeader>
        <CardContent className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
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
                formatter={(value, name) => {
                  if (name === "rate") return [`${value}%`, "Savings Rate"];
                  return [
                    formatCurrencyWithLocale(
                      value as number,
                      currency,
                      language
                    ),
                    "Savings Amount",
                  ];
                }}
              />
              <Line
                type="monotone"
                dataKey="rate"
                name="Savings Rate"
                stroke="#8884d8"
                activeDot={{ r: 8 }}
              />
              <Line
                type="monotone"
                dataKey="savings"
                name="Savings Amount"
                stroke="#82ca9d"
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Savings Tips</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h3 className="font-medium">The 50/30/20 Rule</h3>
              <p className="text-sm text-muted-foreground">
                Allocate 50% of your income to needs, 30% to wants, and 20% to
                savings and debt repayment.
              </p>
            </div>
            <div>
              <h3 className="font-medium">Pay Yourself First</h3>
              <p className="text-sm text-muted-foreground">
                Set up automatic transfers to your savings account on payday
                before you have a chance to spend it.
              </p>
            </div>
            <div>
              <h3 className="font-medium">Track Your Spending</h3>
              <p className="text-sm text-muted-foreground">
                Regularly review your expenses to identify areas where you can
                cut back.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
