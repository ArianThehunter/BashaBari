/**
 * Money formatting utilities for BashaBari.
 *
 * Strategy:
 * - All monetary values from the API are in POISHA (integer, 1 BDT = 100 poisha).
 * - Display conversion happens here at the presentation layer.
 * - Never perform floating-point arithmetic on money.
 */

const CURRENCY = "BDT";
const MINOR_UNITS = 100; // 1 BDT = 100 poisha

/**
 * Convert poisha (integer) to BDT (display number).
 * Example: 150000 → 1500.00
 */
export function poishaToBdt(poisha: number): number {
  return poisha / MINOR_UNITS;
}

/**
 * Convert BDT (user input) to poisha (integer for storage).
 * Example: 1500.00 → 150000
 */
export function bdtToPoisha(bdt: number): number {
  return Math.round(bdt * MINOR_UNITS);
}

/**
 * Format a poisha amount for display as BDT.
 * Example: 150000 → "৳1,500.00"
 */
export function formatMoney(poisha: number): string {
  const bdt = poishaToBdt(poisha);
  return new Intl.NumberFormat("en-BD", {
    style: "currency",
    currency: CURRENCY,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(bdt);
}

/**
 * Format a poisha amount compactly (no decimal if whole number).
 * Example: 150000 → "৳1,500"
 * Example: 150050 → "৳1,500.50"
 */
export function formatMoneyCompact(poisha: number): string {
  const bdt = poishaToBdt(poisha);
  const hasDecimal = bdt % 1 !== 0;

  return new Intl.NumberFormat("en-BD", {
    style: "currency",
    currency: CURRENCY,
    minimumFractionDigits: hasDecimal ? 2 : 0,
    maximumFractionDigits: 2,
  }).format(bdt);
}

/**
 * Format for form input fields (plain number, no currency symbol).
 * Example: 150000 → "1500.00"
 */
export function formatMoneyInput(poisha: number): string {
  return poishaToBdt(poisha).toFixed(2);
}

/**
 * Parse a BDT string from user input to poisha.
 * Handles common input formats: "1500", "1,500", "1500.00", "1,500.50"
 */
export function parseMoneyInput(input: string): number {
  // Remove currency symbols, commas, spaces
  const cleaned = input.replace(/[৳,\s]/g, "").trim();
  const parsed = parseFloat(cleaned);

  if (isNaN(parsed)) return 0;

  return bdtToPoisha(parsed);
}
