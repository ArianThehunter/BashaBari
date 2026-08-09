"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useOrganization } from "@/hooks/use-organization";
import { useLeases } from "@/hooks/use-lease";
import { useTenants } from "@/hooks/use-tenant";
import { useUnits } from "@/hooks/use-property";
import { leaseSchema, type LeaseInput } from "@/lib/validations/lease";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileText, ArrowLeft, Loader2, ShieldCheck, AlertCircle, Plus } from "lucide-react";

function getDefaultDates() {
  const today = new Date();
  const nextYear = new Date(today);
  nextYear.setFullYear(today.getFullYear() + 1);

  return {
    start_date: today.toISOString().split("T")[0],
    end_date: nextYear.toISOString().split("T")[0],
  };
}

export default function NewLeaseAgreementPage() {
  const router = useRouter();
  const { activeOrgId } = useOrganization();

  const { createLease, isCreatingLease } = useLeases({ organization_id: activeOrgId });
  const { tenants, isLoading: isLoadingTenants } = useTenants({ organization_id: activeOrgId, status: "active" });
  const { units, isLoading: isLoadingUnits } = useUnits({ organization_id: activeOrgId, occupancy_status: "vacant" });

  const [serverError, setServerError] = useState<string | null>(null);
  const defaultDates = getDefaultDates();

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<LeaseInput>({
    resolver: zodResolver(leaseSchema),
    defaultValues: {
      unit_id: undefined,
      tenant_id: undefined,
      start_date: defaultDates.start_date,
      end_date: defaultDates.end_date,
      rent_amount_bdt: 20000,
      security_deposit_bdt: 40000,
      advance_rent_bdt: 20000,
      billing_day: 1,
      terms_and_conditions: "Standard residential lease agreement governed by the Bangladesh Premises Rent Control Act 1992.",
    },
  });

  const onUnitSelect = (unitIdStr: string) => {
    const uId = Number(unitIdStr);
    setValue("unit_id", uId);
    const foundUnit = units.find((u) => u.id === uId);
    if (foundUnit && foundUnit.base_rent_amount) {
      const bdt = foundUnit.base_rent_amount / 100;
      setValue("rent_amount_bdt", bdt);
    }
  };

  const onSubmit = async (data: LeaseInput) => {
    setServerError(null);
    try {
      const lease = await createLease(data);
      router.push(`/leases/${lease.id}`);
    } catch {
      setServerError("Failed to create lease agreement. Please verify unit availability.");
    }
  };

  return (
    <div className="max-w-3xl space-y-6">
      <div className="flex items-center gap-2">
        <Button asChild variant="ghost" size="sm">
          <Link href="/leases">
            <ArrowLeft className="w-4 h-4 mr-1" /> Back to Leases
          </Link>
        </Button>
      </div>

      <Card className="border-border shadow-sm">
        <CardHeader>
          <CardTitle className="text-xl font-bold flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary" />
            Create Digital Lease Agreement
          </CardTitle>
          <CardDescription>
            Execute a new rental contract linking a verified tenant to a vacant flat unit.
          </CardDescription>
        </CardHeader>

        <CardContent>
          {/* BD-003 & BD-008 Compliance Notice */}
          <div className="mb-6 p-4 bg-primary/5 border border-primary/20 rounded-xl flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-primary shrink-0 mt-0.5" />
            <div className="text-xs space-y-1">
              <p className="font-bold text-foreground">BD-003 & BD-008 Bangladesh Rent Act Rules</p>
              <p className="text-muted-foreground">
                Standard lease agreements are 1 to 2 years (12–24 months). Advance rent paid is refundable if the tenant vacates prior to the advance period.
              </p>
            </div>
          </div>

          {serverError && (
            <div className="mb-4 p-3 bg-destructive/10 border border-destructive/20 rounded-md text-destructive text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{serverError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Section 1: Tenant & Unit Assignment */}
            <div className="space-y-4">
              <h3 className="text-sm font-bold border-b border-border pb-2 text-foreground">
                1. Tenant & Unit Selection
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Select Tenant */}
                <div className="space-y-2">
                  <Label htmlFor="tenant_id">
                    Select Tenant <span className="text-destructive">*</span>
                  </Label>
                  <Select
                    disabled={isLoadingTenants || isCreatingLease}
                    onValueChange={(val) => setValue("tenant_id", Number(val))}
                  >
                    <SelectTrigger id="tenant_id">
                      <SelectValue placeholder="Choose a registered tenant..." />
                    </SelectTrigger>
                    <SelectContent>
                      {tenants.map((t) => (
                        <SelectItem key={t.id} value={String(t.id)}>
                          <span className="font-semibold">{t.name}</span> ({t.phone})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.tenant_id && (
                    <p className="text-xs text-destructive">{errors.tenant_id.message}</p>
                  )}
                </div>

                {/* Select Vacant Unit */}
                <div className="space-y-2">
                  <Label htmlFor="unit_id">
                    Select Vacant Unit <span className="text-destructive">*</span>
                  </Label>
                  <Select
                    disabled={isLoadingUnits || isCreatingLease}
                    onValueChange={onUnitSelect}
                  >
                    <SelectTrigger id="unit_id">
                      <SelectValue placeholder="Choose a vacant flat unit..." />
                    </SelectTrigger>
                    <SelectContent>
                      {units.map((u) => (
                        <SelectItem key={u.id} value={String(u.id)}>
                          <span className="font-semibold">{u.unit_number}</span> — {u.property?.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.unit_id && (
                    <p className="text-xs text-destructive">{errors.unit_id.message}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Section 2: Contract Dates */}
            <div className="space-y-4">
              <h3 className="text-sm font-bold border-b border-border pb-2 text-foreground">
                2. Contract Period (BD-003: 1 to 2 Years)
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="start_date">
                    Start Date <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="start_date"
                    type="date"
                    disabled={isCreatingLease}
                    {...register("start_date")}
                  />
                  {errors.start_date && (
                    <p className="text-xs text-destructive">{errors.start_date.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="end_date">
                    End Date <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="end_date"
                    type="date"
                    disabled={isCreatingLease}
                    {...register("end_date")}
                  />
                  {errors.end_date && (
                    <p className="text-xs text-destructive">{errors.end_date.message}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Section 3: Financial Terms */}
            <div className="space-y-4">
              <h3 className="text-sm font-bold border-b border-border pb-2 text-foreground">
                3. Rent & Deposit Terms (BDT)
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="rent_amount_bdt">
                    Monthly Rent (BDT) <span className="text-destructive">*</span>
                  </Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-sm text-muted-foreground">
                      ৳
                    </span>
                    <Input
                      id="rent_amount_bdt"
                      type="number"
                      placeholder="20000"
                      className="pl-7"
                      disabled={isCreatingLease}
                      {...register("rent_amount_bdt", { valueAsNumber: true })}
                    />
                  </div>
                  {errors.rent_amount_bdt && (
                    <p className="text-xs text-destructive">{errors.rent_amount_bdt.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="security_deposit_bdt">Security Deposit (BDT)</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-sm text-muted-foreground">
                      ৳
                    </span>
                    <Input
                      id="security_deposit_bdt"
                      type="number"
                      placeholder="40000"
                      className="pl-7"
                      disabled={isCreatingLease}
                      {...register("security_deposit_bdt", { valueAsNumber: true })}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="advance_rent_bdt">Advance Rent (BDT)</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-sm text-muted-foreground">
                      ৳
                    </span>
                    <Input
                      id="advance_rent_bdt"
                      type="number"
                      placeholder="20000"
                      className="pl-7"
                      disabled={isCreatingLease}
                      {...register("advance_rent_bdt", { valueAsNumber: true })}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2 max-w-xs">
                <Label htmlFor="billing_day">Monthly Billing Due Day</Label>
                <Input
                  id="billing_day"
                  type="number"
                  min={1}
                  max={31}
                  disabled={isCreatingLease}
                  {...register("billing_day", { valueAsNumber: true })}
                />
                <p className="text-[11px] text-muted-foreground">Day of month rent is due (1 to 31)</p>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="terms_and_conditions">Custom Terms & Notes (Optional)</Label>
              <Input
                id="terms_and_conditions"
                placeholder="Custom terms, parking inclusion, or special clauses..."
                disabled={isCreatingLease}
                {...register("terms_and_conditions")}
              />
            </div>

            <div className="flex justify-end pt-4 gap-3 border-t border-border">
              <Button asChild variant="outline">
                <Link href="/leases">Cancel</Link>
              </Button>

              <Button type="submit" disabled={isCreatingLease} className="gap-2 font-semibold">
                {isCreatingLease ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Executing Contract...
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4" /> Execute Lease Contract
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
