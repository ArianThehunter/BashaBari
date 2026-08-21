"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useInvoiceDetail } from "@/hooks/use-invoice";
import { formatMoney } from "@/lib/money";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
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
  ArrowLeft,
  Calendar,
  Home,
  Users,
  Printer,
  Building2,
  Loader2,
  Phone,
  Mail,
  MapPin,
} from "lucide-react";

export default function InvoiceDetailPrintablePage() {
  const params = useParams();
  const invoiceId = Number(params.id);

  const { invoice, isLoading } = useInvoiceDetail(invoiceId);

  const handlePrint = () => {
    if (typeof window !== "undefined") {
      window.print();
    }
  };

  if (isLoading) {
    return (
      <div className="py-16 text-center text-sm text-muted-foreground flex items-center justify-center gap-2">
        <Loader2 className="w-6 h-6 animate-spin text-primary" /> Loading printable invoice...
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="text-center py-12 space-y-3">
        <h2 className="text-xl font-bold">Invoice Not Found</h2>
        <p className="text-sm text-muted-foreground">The invoice you requested does not exist or was deleted.</p>
        <Button asChild variant="outline">
          <Link href="/invoices">&larr; Back to Invoices</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* ---- Navigation & Action Toolbar (Hidden during print) ---- */}
      <div className="flex items-center justify-between print:hidden">
        <Button asChild variant="ghost" size="sm">
          <Link href="/invoices">
            <ArrowLeft className="w-4 h-4 mr-1" /> Back to Invoices Directory
          </Link>
        </Button>

        <Button onClick={handlePrint} className="gap-2 font-semibold">
          <Printer className="w-4 h-4" /> Print / Save PDF
        </Button>
      </div>

      {/* ---- Printable Invoice Canvas Card ---- */}
      <Card className="border-border shadow-md print:shadow-none print:border-none">
        <CardHeader className="border-b border-border pb-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            {/* Organization Letterhead */}
            <div className="space-y-1">
              <h2 className="text-xl font-extrabold text-primary flex items-center gap-2">
                <Building2 className="w-6 h-6" />
                {invoice.organization?.name || "BashaBari Property Management"}
              </h2>
              {invoice.organization?.address && (
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 shrink-0" />
                  {invoice.organization.address}
                </p>
              )}
              <div className="flex items-center gap-3 text-xs text-muted-foreground pt-0.5">
                {invoice.organization?.phone && (
                  <span className="flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5" /> {invoice.organization.phone}
                  </span>
                )}
                {invoice.organization?.email && (
                  <span className="flex items-center gap-1">
                    <Mail className="w-3.5 h-3.5" /> {invoice.organization.email}
                  </span>
                )}
              </div>
            </div>

            {/* Invoice Meta Header */}
            <div className="text-left sm:text-right space-y-1">
              <h1 className="text-2xl font-black font-mono tracking-tight text-foreground">
                {invoice.invoice_number}
              </h1>
              <Badge
                variant={invoice.status === "paid" ? "default" : "outline"}
                className={`capitalize text-xs px-3 py-0.5 ${
                  invoice.status === "paid"
                    ? "bg-emerald-600 text-white"
                    : invoice.status === "overdue"
                      ? "text-destructive border-destructive/20 bg-destructive/10"
                      : "text-primary border-primary/20 bg-primary/10"
                }`}
              >
                {invoice.status}
              </Badge>
              <p className="text-xs text-muted-foreground flex items-center justify-start sm:justify-end gap-1 pt-1">
                <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
                Issue: {invoice.issue_date} • Due: <strong>{invoice.due_date}</strong>
              </p>
            </div>
          </div>
        </CardHeader>

        <CardContent className="py-6 space-y-6">
          {/* Bill-To & Location Details Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 p-4 bg-accent/30 rounded-xl border border-border">
            {/* Bill To */}
            <div className="space-y-1 text-xs">
              <span className="text-muted-foreground uppercase font-bold text-[10px] tracking-wider block mb-1">
                Bill To (Tenant):
              </span>
              <p className="font-bold text-sm text-foreground flex items-center gap-1">
                <Users className="w-4 h-4 text-primary shrink-0" />
                {invoice.tenant?.name || "Tenant"}
              </p>
              <p className="text-muted-foreground flex items-center gap-1">
                <Phone className="w-3.5 h-3.5" /> {invoice.tenant?.phone}
              </p>
              {invoice.tenant?.email && (
                <p className="text-muted-foreground flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5" /> {invoice.tenant.email}
                </p>
              )}
            </div>

            {/* Flat Unit Details */}
            <div className="space-y-1 text-xs">
              <span className="text-muted-foreground uppercase font-bold text-[10px] tracking-wider block mb-1">
                Flat Unit Location:
              </span>
              <p className="font-bold text-sm text-foreground flex items-center gap-1">
                <Home className="w-4 h-4 text-primary shrink-0" />
                {invoice.unit?.unit_number || "Unit"}
              </p>
              <p className="text-muted-foreground">
                {[invoice.unit?.building?.name, invoice.unit?.floor?.name].filter(Boolean).join(" • ")}
              </p>
              <p className="text-primary font-semibold">
                {invoice.unit?.property?.name}
              </p>
            </div>
          </div>

          {/* Line Items Table */}
          <div className="space-y-2">
            <h3 className="text-sm font-bold text-foreground">Line Item Breakdown</h3>
            <Table>
              <TableHeader>
                <TableRow className="bg-accent/40">
                  <TableHead className="w-12">#</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead className="text-center">Qty</TableHead>
                  <TableHead className="text-right">Unit Rate (BDT)</TableHead>
                  <TableHead className="text-right">Total (BDT)</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {invoice.items?.map((item, idx) => (
                  <TableRow key={item.id}>
                    <TableCell className="text-xs text-muted-foreground">{idx + 1}</TableCell>
                    <TableCell className="font-medium text-sm text-foreground">
                      {item.description}
                    </TableCell>
                    <TableCell className="text-center text-xs font-semibold">
                      {item.quantity}
                    </TableCell>
                    <TableCell className="text-right text-xs">
                      {formatMoney(item.unit_amount)}
                    </TableCell>
                    <TableCell className="text-right font-bold text-sm">
                      {formatMoney(item.total_amount)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Payment Summary Footer */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6 pt-4 border-t border-border">
            <div className="space-y-1 max-w-xs text-xs text-muted-foreground">
              {invoice.notes && (
                <div>
                  <span className="font-bold text-foreground block">Notes:</span>
                  <p>{invoice.notes}</p>
                </div>
              )}
              <div className="pt-2 text-[10px]">
                <p>Computer-generated digital invoice issued by BashaBari.</p>
              </div>
            </div>

            <div className="w-full sm:w-72 bg-accent/40 p-4 rounded-xl space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-border/50">
                <span className="text-muted-foreground">Subtotal:</span>
                <span className="font-semibold">{formatMoney(invoice.subtotal_amount)}</span>
              </div>

              {invoice.tax_amount > 0 && (
                <div className="flex justify-between py-1 border-b border-border/50">
                  <span className="text-muted-foreground">Tax:</span>
                  <span className="font-semibold">{formatMoney(invoice.tax_amount)}</span>
                </div>
              )}

              {invoice.late_fee_amount > 0 && (
                <div className="flex justify-between py-1 border-b border-border/50 text-destructive">
                  <span>Late Fee:</span>
                  <span className="font-semibold">{formatMoney(invoice.late_fee_amount)}</span>
                </div>
              )}

              <div className="flex justify-between py-2 font-extrabold text-base border-b border-border text-foreground">
                <span>Total Billed:</span>
                <span>{formatMoney(invoice.total_amount)}</span>
              </div>

              <div className="flex justify-between py-1 text-emerald-600 dark:text-emerald-400 font-semibold">
                <span>Paid Amount:</span>
                <span>{formatMoney(invoice.paid_amount)}</span>
              </div>

              <div className="flex justify-between py-1 text-destructive font-extrabold text-sm pt-1">
                <span>Due Balance:</span>
                <span>{formatMoney(invoice.due_amount)}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
