"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth";
import { safeDBOperation } from "@/lib/db";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";
import type { Transaction } from "@/lib/db";
import { formatDistanceToNow } from "date-fns";
import { Button } from "@/components/ui/button";
import { PlusCircle, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { useTranslations } from "@/lib/hooks/use-translations";
import { useLanguage } from "@/lib/language-context";
import * as dateFnsLocales from "date-fns/locale";
import type { Locale } from "date-fns";
import { type TranslationKey } from "@/lib/translations";

interface RecentTransactionsProps {
  transactions: Transaction[];
}

export function RecentTransactions({ transactions }: RecentTransactionsProps) {
  const { t } = useTranslations([
    "noTransactions",
    "transaction.add",
    "dashboard.recentTransactions",
    "dashboard.viewAll",
    "transaction.income",
    "transaction.expense",
    "time.ago",
  ] as const satisfies readonly TranslationKey[]);
  const { formatCurrency, language } = useLanguage();

  // Get the appropriate date-fns locale
  const getDateLocale = () => {
    const localeMap: { [key: string]: Locale } = {
      "en-US": dateFnsLocales.enUS,
      "es-ES": dateFnsLocales.es,
      "fr-FR": dateFnsLocales.fr,
      "de-DE": dateFnsLocales.de,
      "it-IT": dateFnsLocales.it,
      "pt-PT": dateFnsLocales.pt,
      "ru-RU": dateFnsLocales.ru,
      "ja-JP": dateFnsLocales.ja,
      "ko-KR": dateFnsLocales.ko,
      "zh-CN": dateFnsLocales.zhCN,
      "ar-SA": dateFnsLocales.arSA,
      "hi-IN": dateFnsLocales.hi,
      "ne-NP": dateFnsLocales.hi, // Using Hindi for Nepali as fallback
    };
    return localeMap[language] || dateFnsLocales.enUS;
  };

  if (!transactions || transactions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center">
        <div className="rounded-full bg-primary/10 p-3 mb-4">
          <PlusCircle className="h-6 w-6 text-primary" />
        </div>
        <p className="text-muted-foreground mb-4">{t("noTransactions")}</p>
        <Button asChild variant="outline">
          <Link href="/transactions/new" className="inline-flex items-center">
            <PlusCircle className="mr-2 h-4 w-4" />
            {t("transaction.add")}
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">
          {t("dashboard.recentTransactions")}
        </h3>
        <Button asChild variant="ghost" size="sm">
          <Link href="/transactions" className="inline-flex items-center gap-2">
            {t("dashboard.viewAll")}
            <ArrowUpRight className="h-4 w-4" />
          </Link>
        </Button>
      </div>

      <div className="space-y-4">
        {transactions.map((transaction) => (
          <Card
            key={transaction.id}
            className="p-4 border-none bg-primary/5 hover:bg-primary/10 transition-colors"
          >
            <CardContent className="p-0 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div
                  className={`rounded-full p-2 ${
                    transaction.type === "income"
                      ? "bg-green-500/10 text-green-500"
                      : "bg-red-500/10 text-red-500"
                  }`}
                >
                  {transaction.type === "income" ? (
                    <ArrowDownRight className="h-4 w-4" />
                  ) : (
                    <ArrowUpRight className="h-4 w-4" />
                  )}
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium leading-none">
                    {t(
                      transaction.type === "income"
                        ? "transaction.income"
                        : "transaction.expense"
                    )}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(transaction.date), {
                      addSuffix: true,
                      locale: getDateLocale(),
                    })}
                  </p>
                </div>
              </div>
              <div className="text-sm font-medium">
                {formatCurrency(transaction.amount)}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
