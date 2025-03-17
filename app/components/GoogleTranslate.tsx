"use client";

import { useEffect } from "react";
import Script from "next/script";

declare global {
  interface Window {
    googleTranslateElementInit: () => void;
    google: any;
  }
}

export default function GoogleTranslate() {
  useEffect(() => {
    // Initialize the translate element
    window.googleTranslateElementInit = () => {
      new window.google.translate.TranslateElement(
        {
          pageLanguage: "en",
          includedLanguages: "es,fr,zh,ko,ne", // languages from your current system
          autoDisplay: false,
          layout: window.google.translate.TranslateElement.InlineLayout.SIMPLE,
        },
        "google_translate_element"
      );
    };
  }, []);

  return (
    <>
      <Script
        src="//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit"
        strategy="afterInteractive"
      />
      <div
        id="google_translate_element"
        className="google-translate-container"
      />
      <style jsx global>{`
        /* Container styling */
        .google-translate-container {
          padding: 0.75rem;
          margin: 0.5rem 0;
          border-radius: 0.5rem;
          background: var(--background);
          border: 1px solid var(--border);
        }

        /* Dropdown styling */
        .goog-te-combo {
          width: 100%;
          padding: 0.5rem;
          border-radius: 0.375rem;
          border: 1px solid var(--border);
          background-color: var(--background);
          color: var(--foreground);
          font-size: 0.875rem;
          line-height: 1.25rem;
          outline: none;
          transition: all 0.2s;
        }

        .goog-te-combo:hover {
          border-color: var(--primary);
        }

        .goog-te-combo:focus {
          border-color: var(--primary);
          ring: 2px solid var(--primary);
        }

        /* Hide Google branding */
        .goog-logo-link {
          display: none !important;
        }

        .goog-te-gadget {
          color: transparent !important;
        }

        .goog-te-gadget .goog-te-combo {
          margin: 0 !important;
        }

        /* Dark mode support */
        @media (prefers-color-scheme: dark) {
          .goog-te-combo {
            background-color: var(--background);
            color: var(--foreground);
          }
        }

        /* Mobile responsiveness */
        @media (max-width: 640px) {
          .google-translate-container {
            padding: 0.5rem;
          }

          .goog-te-combo {
            font-size: 1rem;
            padding: 0.75rem;
          }
        }
      `}</style>
    </>
  );
}
