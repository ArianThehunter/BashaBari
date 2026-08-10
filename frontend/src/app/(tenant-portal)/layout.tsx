"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { Home, Receipt, Wrench, LogOut, Loader2, UserCheck, ArrowLeft, Building2, BookOpen } from "lucide-react";

export default function TenantPortalLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAuthenticated, isLoading: isLoadingAuth, logout } = useAuth();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && !isLoadingAuth && !isAuthenticated) {
      router.push("/login");
    }
  }, [mounted, isLoadingAuth, isAuthenticated, router]);

  if (!mounted || isLoadingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-foreground">
        <div className="text-center space-y-3">
          <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto" />
          <p className="text-sm text-muted-foreground font-medium">Loading BashaBari Tenant Portal...</p>
        </div>
      </div>
    );
  }

  const navItems = [
    { href: "/tenant-portal", label: "Tenant Dashboard", icon: Home },
    { href: "/tenant-portal/invoices", label: "My Rent & Invoices", icon: Receipt },
    { href: "/tenant-portal/maintenance", label: "Maintenance Tickets", icon: Wrench },
    { href: "/tenant-portal/guide", label: "User Guide & Tutorial", icon: BookOpen },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      {/* ---- Top Header ---- */}
      <header className="h-16 border-b border-border bg-card px-4 sm:px-6 flex items-center justify-between sticky top-0 z-40 shadow-xs">
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors mr-2">
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Back to</span> Main Site
          </Link>

          <div className="h-4 w-[1px] bg-border hidden sm:block" />

          <Link href="/tenant-portal" className="flex items-center gap-2 font-bold text-base sm:text-lg text-primary">
            <span className="bg-primary text-primary-foreground w-8 h-8 rounded-lg flex items-center justify-center text-sm shadow-sm shrink-0">
              🏠
            </span>
            <span className="tracking-tight">BashaBari Tenant Portal</span>
          </Link>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <Button asChild variant="ghost" size="sm" className="hidden md:inline-flex text-xs font-semibold">
            <Link href="/tenant-portal/guide">
              <BookOpen className="w-3.5 h-3.5 mr-1" /> User Guide
            </Link>
          </Button>

          <div className="hidden sm:flex items-center gap-2 text-xs text-muted-foreground font-semibold bg-accent/50 px-2.5 py-1 rounded-md border border-border">
            <UserCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>{user?.name}</span>
          </div>

          <ThemeToggle />

          <Button variant="outline" size="sm" onClick={() => logout()} className="text-xs font-semibold">
            <LogOut className="w-3.5 h-3.5 mr-1" /> Logout
          </Button>
        </div>
      </header>

      {/* ---- Main Container & Sidebar ---- */}
      <div className="flex-1 flex flex-col md:flex-row">
        {/* Sidebar */}
        <aside className="w-full md:w-64 border-r border-border bg-card p-4 flex md:flex-col gap-1.5 overflow-x-auto md:overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
                  isActive
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{item.label}</span>
              </Link>
            );
          })}
          
          <div className="hidden md:block pt-4 mt-auto border-t border-border">
            <Link
              href="/"
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-all font-medium"
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>BashaBari Homepage</span>
            </Link>
          </div>
        </aside>

        {/* Content Area */}
        <main className="flex-1 p-4 sm:p-6 md:p-8 max-w-5xl">
          {children}
        </main>
      </div>
    </div>
  );
}
