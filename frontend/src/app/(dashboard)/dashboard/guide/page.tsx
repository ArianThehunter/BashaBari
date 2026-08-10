"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  BookOpen,
  Building2,
  Users,
  Zap,
  Receipt,
  Scale,
  ShieldCheck,
  CheckCircle2,
  ArrowLeft,
  PieChart,
} from "lucide-react";

export default function LandlordGuidePage() {
  return (
    <div className="space-y-8 max-w-4xl">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-border pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold mb-2">
            <BookOpen className="w-4 h-4" /> Property Manager Onboarding Guide
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Landlord &amp; Caretaker Portal User Guide
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Learn how to set up properties, onboard tenants, log DPDC/DESCO sub-meters, and generate Rent Control Act 1992 leases.
          </p>
        </div>

        <Button asChild variant="outline" size="sm">
          <Link href="/dashboard">
            <ArrowLeft className="w-4 h-4 mr-1" /> Back to Dashboard
          </Link>
        </Button>
      </div>

      {/* Step 1: Adding Properties & Units */}
      <Card className="border-border bg-card">
        <CardHeader className="border-b border-border bg-accent/30 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm">
              1
            </div>
            <div>
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <Building2 className="w-4 h-4 text-primary" />
                Setting Up Properties &amp; Flat Units
              </CardTitle>
              <p className="text-xs text-muted-foreground">Creating your building structure in BashaBari</p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6 space-y-3 text-xs sm:text-sm text-muted-foreground leading-relaxed">
          <p>
            Before billing rent or logging sub-meters, set up your property address and flat unit numbers (e.g. Flat A-101, B-202).
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-foreground/90">
            <li>Go to <strong>&quot;Properties&quot;</strong> in the sidebar and click <strong>&quot;Add Property&quot;</strong>.</li>
            <li>Define flat unit names, floor levels, occupancy types (`tenant_occupied`, `flat_owner_occupied`, `bariwala_occupied`), and monthly base rent amounts.</li>
          </ul>
        </CardContent>
      </Card>

      {/* Step 2: Tenant Onboarding & Leases */}
      <Card className="border-border bg-card">
        <CardHeader className="border-b border-border bg-accent/30 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold text-sm">
              2
            </div>
            <div>
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <Users className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                Onboarding Tenants &amp; Generating Rent Act 1992 Leases
              </CardTitle>
              <p className="text-xs text-muted-foreground">Assigning tenants to flat units with legally compliant contracts</p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6 space-y-3 text-xs sm:text-sm text-muted-foreground leading-relaxed">
          <p>
            Add tenant profiles and generate standard lease agreements complying with Premises Rent Control Act 1992 of Bangladesh.
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-foreground/90">
            <li>Go to <strong>&quot;Tenants&quot;</strong> → <strong>&quot;Add Tenant&quot;</strong> and enter their legal name, mobile phone number, and National ID (NID).</li>
            <li>In <strong>&quot;Leases&quot;</strong>, link the tenant to their assigned flat unit with a 12 to 24 month tenure.</li>
            <li>The system automatically embeds statutory Section 18 notice clauses into printable PDF lease contracts.</li>
          </ul>
        </CardContent>
      </Card>

      {/* Step 3: Sub-Meter Utility Readings */}
      <Card className="border-border bg-card">
        <CardHeader className="border-b border-border bg-accent/30 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-600 text-white flex items-center justify-center font-bold text-sm">
              3
            </div>
            <div>
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                Logging Sub-Meter Utility Readings (DPDC, DESCO, WASA)
              </CardTitle>
              <p className="text-xs text-muted-foreground">Zero manual math utility calculations</p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6 space-y-3 text-xs sm:text-sm text-muted-foreground leading-relaxed">
          <p>
            Caretakers log monthly sub-meter electricity (DPDC, DESCO, BREB) and WASA water readings directly into BashaBari.
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-foreground/90">
            <li>Go to <strong>&quot;Utilities &amp; Meters&quot;</strong> → <strong>&quot;Log Readings&quot;</strong>.</li>
            <li>Input the current month&apos;s meter reading for each flat unit.</li>
            <li>BashaBari automatically subtracts previous readings, calculates exact poisha charges, and attaches them to the monthly rent invoice.</li>
          </ul>
        </CardContent>
      </Card>

      {/* Step 4: Rent Invoicing & Ledger */}
      <Card className="border-border bg-card">
        <CardHeader className="border-b border-border bg-accent/30 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-sm">
              4
            </div>
            <div>
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <Receipt className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                Auto-Invoicing &amp; Financial Ledger Reports
              </CardTitle>
              <p className="text-xs text-muted-foreground">bKash/Nagad reconciliation and net rental yield tracking</p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6 space-y-3 text-xs sm:text-sm text-muted-foreground leading-relaxed">
          <p>
            On the 1st of every month, BashaBari generates rent invoices (`INV-YYYYMM-XXX`) and sends SMS payment links to tenants.
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-foreground/90">
            <li>When a tenant pays via bKash, Nagad, or SSLCommerz, invoice status updates automatically to `paid`.</li>
            <li>View net rental profit, building maintenance costs, and cash flow in <strong>&quot;Reports &amp; Analytics&quot;</strong>.</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
