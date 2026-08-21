"use client";

import Link from "next/link";
import { useAuth } from "@/hooks/use-auth";
import { useOrganization } from "@/hooks/use-organization";
import { useProperties } from "@/hooks/use-property";
import { useTenants } from "@/hooks/use-tenant";
import { useInvoices } from "@/hooks/use-invoice";
import { useMaintenanceRequests } from "@/hooks/use-maintenance";
import { useLanguage } from "@/providers/language-provider";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Building2,
  Users,
  DoorOpen,
  Wrench,
  Plus,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Banknote,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

/** A number that is still loading, so the layout does not jump when it lands. */
function StatSkeleton({ wide = false }: { wide?: boolean }) {
  return (
    <div
      aria-hidden
      className={`h-7 rounded bg-muted animate-pulse ${wide ? "w-40 sm:h-12 sm:w-64" : "w-16"}`}
    />
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  detail,
  href,
  loading,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  detail: string;
  href: string;
  loading: boolean;
}) {
  return (
    <Link href={href} className="group focus:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-xl">
      <Card className="border-border h-full transition-colors group-hover:border-primary/40">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">{label}</CardTitle>
          <Icon className="h-4 w-4 text-muted-foreground shrink-0" aria-hidden />
        </CardHeader>
        <CardContent>
          {loading ? <StatSkeleton /> : <div className="text-2xl font-bold">{value}</div>}
          <p className="text-xs text-muted-foreground mt-1">{detail}</p>
        </CardContent>
      </Card>
    </Link>
  );
}

export default function DashboardHomePage() {
  const { user } = useAuth();
  const { activeOrganization } = useOrganization();
  const { t, money, num } = useLanguage();

  const organizationId = activeOrganization?.id ?? null;

  const { properties, isLoading: loadingProperties } = useProperties(organizationId);
  const { tenants, isLoading: loadingTenants } = useTenants({ organization_id: organizationId });
  const { invoices, meta: invoiceMeta, isLoading: loadingInvoices } = useInvoices({
    organization_id: organizationId,
  });
  const { meta: repairMeta, isLoading: loadingRepairs } = useMaintenanceRequests({
    organization_id: organizationId,
  });

  // ---- Derived figures ----
  const outstandingPoisha = invoiceMeta.total_outstanding_poisha;
  const unpaidCount = invoices.filter(
    (invoice) => invoice.status === "unpaid" || invoice.status === "partially_paid" || invoice.status === "overdue",
  ).length;

  const totalUnits = properties.reduce((sum, p) => sum + (p.units_count ?? 0), 0);
  const occupiedUnits = properties.reduce((sum, p) => sum + (p.occupied_units_count ?? 0), 0);
  const vacantUnits = Math.max(0, totalUnits - occupiedUnits);

  const pendingRepairs = repairMeta.pending_count + repairMeta.in_progress_count;

  const hasNothingYet = !loadingProperties && properties.length === 0;
  const isSettled = !loadingInvoices && outstandingPoisha <= 0;

  return (
    <div className="space-y-6">
      {/* ---- Welcome ---- */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            {t.dashboard.greeting}, {user?.name || "—"} 👋
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {t.dashboard.managing}{" "}
            <strong className="text-foreground">{activeOrganization?.name || "—"}</strong>
          </p>
        </div>

        <Button asChild size="sm" className="gap-2 shrink-0">
          <Link href="/properties/new">
            <Plus className="w-4 h-4" aria-hidden /> {t.dashboard.step1Cta}
          </Link>
        </Button>
      </div>

      {/* ---- Trial ---- */}
      {activeOrganization?.status === "trial" && (
        <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-700 dark:text-amber-400 flex items-center gap-3">
          <div className="p-2 bg-amber-500/20 rounded-lg shrink-0">
            <Sparkles className="w-5 h-5 text-amber-600 dark:text-amber-400" aria-hidden />
          </div>
          <div>
            <p className="font-semibold text-sm">{t.dashboard.trialTitle}</p>
            <p className="text-xs text-amber-700/80 dark:text-amber-400/80">{t.dashboard.trialBody}</p>
          </div>
        </div>
      )}

      {/* ---- The one number that matters ---- */}
      {/* A landlord opens this app to answer one question: how much rent is  */}
      {/* still owed. It gets the whole width, not a quarter of a tile row.   */}
      <section
        aria-label={t.dashboard.outstandingTitle}
        className="rounded-2xl border border-border bg-card p-6 sm:p-8 shadow-xs"
      >
        <p className="text-sm font-semibold text-muted-foreground">{t.dashboard.outstandingTitle}</p>

        <div className="mt-2 flex flex-wrap items-baseline gap-x-4 gap-y-1">
          {loadingInvoices ? (
            <StatSkeleton wide />
          ) : (
            <span
              className={`text-4xl sm:text-5xl font-extrabold tracking-tight tabular-nums ${
                isSettled ? "text-emerald-600 dark:text-emerald-400" : "text-foreground"
              }`}
            >
              {money(outstandingPoisha)}
            </span>
          )}

          {!loadingInvoices && !isSettled && (
            <span className="text-sm text-muted-foreground">
              {t.dashboard.outstandingFrom(unpaidCount)}
            </span>
          )}
        </div>

        {!loadingInvoices && isSettled && (
          <p className="mt-2 flex items-center gap-1.5 text-sm text-emerald-600 dark:text-emerald-400 font-medium">
            <CheckCircle2 className="w-4 h-4 shrink-0" aria-hidden />
            {t.dashboard.outstandingEmpty}
          </p>
        )}

        <div className="mt-5 flex flex-col sm:flex-row gap-2.5">
          <Button asChild className="gap-2">
            <Link href="/invoices?status=unpaid">
              {t.dashboard.seeUnpaidBills} <ArrowRight className="w-4 h-4" aria-hidden />
            </Link>
          </Button>
          <Button asChild variant="outline" className="gap-2">
            <Link href="/payments/new">
              <Banknote className="w-4 h-4" aria-hidden /> {t.dashboard.recordPayment}
            </Link>
          </Button>
        </div>

        <dl className="mt-6 pt-5 border-t border-border grid grid-cols-2 gap-4 max-w-md">
          <div>
            <dt className="text-xs text-muted-foreground">{t.dashboard.collectedThisPeriod}</dt>
            <dd className="text-base font-bold text-foreground tabular-nums mt-0.5">
              {loadingInvoices ? "—" : money(invoiceMeta.total_collected_poisha)}
            </dd>
          </div>
          <div>
            <dt className="text-xs text-muted-foreground">{t.dashboard.billedThisPeriod}</dt>
            <dd className="text-base font-bold text-foreground tabular-nums mt-0.5">
              {loadingInvoices ? "—" : money(invoiceMeta.total_billed_poisha)}
            </dd>
          </div>
        </dl>
      </section>

      {/* ---- Supporting counts ---- */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={Building2}
          label={t.dashboard.buildings}
          value={num(properties.length)}
          detail={t.dashboard.unitsSummary(occupiedUnits, totalUnits)}
          href="/properties"
          loading={loadingProperties}
        />
        <StatCard
          icon={DoorOpen}
          label={t.dashboard.flatsOccupied}
          value={`${num(occupiedUnits)}/${num(totalUnits)}`}
          detail={t.dashboard.vacantFlats(vacantUnits)}
          href="/units"
          loading={loadingProperties}
        />
        <StatCard
          icon={Users}
          label={t.dashboard.activeTenants}
          value={num(tenants.length)}
          detail={t.dashboard.tenantsSummary(tenants.length)}
          href="/tenants"
          loading={loadingTenants}
        />
        <StatCard
          icon={Wrench}
          label={t.dashboard.openRepairs}
          value={num(pendingRepairs)}
          detail={t.dashboard.repairsSummary(repairMeta.pending_count, repairMeta.emergency_count)}
          href="/maintenance"
          loading={loadingRepairs}
        />
      </div>

      {/* ---- First-run setup, shown only until there is a building ---- */}
      {hasNothingYet && (
        <Card className="border-border">
          <CardHeader>
            <CardTitle className="text-lg font-bold">{t.dashboard.setupTitle}</CardTitle>
            <CardDescription>{t.dashboard.setupBody}</CardDescription>
          </CardHeader>
          <CardContent>
            <ol className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { title: t.dashboard.step1Title, body: t.dashboard.step1Body, cta: t.dashboard.step1Cta, href: "/properties/new" },
                { title: t.dashboard.step2Title, body: t.dashboard.step2Body, cta: t.dashboard.step2Cta, href: "/tenants/new" },
                { title: t.dashboard.step3Title, body: t.dashboard.step3Body, cta: t.dashboard.step3Cta, href: "/invoices" },
              ].map((step, index) => (
                <li key={step.title} className="p-4 bg-accent/40 rounded-xl border border-border space-y-2">
                  <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-primary text-primary-foreground text-sm font-bold">
                    {num(index + 1)}
                  </span>
                  <h3 className="font-semibold text-sm text-foreground">{step.title}</h3>
                  <p className="text-xs text-muted-foreground">{step.body}</p>
                  <Button asChild size="sm" variant="outline" className="gap-1.5 mt-1">
                    <Link href={step.href}>
                      {step.cta} <ArrowRight className="w-3.5 h-3.5" aria-hidden />
                    </Link>
                  </Button>
                </li>
              ))}
            </ol>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
