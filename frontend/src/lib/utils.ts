import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merge Tailwind CSS classes with conflict resolution.
 * Combines clsx (conditional classes) with tailwind-merge (dedup/override).
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
