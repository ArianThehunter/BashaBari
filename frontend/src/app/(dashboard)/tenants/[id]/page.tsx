"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useTenantDetail } from "@/hooks/use-tenant";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  Phone,
  Mail,
  MapPin,
  Briefcase,
  ShieldCheck,
  AlertCircle,
  Loader2,
  FileText,
  UserCheck,
} from "lucide-react";

export default function TenantProfileDetailPage() {
  const params = useParams();
  const tenantId = Number(params.id);

  const { tenant, isLoading } = useTenantDetail(tenantId);

  if (isLoading) {
    return (
      <div className="py-16 text-center text-sm text-muted-foreground flex items-center justify-center gap-2">
        <Loader2 className="w-6 h-6 animate-spin text-primary" /> Loading tenant profile...
      </div>
    );
  }

  if (!tenant) {
    return (
      <div className="text-center py-12 space-y-3">
        <h2 className="text-xl font-bold">Tenant Profile Not Found</h2>
        <p className="text-sm text-muted-foreground">The tenant profile you requested does not exist or was deleted.</p>
        <Button asChild variant="outline">
          <Link href="/tenants">&larr; Back to Tenants</Link>
        </Button>
      </div>
    );
  }

  const isNidVerified = !!tenant.nid_number || !!tenant.passport_number;

  return (
    <div className="space-y-6">
      {/* ---- Navigation Header ---- */}
      <div className="flex items-center justify-between">
        <Button asChild variant="ghost" size="sm">
          <Link href="/tenants">
            <ArrowLeft className="w-4 h-4 mr-1" /> Back to Tenants Directory
          </Link>
        </Button>
      </div>

      {/* ---- Profile Header Card ---- */}
      <Card className="border-border shadow-xs">
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-primary/10 text-primary font-extrabold text-xl flex items-center justify-center shrink-0">
                {tenant.name.charAt(0).toUpperCase()}
              </div>

              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-2xl font-bold tracking-tight">{tenant.name}</h1>
                  <Badge variant="outline" className="capitalize text-emerald-600 border-emerald-500/20 bg-emerald-500/10">
                    {tenant.status}
                  </Badge>
                </div>

                <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground mt-1">
                  <span className="flex items-center gap-1 font-medium text-foreground">
                    <Phone className="w-3.5 h-3.5 text-primary" /> {tenant.phone}
                  </span>
                  {tenant.email && (
                    <span className="flex items-center gap-1">
                      <Mail className="w-3.5 h-3.5 text-primary" /> {tenant.email}
                    </span>
                  )}
                  {tenant.occupation && (
                    <span className="flex items-center gap-1">
                      <Briefcase className="w-3.5 h-3.5 text-primary" /> {tenant.occupation}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Verification Badge */}
            <div>
              {isNidVerified ? (
                <Badge variant="outline" className="text-xs font-semibold gap-1 text-emerald-600 border-emerald-500/20 bg-emerald-500/10 px-3 py-1">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  BD-002 Verified
                </Badge>
              ) : (
                <Badge variant="outline" className="text-xs font-semibold gap-1 text-amber-600 border-amber-500/20 bg-amber-500/10 px-3 py-1">
                  <AlertCircle className="w-4 h-4 text-amber-600" />
                  Missing NID / Passport
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* ---- Details Grid ---- */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Identity & Legal Information */}
        <Card className="border-border">
          <CardHeader>
            <CardTitle className="text-lg font-bold flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-primary" />
              Government Identity Details
            </CardTitle>
            <CardDescription>
              Legal identity metrics required by Bangladesh Rent Act 1992 (BD-002).
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex justify-between py-2 border-b border-border/50">
              <span className="text-muted-foreground">National ID (NID):</span>
              <span className="font-semibold font-mono">{tenant.nid_number || "Not Provided"}</span>
            </div>

            <div className="flex justify-between py-2 border-b border-border/50">
              <span className="text-muted-foreground">Passport Number:</span>
              <span className="font-semibold font-mono">{tenant.passport_number || "Not Provided"}</span>
            </div>

            <div className="flex justify-between py-2 border-b border-border/50">
              <span className="text-muted-foreground">Father&apos;s Name:</span>
              <span className="font-semibold">{tenant.father_name || "Not Provided"}</span>
            </div>

            <div className="py-2">
              <span className="text-muted-foreground block mb-1">Permanent Address:</span>
              <p className="font-medium text-xs bg-accent/40 p-3 rounded-lg flex items-start gap-2">
                <MapPin className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                <span>{tenant.permanent_address || "No permanent address recorded."}</span>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Emergency Contact */}
        <Card className="border-border">
          <CardHeader>
            <CardTitle className="text-lg font-bold flex items-center gap-2">
              <UserCheck className="w-5 h-5 text-primary" />
              Emergency Contact Information
            </CardTitle>
            <CardDescription>
              Primary emergency contact for property managers & caretakers.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex justify-between py-2 border-b border-border/50">
              <span className="text-muted-foreground">Contact Name:</span>
              <span className="font-semibold">{tenant.emergency_contact_name || "Not Provided"}</span>
            </div>

            <div className="flex justify-between py-2 border-b border-border/50">
              <span className="text-muted-foreground">Relationship:</span>
              <span className="font-semibold">{tenant.emergency_contact_relation || "Not Provided"}</span>
            </div>

            <div className="flex justify-between py-2 border-b border-border/50">
              <span className="text-muted-foreground">Contact Phone:</span>
              <span className="font-semibold">{tenant.emergency_contact_phone || "Not Provided"}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Lease History Preview (Prepared for Phase 6) */}
      <Card className="border-border">
        <CardHeader>
          <CardTitle className="text-lg font-bold flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary" />
            Leases & Flat Assignments
          </CardTitle>
          <CardDescription>
            Active and past rental agreement contracts for this tenant.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="py-8 text-center text-sm text-muted-foreground space-y-2">
            <FileText className="w-8 h-8 mx-auto text-muted-foreground" />
            <p className="font-semibold">No Active Leases Yet</p>
            <p className="text-xs max-w-sm mx-auto">
              This tenant profile is ready. You will be able to attach a digital lease contract and assign flat units in Phase 6.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
