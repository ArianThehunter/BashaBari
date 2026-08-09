"use client";

import Link from "next/link";
import { useAuth } from "@/hooks/use-auth";
import { useOrganization } from "@/hooks/use-organization";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Building2, Users, FileText, Wrench, Plus, Sparkles } from "lucide-react";

export default function DashboardHomePage() {
  const { user } = useAuth();
  const { activeOrganization } = useOrganization();

  return (
    <div className="space-y-6">
      {/* ---- Welcome Banner ---- */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-card p-6 rounded-xl border border-border shadow-xs">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Welcome back, {user?.name || "Landlord"}! 👋
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Managing <strong className="text-foreground">{activeOrganization?.name || "Organization"}</strong>
          </p>
        </div>

        <div className="flex gap-2">
          <Button asChild size="sm" className="gap-2">
            <Link href="/properties">
              <Plus className="w-4 h-4" /> Add Property
            </Link>
          </Button>
        </div>
      </div>

      {/* ---- Trial Status Banner (BD-001) ---- */}
      {activeOrganization?.status === "trial" && (
        <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-700 dark:text-amber-400 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-500/20 rounded-lg shrink-0">
              <Sparkles className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <p className="font-semibold text-sm">5-Day Trial Active</p>
              <p className="text-xs text-amber-700/80 dark:text-amber-400/80">
                You have full access to all features during your initial trial period.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ---- Key Metrics Overview Grid ---- */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Properties & Units</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground mt-1">0 Properties / 0 Units</p>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Tenants</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground mt-1">0 Active Leases</p>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Expected Monthly Rent</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">৳0.00</div>
            <p className="text-xs text-muted-foreground mt-1">0 Dues pending</p>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Maintenance Requests</CardTitle>
            <Wrench className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground mt-1">0 Pending issues</p>
          </CardContent>
        </Card>
      </div>

      {/* ---- Getting Started Steps ---- */}
      <Card className="border-border">
        <CardHeader>
          <CardTitle className="text-lg font-bold">Getting Started Roadmap</CardTitle>
          <CardDescription>
            Follow these steps to set up your property operations in Bariwala Hub
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-accent/40 rounded-xl border border-border space-y-2">
              <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary font-bold flex items-center justify-center text-sm">1</div>
              <h3 className="font-semibold text-sm">Add Properties & Units</h3>
              <p className="text-xs text-muted-foreground">
                Set up your buildings, floors, and flat units with rent and meter details.
              </p>
            </div>

            <div className="p-4 bg-accent/40 rounded-xl border border-border space-y-2">
              <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary font-bold flex items-center justify-center text-sm">2</div>
              <h3 className="font-semibold text-sm">Add Tenants & Create Leases</h3>
              <p className="text-xs text-muted-foreground">
                Assign tenants to units, specify rent amounts, due dates, and security deposits.
              </p>
            </div>

            <div className="p-4 bg-accent/40 rounded-xl border border-border space-y-2">
              <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary font-bold flex items-center justify-center text-sm">3</div>
              <h3 className="font-semibold text-sm">Automate Invoices & Receipts</h3>
              <p className="text-xs text-muted-foreground">
                Generate monthly rent bills, record payments, and issue legal-compliant receipts.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
