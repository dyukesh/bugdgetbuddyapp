"use client";

import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { useLanguage } from "@/lib/language-context";
import {
  translations,
  type TranslationKey,
  defaultLanguage,
} from "@/lib/translations";

function getNestedValue(obj: any, path: string): string {
  const value = path.split(".").reduce((acc, part) => {
    if (!acc) return undefined;
    return acc[part];
  }, obj);

  if (typeof value === "object") {
    console.warn(
      `Translation key "${path}" returned an object instead of a string`
    );
    return path;
  }
  return value || path;
}

export function useTranslations(keys?: readonly TranslationKey[]) {
  const { language } = useLanguage();
  const translationsRef = useRef<Record<TranslationKey, string>>(
    {} as Record<TranslationKey, string>
  );

  // Memoize the translations to prevent unnecessary recalculations
  const translatedTexts = useMemo(() => {
    if (!keys || !Array.isArray(keys)) {
      return {} as Record<TranslationKey, string>;
    }

    // If we have translations for the current language, use them
    if (language in translations) {
      return keys.reduce((acc, key: TranslationKey) => {
        const value = getNestedValue(
          translations[language as keyof typeof translations],
          key
        );
        acc[key] = value || getNestedValue(translations[defaultLanguage], key);
        return acc;
      }, {} as Record<TranslationKey, string>);
    }

    // Fallback to default language if language not supported
    return keys.reduce((acc, key: TranslationKey) => {
      acc[key] = getNestedValue(translations[defaultLanguage], key);
      return acc;
    }, {} as Record<TranslationKey, string>);
  }, [keys, language]);

  // Update the ref whenever translations change
  useEffect(() => {
    translationsRef.current = translatedTexts;
  }, [translatedTexts]);

  const t = useCallback(
    (key: TranslationKey): string => {
      if (key in translationsRef.current) {
        return translationsRef.current[key];
      }
      // Fallback to default language if translation is missing
      return getNestedValue(translations[defaultLanguage], key) || key;
    },
    [] // Empty dependency array since we're using ref
  );

  return { t };
}
