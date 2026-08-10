import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "@/components/theme-toggle";
import { HelpCircle, ArrowLeft, ArrowRight, Mail, Phone } from "lucide-react";

export default function FAQPage() {
  const faqs = [
    {
      category: "General & Free Trial",
      questions: [
        {
          q: "How does the 5-Day Free Trial work?",
          a: "When you create an account, your organization receives full access to all platform features for 5 days. No credit card or advance payment details are required.",
        },
        {
          q: "What happens when my free trial expires?",
          a: "After 5 days, you will be prompted to choose a paid plan (Standard Bariwala at ৳999/mo or Enterprise Caretaker at ৳1,499/mo). All your data, properties, and invoice records remain safely preserved.",
        },
        {
          q: "Can I manage multiple buildings under one account?",
          a: "Yes! The Enterprise Caretaker plan (৳1,499/mo) supports unlimited residential buildings, commercial towers, and flat units under a single organization dashboard.",
        },
      ],
    },
    {
      category: "Rent Payments & bKash / Nagad Checkout",
      questions: [
        {
          q: "How do tenants pay rent online?",
          a: "Tenants log into the mobile-first Tenant Portal or click the SMS payment link. They can pay via bKash, Nagad, Rocket, or Bank Card through SSLCommerz PCI-DSS certified gateways.",
        },
        {
          q: "Are official payment receipts generated?",
          a: "Yes! Once a payment is completed, BashaBari automatically updates invoice status to paid and generates an official printable PDF receipt.",
        },
        {
          q: "What is the Poisha Precision Standard?",
          a: "All monetary values are stored and calculated using integer poisha precision (1 BDT = 100 poisha) to eliminate rounding errors on utility bills or rent breakdown calculations.",
        },
      ],
    },
    {
      category: "Sub-Meter Utility Tracking",
      questions: [
        {
          q: "Which Bangladesh utility providers are supported?",
          a: "BashaBari supports electricity sub-meters (DPDC, DESCO, BREB, NESCO, WZPDCL), natural gas (Titas, Karnaphuli, Jalalabad), and WASA water (DWASA, CWASA).",
        },
        {
          q: "Do landlords or caretakers need to do manual utility math?",
          a: "No! Caretakers simply input the current month's sub-meter reading. BashaBari subtracts previous readings and automatically applies official tariffs.",
        },
      ],
    },
    {
      category: "Legal & Premises Rent Control Act 1992",
      questions: [
        {
          q: "Is BashaBari compliant with Bangladeshi tenancy law?",
          a: "Yes. All lease templates and notice generators adhere to the Premises Rent Control Act 1992 of Bangladesh, including statutory Section 18 notice clauses and 12-24 month tenure rules.",
        },
        {
          q: "Is my personal identification data (NID) safe?",
          a: "National ID (NID) and Passport data are strictly encrypted (AES-256) and used solely for legal verification. Data is never shared or sold to third parties.",
        },
      ],
    },
  ];

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
          <Link href="/faq" className="text-foreground font-bold">FAQ</Link>
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
      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-8 py-12 space-y-12">
        <div className="text-center space-y-3">
          <Badge variant="outline" className="text-xs font-semibold text-primary border-primary/30">
            Support Knowledge Base
          </Badge>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight">
            Frequently Asked Questions
          </h1>
          <p className="text-muted-foreground text-sm sm:text-base max-w-xl mx-auto">
            Find clear answers regarding subscriptions, bKash/Nagad rent payments, sub-meter utility billing, and legal protection.
          </p>
        </div>

        {/* Categorized FAQs */}
        <div className="space-y-10">
          {faqs.map((cat, idx) => (
            <div key={idx} className="space-y-4">
              <h2 className="text-xl font-bold text-foreground border-b border-border pb-2 flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-primary" />
                <span>{cat.category}</span>
              </h2>

              <div className="space-y-4">
                {cat.questions.map((faq, fIdx) => (
                  <Card key={fIdx} className="p-5 border-border bg-card space-y-2">
                    <h3 className="font-bold text-sm sm:text-base text-foreground">{faq.q}</h3>
                    <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">{faq.a}</p>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Still Have Questions Box */}
        <div className="bg-accent/40 border border-border p-8 rounded-2xl text-center space-y-4">
          <h2 className="text-2xl font-bold">Still Have Questions?</h2>
          <p className="text-muted-foreground text-xs sm:text-sm max-w-xl mx-auto">
            Our support team in Dhaka is ready to help you configure your property or answer any inquiries.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <Button asChild size="sm" className="font-bold gap-2">
              <Link href="/contact">
                Contact Support Team <ArrowRight className="w-4 h-4" />
              </Link>
            </Button>
            <div className="text-xs font-mono text-muted-foreground">
              ✉️ readusshalehin22@gmail.com | 📞 +8801770207576
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-card py-6 px-4 text-center text-xs text-muted-foreground mt-auto">
        <p>© 2026 BashaBari. All rights reserved. • Premises Rent Control Act 1992 Compliant</p>
      </footer>
    </div>
  );
}
