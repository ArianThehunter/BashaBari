import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Scale } from "lucide-react";

export default function TermsAndConditionsPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 sm:p-8 font-sans">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Navigation Top */}
        <div className="flex items-center justify-between">
          <Button asChild variant="ghost" size="sm" className="text-slate-300 hover:text-white">
            <Link href="/">
              <ArrowLeft className="w-4 h-4 mr-1" /> Back to Home
            </Link>
          </Button>

          <Link href="/" className="font-extrabold text-lg text-white">
            🏠 Bariwala Hub
          </Link>
        </div>

        {/* Header Card */}
        <div className="bg-slate-900 p-8 rounded-2xl border border-slate-800 space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-xs font-semibold">
            <Scale className="w-4 h-4" /> Official Legal Agreement
          </div>
          <h1 className="text-3xl font-extrabold text-white">Terms &amp; Conditions of Service</h1>
          <p className="text-sm text-slate-400">
            Effective Date: August 2026 • Governing Law: The Laws of the People&apos;s Republic of Bangladesh
          </p>
        </div>

        {/* Terms Content Body */}
        <Card className="border-slate-800 bg-slate-900 text-slate-300 leading-relaxed space-y-6 p-6 sm:p-10 text-sm">
          <CardContent className="p-0 space-y-8">
            <section className="space-y-3">
              <h2 className="text-xl font-bold text-white border-b border-slate-800 pb-2">
                1. Acceptance of Terms &amp; Scope
              </h2>
              <p>
                By registering an account, creating an organization, or utilizing the <strong>Bariwala Hub</strong> platform, property owners (&quot;Bariwalas&quot;), caretakers, property managers, and tenants (&quot;Users&quot;) explicitly agree to be bound by these Terms and Conditions. These terms apply to all rental billing, sub-meter utility tracking, lease creation, and payment operations processed through the system.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-bold text-white border-b border-slate-800 pb-2">
                2. Subscription &amp; 5-Day Free Trial Policy (BD-001)
              </h2>
              <p>
                Pursuant to platform policy code <strong>BD-001</strong>:
              </p>
              <ul className="list-disc pl-5 space-y-1 text-slate-300">
                <li>Every newly registered organization receives a non-transferable <strong>5-Day Free Trial</strong> commencing immediately upon account creation.</li>
                <li>Trial duration is calculated according to Bangladesh Standard Time (<code className="text-emerald-400">Asia/Dhaka</code>).</li>
                <li>No credit card or advance payment details are required during the trial period. Upon expiration of the 5-day trial, continued access requires subscribing to a paid plan.</li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-bold text-white border-b border-slate-800 pb-2">
                3. Premises Rent Control Act 1992 Compliance (BD-002 &amp; BD-003)
              </h2>
              <p>
                Bariwala Hub operates in strict accordance with the <strong>Premises Rent Control Act 1992 of Bangladesh</strong>:
              </p>
              <ul className="list-disc pl-5 space-y-2 text-slate-300">
                <li><strong>Section 18 Statutory Notices (BD-002)</strong>: All lease agreements and eviction notices generated through the system embed statutory notice clauses as mandated by Section 18 of the Rent Control Act 1992.</li>
                <li><strong>Lease Tenure Constraints (BD-003)</strong>: Standard tenancy contracts created on the platform must specify a valid lease term between 1 and 2 years (12 to 24 months).</li>
                <li>Landlords and caretakers warrant that all premises descriptions, flat unit numbers, and rent amounts entered are truthful and lawful.</li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-bold text-white border-b border-slate-800 pb-2">
                4. Financial Calculations &amp; Poisha Precision Standard (BD-MONEY)
              </h2>
              <p>
                To eliminate floating-point rounding discrepancies, all monetary values (rent subtotal, taxes, security deposits, utility costs, ledger entries) are stored and calculated using the <strong>Integer Poisha Standard</strong> (<code className="text-emerald-400">1 BDT = 100 poisha</code>).
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-bold text-white border-b border-slate-800 pb-2">
                5. Payment Processing &amp; SSLCommerz Integration
              </h2>
              <p>
                Rent payments processed via mobile financial services (bKash, Nagad, Rocket) or bank debit/credit cards are securely routed through <strong>SSLCommerz</strong> payment gateways. Users agree that:
              </p>
              <ul className="list-disc pl-5 space-y-1 text-slate-300">
                <li>Successful payment callbacks automatically update invoice status to `paid` or `partially_paid` and issue an official printable receipt (`/invoices/[id]/print`).</li>
                <li>Transaction reference numbers (<code className="text-emerald-400">tran_id</code>, <code className="text-emerald-400">val_id</code>) are permanently stored for audit verification.</li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-bold text-white border-b border-slate-800 pb-2">
                6. Advance Rent Refunds &amp; Deposit Policy (BD-008)
              </h2>
              <p>
                Under policy code <strong>BD-008</strong>, financial refunds issued through the platform are strictly constrained to <strong>advance rent paid</strong> in scenarios where a tenant vacates prior to lease expiration. Security deposits are retained until final damage inspection and utility balance clearance.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-bold text-white border-b border-slate-800 pb-2">
                7. Sub-Meter Utility Billing
              </h2>
              <p>
                The platform provides sub-meter tariff logging for 10 Bangladesh utility providers (DPDC, DESCO, BREB, NESCO, WZPDCL, Titas Gas, Karnaphuli Gas, Jalalabad Gas, DWASA, CWASA). Caretakers and property owners are solely responsible for inputting accurate meter serial numbers and meter readings.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-bold text-white border-b border-slate-800 pb-2">
                8. Contact Information
              </h2>
              <p>
                For questions regarding these Terms &amp; Conditions or legal compliance inquiries:
              </p>
              <p className="font-mono text-xs text-emerald-400">
                Bariwala Hub Compliance Office<br />
                Dhaka, Bangladesh<br />
                Email: legal@bariwalahub.bd
              </p>
            </section>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center text-xs text-slate-500 pt-4">
          © 2026 Bariwala Hub. All rights reserved. • Premises Rent Control Act 1992 Compliant
        </div>
      </div>
    </div>
  );
}
