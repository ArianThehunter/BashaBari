"use client";

import { useOrganization } from "@/hooks/use-organization";
import { useFinancialReport } from "@/hooks/use-payment";
import { formatMoney } from "@/lib/money";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { DollarSign, TrendingUp, TrendingDown, CreditCard, ShieldCheck, Loader2, PieChart, ArrowUpRight, ArrowDownRight, Calendar } from "lucide-react";

export default function FinancialsDashboardPage() {
  const { activeOrgId } = useOrganization();
  const { summary, channels, recentLedger, isLoading } = useFinancialReport(activeOrgId);

  return (
    <div className="space-y-6">
      {/* ---- Header Section ---- */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Financial Accounting & Cash Flow</h1>
          <p className="text-sm text-muted-foreground">
            Double-entry general ledger, SSLCommerz revenue channels, and net cash flow analytics
          </p>
        </div>
      </div>

      {/* ---- Summary Metric Cards ---- */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Income */}
        <Card className="border-border">
          <CardHeader className="py-3 px-4 flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-xs font-semibold text-muted-foreground">
              Total Gross Revenue
            </CardTitle>
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-600">
              <TrendingUp className="w-4 h-4" />
            </div>
          </CardHeader>
          <CardContent className="px-4 pb-3">
            <p className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400">
              {formatMoney(summary.total_income_poisha)}
            </p>
            <p className="text-[11px] text-muted-foreground mt-0.5">Total collected rental income</p>
          </CardContent>
        </Card>

        {/* Total Expenses / Refunds */}
        <Card className="border-border">
          <CardHeader className="py-3 px-4 flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-xs font-semibold text-muted-foreground">
              Total Expenses & Refunds
            </CardTitle>
            <div className="p-2 rounded-lg bg-destructive/10 text-destructive">
              <TrendingDown className="w-4 h-4" />
            </div>
          </CardHeader>
          <CardContent className="px-4 pb-3">
            <p className="text-2xl font-extrabold text-destructive">
              {formatMoney(summary.total_expense_poisha)}
            </p>
            <p className="text-[11px] text-muted-foreground mt-0.5">BD-008 refunds & expenses</p>
          </CardContent>
        </Card>

        {/* Net Cash Flow */}
        <Card className="border-border">
          <CardHeader className="py-3 px-4 flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-xs font-semibold text-muted-foreground">
              Net Cash Flow
            </CardTitle>
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              <DollarSign className="w-4 h-4" />
            </div>
          </CardHeader>
          <CardContent className="px-4 pb-3">
            <p className="text-2xl font-extrabold text-foreground">
              {formatMoney(summary.net_cash_flow_poisha)}
            </p>
            <p className="text-[11px] text-muted-foreground mt-0.5">Net cash position</p>
          </CardContent>
        </Card>

        {/* Collection Efficiency Percentage */}
        <Card className="border-border">
          <CardHeader className="py-3 px-4 flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-xs font-semibold text-muted-foreground">
              Collection Efficiency
            </CardTitle>
            <div className="p-2 rounded-lg bg-purple-500/10 text-purple-600">
              <PieChart className="w-4 h-4" />
            </div>
          </CardHeader>
          <CardContent className="px-4 pb-3">
            <p className="text-2xl font-extrabold text-foreground">
              {summary.collection_rate_percentage}%
            </p>
            <div className="w-full bg-accent h-1.5 rounded-full overflow-hidden mt-1.5">
              <div
                className="bg-purple-600 h-full transition-all"
                style={{ width: `${Math.min(summary.collection_rate_percentage, 100)}%` }}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ---- Revenue Channels Grid ---- */}
      <Card className="border-border">
        <CardHeader>
          <CardTitle className="text-base font-bold flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-primary" />
            Revenue Breakdown by SSLCommerz Payment Channel
          </CardTitle>
          <CardDescription>
            Gross collection breakdown across bKash, Nagad, Rocket, Cards, and Cash.
          </CardDescription>
        </CardHeader>

        <CardContent>
          {isLoading ? (
            <div className="py-8 text-center text-sm text-muted-foreground flex items-center justify-center gap-2">
              <Loader2 className="w-5 h-5 animate-spin text-primary" /> Loading revenue breakdown...
            </div>
          ) : channels.length === 0 ? (
            <p className="py-6 text-center text-xs text-muted-foreground">No completed payment channels yet.</p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              {channels.map((ch, idx) => (
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

      {/* ---- Double-Entry General Ledger Table ---- */}
      <Card className="border-border">
        <CardHeader>
          <CardTitle className="text-base font-bold flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-primary" />
            Double-Entry General Ledger Transactions
          </CardTitle>
          <CardDescription>
            Audit log of all income, refund, and expense ledger entries.
          </CardDescription>
        </CardHeader>

        <CardContent>
          {isLoading ? (
            <div className="py-12 text-center text-sm text-muted-foreground flex items-center justify-center gap-2">
              <Loader2 className="w-5 h-5 animate-spin text-primary" /> Loading general ledger...
            </div>
          ) : recentLedger.length === 0 ? (
            <p className="py-8 text-center text-xs text-muted-foreground">No ledger transactions recorded yet.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Type</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Amount (BDT)</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {recentLedger.map((entry) => (
                  <TableRow key={entry.id}>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={`capitalize text-xs flex items-center gap-1 w-fit ${
                          entry.type === "income"
                            ? "text-emerald-600 border-emerald-500/20 bg-emerald-500/10"
                            : "text-destructive border-destructive/20 bg-destructive/10"
                        }`}
                      >
                        {entry.type === "income" ? (
                          <ArrowUpRight className="w-3 h-3" />
                        ) : (
                          <ArrowDownRight className="w-3 h-3" />
                        )}
                        {entry.type}
                      </Badge>
                    </TableCell>

                    <TableCell className="text-xs font-semibold capitalize">
                      {entry.category.replace("_", " ")}
                    </TableCell>

                    <TableCell className="text-xs font-medium text-foreground">
                      {entry.description}
                    </TableCell>

                    <TableCell className="text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        {entry.entry_date}
                      </div>
                    </TableCell>

                    <TableCell className={`text-right font-extrabold ${entry.type === "income" ? "text-emerald-600 dark:text-emerald-400" : "text-destructive"}`}>
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
