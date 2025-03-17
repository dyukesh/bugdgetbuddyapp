"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth";
import { useCurrency, type Currency, currencies } from "@/lib/currency-context";
import { useTranslations } from "@/lib/hooks/use-translations";
import { useLanguage } from "@/lib/language-context";
import { useTheme } from "next-themes";
import { safeDBOperation } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const languages = [
  { code: "en", name: "English" },
  { code: "es", name: "Spanish" },
  { code: "fr", name: "French" },
  { code: "de", name: "German" },
  { code: "it", name: "Italian" },
  { code: "pt", name: "Portuguese" },
  { code: "ru", name: "Russian" },
  { code: "ja", name: "Japanese" },
  { code: "ko", name: "Korean" },
  { code: "zh", name: "Chinese" },
  { code: "ar", name: "Arabic" },
  { code: "hi", name: "Hindi" },
  { code: "ne", name: "Nepali" },
];

export function SettingsForm() {
  const router = useRouter();
  const { user, updateProfile } = useAuth();
  const { currency, setCurrency } = useCurrency();
  const { language, setLanguage } = useLanguage();
  const { theme, setTheme } = useTheme();
  const { t } = useTranslations([
    "settings.title",
    "settings.currency",
    "settings.currencyDescription",
    "settings.language",
    "settings.languageDescription",
    "settings.theme",
    "settings.themeDescription",
    "settings.success",
    "settings.error",
    "settings.name",
    "settings.nameDescription",
    "settings.save",
    "settings.saving",
  ] as const);

  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("");

  useEffect(() => {
    if (user?.fullName) {
      setName(user.fullName);
    }
  }, [user?.fullName]);

  const handleNameSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await updateProfile({ fullName: name });
      toast.success(t("settings.success"));
    } catch (error) {
      console.error("Error updating name:", error);
      toast.error(t("settings.error"));
    } finally {
      setLoading(false);
    }
  };

  const handleCurrencyChange = async (newCurrency: Currency) => {
    setLoading(true);

    try {
      if (!user) {
        throw new Error("You must be logged in to update settings");
      }

      const result = await safeDBOperation(async (db) => {
        const profile = await db.profiles
          .where("userId")
          .equals(user.id)
          .toArray();
        if (profile[0]) {
          await db.profiles.update(profile[0].id!, {
            currency: newCurrency,
            updatedAt: new Date(),
          });
        } else {
          await db.profiles.add({
            userId: user.id,
            currency: newCurrency,
            language,
            fullName: name,
            updatedAt: new Date(),
          });
        }
      });

      if (result.success) {
        setCurrency(newCurrency);
        toast.success(t("settings.success"));
        router.refresh();
      } else {
        toast.error(t("settings.error"));
      }
    } catch (error) {
      console.error("Error updating settings:", error);
      toast.error(t("settings.error"));
    } finally {
      setLoading(false);
    }
  };

  const handleLanguageChange = async (newLanguage: string) => {
    setLoading(true);

    try {
      if (!user) {
        throw new Error("You must be logged in to update settings");
      }

      const result = await safeDBOperation(async (db) => {
        const profile = await db.profiles
          .where("userId")
          .equals(user.id)
          .toArray();
        if (profile[0]) {
          await db.profiles.update(profile[0].id!, {
            language: newLanguage,
            updatedAt: new Date(),
          });
        } else {
          await db.profiles.add({
            userId: user.id,
            currency,
            language: newLanguage,
            fullName: name,
            updatedAt: new Date(),
          });
        }
      });

      if (result.success) {
        setLanguage(newLanguage);
        toast.success(t("settings.success"));
        router.refresh();
      } else {
        toast.error(t("settings.error"));
      }
    } catch (error) {
      console.error("Error updating settings:", error);
      toast.error(t("settings.error"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("settings.title")}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <form onSubmit={handleNameSubmit} className="space-y-2">
          <Label htmlFor="name">{t("settings.name")}</Label>
          <div className="flex gap-2">
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your name"
              disabled={loading}
            />
            <Button type="submit" disabled={loading}>
              {loading ? t("settings.saving") : t("settings.save")}
            </Button>
          </div>
          <p className="text-sm text-muted-foreground">
            {t("settings.nameDescription")}
          </p>
        </form>

        <div className="space-y-2">
          <Label htmlFor="currency">{t("settings.currency")}</Label>
          <Select
            value={currency}
            onValueChange={handleCurrencyChange}
            disabled={loading}
          >
            <SelectTrigger id="currency">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {currencies.map((c) => (
                <SelectItem key={c.value} value={c.value}>
                  {c.label} ({c.value})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-sm text-muted-foreground">
            {t("settings.currencyDescription")}
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="language">{t("settings.language")}</Label>
          <Select
            value={language}
            onValueChange={handleLanguageChange}
            disabled={loading}
          >
            <SelectTrigger id="language">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {languages.map((lang) => (
                <SelectItem key={lang.code} value={lang.code}>
                  {lang.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-sm text-muted-foreground">
            {t("settings.languageDescription")}
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="theme">{t("settings.theme")}</Label>
          <Select value={theme} onValueChange={setTheme} disabled={loading}>
            <SelectTrigger id="theme">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="light">Light</SelectItem>
              <SelectItem value="dark">Dark</SelectItem>
              <SelectItem value="system">System</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-sm text-muted-foreground">
            {t("settings.themeDescription")}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
