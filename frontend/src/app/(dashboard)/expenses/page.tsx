"use client";

import Link from "next/link";
import { useState } from "react";
import { useOrganization } from "@/hooks/use-organization";
import { useExpenses } from "@/hooks/use-expense";
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
import { DollarSign, Plus, Search, Calendar, Home, Loader2, FileText, ShoppingBag } from "lucide-react";

export default function ExpensesDirectoryPage() {
  const { activeOrgId } = useOrganization();
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");

  const { expenses, meta, isLoading } = useExpenses({
    organization_id: activeOrgId,
    search: searchTerm || undefined,
    category: categoryFilter === "all" ? undefined : categoryFilter,
  });

  const categoryPills = [
    { id: "all", label: "All Categories" },
    { id: "plumbing", label: "Plumbing" },
    { id: "electrical", label: "Electrical" },
    { id: "painting", label: "Painting" },
    { id: "elevator", label: "Elevator" },
    { id: "utility_bill", label: "Utility Bill" },
    { id: "tax", label: "Tax & Compliance" },
    { id: "repairs", label: "Repairs" },
  ];

  return (
    <div className="space-y-6">
      {/* ---- Header Section ---- */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Property Operating Expenses</h1>
          <p className="text-sm text-muted-foreground">
            Track vendor payments, utility bills, maintenance expenses, and double-entry ledger logs
          </p>
        </div>

        <Button asChild className="gap-2 font-semibold">
          <Link href="/expenses/new">
            <Plus className="w-4 h-4" /> Log Operating Expense
          </Link>
        </Button>
      </div>

      {/* ---- Summary Metric Cards ---- */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card className="border-border">
          <CardHeader className="py-3 px-4 flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-xs font-semibold text-muted-foreground">
              Total Operating Expenses
            </CardTitle>
            <div className="p-2 rounded-lg bg-destructive/10 text-destructive">
              <DollarSign className="w-4 h-4" />
            </div>
          </CardHeader>
          <CardContent className="px-4 pb-3">
            <p className="text-2xl font-extrabold text-destructive">
              {formatMoney(meta.total_expenses_poisha)}
            </p>
            <p className="text-[11px] text-muted-foreground mt-0.5">Total logged operational costs</p>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardHeader className="py-3 px-4 flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-xs font-semibold text-muted-foreground">
              Total Expense Records
            </CardTitle>
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              <FileText className="w-4 h-4" />
            </div>
          </CardHeader>
          <CardContent className="px-4 pb-3">
            <p className="text-2xl font-extrabold text-foreground">{meta.total_records}</p>
            <p className="text-[11px] text-muted-foreground mt-0.5">Logged receipts & bills</p>
          </CardContent>
        </Card>
      </div>

      {/* ---- Filter Toolbar ---- */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-card p-4 rounded-xl border border-border">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by expense #, vendor, or notes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Category Filter Pills */}
        <div className="flex flex-wrap items-center gap-1.5">
          {categoryPills.map((pill) => (
            <Button
              key={pill.id}
              variant={categoryFilter === pill.id ? "default" : "outline"}
              size="sm"
              onClick={() => setCategoryFilter(pill.id)}
              className="text-xs font-semibold capitalize"
            >
              {pill.label}
            </Button>
          ))}
        </div>
      </div>

      {/* ---- Expenses Directory Table ---- */}
      <Card className="border-border">
        <CardHeader>
          <CardTitle className="text-lg font-bold flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-primary" />
            Property Operating Expense Records
          </CardTitle>
          <CardDescription>
            Vendor bill logs, payment methods, and double-entry ledger integration.
          </CardDescription>
        </CardHeader>

        <CardContent>
          {isLoading ? (
            <div className="py-12 text-center text-sm text-muted-foreground flex items-center justify-center gap-2">
              <Loader2 className="w-5 h-5 animate-spin text-primary" /> Loading expense records...
            </div>
          ) : expenses.length === 0 ? (
            <div className="py-12 text-center text-sm text-muted-foreground space-y-3">
              <ShoppingBag className="w-10 h-10 mx-auto text-muted-foreground" />
              <p className="font-semibold text-base">No Operating Expenses Found</p>
              <p className="text-xs max-w-sm mx-auto">
                No expense records match your search. Click below to log a new vendor bill or repair cost.
              </p>
              <Button asChild size="sm" className="gap-2 font-semibold mt-2">
                <Link href="/expenses/new">
                  <Plus className="w-4 h-4" /> Log Operating Expense
                </Link>
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Expense # & Category</TableHead>
                  <TableHead>Property & Location</TableHead>
                  <TableHead>Vendor Name</TableHead>
                  <TableHead>Expense Date</TableHead>
                  <TableHead>Payment Method</TableHead>
                  <TableHead className="text-right">Amount (BDT)</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {expenses.map((e) => (
                  <TableRow key={e.id}>
                    <TableCell className="font-bold">
                      <div className="space-y-0.5 font-mono text-xs">
                        <p className="text-foreground">{e.expense_number}</p>
                        <Badge variant="outline" className="capitalize text-[10px] font-bold bg-accent/30 font-sans">
                          {e.category.replace("_", " ")}
                        </Badge>
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="text-xs">
                        <p className="font-semibold text-foreground flex items-center gap-1">
                          <Home className="w-3.5 h-3.5 text-primary" />
                          {e.property?.name || "General Property"}
                        </p>
                        {e.unit && <p className="text-muted-foreground">{e.unit.unit_number}</p>}
                      </div>
                    </TableCell>

                    <TableCell className="text-xs font-semibold">
                      {e.vendor_name || <span className="text-muted-foreground italic font-normal">N/A</span>}
                    </TableCell>

                    <TableCell>
                      <div className="text-xs flex items-center gap-1 font-medium">
                        <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
                        <span>{e.expense_date}</span>
                      </div>
                    </TableCell>

                    <TableCell>
                      <Badge variant="outline" className="capitalize text-xs font-medium">
                        {e.payment_method}
                      </Badge>
                    </TableCell>

                    <TableCell className="text-right font-extrabold text-destructive text-sm">
                      -{formatMoney(e.amount)}
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
