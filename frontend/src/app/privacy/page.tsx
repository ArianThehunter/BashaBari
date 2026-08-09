import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ThemeToggle } from "@/components/theme-toggle";
import { ArrowLeft, Lock, Mail, Phone, MapPin } from "lucide-react";

export default function PrivacyPolicyPage() {
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
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 text-blue-500 border border-blue-500/20 text-xs font-semibold">
            <Lock className="w-4 h-4" /> Data Protection Standard
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground">Privacy Policy &amp; Data Security</h1>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Effective Date: August 2026 • Encryption: AES-256 &amp; TLS 1.3
          </p>
        </div>

        {/* Policy Body */}
        <Card className="border-border bg-card text-foreground leading-relaxed p-6 sm:p-10 text-sm shadow-xs">
          <CardContent className="p-0 space-y-8">
            <section className="space-y-3">
              <h2 className="text-xl font-bold text-foreground border-b border-border pb-2">
                1. Data We Collect
              </h2>
              <p className="text-muted-foreground">
                To provide rental billing, lease contract generation, and SSLCommerz payment processing, <strong className="text-foreground">BashaBari</strong> collects the following categories of data:
              </p>
              <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
                <li><strong>Property Owner &amp; Caretaker Account Data</strong>: Name, email address, phone number, organization name.</li>
                <li><strong>Tenant Identification Data</strong>: Full legal name, mobile phone number, National ID (NID) number, Passport number, emergency contact details.</li>
                <li><strong>Premises &amp; Meter Data</strong>: Property address, flat unit numbers, sub-meter serial numbers, monthly utility consumption readings (DPDC, DESCO, DWASA).</li>
                <li><strong>Financial &amp; Payment Transaction Records</strong>: Invoice numbers, payment amounts (poisha), SSLCommerz transaction IDs, card brand/type (masked).</li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-bold text-foreground border-b border-border pb-2">
                2. NID Verification &amp; Tenant Privacy
              </h2>
              <p className="text-muted-foreground">
                National ID (NID) and Passport numbers collected during tenant onboarding are strictly restricted to lease verification under Bangladesh law. Tenant personal data is never sold, leased, or disclosed to third-party advertisers.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-bold text-foreground border-b border-border pb-2">
                3. Payment Encryption (PCI-DSS &amp; SSLCommerz)
              </h2>
              <p className="text-muted-foreground">
                All online rent transactions made via bKash, Nagad, Rocket, or Bank Cards are processed directly through <strong>SSLCommerz PCI-DSS certified</strong> gateways. BashaBari never stores unmasked credit card numbers or Mobile Financial Services (MFS) PIN numbers on its servers.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-bold text-foreground border-b border-border pb-2">
                4. Automated SMS Notifications &amp; Consent
              </h2>
              <p className="text-muted-foreground">
                By providing a mobile phone number, users consent to receiving transactional SMS alerts regarding rent due dates, payment receipts, and emergency maintenance dispatches across Bangladesh mobile operators.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-bold text-foreground border-b border-border pb-2">
                5. Security Audit Logging &amp; Infrastructure
              </h2>
              <p className="text-muted-foreground">
                Sensitive administrative actions (such as tenant profile deletion, lease termination, or rent refunds) are automatically recorded in immutable <strong>Security Audit Logs</strong> containing the actor&apos;s User ID, event timestamp, IP address, and changed values.
              </p>
            </section>

            <section className="space-y-3 border-t border-border pt-4">
              <h2 className="text-xl font-bold text-foreground">
                6. Contact Privacy Team
              </h2>
              <p className="text-muted-foreground">
                For privacy inquiries or data subject access requests:
              </p>
              <div className="space-y-1 font-mono text-xs text-foreground bg-accent/40 p-4 rounded-lg border border-border">
                <p className="font-bold">BashaBari Data Protection Office</p>
                <p className="flex items-center gap-1.5 text-muted-foreground"><MapPin className="w-3.5 h-3.5 text-primary" /> Dhaka, Bangladesh</p>
                <p className="flex items-center gap-1.5 text-muted-foreground"><Mail className="w-3.5 h-3.5 text-primary" /> readusshalehin22@gmail.com</p>
                <p className="flex items-center gap-1.5 text-muted-foreground"><Phone className="w-3.5 h-3.5 text-primary" /> +8801770207576</p>
              </div>
            </section>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center text-xs text-muted-foreground pt-4">
          © 2026 BashaBari. All rights reserved. • AES-256 Encrypted Platform
        </div>
      </div>
    </div>
  );
}
