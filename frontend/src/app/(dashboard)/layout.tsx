"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useSyncExternalStore, type ReactNode } from "react";
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
  DoorOpen,
  Wallet,
  Banknote,
  TrendingUp,
  Wrench,
  BarChart3,
  Settings,
  LogOut,
  ChevronDown,
  Plus,
  Loader2,
  HardHat,
  UserCog,
  History,
  Receipt,
  Zap,
  Scale,
  BookOpen,
} from "lucide-react";
import { LanguageToggle } from "@/components/language-toggle";
import { ThemeToggle } from "@/components/theme-toggle";
import { useLanguage } from "@/providers/language-provider";

const emptySubscribe = () => () => {};

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

  const { t } = useLanguage();

  const mounted = useSyncExternalStore(emptySubscribe, () => true, () => false);

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
          <p className="text-sm text-muted-foreground font-medium">Loading BashaBari...</p>
        </div>
      </div>
    );
  }

  // Grouped by what a landlord is trying to do, not by database table. Every
  // item has a distinct icon — Building Staff, Team Members and Audit Logs all
  // used ShieldCheck, so the sidebar could not be scanned by shape.
  const navGroups = [
    {
      label: t.nav.groupEveryday,
      items: [
        { href: "/dashboard", label: t.nav.dashboard, icon: Home },
        { href: "/maintenance", label: t.nav.maintenance, icon: Wrench },
        { href: "/dashboard/guide", label: t.nav.guide, icon: BookOpen },
      ],
    },
    {
      label: t.nav.groupMoney,
      items: [
        { href: "/invoices", label: t.nav.invoices, icon: Receipt },
        { href: "/payments", label: t.nav.payments, icon: Banknote },
        { href: "/utilities", label: t.nav.utilities, icon: Zap },
        { href: "/expenses", label: t.nav.expenses, icon: Wallet },
        { href: "/financials", label: t.nav.financials, icon: TrendingUp },
        { href: "/reports", label: t.nav.reports, icon: BarChart3 },
      ],
    },
    {
      label: t.nav.groupProperty,
      items: [
        { href: "/properties", label: t.nav.properties, icon: Building2 },
        { href: "/units", label: t.nav.units, icon: DoorOpen },
        { href: "/tenants", label: t.nav.tenants, icon: Users },
        { href: "/leases", label: t.nav.leases, icon: FileText },
        { href: "/building-staff", label: t.nav.staff, icon: HardHat },
      ],
    },
    {
      label: t.nav.groupAdmin,
      items: [
        { href: "/settings/organization", label: t.nav.organization, icon: Settings },
        { href: "/settings/members", label: t.nav.members, icon: UserCog },
        { href: "/settings/compliance", label: t.nav.compliance, icon: Scale },
        { href: "/settings/audit-logs", label: t.nav.auditLogs, icon: History },
      ],
    },
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
                    {t.nav.switchOrganization}
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
                      <span>{t.nav.addOrganization}</span>
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* 5-day Trial Badge */}
              {activeOrganization.status === "trial" && (
                <Badge variant="outline" className="hidden md:inline-flex bg-amber-500/10 text-amber-600 border-amber-500/20 text-xs gap-1">
                  <span>⚡ {t.nav.trial}</span>
                </Badge>
              )}
            </div>
          )}
        </div>

        {/* ---- Right User Profile Menu ---- */}
        <div className="flex items-center gap-2 sm:gap-3">
          <LanguageToggle />
          <ThemeToggle className="hidden sm:inline-flex" />

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
                  <Settings className="w-4 h-4 mr-2" /> {t.nav.settings}
                </Link>
              </DropdownMenuItem>

              <DropdownMenuSeparator />

              <DropdownMenuItem onClick={() => logout()} className="cursor-pointer text-destructive focus:text-destructive">
                <LogOut className="w-4 h-4 mr-2" /> {t.nav.signOut}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      {/* ---- Main Body Shell ---- */}
      <div className="flex-1 flex overflow-hidden">
        {/* ---- Left Sidebar Navigation ---- */}
        <aside className="w-64 bg-card border-r border-border hidden md:flex flex-col overflow-y-auto">
          <nav className="flex-1 p-3 space-y-5">
            {navGroups.map((group) => (
              <div key={group.label} className="space-y-1">
                <div className="px-3 pb-1 text-[11px] font-bold text-muted-foreground tracking-wider uppercase">
                  {group.label}
                </div>

                {group.items.map((item) => {
                  const Icon = item.icon;
                  const isActive =
                    pathname === item.href || pathname.startsWith(`${item.href}/`);

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      aria-current={isActive ? "page" : undefined}
                      className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        isActive
                          ? "bg-primary text-primary-foreground shadow-xs font-semibold"
                          : "text-muted-foreground hover:bg-accent hover:text-foreground"
                      }`}
                    >
                      <Icon className="w-4 h-4 shrink-0" aria-hidden />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </div>
            ))}
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
