"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useLeaseDetail } from "@/hooks/use-lease";
import { formatMoney } from "@/lib/money";
import { terminateLeaseSchema, type TerminateLeaseInput } from "@/lib/validations/lease";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  ArrowLeft,
  Calendar,
  Home,
  Users,
  ShieldCheck,
  AlertCircle,
  Loader2,
  Phone,
  DollarSign,
  AlertTriangle,
} from "lucide-react";

export default function LeaseDetailContractPage() {
  const params = useParams();
  const leaseId = Number(params.id);

  const { lease, isLoading, terminateLease, isTerminatingLease } = useLeaseDetail(leaseId);
  const [isTerminateDialogOpen, setIsTerminateDialogOpen] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<TerminateLeaseInput>({
    resolver: zodResolver(terminateLeaseSchema),
    defaultValues: {
      termination_reason: "",
    },
  });

  const onTerminateSubmit = async (data: TerminateLeaseInput) => {
    setServerError(null);
    try {
      await terminateLease(data);
      setIsTerminateDialogOpen(false);
    } catch {
      setServerError("Failed to terminate lease agreement.");
    }
  };

  if (isLoading) {
    return (
      <div className="py-16 text-center text-sm text-muted-foreground flex items-center justify-center gap-2">
        <Loader2 className="w-6 h-6 animate-spin text-primary" /> Loading lease contract details...
      </div>
    );
  }

  if (!lease) {
    return (
      <div className="text-center py-12 space-y-3">
        <h2 className="text-xl font-bold">Lease Contract Not Found</h2>
        <p className="text-sm text-muted-foreground">The lease agreement you requested does not exist or was deleted.</p>
        <Button asChild variant="outline">
          <Link href="/leases">&larr; Back to Leases</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* ---- Navigation Header ---- */}
      <div className="flex items-center justify-between">
        <Button asChild variant="ghost" size="sm">
          <Link href="/leases">
            <ArrowLeft className="w-4 h-4 mr-1" /> Back to Leases Directory
          </Link>
        </Button>
      </div>

      {/* ---- Lease Header Card ---- */}
      <Card className="border-border shadow-xs">
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold tracking-tight">Lease Agreement #{lease.id}</h1>
                <Badge
                  variant={lease.status === "active" ? "default" : "outline"}
                  className={`capitalize text-xs ${
                    lease.status === "active"
                      ? "bg-primary text-primary-foreground"
                      : lease.status === "terminated"
                        ? "text-destructive border-destructive/20 bg-destructive/10"
                        : "text-muted-foreground"
                  }`}
                >
                  {lease.status}
                </Badge>
              </div>

              <p className="text-sm text-muted-foreground flex items-center gap-1.5 mt-1">
                <Calendar className="w-4 h-4 text-primary shrink-0" />
                <span>
                  Contract Period: <strong>{lease.start_date}</strong> to <strong>{lease.end_date}</strong>
                </span>
              </p>
            </div>

            {/* Terminate Modal Trigger */}
            {lease.status === "active" && (
              <Dialog open={isTerminateDialogOpen} onOpenChange={setIsTerminateDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="destructive" className="gap-2 font-semibold">
                    <AlertTriangle className="w-4 h-4" /> Terminate Lease
                  </Button>
                </DialogTrigger>

                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-destructive">
                      <AlertTriangle className="w-5 h-5" />
                      Terminate Lease Agreement
                    </DialogTitle>
                    <DialogDescription>
                      Terminating this lease will set the flat unit back to vacant.
                    </DialogDescription>
                  </DialogHeader>

                  {serverError && (
                    <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-md text-destructive text-xs flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{serverError}</span>
                    </div>
                  )}

                  <form onSubmit={handleSubmit(onTerminateSubmit)} className="space-y-4 py-2">
                    <div className="space-y-2">
                      <Label htmlFor="termination_reason">Reason for Termination</Label>
                      <Input
                        id="termination_reason"
                        placeholder="e.g. Early move-out, lease expiration, agreement violation"
                        disabled={isTerminatingLease}
                        {...register("termination_reason")}
                      />
                      {errors.termination_reason && (
                        <p className="text-xs text-destructive">{errors.termination_reason.message}</p>
                      )}
                    </div>

                    <DialogFooter className="pt-2">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setIsTerminateDialogOpen(false)}
                        disabled={isTerminatingLease}
                      >
                        Cancel
                      </Button>
                      <Button type="submit" variant="destructive" disabled={isTerminatingLease} className="gap-2">
                        {isTerminatingLease ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" /> Terminating...
                          </>
                        ) : (
                          "Confirm Termination"
                        )}
                      </Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            )}
          </div>
        </CardHeader>
      </Card>

      {/* ---- Details Grid ---- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Financial Summary Card */}
        <Card className="border-border md:col-span-1">
          <CardHeader>
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-primary" />
              Financial Terms
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex justify-between py-2 border-b border-border/50">
              <span className="text-muted-foreground">Monthly Base Rent:</span>
              <span className="font-extrabold text-foreground">{formatMoney(lease.rent_amount)}</span>
            </div>

            <div className="flex justify-between py-2 border-b border-border/50">
              <span className="text-muted-foreground">Security Deposit:</span>
              <span className="font-semibold">{formatMoney(lease.security_deposit)}</span>
            </div>

            <div className="flex justify-between py-2 border-b border-border/50">
              <span className="text-muted-foreground">Advance Rent Paid:</span>
              <span className="font-semibold">{formatMoney(lease.advance_rent)}</span>
            </div>

            <div className="flex justify-between py-2">
              <span className="text-muted-foreground">Billing Due Day:</span>
              <span className="font-semibold">{lease.billing_day}st of each month</span>
            </div>
          </CardContent>
        </Card>

        {/* Tenant Information Card */}
        <Card className="border-border md:col-span-1">
          <CardHeader>
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <Users className="w-4 h-4 text-primary" />
              Tenant Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="py-1">
              <p className="font-bold text-base text-foreground">{lease.tenant?.name}</p>
              <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                <Phone className="w-3 h-3 text-primary" /> {lease.tenant?.phone}
              </p>
            </div>

            {lease.tenant?.nid_number && (
              <div className="flex justify-between py-2 border-t border-border/50 text-xs">
                <span className="text-muted-foreground">NID Number:</span>
                <span className="font-mono font-semibold">{lease.tenant.nid_number}</span>
              </div>
            )}

            {lease.tenant && (
              <div className="pt-2">
                <Button asChild variant="outline" size="sm" className="w-full text-xs font-semibold">
                  <Link href={`/tenants/${lease.tenant.id}`}>View Full Tenant Profile &rarr;</Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Unit Location Card */}
        <Card className="border-border md:col-span-1">
          <CardHeader>
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <Home className="w-4 h-4 text-primary" />
              Assigned Flat Unit
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="py-1">
              <p className="font-bold text-base text-foreground">{lease.unit?.unit_number}</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {[lease.unit?.building?.name, lease.unit?.floor?.name].filter(Boolean).join(" • ")}
              </p>
              <p className="text-xs text-primary font-semibold mt-0.5">
                {lease.unit?.property?.name}
              </p>
            </div>

            {lease.unit?.property && (
              <div className="pt-2">
                <Button asChild variant="outline" size="sm" className="w-full text-xs font-semibold">
                  <Link href={`/properties/${lease.unit.property.id}`}>View Property Assets &rarr;</Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* BD Legal Compliance Card */}
      <Card className="border-border">
        <CardHeader className="py-4">
          <CardTitle className="text-base font-bold flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-primary" />
            Bangladesh Rent Control Act 1992 Compliance Summary
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="p-3 bg-accent/40 rounded-lg space-y-1">
            <p className="font-bold text-foreground">BD-003 Tenure Duration Standard</p>
            <p className="text-muted-foreground">
              Standard residential agreements run 12 to 24 months. This contract is valid from {lease.start_date} to {lease.end_date}.
            </p>
          </div>

          <div className="p-3 bg-accent/40 rounded-lg space-y-1">
            <p className="font-bold text-foreground">BD-008 Advance Rent Refund Clause</p>
            <p className="text-muted-foreground">
              Advance rent paid ({formatMoney(lease.advance_rent)}) is refundable if the tenant vacates prior to the end of the advance period.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
