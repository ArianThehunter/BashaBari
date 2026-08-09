import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ThemeToggle } from "@/components/theme-toggle";
import { ArrowLeft, Scale, Mail, Phone, MapPin } from "lucide-react";

export default function TermsAndConditionsPage() {
  return (
    <div className="min-h-screen bg-background text-foreground p-4 sm:p-8 font-sans">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Navigation Top */}
        <div className="flex items-center justify-between">
          <Button asChild variant="ghost" size="sm">
            <Link href="/" className="gap-1">
              <ArrowLeft className="w-4 h-4" /> Back to Home
            </Link>
          </Button>

          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Link href="/" className="font-extrabold text-lg text-primary flex items-center gap-1.5">
              <span>🏠</span> BashaBari
            </Link>
          </div>
        </div>

        {/* Header Card */}
        <div className="bg-card p-6 sm:p-8 rounded-2xl border border-border space-y-3 shadow-xs">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary border border-primary/20 text-xs font-semibold">
            <Scale className="w-4 h-4" /> Official Legal Agreement
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground">Terms &amp; Conditions of Service</h1>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Effective Date: August 2026 • Governing Law: The Laws of the People&apos;s Republic of Bangladesh
          </p>
        </div>

        {/* Terms Content Body */}
        <Card className="border-border bg-card text-foreground leading-relaxed p-6 sm:p-10 text-sm shadow-xs">
          <CardContent className="p-0 space-y-8">
            <section className="space-y-3">
              <h2 className="text-xl font-bold text-foreground border-b border-border pb-2">
                1. Acceptance of Terms &amp; Scope
              </h2>
              <p className="text-muted-foreground">
                By registering an account, creating an organization, or utilizing the <strong className="text-foreground">BashaBari</strong> platform, property owners (&quot;Bariwalas&quot;), caretakers, property managers, and tenants (&quot;Users&quot;) explicitly agree to be bound by these Terms and Conditions. These terms apply to all rental billing, sub-meter utility tracking, lease creation, and payment operations processed through the system.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-bold text-foreground border-b border-border pb-2">
                2. Subscription &amp; 5-Day Free Trial Policy (BD-001)
              </h2>
              <p className="text-muted-foreground">
                Pursuant to platform policy code <strong>BD-001</strong>:
              </p>
              <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
                <li>Every newly registered organization receives a non-transferable <strong>5-Day Free Trial</strong> commencing immediately upon account creation.</li>
                <li>Trial duration is calculated according to Bangladesh Standard Time (<code className="text-primary font-mono">Asia/Dhaka</code>).</li>
                <li>No credit card or advance payment details are required during the trial period. Upon expiration of the 5-day trial, continued access requires subscribing to a paid plan.</li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-bold text-foreground border-b border-border pb-2">
                3. Premises Rent Control Act 1992 Compliance (BD-002 &amp; BD-003)
              </h2>
              <p className="text-muted-foreground">
                BashaBari operates in strict accordance with the <strong>Premises Rent Control Act 1992 of Bangladesh</strong>:
              </p>
              <ul className="list-disc pl-5 space-y-2 text-muted-foreground">
                <li><strong>Section 18 Statutory Notices (BD-002)</strong>: All lease agreements and eviction notices generated through the system embed statutory notice clauses as mandated by Section 18 of the Rent Control Act 1992.</li>
                <li><strong>Lease Tenure Constraints (BD-003)</strong>: Standard tenancy contracts created on the platform must specify a valid lease term between 1 and 2 years (12 to 24 months).</li>
                <li>Landlords and caretakers warrant that all premises descriptions, flat unit numbers, and rent amounts entered are truthful and lawful.</li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-bold text-foreground border-b border-border pb-2">
                4. Financial Calculations &amp; Poisha Precision Standard (BD-MONEY)
              </h2>
              <p className="text-muted-foreground">
                To eliminate floating-point rounding discrepancies, all monetary values (rent subtotal, taxes, security deposits, utility costs, ledger entries) are stored and calculated using the <strong>Integer Poisha Standard</strong> (<code className="text-primary font-mono">1 BDT = 100 poisha</code>).
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-bold text-foreground border-b border-border pb-2">
                5. Payment Processing &amp; SSLCommerz Integration
              </h2>
              <p className="text-muted-foreground">
                Rent payments processed via mobile financial services (bKash, Nagad, Rocket) or bank debit/credit cards are securely routed through <strong>SSLCommerz</strong> payment gateways. Users agree that:
              </p>
              <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
                <li>Successful payment callbacks automatically update invoice status to `paid` or `partially_paid` and issue an official printable receipt (<code className="text-primary font-mono">/invoices/[id]/print</code>).</li>
                <li>Transaction reference numbers (<code className="text-primary font-mono">tran_id</code>, <code className="text-primary font-mono">val_id</code>) are permanently stored for audit verification.</li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-bold text-foreground border-b border-border pb-2">
                6. Sub-Meter Utility Billing
              </h2>
              <p className="text-muted-foreground">
                The platform provides sub-meter tariff logging for 10 Bangladesh utility providers (DPDC, DESCO, BREB, NESCO, WZPDCL, Titas Gas, Karnaphuli Gas, Jalalabad Gas, DWASA, CWASA). Caretakers and property owners are solely responsible for inputting accurate meter serial numbers and meter readings.
              </p>
            </section>

            <section className="space-y-3 border-t border-border pt-4">
              <h2 className="text-xl font-bold text-foreground">
                7. Contact Information
              </h2>
              <p className="text-muted-foreground">
                For questions regarding these Terms &amp; Conditions or legal compliance inquiries:
              </p>
              <div className="space-y-1 font-mono text-xs text-foreground bg-accent/40 p-4 rounded-lg border border-border">
                <p className="font-bold">BashaBari Compliance Office</p>
                <p className="flex items-center gap-1.5 text-muted-foreground"><MapPin className="w-3.5 h-3.5 text-primary" /> Dhaka, Bangladesh</p>
                <p className="flex items-center gap-1.5 text-muted-foreground"><Mail className="w-3.5 h-3.5 text-primary" /> readusshalehin22@gmail.com</p>
                <p className="flex items-center gap-1.5 text-muted-foreground"><Phone className="w-3.5 h-3.5 text-primary" /> +8801770207576</p>
              </div>
            </section>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center text-xs text-muted-foreground pt-4">
          © 2026 BashaBari. All rights reserved. • Premises Rent Control Act 1992 Compliant
        </div>
      </div>
    </div>
  );
}
