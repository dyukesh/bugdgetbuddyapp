export const translateTo = (lang: string) => {
  // Get the Google Translate iframe
  const iframe = document.querySelector(
    ".goog-te-menu-frame"
  ) as HTMLIFrameElement;
  if (!iframe) return;

  // Get the document inside the iframe
  const doc = iframe.contentDocument;
  if (!doc) return;

  // Find all language links
  const links = doc.getElementsByTagName("a");

  // Click the link for the desired language
  for (let i = 0; i < links.length; i++) {
    const link = links[i];
    const option = link.getAttribute("class");
    if (option && option.indexOf(lang) !== -1) {
      link.click();
      break;
    }
  }
};

// Map your current language codes to Google Translate codes
export const languageCodeMap: Record<string, string> = {
  en: "en",
  es: "es",
  fr: "fr",
  zh: "zh-CN",
  ko: "ko",
  ne: "ne",
};
