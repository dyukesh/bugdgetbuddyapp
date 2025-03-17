"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useAuth } from "@/lib/auth";
import { db } from "@/lib/db";
import { resetDatabase } from "@/lib/reset-db";
import { useToast } from "@/hooks/use-toast";
import { useTranslations } from "@/lib/hooks/use-translations";
import { type TranslationKey } from "@/lib/translations";

export default function DebugPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [dbStats, setDbStats] = useState<any>(null);
  const { t } = useTranslations([
    "debug.title",
    "debug.description",
    "debug.profiles",
    "debug.bankAccounts",
    "debug.transactions",
    "debug.stats",
    "debug.statsDesc",
    "debug.recordCounts",
    "debug.users",
    "nav.budgets",
    "debug.currentUser",
    "debug.found",
    "debug.notFound",
    "debug.notSignedIn",
    "debug.resetDb",
    "debug.resetConfirm",
    "debug.dbReset",
    "debug.dbResetSuccess",
    "debug.dbResetFailed",
    "loadingStates.loading",
  ] as const satisfies readonly TranslationKey[]);

  async function loadStats() {
    try {
      if (!db) {
        console.error("Database not initialized");
        return;
      }

      const userCount = await db.users.count();
      const profileCount = await db.profiles.count();
      const accountCount = await db.bankAccounts.count();
      const transactionCount = await db.transactions.count();
      const budgetCount = await db.budgets.count();

      let currentUser = null;
      if (user && db) {
        const dbUser = await db.users.get(user.id);
        const profile = await db.profiles.where({ userId: user.id }).first();
        currentUser = {
          user: dbUser,
          profile,
        };
      }

      setDbStats({
        counts: {
          users: userCount,
          profiles: profileCount,
          accounts: accountCount,
          transactions: transactionCount,
          budgets: budgetCount,
        },
        currentUser,
      });
    } catch (error) {
      console.error("Error loading debug stats:", error);
    }
  }

  useEffect(() => {
    loadStats();
  }, [user]);

  const handleResetDb = async () => {
    if (confirm(t("debug.resetConfirm"))) {
      try {
        const success = await resetDatabase();
        if (success) {
          toast({
            title: t("debug.dbReset"),
            description: t("debug.dbResetSuccess"),
          });
          window.location.reload();
        }
      } catch (error) {
        toast({
          title: t("debug.dbReset"),
          description: t("debug.dbResetFailed"),
          variant: "destructive",
        });
      }
    }
  };

  if (!dbStats) {
    return (
      <div className="flex items-center justify-center h-64">
        {t("loadingStates.loading")}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/50 bg-clip-text text-transparent">
          {t("debug.title")}
        </h1>
        <p className="text-muted-foreground mb-8">{t("debug.description")}</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t("debug.stats")}</CardTitle>
          <CardDescription>{t("debug.statsDesc")}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">{t("debug.stats")}</h2>
            <p className="text-muted-foreground">{t("debug.statsDesc")}</p>

            <div className="space-y-4">
              <div>
                <h3 className="font-medium mb-2">{t("debug.recordCounts")}</h3>
                <div className="bg-primary/5 rounded-lg p-4">
                  <ul className="space-y-2">
                    <li>
                      {t("debug.users")}: {dbStats.counts.users}
                    </li>
                    <li>
                      {t("debug.profiles")}: {dbStats.counts.profiles}
                    </li>
                    <li>
                      {t("debug.bankAccounts")}: {dbStats.counts.accounts}
                    </li>
                    <li>
                      {t("debug.transactions")}: {dbStats.counts.transactions}
                    </li>
                    <li>
                      {t("nav.budgets")}: {dbStats.counts.budgets}
                    </li>
                  </ul>
                </div>
              </div>

              <div>
                <h3 className="font-medium">{t("debug.currentUser")}</h3>
                {dbStats.currentUser ? (
                  <div className="mt-2">
                    <p>
                      User:{" "}
                      {dbStats.currentUser.user
                        ? t("debug.found")
                        : t("debug.notFound")}
                    </p>
                    <p>
                      Profile:{" "}
                      {dbStats.currentUser.profile
                        ? t("debug.found")
                        : t("debug.notFound")}
                    </p>
                  </div>
                ) : (
                  <p className="text-muted-foreground">
                    {t("debug.notSignedIn")}
                  </p>
                )}
              </div>
            </div>
          </div>

          <Button
            variant="destructive"
            onClick={handleResetDb}
            className="mt-6"
          >
            {t("debug.resetDb")}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
