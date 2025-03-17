import { type Currency } from "@/lib/currency-context";
import { getLocaleFromLanguage } from "@/lib/language-context";

export function formatCurrencyWithLocale(
  value: number,
  currency: Currency,
  language: string
): string {
  try {
    const locale = getLocaleFromLanguage(language);
    const currencyFormat = new Intl.NumberFormat(locale, {
      style: "currency",
      currency,
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
}
