"use client";

import { useTheme } from "next-themes";
import { useSyncExternalStore } from "react";
import { Sun, Moon } from "lucide-react";

const emptySubscribe = () => () => {};

export function ThemeToggle({ className }: { className?: string }) {
  const { theme, setTheme } = useTheme();
  const mounted = useSyncExternalStore(emptySubscribe, () => true, () => false);

  if (!mounted) {
    return (
      <div className={`h-8 w-24 rounded-full border border-border bg-card/60 animate-pulse ${className}`} />
    );
  }

  const isDark = theme === "dark";

  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all duration-200 cursor-pointer shadow-xs ${
        isDark
          ? "bg-stone-900 border-amber-500/40 text-amber-300 hover:bg-stone-800 hover:border-amber-400"
          : "bg-amber-500/10 border-amber-600/30 text-amber-900 hover:bg-amber-500/20"
      } ${className}`}
      title={isDark ? "Switch to Warm Light Theme" : "Switch to Dark Theme"}
      aria-label="Toggle theme"
    >
      {isDark ? (
        <>
          <Sun className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          <span>Light Mode</span>
        </>
      ) : (
        <>
          <Moon className="w-3.5 h-3.5 text-slate-700 shrink-0" />
          <span>Dark Mode</span>
        </>
      )}
    </button>
  );
}
