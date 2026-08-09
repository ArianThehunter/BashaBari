import Link from "next/link";
import type { ReactNode } from "react";
import { ThemeToggle } from "@/components/theme-toggle";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8 bg-background text-foreground font-sans selection:bg-primary selection:text-white transition-colors duration-200">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center mb-6">
        <div className="flex items-center justify-between mb-4 px-4 sm:px-0">
          <Button asChild variant="ghost" size="sm">
            <Link href="/" className="gap-1.5 text-xs font-semibold">
              <ArrowLeft className="w-4 h-4" /> Back to Home
            </Link>
          </Button>

          <ThemeToggle />
        </div>

        <Link href="/" className="inline-block group">
          <h1 className="text-3xl font-extrabold tracking-tight text-primary flex items-center justify-center gap-2">
            <span className="bg-primary text-primary-foreground w-10 h-10 rounded-xl flex items-center justify-center text-xl shadow-md group-hover:scale-105 transition-transform">
              🏠
            </span>
            <span>BashaBari</span>
          </h1>
        </Link>
        <p className="mt-2 text-xs sm:text-sm text-muted-foreground font-medium">
          Smart Property Operations &amp; Financial Management Platform
        </p>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        {children}
      </div>

      <footer className="mt-8 text-center text-xs text-muted-foreground font-medium">
        &copy; {new Date().getFullYear()} BashaBari. All rights reserved. • Premises Rent Control Act 1992 Compliant
      </footer>
    </div>
  );
}
