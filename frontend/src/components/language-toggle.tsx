"use client";

import { Languages } from "lucide-react";
import { useLanguage } from "@/providers/language-provider";

/**
 * Switches the interface between English and Bangla.
 *
 * The label always shows the language you would switch *to*, written in that
 * language — a Bangla speaker looking for their language looks for the word
 * "বাংলা", not for a flag or a two-letter code.
 */
export function LanguageToggle({ className = "" }: { className?: string }) {
  const { language, toggleLanguage, ready } = useLanguage();

  if (!ready) {
    return (
      <div
        aria-hidden
        className={`h-8 w-20 rounded-full border border-border bg-card/60 animate-pulse ${className}`}
      />
    );
  }

  const switchingToBangla = language === "en";

  return (
    <button
      type="button"
      onClick={toggleLanguage}
      lang={switchingToBangla ? "bn" : "en"}
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border border-border bg-card text-foreground transition-colors duration-200 cursor-pointer shadow-xs hover:bg-accent hover:border-primary/40 ${className}`}
      title={switchingToBangla ? "বাংলায় দেখুন" : "View in English"}
      aria-label={switchingToBangla ? "Switch to Bangla" : "Switch to English"}
    >
      <Languages className="w-3.5 h-3.5 text-primary shrink-0" aria-hidden />
      <span>{switchingToBangla ? "বাংলা" : "English"}</span>
    </button>
  );
}
