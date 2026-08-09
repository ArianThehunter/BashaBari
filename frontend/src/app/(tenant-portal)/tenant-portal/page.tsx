"use client";

import Link from "next/link";
import { useTenantOverview } from "@/hooks/use-tenant-portal";
import { formatMoney } from "@/lib/money";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Home, Receipt, Wrench, CreditCard, Loader2, Calendar, ShieldCheck, CheckCircle2 } from "lucide-react";

export default function TenantDashboardPage() {
  const { overview, isLoading } = useTenantOverview();

  if (isLoading) {
    return (
      <div className="py-12 text-center text-sm text-muted-foreground flex items-center justify-center gap-2">
        <Loader2 className="w-5 h-5 animate-spin text-primary" /> Loading your tenant portal...
      </div>
    );
  }

  const tenant = overview?.tenant;
  const lease = overview?.active_lease;
  const totalDuePoisha = overview?.total_due_poisha || 0;

  return (
    <div className="space-y-6">
      {/* ---- Welcome Banner ---- */}
      <div className="bg-card p-6 rounded-2xl border border-border shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Welcome, {tenant?.name || "Tenant"}!</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {lease?.unit?.property?.name ? `${lease.unit.property.name} — Flat ${lease.unit.unit_number}` : "Resident Portal"}
          </p>
        </div>

        <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 border-emerald-500/30 text-xs font-semibold px-3 py-1 gap-1">
          <ShieldCheck className="w-4 h-4" /> Active Verified Tenant
        </Badge>
      </div>

      {/* ---- Due Rent Banner Box ---- */}
      <Card className={`border-2 ${totalDuePoisha > 0 ? "border-amber-500 bg-amber-500/5 dark:bg-amber-500/10" : "border-emerald-500 bg-emerald-500/5"}`}>
        <CardContent className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
              {totalDuePoisha > 0 ? "Total Outstanding Due Balance" : "Rent Status"}
            </p>
            <p className="text-3xl font-extrabold text-foreground">
              {totalDuePoisha > 0 ? formatMoney(totalDuePoisha) : "৳ 0.00 (All Paid)"}
            </p>
            <p className="text-xs text-muted-foreground">
              {totalDuePoisha > 0 ? `${overview?.unpaid_invoices_count} pending rent invoice(s)` : "Your rent account is completely up-to-date!"}
            </p>
          </div>

          {totalDuePoisha > 0 ? (
            <Button asChild size="lg" className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold gap-2 shadow-sm">
              <Link href="/payments/sslcommerz-checkout?invoice_id=1">
                <CreditCard className="w-5 h-5" /> Pay Now via SSLCommerz (bKash/Nagad/Card)
              </Link>
            </Button>
          ) : (
            <Badge className="bg-emerald-600 text-white text-xs font-bold px-3 py-1.5 gap-1">
              <CheckCircle2 className="w-4 h-4" /> Account Clear
            </Badge>
          )}
        </CardContent>
      </Card>

      {/* ---- Key Summary Cards ---- */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-border">
          <CardHeader className="py-3 px-4 flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-xs font-semibold text-muted-foreground">
              Monthly Rent Amount
            </CardTitle>
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              <Home className="w-4 h-4" />
            </div>
          </CardHeader>
          <CardContent className="px-4 pb-3">
            <p className="text-2xl font-extrabold text-foreground">
              {formatMoney(lease?.rent_amount || 0)}
            </p>
            <p className="text-[11px] text-muted-foreground mt-0.5">Monthly base rent</p>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardHeader className="py-3 px-4 flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-xs font-semibold text-muted-foreground">
              Lease Term Expiry
            </CardTitle>
            <div className="p-2 rounded-lg bg-blue-500/10 text-blue-600">
              <Calendar className="w-4 h-4" />
            </div>
          </CardHeader>
          <CardContent className="px-4 pb-3">
            <p className="text-lg font-bold text-foreground">
              {lease?.end_date || "Active Lease"}
            </p>
            <p className="text-[11px] text-muted-foreground mt-0.5">1-2 Year Tenancy Contract</p>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardHeader className="py-3 px-4 flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-xs font-semibold text-muted-foreground">
              Open Maintenance Tickets
            </CardTitle>
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-600">
              <Wrench className="w-4 h-4" />
            </div>
          </CardHeader>
          <CardContent className="px-4 pb-3">
            <p className="text-2xl font-extrabold text-amber-600 dark:text-amber-400">
              {overview?.open_maintenance_tickets_count || 0}
            </p>
            <p className="text-[11px] text-muted-foreground mt-0.5">Under active repair</p>
          </CardContent>
        </Card>
      </div>

      {/* ---- Quick Actions ---- */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card className="border-border hover:border-primary/50 transition-all">
          <CardHeader>
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <Receipt className="w-5 h-5 text-primary" />
              Rent Receipts & Invoice History
            </CardTitle>
            <CardDescription className="text-xs">
              View past monthly rent bills and download official payment receipts.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="outline" size="sm" className="w-full font-semibold">
              <Link href="/tenant-portal/invoices">View Rent Invoices & Receipts</Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="border-border hover:border-primary/50 transition-all">
          <CardHeader>
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <Wrench className="w-5 h-5 text-amber-600" />
              Request Maintenance Repair
            </CardTitle>
            <CardDescription className="text-xs">
              Report plumbing, electrical, or elevator issues to your property manager.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="outline" size="sm" className="w-full font-semibold">
              <Link href="/tenant-portal/maintenance">Submit Maintenance Ticket</Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* ---- Tenant Departure / Move-Out Notice Action Card ---- */}
      <Card className="border-border bg-slate-900 text-slate-100 p-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              🚪 Vacating Flat? Inform Move-Out Notice (বাসা ছাড়ার নোটিশ)
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Submit your formal departure notice to the Caretaker & Bariwala to initiate flat inspection and security deposit refund processing.
            </p>
          </div>

          <Button
            onClick={async () => {
              const moveOutDate = prompt("Enter your intended move-out date (YYYY-MM-DD):", new Date(Date.now() + 30*24*60*60*1000).toISOString().slice(0,10));
              if (moveOutDate) {
                const refundAccount = prompt("Enter bKash/Nagad or Bank account number for Security Deposit Refund:");
                const reason = prompt("Reason for leaving (Optional):");
                await fetch("/api/v1/tenant-portal/move-out-notices", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    intended_move_out_date: moveOutDate,
                    deposit_refund_account: refundAccount,
                    reason_for_leaving: reason,
                  }),
                });
                alert("Move-out notice submitted successfully via portal! Caretaker & Bariwala have been notified.");
              }
            }}
            className="bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shrink-0"
          >
            Submit Move-Out Notice
          </Button>
        </div>
      </Card>
    </div>
  );
}
