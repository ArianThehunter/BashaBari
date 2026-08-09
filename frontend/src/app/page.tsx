import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Users,
  Zap,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  Gauge,
  Landmark,
  Clock,
} from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-primary selection:text-white">
      {/* ---- Navigation Bar ---- */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-slate-950/80 border-b border-slate-800 px-4 sm:px-8 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-extrabold text-xl tracking-tight text-white">
          <span className="bg-primary text-white w-9 h-9 rounded-xl flex items-center justify-center text-base shadow-md">
            🏠
          </span>
          <span>Bariwala Hub</span>
        </Link>

        <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-slate-300">
          <a href="#features" className="hover:text-primary transition-colors">Features</a>
          <a href="#benefits" className="hover:text-primary transition-colors">Who It&apos;s For</a>
          <a href="#utilities" className="hover:text-primary transition-colors">Sub-Meters</a>
          <a href="#pricing" className="hover:text-primary transition-colors">Pricing</a>
          <Link href="/tenant-portal" className="hover:text-primary transition-colors">Tenant Portal</Link>
        </nav>

        <div className="flex items-center gap-3">
          <Button asChild variant="ghost" className="text-slate-300 hover:text-white text-xs sm:text-sm font-semibold">
            <Link href="/login">Sign In</Link>
          </Button>

          <Button asChild className="bg-primary hover:bg-primary/90 text-white font-bold text-xs sm:text-sm rounded-lg shadow-md gap-1.5">
            <Link href="/register">
              Start 5-Day Free Trial <ArrowRight className="w-4 h-4" />
            </Link>
          </Button>
        </div>
      </header>

      {/* ---- Hero Section ---- */}
      <section className="relative pt-12 pb-20 px-4 sm:px-8 max-w-7xl mx-auto text-center space-y-8 overflow-hidden">
        {/* Glow Effects */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary/20 rounded-full blur-3xl -z-10 pointer-events-none" />

        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900 border border-slate-800 text-xs font-semibold text-primary">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Built for Bariwalas, Caretakers &amp; Property Managers in Bangladesh</span>
        </div>

        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white max-w-4xl mx-auto leading-tight sm:leading-none">
          Smart Property &amp; Rental Operations Platform for <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-200">Bangladesh</span>
        </h1>

        <p className="text-base sm:text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed">
          Automate monthly rent invoicing via <strong className="text-slate-200">bKash, Nagad &amp; SSLCommerz</strong>, track flat occupancy, log sub-meter utilities (DPDC/DESCO/DWASA), generate Premises Rent Control Act 1992 legal contracts, and enjoy a <strong className="text-slate-200">5-Day Free Trial</strong>.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
          <Button asChild size="lg" className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-white font-extrabold text-base px-8 py-6 rounded-xl shadow-lg gap-2">
            <Link href="/register">
              Start 5-Day Free Trial <ArrowRight className="w-5 h-5" />
            </Link>
          </Button>

          <Button asChild variant="outline" size="lg" className="w-full sm:w-auto border-slate-800 bg-slate-900/60 hover:bg-slate-800 text-slate-200 font-bold text-base px-8 py-6 rounded-xl gap-2">
            <Link href="/tenant-portal">
              <Users className="w-5 h-5 text-emerald-400" /> Explore Tenant Portal
            </Link>
          </Button>
        </div>

        {/* Hero Interactive Dashboard Preview Mockup */}
        <div className="pt-8 max-w-5xl mx-auto">
          <Card className="border-slate-800 bg-slate-900/80 backdrop-blur-md shadow-2xl rounded-2xl text-left overflow-hidden">
            <CardHeader className="border-b border-slate-800 pb-4 flex flex-row items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-rose-500" />
                <div className="w-3 h-3 rounded-full bg-amber-500" />
                <div className="w-3 h-3 rounded-full bg-emerald-500" />
                <span className="text-xs font-mono text-slate-400 ml-2">Bariwala Hub Dashboard Live Preview</span>
              </div>
              <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/30 text-xs font-semibold">
                SSLCommerz Live Connected
              </Badge>
            </CardHeader>

            <CardContent className="p-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
                <p className="text-xs font-semibold text-slate-400">Total Monthly Rent Billed</p>
                <p className="text-2xl font-extrabold text-white mt-1">৳ 2,45,000.00</p>
                <p className="text-[11px] text-emerald-400 mt-1 flex items-center gap-1 font-semibold">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Auto Invoiced INV-202608
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
                <p className="text-xs font-semibold text-slate-400">Sub-Meter Utilities Logged</p>
                <p className="text-2xl font-extrabold text-amber-400 mt-1">DPDC &amp; DWASA</p>
                <p className="text-[11px] text-slate-400 mt-1 font-mono">1,450 Units Consumed</p>
              </div>

              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
                <p className="text-xs font-semibold text-slate-400">Occupancy &amp; Free Trial</p>
                <p className="text-2xl font-extrabold text-emerald-400 mt-1">18 / 20 Occupied</p>
                <p className="text-[11px] text-primary mt-1 font-semibold flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" /> 5-Day Free Trial Active
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* ---- Target Audience Benefits Grid ---- */}
      <section id="benefits" className="py-16 px-4 sm:px-8 bg-slate-900/50 border-y border-slate-800">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="text-center space-y-3">
            <Badge variant="outline" className="text-xs font-semibold text-primary border-primary/30 bg-primary/10">
              Built for Every Stakeholder
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
              Designed for Bariwalas, Caretakers &amp; Tenants
            </h2>
            <p className="text-slate-400 text-sm sm:text-base max-w-xl mx-auto">
              Whether you own 1 residential building or manage multi-story commercial towers across Dhaka and Chattogram.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Card 1: Building Owners */}
            <Card className="border-slate-800 bg-slate-950 p-6 space-y-4 hover:border-primary/50 transition-all">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold text-xl">
                🏠
              </div>
              <h3 className="text-xl font-bold text-white">For Bariwalas &amp; Building Owners</h3>
              <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">
                Automate monthly rent billing (`INV-YYYYMM-XXX`), collect rent online via bKash/Nagad/SSLCommerz, and track net profit with double-entry general ledger statements.
              </p>
              <ul className="space-y-2 text-xs text-slate-300">
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" /> 5-Day Free Trial upon registration</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" /> Auto-reconciled bKash / Nagad rent payments</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" /> Poisha currency precision (`1 BDT = 100 poisha`)</li>
              </ul>
            </Card>

            {/* Card 2: Caretakers & Managers */}
            <Card className="border-slate-800 bg-slate-950 p-6 space-y-4 hover:border-primary/50 transition-all">
              <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center font-bold text-xl">
                🔑
              </div>
              <h3 className="text-xl font-bold text-white">For Caretakers &amp; Managers</h3>
              <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">
                Log monthly sub-meter electricity (DPDC, DESCO, BREB), gas, and WASA water readings. Dispatch vendor repair technicians for plumbing or elevator emergencies.
              </p>
              <ul className="space-y-2 text-xs text-slate-300">
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" /> Log DPDC, DESCO &amp; WASA sub-meters</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" /> Maintenance ticket priority dispatch</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" /> Automated SMS dispatches to tenants</li>
              </ul>
            </Card>

            {/* Card 3: Tenants */}
            <Card className="border-slate-800 bg-slate-950 p-6 space-y-4 hover:border-primary/50 transition-all">
              <div className="w-12 h-12 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center font-bold text-xl">
                📱
              </div>
              <h3 className="text-xl font-bold text-white">For Tenants</h3>
              <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">
                Access your mobile-first self-service portal (`/tenant-portal`), pay rent in 1-click via bKash/Nagad, download official printable receipts, and request repairs.
              </p>
              <ul className="space-y-2 text-xs text-slate-300">
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0" /> 1-Click bKash/Nagad/SSLCommerz checkout</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0" /> Download official printable PDF receipts</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0" /> Premises Rent Control Act 1992 protection</li>
              </ul>
            </Card>
          </div>
        </div>
      </section>

      {/* ---- Sub-Meter Utilities Highlight ---- */}
      <section id="utilities" className="py-16 px-4 sm:px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <Badge variant="outline" className="text-xs font-semibold text-amber-400 border-amber-500/30 bg-amber-500/10">
              Nationwide Bangladesh Coverage
            </Badge>

            <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
              Sub-Meter Billing Across All 10 BD Utility Providers
            </h2>

            <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
              No more manual utility math. Bariwala Hub comes pre-seeded with official tariffs for electricity, gas, and WASA companies across Dhaka, Chattogram, Sylhet, Rajshahi, Rangpur, Khulna, and Barishal.
            </p>

            <div className="grid grid-cols-3 gap-3 pt-2">
              <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 text-center">
                <Zap className="w-5 h-5 text-amber-400 mx-auto mb-1" />
                <p className="text-xs font-bold text-white">Electricity</p>
                <p className="text-[10px] text-slate-400">DPDC, DESCO, BREB, NESCO, WZPDCL</p>
              </div>

              <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 text-center">
                <Gauge className="w-5 h-5 text-rose-400 mx-auto mb-1" />
                <p className="text-xs font-bold text-white">Natural Gas</p>
                <p className="text-[10px] text-slate-400">Titas, Karnaphuli, Jalalabad</p>
              </div>

              <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 text-center">
                <Landmark className="w-5 h-5 text-blue-400 mx-auto mb-1" />
                <p className="text-xs font-bold text-white">WASA Water</p>
                <p className="text-[10px] text-slate-400">DWASA, CWASA</p>
              </div>
            </div>
          </div>

          <Card className="border-slate-800 bg-slate-900 p-6 space-y-4 text-xs font-mono text-slate-300">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <span className="font-bold text-white">Sub-Meter Unit Consumption Formula</span>
              <Badge variant="outline" className="text-[10px] font-sans">Poisha Accuracy</Badge>
            </div>
            <p className="text-slate-400 font-sans text-xs">
              `units_consumed = current_reading - previous_reading`
            </p>
            <p className="text-slate-400 font-sans text-xs">
              `total_utility_cost = units_consumed * rate_per_unit_poisha`
            </p>
            <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-1 text-slate-200">
              <p>📍 Flat A-101 (DPDC Electricity Sub-Meter)</p>
              <p>Previous Reading: 120.00 kWh | Current Reading: 220.00 kWh</p>
              <p className="text-amber-400 font-bold">Total Consumed: 100 Units @ ৳ 8.50/unit = ৳ 850.00</p>
            </div>
          </Card>
        </div>
      </section>

      {/* ---- Subscription & Pricing Section ---- */}
      <section id="pricing" className="py-16 px-4 sm:px-8 bg-slate-900/50 border-t border-slate-800">
        <div className="max-w-7xl mx-auto space-y-12 text-center">
          <div className="space-y-3">
            <Badge variant="outline" className="text-xs font-semibold text-emerald-400 border-emerald-500/30 bg-emerald-500/10">
              Simple &amp; Transparent Pricing
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
              Start Free, Scale Across Bangladesh
            </h2>
            <p className="text-slate-400 text-sm sm:text-base max-w-lg mx-auto">
              Every new organization starts with a 5-Day Full-Featured Free Trial. No credit card required.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
            {/* Plan 1: Free Trial */}
            <Card className="border-slate-800 bg-slate-950 p-6 flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <Badge variant="outline" className="text-xs font-bold text-primary border-primary/30">
                  BD-001 Guaranteed
                </Badge>
                <h3 className="text-2xl font-bold text-white">5-Day Free Trial</h3>
                <p className="text-3xl font-extrabold text-white">৳ 0 <span className="text-xs font-normal text-slate-400">/ 5 days</span></p>
                <p className="text-xs text-slate-400">Perfect for exploring platform capabilities with zero risk.</p>

                <ul className="space-y-2 text-xs text-slate-300 pt-2">
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> Full feature access for 5 days</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> Unlimited properties &amp; flat units</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> SSLCommerz bKash/Nagad simulator</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> No credit card or advance payment</li>
                </ul>
              </div>

              <Button asChild className="w-full bg-primary hover:bg-primary/90 text-white font-bold">
                <Link href="/register">Start Free Trial Now</Link>
              </Button>
            </Card>

            {/* Plan 2: Bariwala Standard */}
            <Card className="border-primary bg-slate-950 p-6 flex flex-col justify-between space-y-6 relative shadow-xl">
              <Badge className="absolute -top-3 right-6 bg-primary text-white text-[10px] font-bold uppercase px-3">
                Most Popular
              </Badge>

              <div className="space-y-4">
                <Badge variant="outline" className="text-xs font-bold text-emerald-400 border-emerald-500/30">
                  Residential Owners
                </Badge>
                <h3 className="text-2xl font-bold text-white">Standard Bariwala</h3>
                <p className="text-3xl font-extrabold text-white">৳ 999 <span className="text-xs font-normal text-slate-400">/ month</span></p>
                <p className="text-xs text-slate-400">Ideal for residential apartment building owners up to 20 flat units.</p>

                <ul className="space-y-2 text-xs text-slate-300 pt-2">
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> Up to 20 Flat Units &amp; Tenant Profiles</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> Auto Rent Invoicing &amp; bKash/Nagad</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> DPDC/DESCO/DWASA Sub-Meter Module</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> Rent Act 1992 Legal Contract Notice</li>
                </ul>
              </div>

              <Button asChild className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold">
                <Link href="/register">Choose Bariwala Standard</Link>
              </Button>
            </Card>

            {/* Plan 3: Enterprise Caretaker */}
            <Card className="border-slate-800 bg-slate-950 p-6 flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <Badge variant="outline" className="text-xs font-bold text-amber-400 border-amber-500/30">
                  Commercial &amp; Multi-Property
                </Badge>
                <h3 className="text-2xl font-bold text-white">Enterprise Caretaker</h3>
                <p className="text-3xl font-extrabold text-white">৳ 2,499 <span className="text-xs font-normal text-slate-400">/ month</span></p>
                <p className="text-xs text-slate-400">For commercial towers, multi-building caretakers, and property management firms.</p>

                <ul className="space-y-2 text-xs text-slate-300 pt-2">
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-amber-400" /> Unlimited Buildings &amp; Flat Units</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-amber-400" /> Multi-Staff Roles &amp; Security Audit Logs</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-amber-400" /> Automated Telco SMS Dispatches</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-amber-400" /> Priority 24/7 Support &amp; Cash Flow Reports</li>
                </ul>
              </div>

              <Button asChild variant="outline" className="w-full border-slate-800 text-slate-200 hover:bg-slate-800 font-bold">
                <Link href="/register">Choose Enterprise Caretaker</Link>
              </Button>
            </Card>
          </div>
        </div>
      </section>

      {/* ---- Footer ---- */}
      <footer className="border-t border-slate-800 bg-slate-950 py-12 px-4 sm:px-8 mt-auto">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 text-xs text-slate-400">
          <div className="space-y-3">
            <div className="flex items-center gap-2 font-bold text-base text-white">
              <span>🏠 Bariwala Hub</span>
            </div>
            <p className="leading-relaxed">
              Smart property management, automated rent invoicing, SSLCommerz payment processing, and legal compliance engine for Bangladesh.
            </p>
            <p className="text-[11px] text-slate-500 font-mono">
              Premises Rent Control Act 1992 Compliant
            </p>
          </div>

          <div className="space-y-2">
            <p className="font-bold text-white text-sm">Product Links</p>
            <ul className="space-y-1.5">
              <li><Link href="/register" className="hover:text-white">Start 5-Day Free Trial</Link></li>
              <li><Link href="/login" className="hover:text-white">Owner &amp; Caretaker Sign In</Link></li>
              <li><Link href="/tenant-portal" className="hover:text-white">Tenant Self-Service Portal</Link></li>
              <li><a href="#utilities" className="hover:text-white">Sub-Meter Utilities</a></li>
            </ul>
          </div>

          <div className="space-y-2">
            <p className="font-bold text-white text-sm">Legal &amp; Compliance</p>
            <ul className="space-y-1.5">
              <li><Link href="/terms" className="hover:text-white">Terms &amp; Conditions</Link></li>
              <li><Link href="/privacy" className="hover:text-white">Privacy Policy</Link></li>
              <li><Link href="/settings/compliance" className="hover:text-white">Rent Act 1992 Compliance</Link></li>
            </ul>
          </div>

          <div className="space-y-2">
            <p className="font-bold text-white text-sm">Contact &amp; Support</p>
            <p>Dhaka, Bangladesh</p>
            <p className="font-mono text-slate-300">support@bariwalahub.bd</p>
            <p className="font-mono text-slate-300">+880 1700-000000</p>
          </div>
        </div>

        <div className="max-w-7xl mx-auto pt-8 mt-8 border-t border-slate-900 text-center text-[11px] text-slate-600 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p>© 2026 Bariwala Hub. All rights reserved.</p>
          <p className="font-mono">BDT (poisha precision) • SSLCommerz bKash/Nagad</p>
        </div>
      </footer>
    </div>
  );
}
