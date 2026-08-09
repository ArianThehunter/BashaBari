import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Lock } from "lucide-react";

export default function PrivacyPolicyPage() {
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
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/30 text-xs font-semibold">
            <Lock className="w-4 h-4" /> Data Protection Standard
          </div>
          <h1 className="text-3xl font-extrabold text-white">Privacy Policy &amp; Data Security</h1>
          <p className="text-sm text-slate-400">
            Effective Date: August 2026 • Encryption: AES-256 &amp; TLS 1.3
          </p>
        </div>

        {/* Policy Body */}
        <Card className="border-slate-800 bg-slate-900 text-slate-300 leading-relaxed space-y-6 p-6 sm:p-10 text-sm">
          <CardContent className="p-0 space-y-8">
            <section className="space-y-3">
              <h2 className="text-xl font-bold text-white border-b border-slate-800 pb-2">
                1. Data We Collect
              </h2>
              <p>
                To provide rental billing, lease contract generation, and SSLCommerz payment processing, Bariwala Hub collects the following categories of data:
              </p>
              <ul className="list-disc pl-5 space-y-1 text-slate-300">
                <li><strong>Property Owner &amp; Caretaker Account Data</strong>: Name, email address, phone number, organization name.</li>
                <li><strong>Tenant Identification Data</strong>: Full legal name, mobile phone number, National ID (NID) number, Passport number, emergency contact details.</li>
                <li><strong>Premises &amp; Meter Data</strong>: Property address, flat unit numbers, sub-meter serial numbers, monthly utility consumption readings (DPDC, DESCO, DWASA).</li>
                <li><strong>Financial &amp; Payment Transaction Records</strong>: Invoice numbers, payment amounts (poisha), SSLCommerz transaction IDs, card brand/type (masked).</li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-bold text-white border-b border-slate-800 pb-2">
                2. NID Verification &amp; Tenant Privacy
              </h2>
              <p>
                National ID (NID) and Passport numbers collected during tenant onboarding are strictly restricted to lease verification under Bangladesh law. Tenant personal data is never sold, leased, or disclosed to third-party advertisers.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-bold text-white border-b border-slate-800 pb-2">
                3. Payment Encryption (PCI-DSS &amp; SSLCommerz)
              </h2>
              <p>
                All online rent transactions made via bKash, Nagad, Rocket, or Bank Cards are processed directly through <strong>SSLCommerz PCI-DSS certified</strong> gateways. Bariwala Hub never stores unmasked credit card numbers or Mobile Financial Services (MFS) PIN numbers on its servers.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-bold text-white border-b border-slate-800 pb-2">
                4. Automated SMS Notifications &amp; Consent
              </h2>
              <p>
                By providing a mobile phone number, users consent to receiving transactional SMS alerts regarding rent due dates, payment receipts, and emergency maintenance dispatches across Bangladesh mobile operators (Grameenphone, Robi, Banglalink, Teletalk).
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-bold text-white border-b border-slate-800 pb-2">
                5. Security Audit Logging &amp; Infrastructure
              </h2>
              <p>
                Sensitive administrative actions (such as tenant profile deletion, lease termination, or rent refunds) are automatically recorded in immutable <strong>Security Audit Logs</strong> containing the actor&apos;s User ID, event timestamp, IP address, and changed values.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-bold text-white border-b border-slate-800 pb-2">
                6. Contact Privacy Team
              </h2>
              <p>
                For privacy inquiries or data subject access requests:
              </p>
              <p className="font-mono text-xs text-blue-400">
                Bariwala Hub Data Protection Office<br />
                Dhaka, Bangladesh<br />
                Email: privacy@bariwalahub.bd
              </p>
            </section>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center text-xs text-slate-500 pt-4">
          © 2026 Bariwala Hub. All rights reserved. • AES-256 Encrypted Platform
        </div>
      </div>
    </div>
  );
}
