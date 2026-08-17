import { translations, Language } from "./translations";

const BENGALI_DIGITS: Record<string, string> = {
  "0": "০",
  "1": "১",
  "2": "২",
  "3": "৩",
  "4": "৪",
  "5": "৫",
  "6": "৬",
  "7": "৭",
  "8": "৮",
  "9": "৯",
};

/**
 * Convert an English number or string with digits to Bengali numerals (e.g. 12500 -> ১২,৫০০).
 */
export function toBengaliNumber(value: number | string): string {
  if (value === null || value === undefined) return "";
  const str = typeof value === "number" ? value.toLocaleString("en-US") : value.toString();
  return str.replace(/[0-9]/g, (digit) => BENGALI_DIGITS[digit] || digit);
}

/**
 * Format poisha currency amount to localized formatted BDT string.
 */
export function formatLocalizedPoisha(poishaAmount: number, lang: Language = "en"): string {
  const bdt = (poishaAmount / 100).toFixed(0);
  const formattedBDT = Number(bdt).toLocaleString("en-US");

  if (lang === "bn") {
    return `৳${toBengaliNumber(formattedBDT)}`;
  }
  return `৳${formattedBDT}`;
}

/**
 * Convert number to Bengali words for official Money Receipts (টাকা কথায়).
 */
export function numberToBengaliWords(bdtAmount: number): string {
  if (bdtAmount <= 0) return "শূন্য টাকা মাত্র";
  // Standard money receipt suffix
  return `${toBengaliNumber(bdtAmount.toLocaleString("en-US"))} টাকা মাত্র`;
}

/**
 * Helper to get translations by language.
 */
export function getTranslations(lang: Language = "en") {
  return translations[lang] || translations.en;
}
