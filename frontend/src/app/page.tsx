import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "@/components/theme-toggle";
import {
  Users,
  Zap,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  Gauge,
  Landmark,
  Clock,
  ShieldCheck,
  Building,
  Mail,
  Phone,
  MapPin,
  ChevronRight,
  HelpCircle,
} from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans selection:bg-primary selection:text-white transition-colors duration-200">
      {/* ---- Navigation Bar ---- */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-background/85 border-b border-border px-4 sm:px-8 py-3.5 flex items-center justify-between shadow-xs">
        <Link href="/" className="flex items-center gap-2 font-extrabold text-xl tracking-tight text-foreground">
          <span className="bg-primary text-primary-foreground w-9 h-9 rounded-xl flex items-center justify-center text-base shadow-sm">
            🏠
          </span>
          <span className="tracking-tight">BashaBari</span>
        </Link>

        <nav className="hidden lg:flex items-center gap-7 text-xs sm:text-sm font-semibold text-muted-foreground">
          <a href="#features" className="hover:text-foreground transition-colors">Features</a>
          <a href="#benefits" className="hover:text-foreground transition-colors">Who It&apos;s For</a>
          <a href="#utilities" className="hover:text-foreground transition-colors">Sub-Meters</a>
          <a href="#pricing" className="hover:text-foreground transition-colors">Pricing</a>
          <Link href="/tenant-portal" className="hover:text-foreground transition-colors">Tenant Portal</Link>
          <Link href="/compliance" className="hover:text-foreground transition-colors">Legal Act 1992</Link>
          <Link href="/contact" className="hover:text-foreground transition-colors">Contact</Link>
        </nav>

        <div className="flex items-center gap-2.5">
          <ThemeToggle />

          <Button asChild variant="ghost" className="text-xs sm:text-sm font-semibold hidden sm:inline-flex">
            <Link href="/login">Sign In</Link>
          </Button>

          <Button asChild className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-xs sm:text-sm rounded-lg shadow-sm gap-1.5 px-3.5 py-2">
            <Link href="/register">
              <span>5-Day Free Trial</span>
              <ArrowRight className="w-4 h-4 hidden sm:inline" />
            </Link>
          </Button>
        </div>
      </header>

      {/* ---- Hero Section ---- */}
      <section className="relative pt-12 pb-16 px-4 sm:px-8 max-w-7xl mx-auto text-center space-y-8 overflow-hidden">
        {/* Soft Background Radial Glow */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[32rem] h-[32rem] bg-primary/10 rounded-full blur-3xl -z-10 pointer-events-none" />

        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-accent/60 border border-border text-xs font-semibold text-foreground shadow-xs">
          <Sparkles className="w-3.5 h-3.5 text-primary" />
          <span>Built for Property Owners, Caretakers &amp; Tenants in Bangladesh</span>
        </div>

        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-foreground max-w-4xl mx-auto leading-tight">
          Smart Property &amp; Rental Operations Platform for <span className="text-primary underline decoration-primary/30 underline-offset-8">Bangladesh</span>
        </h1>

        <p className="text-sm sm:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
          Automate monthly rent invoicing via <strong className="text-foreground">bKash, Nagad &amp; SSLCommerz</strong>, track flat occupancy, log sub-meter utilities (DPDC/DESCO/DWASA), generate Rent Control Act 1992 contracts, and start with a <strong className="text-foreground">5-Day Free Trial</strong>.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-2">
          <Button asChild size="lg" className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-primary-foreground font-extrabold text-sm sm:text-base px-8 py-6 rounded-xl shadow-md gap-2">
            <Link href="/register">
              Start 5-Day Free Trial <ArrowRight className="w-4 h-4" />
            </Link>
          </Button>

          <Button asChild variant="outline" size="lg" className="w-full sm:w-auto font-bold text-sm sm:text-base px-8 py-6 rounded-xl gap-2">
            <Link href="/tenant-portal">
              <Users className="w-4.5 h-4.5 text-emerald-600 dark:text-emerald-400" /> Explore Tenant Portal
            </Link>
          </Button>

          <Button asChild variant="ghost" size="lg" className="w-full sm:w-auto font-semibold text-xs sm:text-sm px-6 py-6 rounded-xl gap-1">
            <Link href="/contact">
              Contact &amp; Support <ChevronRight className="w-4 h-4" />
            </Link>
          </Button>
        </div>

        {/* Hero Interactive Dashboard Preview Mockup */}
        <div className="pt-6 max-w-5xl mx-auto">
          <Card className="border-border bg-card shadow-xl rounded-2xl text-left overflow-hidden">
            <CardHeader className="border-b border-border pb-3.5 px-6 flex flex-row items-center justify-between bg-accent/30">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-rose-500" />
                <div className="w-3 h-3 rounded-full bg-amber-500" />
                <div className="w-3 h-3 rounded-full bg-emerald-500" />
                <span className="text-xs font-mono text-muted-foreground ml-2">BashaBari Live Operations Preview</span>
              </div>
              <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 text-xs font-semibold">
                SSLCommerz Live Connected
              </Badge>
            </CardHeader>

            <CardContent className="p-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-background border border-border">
                <p className="text-xs font-semibold text-muted-foreground">Total Monthly Rent Billed</p>
                <p className="text-xl sm:text-2xl font-extrabold text-foreground mt-1">৳ 2,45,000.00</p>
                <p className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-1 flex items-center gap-1 font-semibold">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Auto Invoiced INV-202608
                </p>
              </div>

              <div className="p-4 rounded-xl bg-background border border-border">
                <p className="text-xs font-semibold text-muted-foreground">Sub-Meter Utilities Logged</p>
                <p className="text-xl sm:text-2xl font-extrabold text-amber-600 dark:text-amber-400 mt-1">DPDC &amp; DWASA</p>
                <p className="text-[11px] text-muted-foreground mt-1 font-mono">1,450 Units Consumed</p>
              </div>

              <div className="p-4 rounded-xl bg-background border border-border">
                <p className="text-xs font-semibold text-muted-foreground">Occupancy &amp; Free Trial</p>
                <p className="text-xl sm:text-2xl font-extrabold text-primary mt-1">18 / 20 Occupied</p>
                <p className="text-[11px] text-primary mt-1 font-semibold flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" /> 5-Day Free Trial Active
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* ---- Target Audience Benefits Grid ---- */}
      <section id="benefits" className="py-16 px-4 sm:px-8 bg-accent/20 border-y border-border">
        <div className="max-w-7xl mx-auto space-y-10">
          <div className="text-center space-y-2">
            <Badge variant="outline" className="text-xs font-semibold text-primary border-primary/30">
              Built for Every Stakeholder
            </Badge>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-foreground">
              Designed for Property Owners, Caretakers &amp; Tenants
            </h2>
            <p className="text-muted-foreground text-xs sm:text-base max-w-xl mx-auto">
              Whether you own 1 residential building or manage multi-story commercial towers across Dhaka and Chattogram.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Card 1: Building Owners */}
            <Card className="border-border bg-card p-6 space-y-4 hover:shadow-md transition-all">
              <div className="w-11 h-11 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold text-xl">
                🏠
              </div>
              <h3 className="text-lg font-bold text-foreground">For Property Owners (Bariwalas)</h3>
              <p className="text-muted-foreground text-xs sm:text-sm leading-relaxed">
                Automate monthly rent billing (`INV-YYYYMM-XXX`), collect rent online via bKash/Nagad/SSLCommerz, and track net profit with general ledger accounting.
              </p>
              <ul className="space-y-2 text-xs text-foreground/80 pt-1">
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" /> 5-Day Free Trial upon registration</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" /> Auto-reconciled bKash / Nagad rent payments</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" /> Poisha currency precision (`1 BDT = 100 poisha`)</li>
              </ul>
            </Card>

            {/* Card 2: Caretakers & Managers */}
            <Card className="border-border bg-card p-6 space-y-4 hover:shadow-md transition-all">
              <div className="w-11 h-11 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold text-xl">
                🔑
              </div>
              <h3 className="text-lg font-bold text-foreground">For Caretakers &amp; Managers</h3>
              <p className="text-muted-foreground text-xs sm:text-sm leading-relaxed">
                Log monthly sub-meter electricity (DPDC, DESCO, BREB), gas, and WASA water readings. Dispatch repair technicians for plumbing or emergency maintenance.
              </p>
              <ul className="space-y-2 text-xs text-foreground/80 pt-1">
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-amber-500 shrink-0" /> Log DPDC, DESCO &amp; WASA sub-meters</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-amber-500 shrink-0" /> Maintenance ticket priority dispatch</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-amber-500 shrink-0" /> Automated SMS dispatches to tenants</li>
              </ul>
            </Card>

            {/* Card 3: Tenants */}
            <Card className="border-border bg-card p-6 space-y-4 hover:shadow-md transition-all">
              <div className="w-11 h-11 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-xl">
                📱
              </div>
              <h3 className="text-lg font-bold text-foreground">For Tenants</h3>
              <p className="text-muted-foreground text-xs sm:text-sm leading-relaxed">
                Access your mobile-first self-service portal (`/tenant-portal`), pay rent in 1-click via bKash/Nagad, download official printable receipts, and request repairs.
              </p>
              <ul className="space-y-2 text-xs text-foreground/80 pt-1">
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-blue-500 shrink-0" /> 1-Click bKash/Nagad/SSLCommerz checkout</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-blue-500 shrink-0" /> Download official printable PDF receipts</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-blue-500 shrink-0" /> Rent Control Act 1992 compliance</li>
              </ul>
            </Card>
          </div>
        </div>
      </section>

      {/* ---- Sub-Meter Utilities Highlight Section ---- */}
      <section id="utilities" className="py-16 px-4 sm:px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
          <div className="space-y-5">
            <Badge variant="outline" className="text-xs font-semibold text-amber-600 dark:text-amber-400 border-amber-500/30">
              Nationwide Bangladesh Utility Tariff Support
            </Badge>

            <h2 className="text-2xl sm:text-4xl font-extrabold text-foreground">
              Sub-Meter Billing Across All 10 BD Utility Providers
            </h2>

            <p className="text-muted-foreground text-xs sm:text-base leading-relaxed">
              Eliminate utility calculation disputes. BashaBari pre-configures tariff structures for electricity, gas, and water utility providers across Dhaka, Chattogram, Sylhet, Rajshahi, Khulna, and Barishal.
            </p>

            <div className="grid grid-cols-3 gap-3 pt-1">
              <div className="p-3 rounded-lg bg-card border border-border text-center shadow-xs">
                <Zap className="w-5 h-5 text-amber-500 mx-auto mb-1" />
                <p className="text-xs font-bold text-foreground">Electricity</p>
                <p className="text-[10px] text-muted-foreground">DPDC, DESCO, BREB, NESCO, WZPDCL</p>
              </div>

              <div className="p-3 rounded-lg bg-card border border-border text-center shadow-xs">
                <Gauge className="w-5 h-5 text-rose-500 mx-auto mb-1" />
                <p className="text-xs font-bold text-foreground">Natural Gas</p>
                <p className="text-[10px] text-muted-foreground">Titas, Karnaphuli, Jalalabad</p>
              </div>

              <div className="p-3 rounded-lg bg-card border border-border text-center shadow-xs">
                <Landmark className="w-5 h-5 text-blue-500 mx-auto mb-1" />
                <p className="text-xs font-bold text-foreground">WASA Water</p>
                <p className="text-[10px] text-muted-foreground">DWASA, CWASA</p>
              </div>
            </div>
          </div>

          <Card className="border-border bg-card p-6 space-y-4 text-xs font-mono text-muted-foreground shadow-sm">
            <div className="flex justify-between items-center border-b border-border pb-3">
              <span className="font-bold text-foreground font-sans">Sub-Meter Utility Formula</span>
              <Badge variant="outline" className="text-[10px] font-sans">Poisha Precision</Badge>
            </div>
            <p className="text-foreground font-sans text-xs">
              `units_consumed = current_reading - previous_reading`
            </p>
            <p className="text-foreground font-sans text-xs">
              `total_utility_cost = units_consumed * rate_per_unit_poisha`
            </p>
            <div className="p-3.5 rounded-lg bg-accent/40 border border-border space-y-1 text-foreground font-mono">
              <p className="font-semibold text-xs font-sans">📍 Flat A-101 (DPDC Electricity Sub-Meter)</p>
              <p className="text-xs">Previous Reading: 120.00 kWh | Current Reading: 220.00 kWh</p>
              <p className="text-amber-600 dark:text-amber-400 font-bold">Total Consumed: 100 Units @ ৳ 8.50/unit = ৳ 850.00</p>
            </div>
          </Card>
        </div>
      </section>

      {/* ---- Subscription & Pricing Section ---- */}
      <section id="pricing" className="py-16 px-4 sm:px-8 bg-accent/20 border-t border-border">
        <div className="max-w-7xl mx-auto space-y-10 text-center">
          <div className="space-y-2">
            <Badge variant="outline" className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 border-emerald-500/30">
              Simple &amp; Transparent Pricing
            </Badge>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-foreground">
              Start Free, Scale Across Bangladesh
            </h2>
            <p className="text-muted-foreground text-xs sm:text-base max-w-lg mx-auto">
              Every new organization starts with a 5-Day Full-Featured Free Trial. No credit card required.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
            {/* Plan 1: Free Trial */}
            <Card className="border-border bg-card p-6 flex flex-col justify-between space-y-6">
              <div className="space-y-3">
                <Badge variant="outline" className="text-xs font-bold text-primary border-primary/30">
                  Risk-Free Exploration
                </Badge>
                <h3 className="text-xl font-bold text-foreground">5-Day Free Trial</h3>
                <p className="text-3xl font-extrabold text-foreground">৳ 0 <span className="text-xs font-normal text-muted-foreground">/ 5 days</span></p>
                <p className="text-xs text-muted-foreground">Perfect for testing platform features with zero risk.</p>

                <ul className="space-y-2 text-xs text-foreground/80 pt-2">
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> Full feature access for 5 days</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> Unlimited properties &amp; flat units</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> bKash/Nagad payment testing</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> No credit card required</li>
                </ul>
              </div>

              <Button asChild className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold">
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
                <h3 className="text-xl font-bold text-foreground">Standard Bariwala</h3>
                <p className="text-3xl font-extrabold text-foreground">৳ 999 <span className="text-xs font-normal text-muted-foreground">/ month</span></p>
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
                <h3 className="text-xl font-bold text-foreground">Enterprise Caretaker</h3>
                <p className="text-3xl font-extrabold text-foreground">৳ 2,499 <span className="text-xs font-normal text-muted-foreground">/ month</span></p>
                <p className="text-xs text-muted-foreground">For commercial towers, caretakers, and property management firms.</p>

                <ul className="space-y-2 text-xs text-foreground/80 pt-2">
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-amber-500" /> Unlimited Buildings &amp; Flat Units</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-amber-500" /> Multi-Staff Roles &amp; Security Audit Logs</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-amber-500" /> Automated Telco SMS Dispatches</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-amber-500" /> Priority Support &amp; Financial Ledger Reports</li>
                </ul>
              </div>

              <Button asChild variant="outline" className="w-full font-bold">
                <Link href="/register">Choose Enterprise Plan</Link>
              </Button>
            </Card>
          </div>
        </div>
      </section>

      {/* ---- Sub-Footer & Footer Section ---- */}
      <footer className="border-t border-border bg-card py-12 px-4 sm:px-8 mt-auto">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 text-xs text-muted-foreground">
          <div className="space-y-3">
            <div className="flex items-center gap-2 font-bold text-base text-foreground">
              <span>🏠 BashaBari</span>
            </div>
            <p className="leading-relaxed">
              Smart property management, automated rent invoicing, SSLCommerz payment processing, and legal compliance engine for Bangladesh.
            </p>
            <p className="text-[11px] font-mono text-muted-foreground">
              Premises Rent Control Act 1992 Compliant
            </p>
          </div>

          <div className="space-y-2.5">
            <p className="font-bold text-foreground text-sm">Product Navigation</p>
            <ul className="space-y-1.5">
              <li><Link href="/register" className="hover:text-foreground transition-colors">Start 5-Day Free Trial</Link></li>
              <li><Link href="/login" className="hover:text-foreground transition-colors">Owner &amp; Caretaker Sign In</Link></li>
              <li><Link href="/tenant-portal" className="hover:text-foreground transition-colors">Tenant Self-Service Portal</Link></li>
              <li><a href="#utilities" className="hover:text-foreground transition-colors">Sub-Meter Utilities</a></li>
              <li><a href="#pricing" className="hover:text-foreground transition-colors">Pricing Plans</a></li>
            </ul>
          </div>

          <div className="space-y-2.5">
            <p className="font-bold text-foreground text-sm">Legal &amp; Compliance</p>
            <ul className="space-y-1.5">
              <li><Link href="/terms" className="hover:text-foreground transition-colors">Terms &amp; Conditions</Link></li>
              <li><Link href="/privacy" className="hover:text-foreground transition-colors">Privacy Policy</Link></li>
              <li><Link href="/compliance" className="hover:text-foreground transition-colors">Rent Act 1992 Legal Guide</Link></li>
            </ul>
          </div>

          <div className="space-y-2.5">
            <p className="font-bold text-foreground text-sm">Contact &amp; Support</p>
            <div className="space-y-1 font-mono text-xs">
              <p className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 text-primary shrink-0" /> Dhaka, Bangladesh</p>
              <p className="flex items-center gap-1.5 text-foreground font-semibold"><Mail className="w-3.5 h-3.5 text-primary shrink-0" /> readusshalehin22@gmail.com</p>
              <p className="flex items-center gap-1.5 text-foreground font-semibold"><Phone className="w-3.5 h-3.5 text-primary shrink-0" /> +8801770207576</p>
            </div>
            <div className="pt-1">
              <Button asChild variant="outline" size="xs" className="w-full">
                <Link href="/contact" className="gap-1">
                  <HelpCircle className="w-3 h-3" /> Contact Support Form
                </Link>
              </Button>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto pt-8 mt-8 border-t border-border text-center text-[11px] text-muted-foreground flex flex-col sm:flex-row items-center justify-between gap-2">
          <p>© 2026 BashaBari. All rights reserved.</p>
          <p className="font-mono">BDT (Poisha Precision) • SSLCommerz bKash/Nagad</p>
        </div>
      </footer>
    </div>
  );
}
