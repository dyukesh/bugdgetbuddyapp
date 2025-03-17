import { rateLimit } from "./utils";

export type TranslationResponse = {
  translatedText: string;
  detectedSourceLanguage?: string;
};

// Rate limit to 10 requests per second
const translationRateLimiter = rateLimit(10, 1000);

function stripHtml(text: string): string {
  return text.replace(/<[^>]*>/g, "");
}

function restoreHtml(originalText: string, translatedText: string): string {
  const htmlTags: string[] = [];
  const textWithoutHtml = originalText.replace(/<[^>]*>/g, (match) => {
    htmlTags.push(match);
    return "{{TAG}}";
  });

  let result = translatedText;
  htmlTags.forEach((tag) => {
    result = result.replace("{{TAG}}", tag);
  });
  return result;
}

export async function translateText(
  text: string,
  targetLanguage: string,
  sourceLanguage?: string
): Promise<TranslationResponse> {
  try {
    // Don't translate empty strings or strings with only HTML
    const strippedText = stripHtml(text);
    if (!strippedText.trim()) {
      return { translatedText: text };
    }

    // Apply rate limiting
    await translationRateLimiter();

    const response = await fetch("/api/translate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        text: strippedText,
        targetLanguage,
        sourceLanguage,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Translation failed");
    }

    const { translatedText, detectedSourceLanguage } = await response.json();

    // Restore HTML tags in the translated text
    const finalText = restoreHtml(text, translatedText);

    return {
      translatedText: finalText,
      detectedSourceLanguage,
    };
  } catch (error) {
    console.error("Translation error:", error);
    // Return original text as fallback
    return { translatedText: text };
  }
}
