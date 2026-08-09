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
      {/* ---- Header Navigation Bar ---- */}
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
        {/* Soft Radial Glow Accent */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[34rem] h-[34rem] bg-primary/10 rounded-full blur-3xl -z-10 pointer-events-none" />

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

        {/* Hero Stock Photography Visual Banner */}
        <div className="pt-6 max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="rounded-2xl overflow-hidden shadow-md border border-border group relative h-48 md:h-56">
            <img
              src="https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=800&q=80"
              alt="Modern Residential Apartment Tower in Bangladesh"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent flex items-end p-4">
              <span className="text-white text-xs font-bold font-sans">Multi-Story Residential Towers</span>
            </div>
          </div>

          <div className="rounded-2xl overflow-hidden shadow-md border border-border group relative h-48 md:h-56">
            <img
              src="https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=800&q=80"
              alt="Property Owner holding keys"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent flex items-end p-4">
              <span className="text-white text-xs font-bold font-sans">Bariwala &amp; Caretaker Operations</span>
            </div>
          </div>

          <div className="rounded-2xl overflow-hidden shadow-md border border-border group relative h-48 md:h-56">
            <img
              src="https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&q=80"
              alt="Sleek Flat Interior Living Room"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent flex items-end p-4">
              <span className="text-white text-xs font-bold font-sans">Tenant Self-Service Portal</span>
            </div>
          </div>
        </div>

        {/* Hero Interactive Dashboard Preview Mockup */}
        <div className="pt-4 max-w-5xl mx-auto">
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

      {/* ---- Stakeholder Solutions Overview ---- */}
      <section className="py-16 px-4 sm:px-8 bg-accent/20 border-y border-border">
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
            <Card className="border-border bg-card p-6 space-y-4 hover:shadow-md transition-all flex flex-col justify-between">
              <div className="space-y-3">
                <div className="w-11 h-11 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold text-xl">
                  🏠
                </div>
                <h3 className="text-lg font-bold text-foreground">For Property Owners (Bariwalas)</h3>
                <p className="text-muted-foreground text-xs sm:text-sm leading-relaxed">
                  Automate monthly rent billing (`INV-YYYYMM-XXX`), collect rent online via bKash/Nagad/SSLCommerz, and track net profit with general ledger accounting.
                </p>
              </div>
              <Button asChild variant="outline" size="sm" className="w-full text-xs font-semibold mt-4">
                <Link href="/who-its-for">Learn More <ChevronRight className="w-3.5 h-3.5 ml-1" /></Link>
              </Button>
            </Card>

            {/* Card 2: Caretakers & Managers */}
            <Card className="border-border bg-card p-6 space-y-4 hover:shadow-md transition-all flex flex-col justify-between">
              <div className="space-y-3">
                <div className="w-11 h-11 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold text-xl">
                  🔑
                </div>
                <h3 className="text-lg font-bold text-foreground">For Caretakers &amp; Managers</h3>
                <p className="text-muted-foreground text-xs sm:text-sm leading-relaxed">
                  Log monthly sub-meter electricity (DPDC, DESCO, BREB), gas, and WASA water readings. Dispatch repair technicians for plumbing or emergency maintenance.
                </p>
              </div>
              <Button asChild variant="outline" size="sm" className="w-full text-xs font-semibold mt-4">
                <Link href="/who-its-for">Learn More <ChevronRight className="w-3.5 h-3.5 ml-1" /></Link>
              </Button>
            </Card>

            {/* Card 3: Tenants */}
            <Card className="border-border bg-card p-6 space-y-4 hover:shadow-md transition-all flex flex-col justify-between">
              <div className="space-y-3">
                <div className="w-11 h-11 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-xl">
                  📱
                </div>
                <h3 className="text-lg font-bold text-foreground">For Tenants</h3>
                <p className="text-muted-foreground text-xs sm:text-sm leading-relaxed">
                  Access your mobile-first self-service portal (`/tenant-portal`), pay rent in 1-click via bKash/Nagad, download official printable receipts, and request repairs.
                </p>
              </div>
              <Button asChild variant="outline" size="sm" className="w-full text-xs font-semibold mt-4">
                <Link href="/tenant-portal">Access Portal <ChevronRight className="w-3.5 h-3.5 ml-1" /></Link>
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
