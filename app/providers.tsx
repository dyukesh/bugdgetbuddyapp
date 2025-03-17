"use client";

import { ReactNode } from "react";
import { AuthProvider } from "@/lib/auth";
import { CurrencyProvider } from "@/lib/currency-context";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "sonner";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
      storageKey="budget-buddy-theme"
    >
      <AuthProvider>
        <CurrencyProvider>
          {children}
          <Toaster />
        </CurrencyProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
