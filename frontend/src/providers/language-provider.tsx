"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import { translations, type Dictionary, type Language } from "@/lib/translations";
import { formatLocalizedPoisha, toBengaliNumber } from "@/lib/i18n";

const STORAGE_KEY = "bashabari-language";

/* ------------------------------------------------------------------ *
 * External store
 *
 * The preference lives in localStorage, which React cannot read during
 * render without risking a hydration mismatch. useSyncExternalStore is the
 * supported way to read it: the server snapshot is always "en", the client
 * snapshot is the stored value, and React reconciles the two itself.
 *
 * Doing this with useState + useEffect would mean calling setState inside an
 * effect, which React 19 flags.
 * ------------------------------------------------------------------ */

const listeners = new Set<() => void>();

function notify() {
  for (const listener of listeners) listener();
}

function subscribe(onStoreChange: () => void): () => void {
  listeners.add(onStoreChange);
  // `storage` fires in *other* tabs, so switching language keeps every open
  // tab in sync.
  window.addEventListener("storage", onStoreChange);

  return () => {
    listeners.delete(onStoreChange);
    window.removeEventListener("storage", onStoreChange);
  };
}

function getSnapshot(): Language {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored === "en" || stored === "bn") return stored;
  } catch {
    // Private mode or blocked storage — fall through to the default.
  }

  return "en";
}

function getServerSnapshot(): Language {
  return "en";
}

function writeLanguage(next: Language) {
  try {
    window.localStorage.setItem(STORAGE_KEY, next);
  } catch {
    // The preference will not persist, but the session still works.
  }

  notify();
}

/* ------------------------------------------------------------------ */

interface LanguageContextValue {
  /** Active language. "en" on the server and during hydration. */
  language: Language;
  setLanguage: (next: Language) => void;
  toggleLanguage: () => void;
  /** Dictionary for the active language. */
  t: Dictionary;
  /** Poisha → "৳12,500" / "৳১২,৫০০". */
  money: (poisha: number) => string;
  /** Any number rendered in the active script. */
  num: (value: number | string) => string;
  /** False until the client snapshot is in use. */
  ready: boolean;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const language = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const ready = useSyncExternalStore(subscribe, () => true, () => false);

  // Keep the document language in sync so screen readers, hyphenation and the
  // browser's own translation prompt behave correctly.
  useEffect(() => {
    document.documentElement.lang = language === "bn" ? "bn" : "en";
  }, [language]);

  const setLanguage = useCallback((next: Language) => writeLanguage(next), []);

  const toggleLanguage = useCallback(
    () => writeLanguage(language === "bn" ? "en" : "bn"),
    [language],
  );

  const value = useMemo<LanguageContextValue>(
    () => ({
      language,
      setLanguage,
      toggleLanguage,
      t: translations[language],
      money: (poisha: number) => formatLocalizedPoisha(poisha, language),
      num: (v: number | string) =>
        language === "bn"
          ? toBengaliNumber(v)
          : typeof v === "number"
            ? v.toLocaleString("en-US")
            : String(v),
      ready,
    }),
    [language, setLanguage, toggleLanguage, ready],
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage(): LanguageContextValue {
  const context = useContext(LanguageContext);

  if (!context) {
    throw new Error("useLanguage must be used inside <LanguageProvider>.");
  }

  return context;
}
