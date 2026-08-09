"use client";

import Link from "next/link";
import { useState } from "react";
import { useOrganization } from "@/hooks/use-organization";
import { usePayments } from "@/hooks/use-payment";
import { formatMoney } from "@/lib/money";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { Plus, Search, Calendar, Users, Loader2, CreditCard, ShieldCheck, CheckCircle2, RefreshCw } from "lucide-react";

export default function PaymentsDirectoryPage() {
  const { activeOrgId } = useOrganization();
  const [searchTerm, setSearchTerm] = useState("");
  const [methodFilter, setMethodFilter] = useState<string>("all");

  const { payments, meta, isLoading, refundPayment, isRefundingPayment } = usePayments({
    organization_id: activeOrgId,
    search: searchTerm || undefined,
    payment_method: methodFilter === "all" ? undefined : methodFilter,
  });

  const methodPills = [
    { id: "all", label: "All Methods" },
    { id: "sslcommerz", label: "SSLCommerz" },
    { id: "bkash", label: "bKash" },
    { id: "nagad", label: "Nagad" },
    { id: "rocket", label: "Rocket" },
    { id: "bank_transfer", label: "Bank Transfer" },
    { id: "cash", label: "Cash" },
  ];

  return (
    <div className="space-y-6">
      {/* ---- Header Section ---- */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Payments & SSLCommerz Transactions</h1>
          <p className="text-sm text-muted-foreground">
            Track online SSLCommerz gateway payments (bKash, Nagad, Cards) and manual offline receipts
          </p>
        </div>

        <Button asChild className="gap-2 font-semibold">
          <Link href="/payments/new">
            <Plus className="w-4 h-4" /> Pay via Gateway / Record Payment
          </Link>
        </Button>
      </div>

      {/* ---- Summary Metric Cards ---- */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card className="border-border">
          <CardHeader className="py-3 px-4 flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-xs font-semibold text-muted-foreground">
              Total Revenue Collected
            </CardTitle>
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-600">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </CardHeader>
          <CardContent className="px-4 pb-3">
            <p className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400">
              {formatMoney(meta.total_collected_poisha)}
            </p>
            <p className="text-[11px] text-muted-foreground mt-0.5">Completed payment receipts</p>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardHeader className="py-3 px-4 flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-xs font-semibold text-muted-foreground">
              Total Refunded Amount
            </CardTitle>
            <div className="p-2 rounded-lg bg-destructive/10 text-destructive">
              <RefreshCw className="w-4 h-4" />
            </div>
          </CardHeader>
          <CardContent className="px-4 pb-3">
            <p className="text-2xl font-extrabold text-destructive">
              {formatMoney(meta.total_refunded_poisha)}
            </p>
            <p className="text-[11px] text-muted-foreground mt-0.5">BD-008 advance rent refunds</p>
          </CardContent>
        </Card>
      </div>

      {/* ---- Filter Toolbar ---- */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-card p-4 rounded-xl border border-border">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by transaction #, val_id, or tenant..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Method Filter Pills */}
        <div className="flex flex-wrap items-center gap-1.5">
          {methodPills.map((pill) => (
            <Button
              key={pill.id}
              variant={methodFilter === pill.id ? "default" : "outline"}
              size="sm"
              onClick={() => setMethodFilter(pill.id)}
              className="text-xs font-semibold capitalize"
            >
              {pill.label}
            </Button>
          ))}
        </div>
      </div>

      {/* ---- Payments Records Table ---- */}
      <Card className="border-border">
        <CardHeader>
          <CardTitle className="text-lg font-bold flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-primary" />
            Payment Transactions Directory
          </CardTitle>
          <CardDescription>
            Transaction log with SSLCommerz Validation IDs (`val_id`) and invoice reconciliation details.
          </CardDescription>
        </CardHeader>

        <CardContent>
          {isLoading ? (
            <div className="py-12 text-center text-sm text-muted-foreground flex items-center justify-center gap-2">
              <Loader2 className="w-5 h-5 animate-spin text-primary" /> Loading transaction directory...
            </div>
          ) : payments.length === 0 ? (
            <div className="py-12 text-center text-sm text-muted-foreground space-y-3">
              <CreditCard className="w-10 h-10 mx-auto text-muted-foreground" />
              <p className="font-semibold text-base">No Payment Transactions Found</p>
              <p className="text-xs max-w-sm mx-auto">
                No payment transactions match your search. Pay via SSLCommerz or record a manual receipt below.
              </p>
              <Button asChild size="sm" className="gap-2 font-semibold mt-2">
                <Link href="/payments/new">
                  <Plus className="w-4 h-4" /> Pay / Record Payment
                </Link>
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Transaction # / Val ID</TableHead>
                  <TableHead>Tenant</TableHead>
                  <TableHead>Channel & Method</TableHead>
                  <TableHead>Payment Date</TableHead>
                  <TableHead>Amount (BDT)</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {payments.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell className="font-bold">
                      <div className="space-y-0.5 font-mono text-xs">
                        <p className="text-foreground flex items-center gap-1">
                          <CreditCard className="w-3.5 h-3.5 text-primary shrink-0" />
                          {p.transaction_number}
                        </p>
                        {p.val_id && (
                          <p className="text-[10px] text-muted-foreground flex items-center gap-1 font-sans">
                            <ShieldCheck className="w-3 h-3 text-emerald-600 shrink-0" />
                            Val ID: {p.val_id}
                          </p>
                        )}
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="text-xs">
                        <p className="font-semibold text-foreground flex items-center gap-1">
                          <Users className="w-3 h-3 text-muted-foreground" />
                          {p.tenant?.name || "Tenant"}
                        </p>
                        {p.invoice && (
                          <p className="text-[11px] text-muted-foreground font-mono">
                            Invoice: {p.invoice.invoice_number}
                          </p>
                        )}
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="text-xs space-y-0.5">
                        <Badge variant="outline" className="capitalize text-[11px] font-semibold bg-accent/30">
                          {p.card_type || p.payment_method}
                        </Badge>
                        {p.card_no && <p className="text-[10px] text-muted-foreground">{p.card_no}</p>}
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="text-xs flex items-center gap-1 font-medium">
                        <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
                        <span>{p.payment_date}</span>
                      </div>
                    </TableCell>

                    <TableCell className="font-extrabold text-foreground">
                      {formatMoney(p.amount)}
                    </TableCell>

                    <TableCell>
                      <Badge
                        variant={p.status === "completed" ? "default" : "outline"}
                        className={`capitalize text-xs ${
                          p.status === "completed"
                            ? "bg-emerald-600 text-white"
                            : p.status === "refunded"
                              ? "text-destructive border-destructive/20 bg-destructive/10"
                              : "text-primary border-primary/20 bg-primary/10"
                        }`}
                      >
                        {p.status}
                      </Badge>
                    </TableCell>

                    <TableCell className="text-right">
                      {p.status === "completed" && (
                        <Button
                          variant="ghost"
                          size="sm"
                          disabled={isRefundingPayment}
                          onClick={() => refundPayment(p.id)}
                          className="text-xs text-destructive hover:bg-destructive/10 font-semibold"
                        >
                          <RefreshCw className="w-3.5 h-3.5 mr-1" /> Refund (BD-008)
                        </Button>
                      )}
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
