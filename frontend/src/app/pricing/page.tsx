import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "@/components/theme-toggle";
import { ArrowLeft, ArrowRight, CheckCircle2, HelpCircle } from "lucide-react";

export default function PricingPage() {
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
          <Link href="/pricing" className="text-foreground font-bold">Pricing</Link>
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
          <Badge variant="outline" className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 border-emerald-500/30">
            Simple &amp; Transparent Plans
          </Badge>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight">
            Transparent Pricing for Property Management
          </h1>
          <p className="text-muted-foreground text-sm sm:text-base leading-relaxed">
            Every new organization starts with a 5-Day Full-Featured Free Trial. No credit card or advance payment required.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
          {/* Plan 1: Free Trial */}
          <Card className="border-border bg-card p-6 flex flex-col justify-between space-y-6">
            <div className="space-y-3">
              <Badge variant="outline" className="text-xs font-bold text-primary border-primary/30">
                Risk-Free Trial
              </Badge>
              <h3 className="text-2xl font-bold">5-Day Free Trial</h3>
              <p className="text-3xl font-extrabold">৳ 0 <span className="text-xs font-normal text-muted-foreground">/ 5 days</span></p>
              <p className="text-xs text-muted-foreground">Perfect for exploring platform capabilities with zero financial commitment.</p>

              <ul className="space-y-2 text-xs text-foreground/80 pt-2">
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> Full feature access for 5 days</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> Unlimited properties &amp; flat units</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> SSLCommerz bKash/Nagad simulator</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> No credit card required</li>
              </ul>
            </div>

            <Button asChild className="w-full font-bold">
              <Link href="/register">Start Free Trial Now</Link>
            </Button>
          </Card>

          {/* Plan 2: Bariwala Standard */}
          <Card className="border-primary bg-card p-6 flex flex-col justify-between space-y-6 relative shadow-md">
            <Badge className="absolute -top-3 right-6 bg-primary text-primary-foreground text-[10px] font-bold uppercase px-3">
              Most Popular
            </Badge>

            <div className="space-y-3">
              <Badge variant="outline" className="text-xs font-bold text-emerald-600 dark:text-emerald-400 border-emerald-500/30">
                Residential Property Owners
              </Badge>
              <h3 className="text-2xl font-bold">Standard Bariwala</h3>
              <p className="text-3xl font-extrabold">৳ 999 <span className="text-xs font-normal text-muted-foreground">/ month</span></p>
              <p className="text-xs text-muted-foreground">Ideal for residential apartment buildings up to 20 flat units.</p>

              <ul className="space-y-2 text-xs text-foreground/80 pt-2">
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> Up to 20 Flat Units &amp; Tenant Profiles</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> Auto Rent Invoicing &amp; bKash/Nagad</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> DPDC/DESCO/DWASA Sub-Meter Module</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> Rent Control Act 1992 Contract Engine</li>
              </ul>
            </div>

            <Button asChild className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold">
              <Link href="/register">Choose Standard Plan</Link>
            </Button>
          </Card>

          {/* Plan 3: Enterprise Caretaker */}
          <Card className="border-border bg-card p-6 flex flex-col justify-between space-y-6">
            <div className="space-y-3">
              <Badge variant="outline" className="text-xs font-bold text-amber-600 dark:text-amber-400 border-amber-500/30">
                Commercial &amp; Multi-Building
              </Badge>
              <h3 className="text-2xl font-bold">Enterprise Caretaker</h3>
              <p className="text-3xl font-extrabold">৳ 2,499 <span className="text-xs font-normal text-muted-foreground">/ month</span></p>
              <p className="text-xs text-muted-foreground">For commercial towers, caretakers, and property management firms.</p>

              <ul className="space-y-2 text-xs text-foreground/80 pt-2">
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-amber-500" /> Unlimited Buildings &amp; Flat Units</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-amber-500" /> Multi-Staff Roles &amp; Security Audit Logs</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-amber-500" /> Automated Telco SMS Dispatches</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-amber-500" /> Priority Support &amp; Financial Reports</li>
              </ul>
            </div>

            <Button asChild variant="outline" className="w-full font-bold">
              <Link href="/register">Choose Enterprise Plan</Link>
            </Button>
          </Card>
        </div>

        {/* Pricing FAQ Section */}
        <section className="space-y-6 pt-8 border-t border-border">
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-bold">Frequently Asked Questions</h2>
            <p className="text-xs sm:text-sm text-muted-foreground">Everything you need to know about BashaBari subscriptions.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto text-xs sm:text-sm">
            <Card className="p-5 border-border bg-card space-y-2">
              <h4 className="font-bold text-foreground">How does the 5-Day Free Trial work?</h4>
              <p className="text-muted-foreground leading-relaxed">
                When you create an account, your organization automatically gets full access to all features for 5 days. No payment details are required.
              </p>
            </Card>

            <Card className="p-5 border-border bg-card space-y-2">
              <h4 className="font-bold text-foreground">How do tenants pay rent?</h4>
              <p className="text-muted-foreground leading-relaxed">
                Tenants can log into the Tenant Portal or click the SMS link to pay via bKash, Nagad, Rocket, or Bank Card through SSLCommerz.
              </p>
            </Card>

            <Card className="p-5 border-border bg-card space-y-2">
              <h4 className="font-bold text-foreground">Can I manage multiple buildings under 1 account?</h4>
              <p className="text-muted-foreground leading-relaxed">
                Yes! The Enterprise Caretaker plan supports unlimited buildings, flat units, and staff members across Bangladesh.
              </p>
            </Card>

            <Card className="p-5 border-border bg-card space-y-2">
              <h4 className="font-bold text-foreground">What currency precision is used?</h4>
              <p className="text-muted-foreground leading-relaxed">
                BashaBari uses the Integer Poisha Standard (`1 BDT = 100 poisha`) for exact financial precision without rounding errors.
              </p>
            </Card>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-card py-6 px-4 text-center text-xs text-muted-foreground mt-auto">
        <p>© 2026 BashaBari. All rights reserved. • Premises Rent Control Act 1992 Compliant</p>
      </footer>
    </div>
  );
}
