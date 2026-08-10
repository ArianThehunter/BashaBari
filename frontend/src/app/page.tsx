import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "@/components/theme-toggle";
import {
  Users,
  Zap,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  Scale,
  Building,
  Mail,
  Phone,
  MapPin,
  ChevronRight,
  HelpCircle,
  XCircle,
  Receipt,
  ShieldCheck,
} from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans selection:bg-primary selection:text-white transition-colors duration-200">
      {/* ---- Navigation Header ---- */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-background/85 border-b border-border px-4 sm:px-8 py-3.5 flex items-center justify-between shadow-xs">
        <Link href="/" className="flex items-center gap-2 font-extrabold text-xl tracking-tight text-foreground">
          <span className="bg-primary text-primary-foreground w-9 h-9 rounded-xl flex items-center justify-center text-base shadow-sm">
            🏠
          </span>
          <span className="tracking-tight">BashaBari</span>
        </Link>

        {/* Dedicated Route Sub-Header Navigation Links */}
        <nav className="hidden lg:flex items-center gap-7 text-xs sm:text-sm font-semibold text-muted-foreground">
          <Link href="/features" className="hover:text-foreground transition-colors">Features</Link>
          <Link href="/who-its-for" className="hover:text-foreground transition-colors">Who It&apos;s For</Link>
          <Link href="/sub-meters" className="hover:text-foreground transition-colors">Sub-Meters</Link>
          <Link href="/pricing" className="hover:text-foreground transition-colors">Pricing</Link>
          <Link href="/tenant-portal" className="hover:text-foreground transition-colors">Tenant Portal</Link>
          <Link href="/compliance" className="hover:text-foreground transition-colors">Legal Act 1992</Link>
          <Link href="/contact" className="hover:text-foreground transition-colors">Contact</Link>
        </nav>

        <div className="flex items-center gap-3">
          {/* Prominent High-Visibility Theme Toggle */}
          <ThemeToggle />

          <Button asChild variant="ghost" className="text-xs sm:text-sm font-semibold hidden sm:inline-flex">
            <Link href="/login">Sign In</Link>
          </Button>

          <Button asChild className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-xs sm:text-sm rounded-lg shadow-sm gap-1.5 px-4 py-2">
            <Link href="/register">
              <span>5-Day Free Trial</span>
              <ArrowRight className="w-4 h-4 hidden sm:inline" />
            </Link>
          </Button>
        </div>
      </header>

      {/* ---- Chapter 1: The Vision (Hero Section) ---- */}
      <section className="relative pt-12 pb-16 px-4 sm:px-8 max-w-6xl mx-auto text-center space-y-8">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-accent border border-border text-xs font-semibold text-foreground shadow-xs">
          <Sparkles className="w-3.5 h-3.5 text-primary" />
          <span>Effortless Property &amp; Rental Operations for Bangladesh</span>
        </div>

        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-foreground max-w-4xl mx-auto leading-tight">
          Property Management, Simplified.
        </h1>

        <p className="text-sm sm:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
          Say goodbye to manual paper notebooks, utility billing math disputes, and delayed rent collection. BashaBari brings clarity, speed, and legal peace of mind to property owners, caretakers, and tenants.
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
        </div>

        {/* Hero Stock Photography Visual Banner */}
        <div className="pt-6 max-w-4xl mx-auto">
          <div className="rounded-2xl overflow-hidden shadow-lg border border-border">
            <img
              src="https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=80"
              alt="Modern Residential Apartment Complex in Bangladesh"
              className="w-full h-64 sm:h-96 object-cover"
            />
          </div>
        </div>
      </section>

      {/* ---- Chapter 2: The Story Transformation (Before vs After) ---- */}
      <section className="py-16 px-4 sm:px-8 bg-accent/30 border-y border-border">
        <div className="max-w-5xl mx-auto space-y-10">
          <div className="text-center space-y-2">
            <Badge variant="outline" className="text-xs font-semibold text-primary border-primary/30">
              The BashaBari Difference
            </Badge>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-foreground">
              From Paper Notebook Chaos to Digital Clarity
            </h2>
            <p className="text-muted-foreground text-xs sm:text-base max-w-lg mx-auto">
              See how BashaBari transforms daily property management for landlords and caretakers across Bangladesh.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Old Way */}
            <Card className="border-border bg-card p-6 space-y-4">
              <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400 font-bold text-base border-b border-border pb-3">
                <XCircle className="w-5 h-5 shrink-0" />
                <span>The Manual Way (Before)</span>
              </div>
              <ul className="space-y-3 text-xs sm:text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-rose-500 font-bold">•</span>
                  <span>Writing rent payments in paper ledger notebooks that get lost or damaged.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-rose-500 font-bold">•</span>
                  <span>Manually calculating DPDC/DESCO/DWASA sub-meter units and arguing over calculations.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-rose-500 font-bold">•</span>
                  <span>Chasing tenants for cash or waiting for unverified bank transfers.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-rose-500 font-bold">•</span>
                  <span>Unsure about legal protection under the Premises Rent Control Act 1992.</span>
                </li>
              </ul>
            </Card>

            {/* BashaBari Way */}
            <Card className="border-primary bg-card p-6 space-y-4 shadow-sm">
              <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold text-base border-b border-border pb-3">
                <CheckCircle2 className="w-5 h-5 shrink-0" />
                <span>The BashaBari Way (Now)</span>
              </div>
              <ul className="space-y-3 text-xs sm:text-sm text-foreground/90 font-medium">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span>Automated monthly rent invoices sent straight to tenant phones via SMS.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span>Pre-configured DPDC, DESCO, and WASA tariff formulas with poisha accuracy.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span>1-Click rent checkout via bKash, Nagad &amp; SSLCommerz with auto receipts.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span>Legally binding tenancy contracts adhering to Bangladesh Rent Act 1992.</span>
                </li>
              </ul>
            </Card>
          </div>
        </div>
      </section>

      {/* ---- Chapter 3: The Three Pillars ---- */}
      <section className="py-16 px-4 sm:px-8 max-w-6xl mx-auto space-y-12">
        <div className="text-center space-y-2">
          <Badge variant="outline" className="text-xs font-semibold text-primary border-primary/30">
            Core Pillars
          </Badge>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-foreground">
            Everything You Need to Manage Properties Wisely
          </h2>
          <p className="text-muted-foreground text-xs sm:text-base max-w-lg mx-auto">
            Discover how BashaBari streamlines operations into three simple, intuitive pillars.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Pillar 1 */}
          <Card className="border-border bg-card overflow-hidden hover:shadow-md transition-all flex flex-col justify-between">
            <div>
              <div className="h-48 overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=600&q=80"
                  alt="Property Keys and Rent Collection"
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                />
              </div>
              <div className="p-6 space-y-3">
                <div className="flex items-center gap-2 text-primary font-bold text-xs">
                  <Receipt className="w-4 h-4" /> Pillar 01
                </div>
                <h3 className="text-lg font-bold text-foreground">Smart Rent Collection</h3>
                <p className="text-muted-foreground text-xs sm:text-sm leading-relaxed">
                  Automate invoice creation, collect rent online via bKash/Nagad, and access double-entry ledger reports.
                </p>
              </div>
            </div>
            <div className="p-6 pt-0">
              <Button asChild variant="outline" size="sm" className="w-full font-semibold">
                <Link href="/features">Explore Features <ChevronRight className="w-3.5 h-3.5 ml-1" /></Link>
              </Button>
            </div>
          </Card>

          {/* Pillar 2 */}
          <Card className="border-border bg-card overflow-hidden hover:shadow-md transition-all flex flex-col justify-between">
            <div>
              <div className="h-48 overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=600&q=80"
                  alt="Sub-Meter Utility Management"
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                />
              </div>
              <div className="p-6 space-y-3">
                <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 font-bold text-xs">
                  <Zap className="w-4 h-4" /> Pillar 02
                </div>
                <h3 className="text-lg font-bold text-foreground">Sub-Meter Utilities</h3>
                <p className="text-muted-foreground text-xs sm:text-sm leading-relaxed">
                  Log kWh and unit readings for DPDC, DESCO, BREB, WASA, and Titas Gas with poisha accuracy.
                </p>
              </div>
            </div>
            <div className="p-6 pt-0">
              <Button asChild variant="outline" size="sm" className="w-full font-semibold">
                <Link href="/sub-meters">Explore Sub-Meters <ChevronRight className="w-3.5 h-3.5 ml-1" /></Link>
              </Button>
            </div>
          </Card>

          {/* Pillar 3 */}
          <Card className="border-border bg-card overflow-hidden hover:shadow-md transition-all flex flex-col justify-between">
            <div>
              <div className="h-48 overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=600&q=80"
                  alt="Legal Tenancy Contract Protection"
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                />
              </div>
              <div className="p-6 space-y-3">
                <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 font-bold text-xs">
                  <Scale className="w-4 h-4" /> Pillar 03
                </div>
                <h3 className="text-lg font-bold text-foreground">Legal &amp; Security Shield</h3>
                <p className="text-muted-foreground text-xs sm:text-sm leading-relaxed">
                  Standardized tenancy contracts adhering to Premises Rent Control Act 1992 with security audit logs.
                </p>
              </div>
            </div>
            <div className="p-6 pt-0">
              <Button asChild variant="outline" size="sm" className="w-full font-semibold">
                <Link href="/compliance">Legal Act 1992 Guide <ChevronRight className="w-3.5 h-3.5 ml-1" /></Link>
              </Button>
            </div>
          </Card>
        </div>
      </section>

      {/* ---- Chapter 4: Effortless Call to Action ---- */}
      <section className="py-16 px-4 sm:px-8 bg-accent/40 border-t border-border text-center">
        <div className="max-w-3xl mx-auto space-y-6">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-foreground">
            Ready to Experience Stress-Free Property Management?
          </h2>
          <p className="text-muted-foreground text-xs sm:text-base max-w-xl mx-auto leading-relaxed">
            Join property owners and caretakers across Bangladesh. Start your 5-Day Full-Featured Free Trial today.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button asChild size="lg" className="w-full sm:w-auto font-extrabold px-8 py-6 rounded-xl shadow-md gap-2">
              <Link href="/register">
                Start 5-Day Free Trial <ArrowRight className="w-4 h-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="w-full sm:w-auto font-semibold px-8 py-6 rounded-xl">
              <Link href="/pricing">View Transparent Pricing Plans</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* ---- Footer ---- */}
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
              <li><Link href="/features" className="hover:text-foreground transition-colors">Features</Link></li>
              <li><Link href="/who-its-for" className="hover:text-foreground transition-colors">Who It&apos;s For</Link></li>
              <li><Link href="/sub-meters" className="hover:text-foreground transition-colors">Sub-Meter Utilities</Link></li>
              <li><Link href="/pricing" className="hover:text-foreground transition-colors">Pricing Plans</Link></li>
              <li><Link href="/tenant-portal" className="hover:text-foreground transition-colors">Tenant Self-Service Portal</Link></li>
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
