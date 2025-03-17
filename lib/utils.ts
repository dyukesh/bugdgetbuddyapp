import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { formatDistanceToNow, format } from "date-fns";
import { db } from "./db";
import * as dateFnsLocales from "date-fns/locale";
import type { Locale } from "date-fns";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export async function getUserCurrency(userId: string): Promise<string> {
  try {
    if (!db) {
      console.error("Database not initialized");
      return "USD";
    }
    const profile = await db.profiles.where({ userId }).first();
    return profile?.currency || "USD";
  } catch (error) {
    console.error("Error getting user currency:", error);
    return "USD";
  }
}

export function formatCurrency(
  amount: number,
  language: string = "en-US",
  currency: string = "USD"
) {
  try {
    return new Intl.NumberFormat(language, {
      style: "currency",
      currency,
    }).format(amount);
  } catch (error) {
    // Fallback to en-US if the language code is invalid
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  }
}

export function formatDate(date: Date | string) {
  const d = typeof date === "string" ? new Date(date) : date;
  return formatDistanceToNow(d, { addSuffix: true });
}

export function formatRelativeDate(date: string | Date): string {
  return formatDistanceToNow(new Date(date), { addSuffix: true });
}

export const categories = [
  { id: "housing", name: "Housing", icon: "Home" },
  { id: "transportation", name: "Transportation", icon: "Car" },
  { id: "food", name: "Food & Dining", icon: "Utensils" },
  { id: "utilities", name: "Utilities", icon: "Zap" },
  { id: "entertainment", name: "Entertainment", icon: "Film" },
  { id: "health", name: "Health & Fitness", icon: "Heart" },
  { id: "shopping", name: "Shopping", icon: "ShoppingBag" },
  { id: "personal", name: "Personal Care", icon: "User" },
  { id: "education", name: "Education", icon: "GraduationCap" },
  { id: "travel", name: "Travel", icon: "Plane" },
  { id: "debt", name: "Debt Payments", icon: "CreditCard" },
  { id: "savings", name: "Savings", icon: "PiggyBank" },
  { id: "income", name: "Income", icon: "DollarSign" },
  { id: "other", name: "Other", icon: "MoreHorizontal" },
];

export function rateLimit(maxRequests: number, timeWindow: number) {
  const requests: number[] = [];

  return async function rateLimiter(): Promise<void> {
    const now = Date.now();

    // Remove expired timestamps
    while (requests.length > 0 && requests[0] <= now - timeWindow) {
      requests.shift();
    }

    if (requests.length >= maxRequests) {
      const oldestRequest = requests[0];
      const waitTime = timeWindow - (now - oldestRequest);
      await new Promise((resolve) => setTimeout(resolve, waitTime));
    }

    requests.push(now);
  };
}

export function getDateLocale(language: string): Locale {
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
}
