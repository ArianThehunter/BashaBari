import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "@/components/theme-toggle";
import { Scale, ArrowLeft, ArrowRight, ShieldCheck, Lock, CheckCircle2 } from "lucide-react";

export default function LegalCompliancePage() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans selection:bg-primary selection:text-white transition-colors duration-200">
      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-background/85 border-b border-border px-4 sm:px-8 py-3.5 flex items-center justify-between shadow-xs">
        <Link href="/" className="flex items-center gap-2 font-extrabold text-xl tracking-tight text-foreground">
          <span className="bg-primary text-primary-foreground w-9 h-9 rounded-xl flex items-center justify-center text-base shadow-sm">
            🏠
          </span>
          <span>BashaBari</span>
        </Link>

        <nav className="hidden lg:flex items-center gap-7 text-xs sm:text-sm font-semibold text-muted-foreground">
          <Link href="/features" className="hover:text-foreground transition-colors">Features</Link>
          <Link href="/who-its-for" className="hover:text-foreground transition-colors">Who It&apos;s For</Link>
          <Link href="/sub-meters" className="hover:text-foreground transition-colors">Sub-Meters</Link>
          <Link href="/pricing" className="hover:text-foreground transition-colors">Pricing</Link>
          <Link href="/faq" className="hover:text-foreground transition-colors">FAQ</Link>
          <Link href="/tenant-portal" className="hover:text-foreground transition-colors">Tenant Portal</Link>
          <Link href="/compliance" className="text-foreground font-bold">Legal Act 1992</Link>
          <Link href="/contact" className="hover:text-foreground transition-colors">Contact</Link>
        </nav>

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
      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-8 py-12 space-y-12">
        <div className="text-center space-y-4">
          <Badge variant="outline" className="text-xs font-semibold text-primary border-primary/30">
            Legal Compliance Framework
          </Badge>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight">
            Premises Rent Control Act 1992 Legal Guide
          </h1>
          <p className="text-muted-foreground text-sm sm:text-base leading-relaxed max-w-2xl mx-auto">
            BashaBari enforces Bangladeshi tenancy law standards across lease agreements, rent revision rules, tenant eviction procedures, and security deposit management.
          </p>
        </div>

        {/* Legal Act Breakdown */}
        <div className="space-y-6">
          {/* Section 16 & 18: Statutory Rent Revision Rules */}
          <Card className="border-primary bg-card p-6 sm:p-8 space-y-4 shadow-sm">
            <div className="flex items-center gap-3 border-b border-border pb-3">
              <div className="w-10 h-10 rounded-xl bg-primary text-primary-foreground flex items-center justify-center font-bold">
                <Scale className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-foreground">Section 16 &amp; 18: Rent Revision &amp; Owner Discretion Cap</h2>
                <p className="text-xs text-muted-foreground">Statutory rules governing rent increases in Bangladesh</p>
              </div>
            </div>

            <div className="space-y-3 text-xs sm:text-sm text-muted-foreground leading-relaxed">
              <p>
                Under the Premises Rent Control Act 1992 of Bangladesh, landlords and property owners must adhere to strict statutory rules regarding rent revisions:
              </p>

              <ul className="space-y-2 text-foreground/90 font-medium">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span><strong>Owner-Only Authorization:</strong> Only Property Owners (Bariwalas) are authorized to increase rent. Caretakers and staff are role-restricted.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span><strong>Initial Base Rent Freedom:</strong> Property owners can set any initial base rent they choose when first listing or renting a unit (e.g. ৳ 10,000.00).</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span><strong>Statutory 24-Month Cooling Period:</strong> Once base rent is established, rent revisions are locked for 24 months (2 years) from the previous agreement date.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span><strong>20% Maximum Statutory Ceiling:</strong> When eligible after 24 months, the statutory ceiling cap is 20% above the current base rent (e.g. ৳ 10,000 → Max Cap ৳ 12,000).</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span><strong>Owner Discretion:</strong> The owner can set ANY new rent up to ৳ 12,000 (e.g. ৳ 10,500, ৳ 11,000, ৳ 12,000, or choose no change). However, any amount exceeding ৳ 12,000 is automatically blocked by BashaBari.</span>
                </li>
              </ul>
            </div>
          </Card>

          {/* Section 18: Statutory Notice Period */}
          <Card className="border-border bg-card p-6 space-y-4">
            <h3 className="text-lg font-bold text-foreground">Section 18 Notice Period &amp; Tenancy Termination</h3>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              Standard tenancy contracts generated on BashaBari mandate a minimum 1 to 2 month written notice period prior to tenancy termination or eviction.
            </p>
          </Card>

          {/* Security Deposit Rules */}
          <Card className="border-border bg-card p-6 space-y-4">
            <h3 className="text-lg font-bold text-foreground">Security Deposit Refund &amp; Deduction Protocols</h3>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              Security deposits must be refunded upon flat inspection. Any deductions for flat damage or unpaid utility bills are recorded on official clearance forms.
            </p>
          </Card>
        </div>

        {/* CTA */}
        <div className="bg-accent/40 border border-border p-8 rounded-2xl text-center space-y-4">
          <h2 className="text-2xl font-extrabold">Generate Legal Act 1992 Tenancy Contracts Today</h2>
          <p className="text-muted-foreground text-xs sm:text-sm max-w-xl mx-auto">
            Ensure complete legal compliance for your properties with BashaBari&apos;s automated lease contract engine.
          </p>
          <Button asChild size="lg" className="font-bold gap-2">
            <Link href="/register">
              Start 5-Day Free Trial <ArrowRight className="w-4 h-4" />
            </Link>
          </Button>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-card py-6 px-4 text-center text-xs text-muted-foreground mt-auto">
        <p>© 2026 BashaBari. All rights reserved. • Premises Rent Control Act 1992 Compliant</p>
      </footer>
    </div>
  );
}
