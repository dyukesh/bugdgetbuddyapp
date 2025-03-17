"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "@/lib/auth";
import { safeDBOperation } from "@/lib/db";

export type Currency = "USD" | "EUR" | "GBP" | "NPR" | "CNY" | "JPY" | "KRW";

export const currencies: { value: Currency; label: string; symbol: string }[] =
  [
    { value: "USD", label: "US Dollar", symbol: "$" },
    { value: "EUR", label: "Euro", symbol: "€" },
    { value: "GBP", label: "British Pound", symbol: "£" },
    { value: "NPR", label: "Nepalese Rupee", symbol: "रू" },
    { value: "CNY", label: "Chinese Yuan", symbol: "¥" },
    { value: "JPY", label: "Japanese Yen", symbol: "¥" },
    { value: "KRW", label: "Korean Won", symbol: "₩" },
  ];

type CurrencyContextType = {
  currency: Currency;
  setCurrency: (currency: Currency) => void;
  getCurrencySymbol: (currencyCode: Currency) => string;
  formatAmount: (amount: number) => string;
};

const CurrencyContext = createContext<CurrencyContextType | undefined>(
  undefined
);

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [currency, setCurrency] = useState<Currency>("USD");

  useEffect(() => {
    async function loadUserCurrency() {
      if (!user) return;

      try {
        const result = await safeDBOperation(async (db) => {
          const profile = await db.profiles.where({ userId: user.id }).first();
          return profile?.currency;
        });

        if (result.success && result.data) {
          const userCurrency = result.data as Currency;
          if (currencies.some((c) => c.value === userCurrency)) {
            setCurrency(userCurrency);
            localStorage.setItem("budget-buddy-currency", userCurrency);
          }
        } else {
          // If no profile currency, try to load from localStorage
          const savedCurrency = localStorage.getItem(
            "budget-buddy-currency"
          ) as Currency;
          if (
            savedCurrency &&
            currencies.some((c) => c.value === savedCurrency)
          ) {
            setCurrency(savedCurrency);
          }
        }
      } catch (error) {
        console.error("Error loading user currency:", error);
      }
    }

    loadUserCurrency();
  }, [user]);

  const handleCurrencyChange = async (newCurrency: Currency) => {
    if (!currencies.some((c) => c.value === newCurrency)) return;

    setCurrency(newCurrency);
    localStorage.setItem("budget-buddy-currency", newCurrency);

    if (user) {
      try {
        await safeDBOperation(async (db) => {
          const profile = await db.profiles.where({ userId: user.id }).first();
          if (profile) {
            await db.profiles.update(profile.id!, {
              currency: newCurrency,
              updatedAt: new Date(),
            });
          }
        });
      } catch (error) {
        console.error("Error updating user currency:", error);
      }
    }
  };

  const getCurrencySymbol = (currencyCode: Currency): string => {
    return (
      currencies.find((c) => c.value === currencyCode)?.symbol || currencyCode
    );
  };

  const formatAmount = (amount: number): string => {
    try {
      return new Intl.NumberFormat(undefined, {
        style: "currency",
        currency: currency,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(amount);
    } catch (error) {
      console.error("Error formatting currency:", error);
      return `${getCurrencySymbol(currency)}${amount.toFixed(2)}`;
    }
  };

  return (
    <CurrencyContext.Provider
      value={{
        currency,
        setCurrency: handleCurrencyChange,
        getCurrencySymbol,
        formatAmount,
      }}
    >
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const context = useContext(CurrencyContext);
  if (context === undefined) {
    throw new Error("useCurrency must be used within a CurrencyProvider");
  }
  return context;
}
