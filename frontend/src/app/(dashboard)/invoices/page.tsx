"use client";

import Link from "next/link";
import { useState } from "react";
import { useOrganization } from "@/hooks/use-organization";
import { useInvoices } from "@/hooks/use-invoice";
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
import { FileText, Plus, Search, Calendar, Home, Users, Loader2, DollarSign, AlertCircle, CheckCircle2 } from "lucide-react";

export default function InvoicesDirectoryPage() {
  const { activeOrgId } = useOrganization();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const { invoices, meta, isLoading } = useInvoices({
    organization_id: activeOrgId,
    search: searchTerm || undefined,
    status: statusFilter === "all" ? undefined : statusFilter,
  });

  const statusPills = [
    { id: "all", label: "All Invoices" },
    { id: "unpaid", label: "Unpaid" },
    { id: "overdue", label: "Overdue" },
    { id: "paid", label: "Paid" },
    { id: "partially_paid", label: "Partially Paid" },
  ];

  return (
    <div className="space-y-6">
      {/* ---- Header Section ---- */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Invoices & Rent Billing</h1>
          <p className="text-sm text-muted-foreground">
            Generate monthly rent bills, track due dates, and monitor collection status
          </p>
        </div>

        <Button asChild className="gap-2 font-semibold">
          <Link href="/invoices/new">
            <Plus className="w-4 h-4" /> Generate / Create Invoice
          </Link>
        </Button>
      </div>

      {/* ---- Summary Metric Cards ---- */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-border">
          <CardHeader className="py-3 px-4 flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-xs font-semibold text-muted-foreground">
              Total Billed Amount
            </CardTitle>
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              <FileText className="w-4 h-4" />
            </div>
          </CardHeader>
          <CardContent className="px-4 pb-3">
            <p className="text-2xl font-extrabold text-foreground">
              {formatMoney(meta.total_billed_poisha)}
            </p>
            <p className="text-[11px] text-muted-foreground mt-0.5">Total monthly invoices issued</p>
          </CardContent>
        </Card>

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
            <p className="text-[11px] text-muted-foreground mt-0.5">Payments received to date</p>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardHeader className="py-3 px-4 flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-xs font-semibold text-muted-foreground">
              Outstanding Unpaid Rent
            </CardTitle>
            <div className="p-2 rounded-lg bg-destructive/10 text-destructive">
              <AlertCircle className="w-4 h-4" />
            </div>
          </CardHeader>
          <CardContent className="px-4 pb-3">
            <p className="text-2xl font-extrabold text-destructive">
              {formatMoney(meta.total_outstanding_poisha)}
            </p>
            <p className="text-[11px] text-muted-foreground mt-0.5">Unpaid & overdue balances</p>
          </CardContent>
        </Card>
      </div>

      {/* ---- Filter Toolbar ---- */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-card p-4 rounded-xl border border-border">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by invoice # or tenant name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Status Filter Pills */}
        <div className="flex flex-wrap items-center gap-1.5">
          {statusPills.map((pill) => (
            <Button
              key={pill.id}
              variant={statusFilter === pill.id ? "default" : "outline"}
              size="sm"
              onClick={() => setStatusFilter(pill.id)}
              className="text-xs font-semibold capitalize"
            >
              {pill.label}
            </Button>
          ))}
        </div>
      </div>

      {/* ---- Invoices Directory Table ---- */}
      <Card className="border-border">
        <CardHeader>
          <CardTitle className="text-lg font-bold flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-primary" />
            Invoice Records Directory
          </CardTitle>
          <CardDescription>
            View monthly rent bills, due dates, and line itemized breakdown.
          </CardDescription>
        </CardHeader>

        <CardContent>
          {isLoading ? (
            <div className="py-12 text-center text-sm text-muted-foreground flex items-center justify-center gap-2">
              <Loader2 className="w-5 h-5 animate-spin text-primary" /> Loading invoices directory...
            </div>
          ) : invoices.length === 0 ? (
            <div className="py-12 text-center text-sm text-muted-foreground space-y-3">
              <FileText className="w-10 h-10 mx-auto text-muted-foreground" />
              <p className="font-semibold text-base">No Invoices Found</p>
              <p className="text-xs max-w-sm mx-auto">
                {searchTerm
                  ? "No invoices matched your search criteria."
                  : "No rent invoices have been issued yet. Click below to run the monthly bill generator."}
              </p>
              {!searchTerm && (
                <Button asChild size="sm" className="gap-2 font-semibold mt-2">
                  <Link href="/invoices/new">
                    <Plus className="w-4 h-4" /> Generate Invoices Now
                  </Link>
                </Button>
              )}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Invoice #</TableHead>
                  <TableHead>Tenant & Property</TableHead>
                  <TableHead>Billing Period</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead>Total Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {invoices.map((inv) => (
                  <TableRow key={inv.id}>
                    <TableCell className="font-bold font-mono">
                      <Link
                        href={`/invoices/${inv.id}`}
                        className="hover:text-primary transition-colors flex items-center gap-1.5"
                      >
                        <FileText className="w-4 h-4 text-primary" />
                        {inv.invoice_number}
                      </Link>
                    </TableCell>

                    <TableCell>
                      <div className="text-xs space-y-0.5">
                        <p className="font-semibold text-foreground flex items-center gap-1">
                          <Users className="w-3 h-3 text-muted-foreground" />
                          {inv.tenant?.name || "Tenant"}
                        </p>
                        <p className="text-muted-foreground flex items-center gap-1">
                          <Home className="w-3 h-3 text-muted-foreground" />
                          {inv.unit?.unit_number} ({inv.unit?.property?.name || "Property"})
                        </p>
                      </div>
                    </TableCell>

                    <TableCell className="text-xs font-medium">
                      {inv.billing_period_month}/{inv.billing_period_year}
                    </TableCell>

                    <TableCell>
                      <div className="text-xs flex items-center gap-1 font-medium">
                        <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
                        <span>{inv.due_date}</span>
                      </div>
                    </TableCell>

                    <TableCell className="font-extrabold text-foreground">
                      {formatMoney(inv.total_amount)}
                    </TableCell>

                    <TableCell>
                      <Badge
                        variant={inv.status === "paid" ? "default" : "outline"}
                        className={`capitalize text-xs ${
                          inv.status === "paid"
                            ? "bg-emerald-600 text-white"
                            : inv.status === "overdue"
                              ? "text-destructive border-destructive/20 bg-destructive/10"
                              : inv.status === "partially_paid"
                                ? "text-amber-600 border-amber-500/20 bg-amber-500/10"
                                : "text-primary border-primary/20 bg-primary/10"
                        }`}
                      >
                        {inv.status}
                      </Badge>
                    </TableCell>

                    <TableCell className="text-right">
                      <Button asChild variant="outline" size="sm" className="font-semibold text-xs">
                        <Link href={`/invoices/${inv.id}`}>View Invoice &rarr;</Link>
                      </Button>
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
