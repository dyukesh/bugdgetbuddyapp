const CACHE_KEY = "translations_cache";

export function loadCache(): Record<string, string> {
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    return cached ? JSON.parse(cached) : {};
  } catch (error) {
    console.error("Error loading translations cache:", error);
    return {};
  }
}

export function saveCache(translations: Record<string, string>): void {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(translations));
  } catch (error) {
    console.error("Error saving translations cache:", error);
  }
}
