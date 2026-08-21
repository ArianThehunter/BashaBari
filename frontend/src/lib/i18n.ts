import { translations, type Language } from "./translations";
import { poishaToBdt } from "./money";

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
 * Convert digits in a number or string to Bengali numerals (12500 → ১২,৫০০).
 */
export function toBengaliNumber(value: number | string): string {
  if (value === null || value === undefined) return "";

  const str = typeof value === "number" ? value.toLocaleString("en-US") : value.toString();

  return str.replace(/[0-9]/g, (digit) => BENGALI_DIGITS[digit] || digit);
}

/**
 * Format a poisha amount as BDT in the given language.
 *
 * Paisa are shown only when they are non-zero — rents are quoted in whole taka,
 * and "৳12,500.00" reads as software output where "৳12,500" reads as money.
 */
export function formatLocalizedPoisha(poishaAmount: number, lang: Language = "en"): string {
  const bdt = poishaToBdt(poishaAmount);
  const hasPaisa = Math.abs(bdt % 1) > 0.0001;

  const formatted = new Intl.NumberFormat("en-US", {
    minimumFractionDigits: hasPaisa ? 2 : 0,
    maximumFractionDigits: 2,
  }).format(bdt);

  return lang === "bn" ? `৳${toBengaliNumber(formatted)}` : `৳${formatted}`;
}

/**
 * Amount in Bengali words for official money receipts (টাকা কথায়).
 */
export function numberToBengaliWords(bdtAmount: number): string {
  if (bdtAmount <= 0) return "শূন্য টাকা মাত্র";

  return `${toBengaliNumber(bdtAmount.toLocaleString("en-US"))} টাকা মাত্র`;
}

/**
 * Dictionary lookup by language.
 */
export function getTranslations(lang: Language = "en") {
  return translations[lang] || translations.en;
}
