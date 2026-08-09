import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "@/components/theme-toggle";
import { Zap, Gauge, Landmark, ArrowLeft, ArrowRight, CheckCircle2, ShieldCheck } from "lucide-react";

export default function SubMetersPage() {
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
          <Link href="/sub-meters" className="text-foreground font-bold">Sub-Meters</Link>
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

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-8 py-12 space-y-12">
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <Badge variant="outline" className="text-xs font-semibold text-amber-600 dark:text-amber-400 border-amber-500/30">
            Nationwide Bangladesh Utility Tariff Engine
          </Badge>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight">
            Sub-Meter Utilities &amp; Automated Billing
          </h1>
          <p className="text-muted-foreground text-sm sm:text-base leading-relaxed">
            Eliminate utility math errors and tenant billing disputes. BashaBari provides pre-configured tariff structures for electricity, gas, and WASA water providers across Bangladesh.
          </p>
        </div>

        {/* 3 Main Utility Categories */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="border-border bg-card p-6 space-y-4">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold">
              <Zap className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold">Electricity Sub-Meters</h3>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              Track kWh unit consumption for DPDC (Dhaka Power), DESCO, BREB (Palli Bidyut), NESCO, and WZPDCL. Supports multi-tier slab tariffs and demand charges.
            </p>
            <ul className="space-y-1 text-xs text-foreground/80 font-mono">
              <li>• DPDC (Dhaka South &amp; East)</li>
              <li>• DESCO (Dhaka North)</li>
              <li>• BREB (Rural &amp; Suburban BD)</li>
            </ul>
          </Card>

          <Card className="border-border bg-card p-6 space-y-4">
            <div className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center font-bold">
              <Gauge className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold">Natural Gas Utilities</h3>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              Supports both fixed burner tariffs (Single Burner / Double Burner) and metered natural gas consumption for Titas Gas, Karnaphuli Gas, and Jalalabad Gas.
            </p>
            <ul className="space-y-1 text-xs text-foreground/80 font-mono">
              <li>• Titas Gas (Dhaka Region)</li>
              <li>• Karnaphuli Gas (Chattogram)</li>
              <li>• Jalalabad Gas (Sylhet)</li>
            </ul>
          </Card>

          <Card className="border-border bg-card p-6 space-y-4">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
              <Landmark className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold">WASA Water &amp; Sewerage</h3>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              Log sub-meter cubic meter (m³) water consumption or flat-rate monthly water charges for DWASA (Dhaka WASA) and CWASA (Chattogram WASA).
            </p>
            <ul className="space-y-1 text-xs text-foreground/80 font-mono">
              <li>• DWASA (Dhaka WASA)</li>
              <li>• CWASA (Chattogram WASA)</li>
            </ul>
          </Card>
        </div>

        {/* Calculation Formula Showcase */}
        <Card className="border-border bg-card p-6 sm:p-8 space-y-6 shadow-sm">
          <div className="space-y-2 border-b border-border pb-4">
            <Badge variant="outline" className="text-xs font-mono">Poisha Precision Standard (BD-MONEY)</Badge>
            <h2 className="text-2xl font-bold">Mathematical Billing Formula</h2>
            <p className="text-xs sm:text-sm text-muted-foreground">
              All utility billing operations use the integer poisha standard (`1 BDT = 100 poisha`) to prevent rounding discrepancies.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 font-mono text-xs">
            <div className="p-4 rounded-xl bg-accent/40 border border-border space-y-2">
              <p className="font-bold text-sm text-foreground font-sans">Formula 1: Unit Consumption</p>
              <p className="text-muted-foreground">`units_consumed = current_reading - previous_reading`</p>
              <p className="text-muted-foreground">`utility_charge = units_consumed * rate_per_unit_poisha`</p>
            </div>

            <div className="p-4 rounded-xl bg-accent/40 border border-border space-y-2">
              <p className="font-bold text-sm text-foreground font-sans">Formula 2: Sample Calculation</p>
              <p className="text-foreground font-semibold">Flat B-302 (DESCO Sub-Meter #MTR-8890)</p>
              <p className="text-muted-foreground">Previous: 450 kWh | Current: 650 kWh</p>
              <p className="text-amber-600 dark:text-amber-400 font-bold">200 Units @ ৳ 9.00/unit = ৳ 1,800.00</p>
            </div>
          </div>
        </Card>

        {/* CTA */}
        <div className="bg-accent/40 border border-border p-8 rounded-2xl text-center space-y-4">
          <h2 className="text-2xl sm:text-3xl font-extrabold">Ready to Automate Utility Billing?</h2>
          <p className="text-muted-foreground text-xs sm:text-sm max-w-xl mx-auto">
            Try BashaBari with a 5-Day Free Trial and streamline your building&apos;s sub-meter utilities today.
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
