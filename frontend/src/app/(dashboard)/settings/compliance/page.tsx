"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Scale, CheckCircle2, ShieldAlert, FileText, Landmark, Clock, RefreshCw } from "lucide-react";

export default function LegalCompliancePage() {
  const complianceRules = [
    {
      id: "BD-001",
      title: "First-Time 5-Day Free Trial Guarantee",
      status: "Automated Enforcement",
      icon: Clock,
      description:
        "Initial organization registrations automatically activate a 5-day full-featured free trial period calculated using Bangladesh Standard Time (Asia/Dhaka).",
      implementation: "Automatic 5-day trial period calculated in Bangladesh Standard Time.",
    },
    {
      id: "BD-002",
      title: "Bangladesh Rent Act 1992 Eviction Statutory Notice",
      status: "Automated Compliance",
      icon: FileText,
      description:
        "Tenant profiles and eviction proceedings strictly embed the mandatory legal notice clauses pursuant to Section 18 of the Premises Rent Control Act 1992 of Bangladesh.",
      implementation: "Legally binding eviction notice templates generated on tenant profiles and legal documents.",
    },
    {
      id: "BD-003",
      title: "Standard Lease Duration (1 to 2 Years)",
      status: "Automated Validation",
      icon: Scale,
      description:
        "Lease creation wizard enforces standard 12 to 24-month contract terms compliant with Bangladesh commercial and residential tenancy standards.",
      implementation: "Standard 12 to 24-month tenancy contract terms generated automatically.",
    },
    {
      id: "BD-008",
      title: "Advance Rent Refund Policy",
      status: "Automated Accounting",
      icon: RefreshCw,
      description:
        "Refunds are strictly restricted to advance rent paid when a tenant vacates early. Security deposits are calculated against damages before settlement.",
      implementation: "Advance rent balance verified before processing early vacate refunds.",
    },
    {
      id: "BD-MONEY",
      title: "Poisha Integer Financial Precision Standard",
      status: "Zero Precision Loss",
      icon: Landmark,
      description:
        "All currency values across DB schemas, invoices, and payment gateways are stored as integer poisha (1 BDT = 100 poisha) to prevent floating-point inaccuracies.",
      implementation: "100% poisha accounting standard to prevent currency calculation errors.",
    },
  ];

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Legal &amp; Regulatory Compliance</h1>
        <p className="text-sm text-muted-foreground">
          Compliance protection under the Premises Rent Control Act 1992 of Bangladesh and platform business rules
        </p>
      </div>

      {/* Compliance Overview Banner */}
      <Card className="border-emerald-500/30 bg-emerald-500/5 dark:bg-emerald-500/10">
        <CardContent className="p-6 flex items-start gap-4">
          <div className="p-3 rounded-full bg-emerald-600 text-white shrink-0">
            <Scale className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-foreground">
                Premises Rent Control Act 1992 — Fully Compliant
              </h2>
              <Badge className="bg-emerald-600 text-white text-xs font-semibold">Verified Active</Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              BashaBari has automated legal notice generation, lease term enforcement, advance rent refund constraints, and financial precision standards built directly into its core engine.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Rules List */}
      <div className="grid grid-cols-1 gap-4">
        {complianceRules.map((rule) => {
          const Icon = rule.icon;
          return (
            <Card key={rule.id} className="border-border shadow-sm">
              <CardHeader className="py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10 text-primary">
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <CardTitle className="text-base font-bold flex items-center gap-2">
                        {rule.title}
                        <Badge variant="outline" className="text-[10px] font-mono">
                          {rule.id}
                        </Badge>
                      </CardTitle>
                      <CardDescription className="text-xs">{rule.description}</CardDescription>
                    </div>
                  </div>

                  <Badge className="bg-emerald-600/10 text-emerald-600 border-emerald-500/30 text-xs font-semibold shrink-0 gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> {rule.status}
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="pb-4 pt-0">
                <div className="p-3 rounded-md bg-accent/40 border border-border text-xs text-muted-foreground font-medium flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-primary shrink-0" />
                  <span>Protection Guarantee: {rule.implementation}</span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
