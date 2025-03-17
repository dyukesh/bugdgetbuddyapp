export const languageCodeMap = {
  en: "en",
  es: "es",
  fr: "fr",
  zh: "zh-CN",
  ko: "ko",
  ne: "ne",
} as const;

export type Language = keyof typeof languageCodeMap;

declare global {
  interface Window {
    google: {
      translate: {
        TranslateElement: {
          new (
            options: {
              pageLanguage: string;
              includedLanguages: string;
              layout: number;
              autoDisplay: boolean;
            },
            element: string
          ): void;
          InlineLayout: {
            HORIZONTAL: number;
            SIMPLE: number;
          };
        };
      };
    };
    googleTranslateElementInit: () => void;
  }
}

export function translateTo(lang: string) {
  const element = document.getElementById("google_translate_element");
  if (element && window.google?.translate) {
    new window.google.translate.TranslateElement(
      {
        pageLanguage: "en",
        includedLanguages: Object.values(languageCodeMap).join(","),
        layout:
          window.innerWidth <= 768
            ? window.google.translate.TranslateElement.InlineLayout.SIMPLE
            : window.google.translate.TranslateElement.InlineLayout.HORIZONTAL,
        autoDisplay: false,
      },
      "google_translate_element"
    );
  }
}
