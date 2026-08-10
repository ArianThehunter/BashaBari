"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  BookOpen,
  Receipt,
  CreditCard,
  Wrench,
  LogOut,
  FileCheck2,
  CheckCircle2,
  ArrowLeft,
  HelpCircle,
  Smartphone,
} from "lucide-react";

export default function TenantGuidePage() {
  return (
    <div className="space-y-8 max-w-4xl">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-border pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold mb-2">
            <BookOpen className="w-4 h-4" /> First-Time Tenant Guide
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Tenant Portal Onboarding &amp; Tutorial
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Learn how to view your rent invoices, pay online via bKash/Nagad, request repairs, and download receipts.
          </p>
        </div>

        <Button asChild variant="outline" size="sm">
          <Link href="/tenant-portal">
            <ArrowLeft className="w-4 h-4 mr-1" /> Back to Dashboard
          </Link>
        </Button>
      </div>

      {/* Workflow Step 1: Viewing Invoices */}
      <Card className="border-border bg-card">
        <CardHeader className="border-b border-border bg-accent/30 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm">
              1
            </div>
            <div>
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <Receipt className="w-4 h-4 text-primary" />
                Viewing Rent &amp; Utility Invoices
              </CardTitle>
              <p className="text-xs text-muted-foreground">How monthly billing works on BashaBari</p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6 space-y-3 text-xs sm:text-sm text-muted-foreground leading-relaxed">
          <p>
            Every month, your landlord or caretaker generates your itemized monthly rent invoice (`INV-YYYYMM-XXX`). You will automatically receive an SMS notification on your mobile phone.
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-foreground/90">
            <li>Navigate to <strong>&quot;My Rent &amp; Invoices&quot;</strong> in the sidebar.</li>
            <li>Click on any invoice to view the exact breakdown of base rent, sub-meter electricity (DPDC/DESCO), gas, and WASA water charges.</li>
            <li>Invoices are calculated using the <strong>Integer Poisha Standard</strong> to ensure 100% mathematical accuracy without rounding errors.</li>
          </ul>
        </CardContent>
      </Card>

      {/* Workflow Step 2: 1-Click Online Payment */}
      <Card className="border-border bg-card">
        <CardHeader className="border-b border-border bg-accent/30 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold text-sm">
              2
            </div>
            <div>
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                Paying Rent via bKash, Nagad &amp; SSLCommerz
              </CardTitle>
              <p className="text-xs text-muted-foreground">1-Click instant online checkout</p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6 space-y-3 text-xs sm:text-sm text-muted-foreground leading-relaxed">
          <p>
            You can pay your rent instantly using Mobile Financial Services (MFS) or Debit/Credit Cards through SSLCommerz PCI-DSS certified gateway.
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-foreground/90">
            <li>Click the green <strong>&quot;Pay Now via bKash / Nagad&quot;</strong> button on any due invoice.</li>
            <li>Select your preferred payment method (bKash, Nagad, Rocket, Visa/Mastercard).</li>
            <li>Once confirmed, the invoice status changes immediately to <strong className="text-emerald-600 dark:text-emerald-400">Paid</strong> and an official printable PDF receipt is issued.</li>
          </ul>
        </CardContent>
      </Card>

      {/* Workflow Step 3: Maintenance Tickets */}
      <Card className="border-border bg-card">
        <CardHeader className="border-b border-border bg-accent/30 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-600 text-white flex items-center justify-center font-bold text-sm">
              3
            </div>
            <div>
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <Wrench className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                Submitting Maintenance &amp; Repair Tickets
              </CardTitle>
              <p className="text-xs text-muted-foreground">Report plumbing, electrical, or elevator issues</p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6 space-y-3 text-xs sm:text-sm text-muted-foreground leading-relaxed">
          <p>
            If something in your flat requires repair, submit a ticket directly to your caretaker and landlord through the portal.
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-foreground/90">
            <li>Go to <strong>&quot;Maintenance Tickets&quot;</strong> and click <strong>&quot;Report New Issue&quot;</strong>.</li>
            <li>Describe the problem (e.g., plumbing leak, electrical short) and set the urgency level.</li>
            <li>Track real-time status updates as the caretaker assigns repair technicians.</li>
          </ul>
        </CardContent>
      </Card>

      {/* Workflow Step 4: Move-Out Notice */}
      <Card className="border-border bg-card">
        <CardHeader className="border-b border-border bg-accent/30 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-sm">
              4
            </div>
            <div>
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <FileCheck2 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                Submitting Move-Out &amp; Security Deposit Clearance
              </CardTitle>
              <p className="text-xs text-muted-foreground">Legal departure notice under Premises Rent Control Act 1992</p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6 space-y-3 text-xs sm:text-sm text-muted-foreground leading-relaxed">
          <p>
            When planning to vacate your flat, submit your formal departure notice through the portal to initiate security deposit refund processing.
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-foreground/90">
            <li>On the Tenant Dashboard, click <strong>&quot;Submit Departure Notice&quot;</strong>.</li>
            <li>Specify your planned move-out date to generate timestamped legal proof for deposit reconciliation.</li>
          </ul>
        </CardContent>
      </Card>

      {/* Support Box */}
      <div className="bg-accent/40 border border-border p-6 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-4 text-xs sm:text-sm">
        <div className="space-y-1 text-center sm:text-left">
          <p className="font-bold text-foreground">Need Assistance?</p>
          <p className="text-muted-foreground">Contact your caretaker or the BashaBari support team in Dhaka.</p>
        </div>
        <Button asChild variant="outline" size="sm">
          <Link href="/contact">Contact Support</Link>
        </Button>
      </div>
    </div>
  );
}
