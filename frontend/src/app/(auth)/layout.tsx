import Link from "next/link";
import type { ReactNode } from "react";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8 bg-slate-100 dark:bg-slate-950">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center mb-6">
        <Link href="/" className="inline-block group">
          <h1 className="text-3xl font-extrabold tracking-tight text-primary flex items-center justify-center gap-2">
            <span className="bg-primary text-primary-foreground w-10 h-10 rounded-xl flex items-center justify-center text-xl shadow-md group-hover:scale-105 transition-transform">
              🏠
            </span>
            <span>Bariwala Hub</span>
          </h1>
        </Link>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-400 font-medium">
          Property Operations &amp; Financial Management SaaS
        </p>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        {children}
      </div>

      <footer className="mt-8 text-center text-xs text-slate-500 dark:text-slate-400 font-medium">
        &copy; {new Date().getFullYear()} Bariwala Hub. All rights reserved.
      </footer>
    </div>
  );
}
