"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useTranslations } from "@/lib/hooks/use-translations";

export default function NotFound() {
  const { t } = useTranslations([
    "notFound",
    "pageNotFound",
    "pageNotFoundDesc",
    "goHome",
  ] as const);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-6 py-12">
      <h1 className="text-6xl font-bold">{t("notFound")}</h1>
      <h2 className="mt-4 text-2xl font-semibold">{t("pageNotFound")}</h2>
      <p className="mt-2 text-muted-foreground text-center">
        {t("pageNotFoundDesc")}
      </p>
      <Button asChild className="mt-8">
        <Link href="/">{t("goHome")}</Link>
      </Button>
    </div>
  );
}
