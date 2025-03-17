"use client";

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useRef,
  useMemo,
} from "react";
import { safeDBOperation } from "@/lib/db";
import type { BudgetBuddyDB } from "@/lib/db";
import { useCurrency } from "@/lib/currency-context";

interface LanguageContextType {
  language: string;
  setLanguage: (lang: string) => void;
  translate: (text: string) => Promise<string>;
  translateBatch: (texts: string[]) => Promise<string[]>;
  formatNumber: (value: number) => string;
  formatCurrency: (value: number) => string;
}

const defaultContext: LanguageContextType = {
  language: "en",
  setLanguage: () => {},
  translate: async (text) => text,
  translateBatch: async (texts) => texts,
  formatNumber: (value) => value.toString(),
  formatCurrency: (value) => `$${value.toFixed(2)}`,
};

const LanguageContext = createContext<LanguageContextType>(defaultContext);

// Custom hook for using language context
function useLanguageContext() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error(
      "useLanguageContext must be used within a LanguageProvider"
    );
  }
  return context;
}

// Export the hook as useLanguage
export const useLanguage = useLanguageContext;

interface TranslationCache {
  [key: string]: {
    translation: string;
    timestamp: number;
  };
}

const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours
const CACHE_KEY = "translation_cache";
const DEBOUNCE_DELAY = 500; // 500ms debounce delay

// Memory cache for server-side and initial client-side use
let memoryCache: TranslationCache = {};

function loadCache(): TranslationCache {
  if (typeof window === "undefined") {
    return memoryCache;
  }

  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (cached) {
      const parsedCache = JSON.parse(cached) as TranslationCache;
      // Clean expired entries
      const now = Date.now();
      Object.keys(parsedCache).forEach((key) => {
        if (now - parsedCache[key].timestamp > CACHE_DURATION) {
          delete parsedCache[key];
        }
      });
      memoryCache = parsedCache;
      return parsedCache;
    }
  } catch (error) {
    console.error("Error loading translation cache:", error);
  }
  return {};
}

function saveCache(cache: TranslationCache) {
  if (typeof window === "undefined") {
    memoryCache = cache;
    return;
  }

  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
    memoryCache = cache;
  } catch (error) {
    console.error("Error saving translation cache:", error);
  }
}

// Debounce function for async functions
function debounce<T extends any[]>(
  func: (...args: T) => Promise<any>,
  wait: number
) {
  let timeout: NodeJS.Timeout | null = null;
  let pendingPromise: Promise<any> | null = null;

  return async (...args: T) => {
    if (pendingPromise) return pendingPromise;

    return new Promise((resolve, reject) => {
      if (timeout) clearTimeout(timeout);

      timeout = setTimeout(() => {
        pendingPromise = func(...args)
          .then((result) => {
            pendingPromise = null;
            resolve(result);
            return result;
          })
          .catch((error) => {
            pendingPromise = null;
            reject(error);
            throw error;
          });
      }, wait);
    });
  };
}

// Add language definitions at the top after imports
export type Language = {
  code: string;
  name: string;
  nativeName: string;
};

export const languages: Language[] = [
  { code: "en", name: "English", nativeName: "English" },
  { code: "es", name: "Spanish", nativeName: "Español" },
  { code: "fr", name: "French", nativeName: "Français" },
  { code: "de", name: "German", nativeName: "Deutsch" },
  { code: "it", name: "Italian", nativeName: "Italiano" },
  { code: "pt", name: "Portuguese", nativeName: "Português" },
  { code: "ru", name: "Russian", nativeName: "Русский" },
  { code: "zh", name: "Chinese", nativeName: "中文" },
  { code: "ja", name: "Japanese", nativeName: "日本語" },
  { code: "ko", name: "Korean", nativeName: "한국어" },
  { code: "ar", name: "Arabic", nativeName: "العربية" },
  { code: "hi", name: "Hindi", nativeName: "हिन्दी" },
  { code: "bn", name: "Bengali", nativeName: "বাংলা" },
  { code: "ne", name: "Nepali", nativeName: "नेपाली" },
];

// Add these utility functions at the top after imports
function shouldTranslate(text: string): boolean {
  // Only skip empty strings
  return text !== undefined && text !== null && text.trim() !== "";
}

function cleanupText(text: string): string {
  // Only trim extra whitespace while preserving all content
  return text.trim();
}

export function getLocaleFromLanguage(language: string): string {
  const localeMap: { [key: string]: string } = {
    en: "en-US",
    es: "es-ES",
    fr: "fr-FR",
    de: "de-DE",
    it: "it-IT",
    pt: "pt-PT",
    ru: "ru-RU",
    zh: "zh-CN",
    ja: "ja-JP",
    ko: "ko-KR",
    ar: "ar-SA",
    hi: "hi-IN",
    bn: "bn-BD",
    ne: "ne-NP",
  };
  return localeMap[language] || "en-US";
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("preferred_language") || "en";
    }
    return "en";
  });

  const { currency } = useCurrency();
  const cacheRef = useRef<TranslationCache>(memoryCache);
  const isMounted = useRef(false);
  const pendingTranslations = useRef<Map<string, Promise<string>>>(new Map());

  // Load cache and user's language preference on mount (client-side only)
  useEffect(() => {
    async function loadUserPreferences() {
      if (!isMounted.current) {
        const loadedCache = loadCache();
        cacheRef.current = loadedCache;
        isMounted.current = true;

        // Load user's language preference from profile
        try {
          const result = await safeDBOperation(async (db) => {
            const profile = await db.profiles
              .orderBy("updatedAt")
              .reverse()
              .first();
            return profile?.language;
          });

          if (result.success && result.data) {
            setLanguageState(result.data);
            localStorage.setItem("preferred_language", result.data);
          }
        } catch (error) {
          console.error("Error loading language preference:", error);
        }
      }
    }

    loadUserPreferences();
  }, []);

  const setLanguage = useCallback(
    (lang: string) => {
      if (lang === language) return; // Skip if same language
      setLanguageState(lang);
      if (typeof window !== "undefined") {
        localStorage.setItem("preferred_language", lang);
      }
    },
    [language]
  );

  const updateCache = useCallback((newCache: TranslationCache) => {
    cacheRef.current = newCache;
    saveCache(newCache);
  }, []);

  const getCacheKey = useCallback(
    (text: string, targetLang: string) => `${text}:${targetLang}`,
    []
  );

  const translate = useCallback(
    async (text: string): Promise<string> => {
      if (language === "en" || !shouldTranslate(text)) return text;

      const cleanText = cleanupText(text);
      const cacheKey = getCacheKey(cleanText, language);
      const cached = cacheRef.current[cacheKey];

      if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
        return cached.translation;
      }

      // Check if there's already a pending translation for this text
      const pending = pendingTranslations.current.get(cacheKey);
      if (pending) return pending;

      try {
        const translationPromise = (async () => {
          try {
            const response = await fetch("/api/translate", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                text: cleanText,
                targetLanguage: language,
              }),
            });

            if (!response.ok) throw new Error("Translation failed");

            const { translatedText } = await response.json();

            // Update cache
            const newCache = {
              ...cacheRef.current,
              [cacheKey]: {
                translation: translatedText,
                timestamp: Date.now(),
              },
            };
            updateCache(newCache);

            return translatedText;
          } finally {
            pendingTranslations.current.delete(cacheKey);
          }
        })();

        pendingTranslations.current.set(cacheKey, translationPromise);
        return await translationPromise;
      } catch (error) {
        console.error("Translation error:", error);
        return text;
      }
    },
    [language, getCacheKey, updateCache]
  );

  const debouncedTranslateBatch = useCallback(
    debounce(async (texts: string[]): Promise<string[]> => {
      if (language === "en") return texts;

      // Filter out texts that don't need translation
      const textsToTranslate = texts.map(cleanupText).filter(shouldTranslate);
      if (textsToTranslate.length === 0) return texts;

      const uncachedTexts: string[] = [];
      const translations = new Array(texts.length);
      const uncachedIndices: number[] = [];

      // Check cache and pending translations first
      for (let i = 0; i < texts.length; i++) {
        const text = texts[i];
        if (!shouldTranslate(text)) {
          translations[i] = text;
          continue;
        }

        const cleanText = cleanupText(text);
        const cacheKey = getCacheKey(cleanText, language);
        const cached = cacheRef.current[cacheKey];

        if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
          translations[i] = cached.translation;
        } else {
          const pending = pendingTranslations.current.get(cacheKey);
          if (pending) {
            translations[i] = await pending;
          } else {
            uncachedTexts.push(cleanText);
            uncachedIndices.push(i);
          }
        }
      }

      // If there are uncached texts, translate them in one batch
      if (uncachedTexts.length > 0) {
        try {
          const batchPromise = (async () => {
            const response = await fetch("/api/translate", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                text: uncachedTexts,
                targetLanguage: language,
              }),
            });

            if (!response.ok) throw new Error("Translation failed");

            const { translatedText } = await response.json();
            const translatedParts = translatedText.split(" ||| ");

            // Update cache and translations array
            const newCache = { ...cacheRef.current };
            translatedParts.forEach((translation: string, i: number) => {
              const originalText = uncachedTexts[i];
              const cacheKey = getCacheKey(originalText, language);
              newCache[cacheKey] = {
                translation,
                timestamp: Date.now(),
              };
              translations[uncachedIndices[i]] = translation;
            });
            updateCache(newCache);

            return translatedParts;
          })();

          // Store the promise for each text being translated
          uncachedTexts.forEach((text, i) => {
            const cacheKey = getCacheKey(text, language);
            pendingTranslations.current.set(
              cacheKey,
              batchPromise.then((parts) => parts[i])
            );
          });

          await batchPromise;
        } catch (error) {
          console.error("Batch translation error:", error);
          uncachedIndices.forEach((index) => {
            translations[index] = texts[index];
          });
        }
      }

      return translations;
    }, DEBOUNCE_DELAY),
    [language, getCacheKey, updateCache]
  );

  const formatCurrency = useCallback(
    (value: number) => {
      try {
        const locale = getLocaleFromLanguage(language);
        const currencyFormat = new Intl.NumberFormat(locale, {
          style: "currency",
          currency: currency,
          currencyDisplay: "symbol",
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
          useGrouping: true,
          numberingSystem: locale.startsWith("ar")
            ? "arab"
            : locale.startsWith("fa")
            ? "arab"
            : locale.startsWith("bn")
            ? "beng"
            : locale.startsWith("hi") || locale.startsWith("ne")
            ? "deva"
            : undefined,
        }).format(value);

        if (["ar", "fa"].includes(language)) {
          return currencyFormat.replace(/\s/g, "");
        }
        return currencyFormat;
      } catch (error) {
        console.error("Currency formatting error:", error);
        return `${currency}${value.toFixed(2)}`;
      }
    },
    [language, currency]
  );

  const formatNumber = useCallback(
    (value: number) => {
      try {
        const locale = getLocaleFromLanguage(language);
        return new Intl.NumberFormat(locale, {
          useGrouping: true,
          // Use appropriate numbering system for the locale
          numberingSystem: locale.startsWith("ar")
            ? "arab"
            : locale.startsWith("fa")
            ? "arab"
            : locale.startsWith("bn")
            ? "beng"
            : locale.startsWith("hi") || locale.startsWith("ne")
            ? "deva"
            : undefined,
        }).format(value);
      } catch (error) {
        console.error("Number formatting error:", error);
        return value.toString();
      }
    },
    [language]
  );

  const contextValue = useMemo(
    () => ({
      language,
      setLanguage,
      translate,
      translateBatch: debouncedTranslateBatch,
      formatNumber,
      formatCurrency,
    }),
    [
      language,
      setLanguage,
      translate,
      debouncedTranslateBatch,
      formatNumber,
      formatCurrency,
    ]
  );

  return (
    <LanguageContext.Provider value={contextValue}>
      {children}
    </LanguageContext.Provider>
  );
}
