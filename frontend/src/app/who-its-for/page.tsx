import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "@/components/theme-toggle";
import { ArrowLeft, ArrowRight, CheckCircle2, Building2, Key, Users, Landmark } from "lucide-react";

export default function WhoItsForPage() {
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
          <Link href="/who-its-for" className="text-foreground font-bold">Who It&apos;s For</Link>
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

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-8 py-12 space-y-16">
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <Badge variant="outline" className="text-xs font-semibold text-primary border-primary/30">
            Tailored Solution Blueprints
          </Badge>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight">
            Built for Every Property Stakeholder in Bangladesh
          </h1>
          <p className="text-muted-foreground text-sm sm:text-base leading-relaxed">
            Whether you own 1 residential apartment building or manage multi-story commercial towers across Dhaka, Chattogram, Sylhet, and Rajshahi.
          </p>
        </div>

        {/* Audience Section 1: Property Owners (Bariwalas) */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
          <div className="space-y-5">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold text-2xl">
              🏠
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold">For Property Owners &amp; Landlords (Bariwalas)</h2>
            <p className="text-muted-foreground text-xs sm:text-sm leading-relaxed">
              Eliminate manual rent collection ledger notebooks. Automate monthly invoicing, receive direct bKash, Nagad &amp; SSLCommerz payments, track flat occupancy, and enforce legally compliant tenancy agreements.
            </p>
            <ul className="space-y-2 text-xs sm:text-sm text-foreground/80">
              <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" /> Automatic monthly rent invoice dispatches</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" /> Poisha precision (`1 BDT = 100 poisha`) accounting</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" /> General ledger for property net profit analysis</li>
            </ul>
          </div>
          <div className="rounded-2xl overflow-hidden shadow-md border border-border">
            <img
              src="https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=800&q=80"
              alt="Property Owner holding flat keys"
              className="w-full h-72 object-cover"
            />
          </div>
        </section>

        {/* Audience Section 2: Caretakers & Managers */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center lg:flex-row-reverse">
          <div className="rounded-2xl overflow-hidden shadow-md border border-border lg:order-1">
            <img
              src="https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=800&q=80"
              alt="Residential Building Complex"
              className="w-full h-72 object-cover"
            />
          </div>
          <div className="space-y-5 lg:order-2">
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold text-2xl">
              🔑
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold">For Caretakers &amp; Building Managers</h2>
            <p className="text-muted-foreground text-xs sm:text-sm leading-relaxed">
              Log monthly sub-meter electricity (DPDC, DESCO, BREB) and WASA water readings without tedious paper calculations. Manage maintenance tickets and dispatch plumbers or technicians.
            </p>
            <ul className="space-y-2 text-xs sm:text-sm text-foreground/80">
              <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-amber-500 shrink-0" /> Log DPDC, DESCO &amp; WASA sub-meters in seconds</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-amber-500 shrink-0" /> Maintenance ticket priority escalation</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-amber-500 shrink-0" /> Instant SMS alerts to flat tenants</li>
            </ul>
          </div>
        </section>

        {/* Audience Section 3: Tenants */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
          <div className="space-y-5">
            <div className="w-12 h-12 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-2xl">
              📱
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold">For Flat Tenants</h2>
            <p className="text-muted-foreground text-xs sm:text-sm leading-relaxed">
              Experience transparent, hassle-free tenancy. View detailed breakdowns of your monthly rent and sub-meter utility bill, pay in 1-click via bKash/Nagad, and request repairs online.
            </p>
            <ul className="space-y-2 text-xs sm:text-sm text-foreground/80">
              <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-blue-500 shrink-0" /> 1-Click bKash/Nagad/SSLCommerz online checkout</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-blue-500 shrink-0" /> Printable PDF tax &amp; rent receipts</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-blue-500 shrink-0" /> Protection under Premises Rent Control Act 1992</li>
            </ul>
          </div>
          <div className="rounded-2xl overflow-hidden shadow-md border border-border">
            <img
              src="https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&q=80"
              alt="Modern apartment interior living room"
              className="w-full h-72 object-cover"
            />
          </div>
        </section>

        {/* CTA Banner */}
        <div className="bg-accent/40 border border-border p-8 rounded-2xl text-center space-y-4">
          <h2 className="text-2xl sm:text-3xl font-extrabold">Get Started Today</h2>
          <p className="text-muted-foreground text-xs sm:text-sm max-w-xl mx-auto">
            Create your BashaBari account in under 2 minutes and explore all features with a 5-Day Free Trial.
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
