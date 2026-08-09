"use client";

import { useOrganization } from "@/hooks/use-organization";
import { useFinancialReport } from "@/hooks/use-payment";
import { formatMoney } from "@/lib/money";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Download,
  ShieldCheck,
  Loader2,
  PieChart,
  Landmark,
  FileSpreadsheet,
} from "lucide-react";

export default function ReportsAnalyticsPage() {
  const { activeOrgId, activeOrganization } = useOrganization();
  const { summary, channels, recentLedger, isLoading } = useFinancialReport(activeOrgId);

  return (
    <div className="space-y-6">
      {/* ---- Page Header ---- */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-primary" />
            Property Operational Reports & Financial Analytics
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {activeOrganization?.name || "BashaBari"} — Consolidated bank surplus, staff payroll, and collection performance
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            onClick={() => alert("Downloading PDF Financial Audit Report...")}
            variant="outline"
            size="sm"
            className="gap-2 font-semibold"
          >
            <Download className="w-4 h-4" /> Export PDF Audit Report
          </Button>
          <Button
            onClick={() => alert("Downloading CSV General Ledger Export...")}
            variant="outline"
            size="sm"
            className="gap-2 font-semibold"
          >
            <FileSpreadsheet className="w-4 h-4" /> Export CSV
          </Button>
        </div>
      </div>

      {/* ---- Net Bank Deposit Surplus Spotlight Card ---- */}
      <Card className="border-2 border-emerald-500 bg-emerald-500/5 dark:bg-emerald-500/10 p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Badge className="bg-emerald-600 text-white font-bold text-xs px-2.5 py-0.5 gap-1">
                <Landmark className="w-3.5 h-3.5" /> Net Surplus for Bank Deposit
              </Badge>
              <span className="text-xs text-muted-foreground">Monthly Final Balance</span>
            </div>
            <p className="text-4xl font-extrabold text-foreground">
              {formatMoney(summary?.net_bank_deposit_surplus_poisha || summary?.net_cash_flow_poisha || 0)}
            </p>
            <p className="text-xs text-muted-foreground max-w-xl">
              Calculated as Total Rental Collections minus Caretaker/Guard Staff Salaries, Property Repairs, and Building Utilities. Available for direct deposit into Bariwala Bank Account.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 shrink-0 bg-card p-4 rounded-xl border border-border">
            <div>
              <p className="text-[11px] font-semibold text-muted-foreground uppercase">Staff Payroll Paid</p>
              <p className="text-lg font-extrabold text-foreground">
                {formatMoney(summary?.staff_payroll_expense_poisha || 0)}
              </p>
            </div>
            <div>
              <p className="text-[11px] font-semibold text-muted-foreground uppercase">Property Repairs</p>
              <p className="text-lg font-extrabold text-foreground">
                {formatMoney(summary?.property_repair_expense_poisha || 0)}
              </p>
            </div>
          </div>
        </div>
      </Card>

      {/* ---- Financial Key Metrics Grid ---- */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-border">
          <CardHeader className="py-3 px-4 flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-xs font-semibold text-muted-foreground">
              Total Gross Collections
            </CardTitle>
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-600">
              <TrendingUp className="w-4 h-4" />
            </div>
          </CardHeader>
          <CardContent className="px-4 pb-3">
            <p className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400">
              {formatMoney(summary?.total_collected_poisha || 0)}
            </p>
            <p className="text-[11px] text-muted-foreground mt-0.5">Rent & utility receipts</p>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardHeader className="py-3 px-4 flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-xs font-semibold text-muted-foreground">
              Total Building Outflows
            </CardTitle>
            <div className="p-2 rounded-lg bg-destructive/10 text-destructive">
              <TrendingDown className="w-4 h-4" />
            </div>
          </CardHeader>
          <CardContent className="px-4 pb-3">
            <p className="text-2xl font-extrabold text-destructive">
              {formatMoney(summary?.total_expense_poisha || 0)}
            </p>
            <p className="text-[11px] text-muted-foreground mt-0.5">Salaries + repairs + utilities</p>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardHeader className="py-3 px-4 flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-xs font-semibold text-muted-foreground">
              Collection Rate
            </CardTitle>
            <div className="p-2 rounded-lg bg-purple-500/10 text-purple-600">
              <PieChart className="w-4 h-4" />
            </div>
          </CardHeader>
          <CardContent className="px-4 pb-3">
            <p className="text-2xl font-extrabold text-foreground">
              {summary?.collection_rate_percentage || 100}%
            </p>
            <p className="text-[11px] text-muted-foreground mt-0.5">Billed vs. Collected ratio</p>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardHeader className="py-3 px-4 flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-xs font-semibold text-muted-foreground">
              Audit Logged Ledger
            </CardTitle>
            <div className="p-2 rounded-lg bg-blue-500/10 text-blue-600">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </CardHeader>
          <CardContent className="px-4 pb-3">
            <p className="text-2xl font-extrabold text-foreground">
              {recentLedger?.length || 0} Entries
            </p>
            <p className="text-[11px] text-muted-foreground mt-0.5">Double-entry verified</p>
          </CardContent>
        </Card>
      </div>

      {/* ---- Payment Channels Breakdown ---- */}
      <Card className="border-border">
        <CardHeader>
          <CardTitle className="text-base font-bold flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-primary" />
            Payment Method Collection Breakdown
          </CardTitle>
          <CardDescription>
            Gross collection share across Cash, bKash, Nagad, Rocket, and Bank Transfer.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="py-8 text-center text-sm text-muted-foreground flex items-center justify-center gap-2">
              <Loader2 className="w-5 h-5 animate-spin text-primary" /> Loading analytics...
            </div>
          ) : channels?.length === 0 ? (
            <p className="py-6 text-center text-xs text-muted-foreground">No completed payment records found.</p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
              {channels?.map((ch, idx) => (
                <div key={idx} className="p-3 bg-accent/30 rounded-xl border border-border space-y-1">
                  <Badge variant="outline" className="capitalize text-[10px] font-bold">
                    {ch.card_type || ch.payment_method}
                  </Badge>
                  <p className="text-lg font-extrabold text-foreground">{formatMoney(ch.total_amount)}</p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* ---- Audit General Ledger Table ---- */}
      <Card className="border-border">
        <CardHeader>
          <CardTitle className="text-base font-bold flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-primary" />
            Recent General Ledger Accounting Audit
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="py-8 text-center text-sm text-muted-foreground flex items-center justify-center gap-2">
              <Loader2 className="w-5 h-5 animate-spin text-primary" /> Loading ledger...
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Type</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead className="text-right">Amount (BDT)</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentLedger?.map((entry) => (
                  <TableRow key={entry.id}>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={`capitalize text-xs ${
                          entry.type === "income" ? "text-emerald-600 bg-emerald-500/10" : "text-destructive bg-destructive/10"
                        }`}
                      >
                        {entry.type}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs font-semibold capitalize">
                      {entry.category.replace("_", " ")}
                    </TableCell>
                    <TableCell className="text-xs font-medium text-foreground">
                      {entry.description}
                    </TableCell>
                    <TableCell className={`text-right font-extrabold ${entry.type === "income" ? "text-emerald-600" : "text-destructive"}`}>
                      {entry.type === "income" ? "+" : "-"}{formatMoney(entry.amount)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
