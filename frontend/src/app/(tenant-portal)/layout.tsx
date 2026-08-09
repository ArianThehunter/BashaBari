"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Home, Receipt, Wrench, LogOut, Loader2, UserCheck } from "lucide-react";

export default function TenantPortalLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAuthenticated, isLoading: isLoadingAuth, logout } = useAuth();
  const [mounted] = useState(() => typeof window !== "undefined");

  useEffect(() => {
    if (mounted && !isLoadingAuth && !isAuthenticated) {
      router.push("/login");
    }
  }, [mounted, isLoadingAuth, isAuthenticated, router]);

  if (!mounted || isLoadingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="text-center space-y-3">
          <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto" />
          <p className="text-sm text-muted-foreground font-medium">Loading Tenant Portal...</p>
        </div>
      </div>
    );
  }

  const navItems = [
    { href: "/tenant-portal", label: "Tenant Dashboard", icon: Home },
    { href: "/tenant-portal/invoices", label: "My Rent & Invoices", icon: Receipt },
    { href: "/tenant-portal/maintenance", label: "Maintenance Tickets", icon: Wrench },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950">
      {/* ---- Top Header ---- */}
      <header className="h-16 border-b border-border bg-card px-4 sm:px-6 flex items-center justify-between sticky top-0 z-40 shadow-xs">
        <Link href="/tenant-portal" className="flex items-center gap-2 font-bold text-lg text-primary">
          <span className="bg-primary text-primary-foreground w-8 h-8 rounded-lg flex items-center justify-center text-sm shadow-sm">
            🏠
          </span>
          <span>Bariwala Hub Tenant Portal</span>
        </Link>

        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 text-xs text-muted-foreground font-semibold">
            <UserCheck className="w-4 h-4 text-emerald-600" />
            <span>{user?.name}</span>
          </div>

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
        </aside>

        {/* Content Area */}
        <main className="flex-1 p-4 sm:p-6 md:p-8 max-w-5xl">
          {children}
        </main>
      </div>
    </div>
  );
}
