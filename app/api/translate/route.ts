import { NextResponse } from "next/server";

// Simple rate limiting with a sliding window
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 100;
const requestCounts = new Map<string, { count: number; timestamp: number }>();

function isRateLimited(clientIp: string): boolean {
  const now = Date.now();
  const clientRequests = requestCounts.get(clientIp);

  if (!clientRequests || now - clientRequests.timestamp > RATE_LIMIT_WINDOW) {
    requestCounts.set(clientIp, { count: 1, timestamp: now });
    return false;
  }

  if (clientRequests.count >= MAX_REQUESTS_PER_WINDOW) {
    return true;
  }

  clientRequests.count++;
  return false;
}

// Clean up old rate limit entries
setInterval(() => {
  const now = Date.now();
  for (const [ip, data] of requestCounts.entries()) {
    if (now - data.timestamp > RATE_LIMIT_WINDOW) {
      requestCounts.delete(ip);
    }
  }
}, RATE_LIMIT_WINDOW);

export async function POST(request: Request) {
  try {
    // Get client IP for rate limiting
    const clientIp = request.headers.get("x-forwarded-for") || "unknown";

    if (isRateLimited(clientIp)) {
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        { status: 429 }
      );
    }

    const { text, targetLanguage } = await request.json();

    if (!text || !targetLanguage) {
      return NextResponse.json(
        { error: "Missing required parameters" },
        { status: 400 }
      );
    }

    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_CLOUD_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "Translation service not configured" },
        { status: 500 }
      );
    }

    // Handle both single text and array of texts
    const texts = Array.isArray(text) ? text : [text];

    // Only filter empty strings
    const textsToTranslate = texts.filter(
      (t) => t !== undefined && t !== null && t.trim() !== ""
    );

    if (textsToTranslate.length === 0) {
      return NextResponse.json({
        translatedText: Array.isArray(text) ? [] : "",
      });
    }

    // Make request to Google Translate API
    const response = await fetch(
      `https://translation.googleapis.com/language/translate/v2?key=${apiKey}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          q: textsToTranslate,
          target: targetLanguage,
          format: "text",
          // Preserve formatting including numbers and special characters
          model: "nmt",
        }),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      console.error("Translation API error:", error);

      // Handle specific error cases
      if (response.status === 403) {
        return NextResponse.json(
          { error: "Invalid API key" },
          { status: response.status }
        );
      }

      return NextResponse.json(
        { error: "Translation service error" },
        { status: response.status }
      );
    }

    const data = await response.json();
    const translations = data.data.translations.map(
      (t: { translatedText: string }) => t.translatedText
    );

    // If original request was not an array, return single translation
    const translatedText = Array.isArray(text)
      ? translations.join(" ||| ")
      : translations[0];

    return NextResponse.json({ translatedText });
  } catch (error) {
    console.error("Translation error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
