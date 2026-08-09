"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useOrganization } from "@/hooks/use-organization";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import {
  Building2,
  Users,
  Home,
  FileText,
  DollarSign,
  Wrench,
  BarChart3,
  Settings,
  LogOut,
  ChevronDown,
  Plus,
  Loader2,
  ShieldCheck,
  Receipt,
  Zap,
  Scale,
} from "lucide-react";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAuthenticated, isLoading: isLoadingAuth, logout } = useAuth();
  const {
    organizations,
    activeOrganization,
    selectOrganization,
    isLoadingOrganizations,
  } = useOrganization();

  const [mounted] = useState(() => typeof window !== "undefined");

  // Redirect to login if unauthenticated
  useEffect(() => {
    if (mounted && !isLoadingAuth && !isAuthenticated) {
      router.push("/login");
    }
  }, [mounted, isLoadingAuth, isAuthenticated, router]);

  // Redirect to onboarding if user has no organizations
  useEffect(() => {
    if (
      mounted &&
      !isLoadingAuth &&
      !isLoadingOrganizations &&
      isAuthenticated &&
      organizations.length === 0 &&
      pathname !== "/onboarding"
    ) {
      router.push("/onboarding");
    }
  }, [
    mounted,
    isLoadingAuth,
    isLoadingOrganizations,
    isAuthenticated,
    organizations,
    pathname,
    router,
  ]);

  if (!mounted || isLoadingAuth || isLoadingOrganizations) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="text-center space-y-3">
          <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto" />
          <p className="text-sm text-muted-foreground font-medium">Loading Bariwala Hub...</p>
        </div>
      </div>
    );
  }

  const navItems = [
    { href: "/dashboard", label: "Dashboard", icon: Home },
    { href: "/properties", label: "Properties", icon: Building2 },
    { href: "/tenants", label: "Tenants", icon: Users },
    { href: "/leases", label: "Leases", icon: FileText },
    { href: "/invoices", label: "Rent & Invoices", icon: Receipt },
    { href: "/utilities", label: "Utilities & Meters", icon: Zap },
    { href: "/expenses", label: "Expenses", icon: DollarSign },
    { href: "/maintenance", label: "Maintenance", icon: Wrench },
    { href: "/building-staff", label: "Building Staff & Security", icon: ShieldCheck },
    { href: "/reports", label: "Reports & Analytics", icon: BarChart3 },
    { href: "/settings/organization", label: "Org Settings", icon: Settings },
    { href: "/settings/members", label: "Team Members", icon: ShieldCheck },
    { href: "/settings/audit-logs", label: "Security Audit Logs", icon: ShieldCheck },
    { href: "/settings/compliance", label: "Legal Compliance", icon: Scale },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950">
      {/* ---- Top Navigation Bar ---- */}
      <header className="h-16 border-b border-border bg-card px-4 sm:px-6 flex items-center justify-between sticky top-0 z-40 shadow-xs">
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="flex items-center gap-2 font-bold text-lg text-primary">
            <span className="bg-primary text-primary-foreground w-8 h-8 rounded-lg flex items-center justify-center text-sm shadow-sm">
              🏠
            </span>
            <span className="hidden sm:inline">BashaBari (বাসাবাড়ি)</span>
          </Link>

          {/* ---- Organization Switcher Dropdown ---- */}
          {activeOrganization && (
            <div className="flex items-center gap-2 border-l border-border pl-4">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-2 font-medium text-xs sm:text-sm">
                    <Building2 className="w-4 h-4 text-primary" />
                    <span className="truncate max-w-[140px] sm:max-w-[200px]">
                      {activeOrganization.name}
                    </span>
                    <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
                  </Button>
                </DropdownMenuTrigger>

                <DropdownMenuContent align="start" className="w-56">
                  <DropdownMenuLabel className="text-xs text-muted-foreground">
                    Switch Organization
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />

                  {organizations.map((org) => (
                    <DropdownMenuItem
                      key={org.id}
                      onClick={() => selectOrganization(org.id)}
                      className={`gap-2 cursor-pointer ${
                        org.id === activeOrganization.id ? "font-bold text-primary" : ""
                      }`}
                    >
                      <Building2 className="w-4 h-4" />
                      <span className="truncate flex-1">{org.name}</span>
                      {org.id === activeOrganization.id && (
                        <Badge variant="secondary" className="text-[10px] py-0">Active</Badge>
                      )}
                    </DropdownMenuItem>
                  ))}

                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/onboarding" className="gap-2 cursor-pointer text-primary">
                      <Plus className="w-4 h-4" />
                      <span>Add New Organization</span>
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* 5-day Trial Badge */}
              {activeOrganization.status === "trial" && (
                <Badge variant="outline" className="hidden md:inline-flex bg-amber-500/10 text-amber-600 border-amber-500/20 text-xs gap-1">
                  <span>⚡ 5-Day Trial</span>
                </Badge>
              )}
            </div>
          )}
        </div>

        {/* ---- Right User Profile Menu ---- */}
        <div className="flex items-center gap-3">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="gap-2">
                <div className="w-7 h-7 rounded-full bg-primary/10 text-primary font-bold text-xs flex items-center justify-center border border-primary/20">
                  {user?.name ? user.name[0].toUpperCase() : "U"}
                </div>
                <span className="text-xs font-semibold hidden sm:inline">{user?.name}</span>
                <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuLabel>
                <p className="text-sm font-medium">{user?.name}</p>
                <p className="text-xs text-muted-foreground font-normal truncate">{user?.email}</p>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />

              <DropdownMenuItem asChild>
                <Link href="/settings/organization" className="cursor-pointer">
                  <Settings className="w-4 h-4 mr-2" /> Settings
                </Link>
              </DropdownMenuItem>

              <DropdownMenuSeparator />

              <DropdownMenuItem onClick={() => logout()} className="cursor-pointer text-destructive focus:text-destructive">
                <LogOut className="w-4 h-4 mr-2" /> Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      {/* ---- Main Body Shell ---- */}
      <div className="flex-1 flex overflow-hidden">
        {/* ---- Left Sidebar Navigation ---- */}
        <aside className="w-64 bg-card border-r border-border hidden md:flex flex-col p-4 space-y-1">
          <div className="px-3 py-2 text-xs font-bold text-muted-foreground tracking-wider uppercase">
            Navigation
          </div>

          <nav className="space-y-1 flex-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-primary text-primary-foreground shadow-xs font-semibold"
                      : "text-muted-foreground hover:bg-accent hover:text-foreground"
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </aside>

        {/* ---- Main Content Workspace ---- */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
