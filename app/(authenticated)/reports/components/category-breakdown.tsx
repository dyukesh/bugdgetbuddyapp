"use client";

import { useState } from "react";
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

// Mock data
const mockCategoryData = [
  { name: "Housing", value: 1200, id: "housing" },
  { name: "Food & Dining", value: 450, id: "food" },
  { name: "Transportation", value: 200, id: "transportation" },
  { name: "Utilities", value: 150, id: "utilities" },
  { name: "Entertainment", value: 100, id: "entertainment" },
].map((item) => ({
  ...item,
  name: expenseCategories.find((cat) => cat.id === item.id)?.name || item.name,
}));

export function CategoryBreakdown() {
  const { t } = useTranslations([
    "reports.categoryBreakdown",
    "time.currentMonth",
    "time.previousMonth",
    "time.thisYear",
    ...expenseCategories.map((cat) => `categories.${cat.id}` as const),
  ] as const satisfies readonly TranslationKey[]);
  const [data] = useState(mockCategoryData);
  const [timeframe, setTimeframe] = useState("current");

  const COLORS = [
    "#0088FE",
    "#00C49F",
    "#FFBB28",
    "#FF8042",
    "#8884d8",
    "#82ca9d",
    "#ffc658",
    "#8dd1e1",
    "#a4de6c",
    "#d0ed57",
  ];

  // Transform the data to use translated category names
  const transformedData = data.map((item) => {
    const category = expenseCategories.find((cat) => cat.id === item.id);
    return {
      ...item,
      name: category
        ? t(`categories.${category.id}` as TranslationKey)
        : item.name,
    };
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">
          {t("reports.categoryBreakdown")}
        </h2>
        <Select value={timeframe} onValueChange={setTimeframe}>
          <SelectTrigger className="w-[180px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="current">{t("time.currentMonth")}</SelectItem>
            <SelectItem value="previous">{t("time.previousMonth")}</SelectItem>
            <SelectItem value="year">{t("time.thisYear")}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={transformedData}
              cx="50%"
              cy="50%"
              labelLine={false}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {transformedData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[index % COLORS.length]}
                />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
