"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { incomeCategories, expenseCategories } from "@/lib/categories";
import { useTranslations } from "@/lib/hooks/use-translations";
import { type TranslationKey } from "@/lib/translations";

export function TransactionFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t } = useTranslations([
    "transaction.type",
    "allTypes",
    "transaction.expense",
    "transaction.income",
    "category",
    "allCategories",
    "startDate",
    "endDate",
    "resetFilters",
    ...incomeCategories.map((cat) => `categories.${cat.id}` as TranslationKey),
    ...expenseCategories.map((cat) => `categories.${cat.id}` as TranslationKey),
  ] as const);

  const updateFilters = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value === "all") {
      params.delete(key);
    } else {
      params.set(key, value);
    }
    router.push(`/transactions?${params.toString()}`);
  };

  const selectedType = searchParams.get("type") || "all";
  const availableCategories =
    selectedType === "income"
      ? incomeCategories
      : selectedType === "expense"
      ? expenseCategories
      : [...incomeCategories, ...expenseCategories];

  return (
    <div className="flex flex-wrap gap-4">
      <Select
        defaultValue={searchParams.get("type") || "all"}
        onValueChange={(value) => updateFilters("type", value)}
      >
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder={t("transaction.type")} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">{t("allTypes")}</SelectItem>
          <SelectItem value="income">{t("transaction.income")}</SelectItem>
          <SelectItem value="expense">{t("transaction.expense")}</SelectItem>
        </SelectContent>
      </Select>

      <Select
        defaultValue={searchParams.get("category") || "all"}
        onValueChange={(value) => updateFilters("category", value)}
      >
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder={t("category")} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">{t("allCategories")}</SelectItem>
          {availableCategories.map((category) => (
            <SelectItem key={category.id} value={category.id}>
              {t(`categories.${category.id}` as TranslationKey)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={`w-[240px] justify-start text-left font-normal ${
              !searchParams.get("startDate") ? "text-muted-foreground" : ""
            }`}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {searchParams.get("startDate")
              ? format(new Date(searchParams.get("startDate")!), "PPP")
              : t("startDate")}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={
              searchParams.get("startDate")
                ? new Date(searchParams.get("startDate")!)
                : undefined
            }
            onSelect={(date) =>
              updateFilters("startDate", date ? date.toISOString() : "all")
            }
            initialFocus
          />
        </PopoverContent>
      </Popover>

      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={`w-[240px] justify-start text-left font-normal ${
              !searchParams.get("endDate") ? "text-muted-foreground" : ""
            }`}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {searchParams.get("endDate")
              ? format(new Date(searchParams.get("endDate")!), "PPP")
              : t("endDate")}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={
              searchParams.get("endDate")
                ? new Date(searchParams.get("endDate")!)
                : undefined
            }
            onSelect={(date) =>
              updateFilters("endDate", date ? date.toISOString() : "all")
            }
            initialFocus
          />
        </PopoverContent>
      </Popover>

      <Button
        variant="outline"
        onClick={() => {
          const params = new URLSearchParams();
          router.push("/transactions");
        }}
      >
        {t("resetFilters")}
      </Button>
    </div>
  );
}
