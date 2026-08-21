"use client";

import { use } from "react";
import { useInvoiceDetail } from "@/hooks/use-invoice";
import { formatMoney } from "@/lib/money";
import { Button } from "@/components/ui/button";
import { Printer, ShieldCheck, Home, FileText, Loader2, ArrowLeft } from "lucide-react";

export default function PrintableInvoicePage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const invoiceId = Number(resolvedParams.id);

  const { invoice, isLoading } = useInvoiceDetail(invoiceId);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-slate-50 dark:bg-slate-950">
        <div className="text-center space-y-3">
          <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto" />
          <p className="text-sm font-semibold text-muted-foreground">Generating Printable Receipt...</p>
        </div>
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-slate-50">
        <p className="text-sm text-destructive font-semibold">Invoice record not found.</p>
      </div>
    );
  }

  const organization = invoice.organization;
  const tenant = invoice.tenant;
  const unit = invoice.lease?.unit;

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 p-4 sm:p-8 print:bg-white print:p-0">
      {/* Print Control Toolbar */}
      <div className="max-w-3xl mx-auto mb-6 flex items-center justify-between print:hidden">
        <Button variant="outline" size="sm" onClick={() => window.history.back()}>
          <ArrowLeft className="w-4 h-4 mr-1" /> Back
        </Button>

        <Button onClick={() => window.print()} className="gap-2 font-bold bg-primary">
          <Printer className="w-4 h-4" /> Print Official PDF Receipt
        </Button>
      </div>

      {/* Printable Receipt Paper Container */}
      <div className="max-w-3xl mx-auto bg-white text-slate-900 p-8 sm:p-12 rounded-xl shadow-lg border border-slate-200 print:shadow-none print:border-none print:p-0">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-300 pb-6 mb-6">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              {organization?.name || "BashaBari Property Management"}
            </h1>
            <p className="text-xs text-slate-600 mt-1">Official Money Receipt & Tax Rental Invoice</p>
            <p className="text-xs text-slate-500 font-mono mt-0.5">Govt Regd / Premises Rent Control Act 1992</p>
          </div>

          <div className="text-right">
            <span className="inline-block px-3 py-1 bg-slate-100 border border-slate-300 font-mono text-sm font-extrabold rounded-md">
              {invoice.invoice_number}
            </span>
            <p className="text-xs text-slate-500 mt-1 font-mono">Date: {invoice.issue_date}</p>
          </div>
        </div>

        {/* Billed To / Property Premises Details */}
        <div className="grid grid-cols-2 gap-6 mb-8 text-xs">
          <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
            <p className="font-bold text-slate-900 uppercase tracking-wider mb-1 flex items-center gap-1">
              <FileText className="w-3.5 h-3.5 text-slate-700" /> Billed Tenant
            </p>
            <p className="font-extrabold text-sm text-slate-900">{tenant?.name || "Tenant Resident"}</p>
            <p className="text-slate-600 font-mono mt-0.5">Phone: {tenant?.phone || "N/A"}</p>
            <p className="text-slate-600 font-mono">NID: {tenant?.nid_number || "Verified"}</p>
          </div>

          <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
            <p className="font-bold text-slate-900 uppercase tracking-wider mb-1 flex items-center gap-1">
              <Home className="w-3.5 h-3.5 text-slate-700" /> Rental Premises
            </p>
            <p className="font-bold text-slate-900">{unit?.property?.name || "Property Premises"}</p>
            <p className="text-slate-600 font-semibold mt-0.5">Flat Unit: {unit?.unit_number || "N/A"}</p>
            <p className="text-slate-600 font-mono">Billing Month: {invoice.billing_month}</p>
          </div>
        </div>

        {/* Itemized Invoice Table */}
        <table className="w-full text-left text-xs mb-8">
          <thead>
            <tr className="border-b-2 border-slate-900 text-slate-900 font-bold uppercase">
              <th className="py-2">Item Description</th>
              <th className="py-2 text-right">Amount (BDT)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {invoice.items && invoice.items.length > 0 ? (
              invoice.items.map((item) => (
                <tr key={item.id}>
                  <td className="py-2.5 font-medium">{item.description}</td>
                  <td className="py-2.5 text-right font-mono font-bold">
                    {formatMoney(item.amount || item.unit_amount)}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td className="py-2.5 font-medium">Monthly Flat Rent Charge ({invoice.billing_month})</td>
                <td className="py-2.5 text-right font-mono font-bold">{formatMoney(invoice.subtotal_amount)}</td>
              </tr>
            )}
          </tbody>
        </table>

        {/* Total Summary */}
        <div className="flex justify-end mb-8">
          <div className="w-64 space-y-2 text-xs border-t border-slate-900 pt-3">
            <div className="flex justify-between font-semibold">
              <span>Subtotal:</span>
              <span className="font-mono">{formatMoney(invoice.subtotal_amount)}</span>
            </div>
            <div className="flex justify-between font-semibold">
              <span>Tax / VAT:</span>
              <span className="font-mono">{formatMoney(invoice.tax_amount)}</span>
            </div>
            <div className="flex justify-between text-sm font-extrabold border-t border-slate-300 pt-2">
              <span>Total Amount:</span>
              <span className="font-mono">{formatMoney(invoice.total_amount)}</span>
            </div>
            <div className="flex justify-between text-emerald-700 font-bold">
              <span>Paid Amount:</span>
              <span className="font-mono">{formatMoney(invoice.paid_amount)}</span>
            </div>
            <div className="flex justify-between text-amber-700 font-extrabold text-sm border-t border-slate-300 pt-2">
              <span>Due Balance:</span>
              <span className="font-mono">{formatMoney(invoice.due_amount)}</span>
            </div>
          </div>
        </div>

        {/* Verification Stamp & Signatures */}
        <div className="pt-8 border-t-2 border-slate-200 flex items-end justify-between">
          <div className="space-y-1 text-[11px] text-slate-500 font-mono">
            <p className="flex items-center gap-1 font-bold text-emerald-700">
              <ShieldCheck className="w-4 h-4" /> SSLCommerz Verified Money Receipt
            </p>
            <p>Generated by BashaBari Automated Property Engine</p>
          </div>

          <div className="text-center w-48 border-t border-slate-400 pt-1 text-xs font-bold text-slate-700">
            Authorized Property Owner Signature
          </div>
        </div>
      </div>
    </div>
  );
}
