import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "@/components/theme-toggle";
import {
  Zap,
  Receipt,
  Users,
  ShieldCheck,
  Scale,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  PieChart,
  MessageSquare,
  FileText,
  Building,
} from "lucide-react";

export default function FeaturesPage() {
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
          <Link href="/features" className="text-foreground font-bold">Features</Link>
          <Link href="/who-its-for" className="hover:text-foreground transition-colors">Who It&apos;s For</Link>
          <Link href="/sub-meters" className="hover:text-foreground transition-colors">Sub-Meters</Link>
          <Link href="/pricing" className="hover:text-foreground transition-colors">Pricing</Link>
          <Link href="/tenant-portal" className="hover:text-foreground transition-colors">Tenant Portal</Link>
          <Link href="/compliance" className="hover:text-foreground transition-colors">Legal Act 1992</Link>
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

      {/* Main Container */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-8 py-12 space-y-12">
        {/* Title & Hero Header */}
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <Badge variant="outline" className="text-xs font-semibold text-primary border-primary/30">
            Comprehensive Platform Capabilities
          </Badge>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight">
            Engineered for Modern Property Management
          </h1>
          <p className="text-muted-foreground text-sm sm:text-base leading-relaxed">
            From automated monthly rent invoicing via bKash/Nagad/SSLCommerz to DPDC/DWASA sub-meter utility math and Rent Control Act 1992 legal contracts.
          </p>
        </div>

        {/* Feature Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="border-border bg-card p-6 space-y-4 hover:shadow-md transition-all">
            <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold">
              <Receipt className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold">Automated Rent Invoicing</h3>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              Auto-generate monthly rent invoices (`INV-YYYYMM-XXX`) with poisha currency precision. Send automated SMS dispatches with direct 1-click bKash/Nagad checkout links.
            </p>
            <ul className="space-y-1.5 text-xs text-foreground/80">
              <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> bKash, Nagad &amp; SSLCommerz integration</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> Printable PDF tax &amp; rent receipts</li>
            </ul>
          </Card>

          <Card className="border-border bg-card p-6 space-y-4 hover:shadow-md transition-all">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold">
              <Zap className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold">Sub-Meter Utility Module</h3>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              Pre-configured tariff structures for 10 Bangladesh utility providers (DPDC, DESCO, BREB, NESCO, WZPDCL, Titas, DWASA). Log sub-meter readings without manual calculations.
            </p>
            <ul className="space-y-1.5 text-xs text-foreground/80">
              <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-amber-500" /> Automated kWh &amp; unit formula math</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-amber-500" /> Meter serial number tracking</li>
            </ul>
          </Card>

          <Card className="border-border bg-card p-6 space-y-4 hover:shadow-md transition-all">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
              <Users className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold">Tenant Self-Service Portal</h3>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              Mobile-first portal for tenants to review due invoices, pay rent online in seconds, report maintenance issues, and submit formal move-out notices.
            </p>
            <ul className="space-y-1.5 text-xs text-foreground/80">
              <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-blue-500" /> 24/7 self-service invoice access</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-blue-500" /> Maintenance ticket tracking</li>
            </ul>
          </Card>

          <Card className="border-border bg-card p-6 space-y-4 hover:shadow-md transition-all">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold">
              <Scale className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold">Rent Control Act 1992 Engine</h3>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              Generate legally binding tenancy contracts adhering to Premises Rent Control Act 1992 of Bangladesh, statutory notice periods, and 12-24 month tenure constraints.
            </p>
            <ul className="space-y-1.5 text-xs text-foreground/80">
              <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-purple-500" /> Statutory eviction notice templates</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-purple-500" /> Legal security deposit clauses</li>
            </ul>
          </Card>

          <Card className="border-border bg-card p-6 space-y-4 hover:shadow-md transition-all">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
              <PieChart className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold">General Ledger &amp; Analytics</h3>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              Double-entry bookkeeping for tracking net rental yield, building maintenance expenses, staff payroll, and cash flow reports across multi-building portfolios.
            </p>
            <ul className="space-y-1.5 text-xs text-foreground/80">
              <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> Real-time net income reports</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> Categorized expense logging</li>
            </ul>
          </Card>

          <Card className="border-border bg-card p-6 space-y-4 hover:shadow-md transition-all">
            <div className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center font-bold">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold">Staff Roles &amp; Audit Logs</h3>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              Assign distinct permissions for Caretakers, Security Guards, and Property Managers. Every administrative action is recorded in immutable security audit logs.
            </p>
            <ul className="space-y-1.5 text-xs text-foreground/80">
              <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-rose-500" /> Granular role-based access</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-rose-500" /> Audit trail for all edits</li>
            </ul>
          </Card>
        </div>

        {/* CTA Banner */}
        <div className="bg-accent/40 border border-border p-8 rounded-2xl text-center space-y-4">
          <h2 className="text-2xl sm:text-3xl font-extrabold">Ready to Streamline Your Property Operations?</h2>
          <p className="text-muted-foreground text-xs sm:text-sm max-w-xl mx-auto">
            Experience 5 full days of unrestricted access with zero commitment. No credit card required.
          </p>
          <Button asChild size="lg" className="font-bold gap-2">
            <Link href="/register">
              Start Your 5-Day Free Trial <ArrowRight className="w-4 h-4" />
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
