import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "@/components/theme-toggle";
import { Scale, ArrowLeft, CheckCircle2, ShieldCheck, Mail, Phone, MapPin } from "lucide-react";

export default function CompliancePage() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans">
      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-background/80 border-b border-border px-4 sm:px-8 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-extrabold text-xl tracking-tight text-foreground">
          <span className="bg-primary text-white w-9 h-9 rounded-xl flex items-center justify-center text-base shadow-md">
            🏠
          </span>
          <span>BashaBari</span>
        </Link>

        <div className="flex items-center gap-3">
          <ThemeToggle />
          <Button asChild variant="outline" size="sm">
            <Link href="/" className="gap-1.5">
              <ArrowLeft className="w-4 h-4" /> Back to Home
            </Link>
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-4xl mx-auto px-4 py-12 space-y-8">
        <div className="space-y-3 text-center sm:text-left border-b border-border pb-8">
          <Badge variant="outline" className="text-xs font-semibold text-primary border-primary/30">
            Legal Framework Bangladesh
          </Badge>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Premises Rent Control Act 1992 Compliance Guide
          </h1>
          <p className="text-muted-foreground text-sm sm:text-base leading-relaxed">
            How BashaBari safeguards property owners (Bariwalas), caretakers, and tenants under Bangladeshi tenancy law.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="p-4 border-border bg-card space-y-2">
            <Scale className="w-6 h-6 text-primary" />
            <h3 className="font-bold text-sm">Standardized Leases</h3>
            <p className="text-xs text-muted-foreground">Automated lease agreements adhering to statutory notice periods.</p>
          </Card>
          <Card className="p-4 border-border bg-card space-y-2">
            <ShieldCheck className="w-6 h-6 text-emerald-500" />
            <h3 className="font-bold text-sm">Transparent Invoicing</h3>
            <p className="text-xs text-muted-foreground">Itemized rent receipts with exact poisha utility calculations.</p>
          </Card>
          <Card className="p-4 border-border bg-card space-y-2">
            <CheckCircle2 className="w-6 h-6 text-blue-500" />
            <h3 className="font-bold text-sm">Legal Protection</h3>
            <p className="text-xs text-muted-foreground">Audit-ready payment trail via SSLCommerz, bKash & Nagad.</p>
          </Card>
        </div>

        <div className="space-y-6 text-sm text-foreground leading-relaxed">
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-primary">1. Overview of the Premises Rent Control Act 1992</h2>
            <p>
              The Premises Rent Control Act 1992 regulates urban tenancy in Bangladesh, establishing statutory standards for fair rent determination, security deposits, eviction notices, and landlord/tenant obligations across metropolitan regions including Dhaka, Chattogram, Sylhet, and Rajshahi.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-primary">2. How BashaBari Enforces Statutory Compliance</h2>
            <ul className="list-disc pl-5 space-y-2 text-muted-foreground">
              <li>
                <strong className="text-foreground">Official Rent Receipts:</strong> Every payment made on BashaBari automatically generates an immutable digital receipt complying with Section 13 of the Act.
              </li>
              <li>
                <strong className="text-foreground">Sub-Meter Utility Transparency:</strong> Electricity (DPDC, DESCO, BREB) and Water (DWASA) sub-meter charges are billed at official government tariffs without arbitrary markups.
              </li>
              <li>
                <strong className="text-foreground">Formal Departure Notices:</strong> Tenants submit formal move-out notices directly through the BashaBari Tenant Portal, recording timestamped legal proof for security deposit reconciliation.
              </li>
            </ul>
          </section>

          <section className="space-y-3 pt-4 border-t border-border">
            <h2 className="text-xl font-bold">Need Legal or Technical Support?</h2>
            <p className="text-muted-foreground">
              Contact the BashaBari Compliance & Support Office for guidance on lease templates or account management.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 pt-2 font-mono text-xs">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Mail className="w-4 h-4 text-primary" /> readusshalehin22@gmail.com
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Phone className="w-4 h-4 text-primary" /> +8801770207576
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <MapPin className="w-4 h-4 text-primary" /> Dhaka, Bangladesh
              </div>
            </div>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-card py-6 px-4 text-center text-xs text-muted-foreground mt-auto">
        <p>© 2026 BashaBari. All rights reserved. • Premises Rent Control Act 1992 Compliant</p>
      </footer>
    </div>
  );
}
