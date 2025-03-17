"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  BarChart3,
  CreditCard,
  DollarSign,
  LayoutDashboard,
  PiggyBank,
  Settings,
  Info,
  Receipt,
} from "lucide-react";
import { useTranslations } from "@/lib/hooks/use-translations";
import { useLanguage } from "@/lib/language-context";
import { type TranslationKey } from "@/lib/translations";

const navigationItems = [
  {
    href: "/dashboard",
    label: "nav.dashboard" as TranslationKey,
    icon: LayoutDashboard,
  },
  {
    href: "/transactions",
    label: "nav.transactions" as TranslationKey,
    icon: Receipt,
  },
  {
    href: "/budgets",
    label: "nav.budgets" as TranslationKey,
    icon: PiggyBank,
  },
  {
    href: "/reports",
    label: "nav.reports" as TranslationKey,
    icon: BarChart3,
  },
  {
    href: "/settings",
    label: "nav.settings" as TranslationKey,
    icon: Settings,
  },
  {
    href: "/about",
    label: "nav.about" as TranslationKey,
    icon: Info,
  },
] as const;

export function Sidebar() {
  const pathname = usePathname();
  const { language } = useLanguage();
  const { t } = useTranslations([
    "appTitle",
    ...navigationItems.map((item) => item.label),
  ] as const);

  return (
    <div className="flex h-full w-full flex-col gap-4 p-4">
      <div className="flex items-center gap-2 px-2">
        <DollarSign className="h-6 w-6" />
        <span className="font-bold">{t("appTitle")}</span>
      </div>
      <nav className="grid gap-1">
        {navigationItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium hover:bg-accent",
                isActive && "bg-accent"
              )}
            >
              <Icon className="h-4 w-4" />
              {t(item.label)}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
