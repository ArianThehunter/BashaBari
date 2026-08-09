"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useOrganization } from "@/hooks/use-organization";
import { useMeterReadings, useUtilityProviders } from "@/hooks/use-utility";
import { useProperties, useUnits } from "@/hooks/use-property";
import { meterReadingSchema, type MeterReadingInput } from "@/lib/validations/utility";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Gauge, ArrowLeft, Loader2, Plus, AlertCircle } from "lucide-react";

export default function NewMeterReadingPage() {
  const router = useRouter();
  const { activeOrgId } = useOrganization();
  const [serverError, setServerError] = useState<string | null>(null);

  const { createMeterReading, isCreatingReading } = useMeterReadings({
    organization_id: activeOrgId,
  });

  const { providers, isLoading: isLoadingProviders } = useUtilityProviders();
  const { properties, isLoading: isLoadingProperties } = useProperties(activeOrgId);
  const { units, isLoading: isLoadingUnits } = useUnits({ organization_id: activeOrgId });

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<MeterReadingInput>({
    resolver: zodResolver(meterReadingSchema),
    defaultValues: {
      property_id: undefined,
      unit_id: null,
      utility_provider_id: undefined,
      meter_number: "",
      previous_reading: 0,
      current_reading: 0,
      rate_per_unit_bdt: 8.50,
      reading_date: new Date().toISOString().split("T")[0],
    },
  });

  const previousReading = watch("previous_reading") || 0;
  const currentReading = watch("current_reading") || 0;
  const rateBdt = watch("rate_per_unit_bdt") || 0;

  const unitsConsumed = Math.max(0, currentReading - previousReading);
  const estimatedCostBdt = unitsConsumed * rateBdt;

  const onSubmit = async (data: MeterReadingInput) => {
    setServerError(null);
    try {
      await createMeterReading(data);
      router.push("/utilities");
    } catch {
      setServerError("Failed to log sub-meter reading.");
    }
  };

  return (
    <div className="max-w-3xl space-y-6">
      <div className="flex items-center gap-2">
        <Button asChild variant="ghost" size="sm">
          <Link href="/utilities">
            <ArrowLeft className="w-4 h-4 mr-1" /> Back to Utilities Directory
          </Link>
        </Button>
      </div>

      <Card className="border-border shadow-sm">
        <CardHeader>
          <CardTitle className="text-xl font-bold flex items-center gap-2">
            <Gauge className="w-5 h-5 text-primary" />
            Log Sub-Meter Reading
          </CardTitle>
          <CardDescription>
            Record monthly sub-meter electric kWh, gas, or WASA water units across DPDC, DESCO, BREB, Titas, and DWASA.
          </CardDescription>
        </CardHeader>

        <CardContent>
          {serverError && (
            <div className="mb-4 p-3 bg-destructive/10 border border-destructive/20 rounded-md text-destructive text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{serverError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Property & Unit Picker */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="property_id">Select Property <span className="text-destructive">*</span></Label>
                <Select
                  disabled={isLoadingProperties || isCreatingReading}
                  onValueChange={(val) => setValue("property_id", Number(val))}
                >
                  <SelectTrigger id="property_id">
                    <SelectValue placeholder="Choose property..." />
                  </SelectTrigger>
                  <SelectContent>
                    {properties.map((p) => (
                      <SelectItem key={p.id} value={String(p.id)}>
                        <span className="font-semibold">{p.name}</span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.property_id && (
                  <p className="text-xs text-destructive">{errors.property_id.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="unit_id">Flat Unit (Optional)</Label>
                <Select
                  disabled={isLoadingUnits || isCreatingReading}
                  onValueChange={(val) => setValue("unit_id", Number(val))}
                >
                  <SelectTrigger id="unit_id">
                    <SelectValue placeholder="Choose flat unit..." />
                  </SelectTrigger>
                  <SelectContent>
                    {units.map((u) => (
                      <SelectItem key={u.id} value={String(u.id)}>
                        {u.unit_number} — {u.property?.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Utility Provider Selector */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="utility_provider_id">Utility Provider <span className="text-destructive">*</span></Label>
                <Select
                  disabled={isLoadingProviders || isCreatingReading}
                  onValueChange={(val) => {
                    const selected = providers.find((p) => p.id === Number(val));
                    setValue("utility_provider_id", Number(val));
                    if (selected) {
                      setValue("rate_per_unit_bdt", selected.default_rate_per_unit_poisha / 100);
                    }
                  }}
                >
                  <SelectTrigger id="utility_provider_id">
                    <SelectValue placeholder="Select BD Utility Company..." />
                  </SelectTrigger>
                  <SelectContent>
                    {providers.map((p) => (
                      <SelectItem key={p.id} value={String(p.id)}>
                        <span className="font-bold">{p.code}</span> — {p.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.utility_provider_id && (
                  <p className="text-xs text-destructive">{errors.utility_provider_id.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="meter_number">Meter Serial Number <span className="text-destructive">*</span></Label>
                <Input
                  id="meter_number"
                  placeholder="e.g. MTR-DPDC-89421"
                  disabled={isCreatingReading}
                  {...register("meter_number")}
                />
                {errors.meter_number && (
                  <p className="text-xs text-destructive">{errors.meter_number.message}</p>
                )}
              </div>
            </div>

            {/* Readings & Tariff Calculation */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="previous_reading">Previous Reading (Units)</Label>
                <Input
                  id="previous_reading"
                  type="number"
                  step="0.01"
                  placeholder="120.00"
                  disabled={isCreatingReading}
                  {...register("previous_reading", { valueAsNumber: true })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="current_reading">Current Reading (Units)</Label>
                <Input
                  id="current_reading"
                  type="number"
                  step="0.01"
                  placeholder="220.00"
                  disabled={isCreatingReading}
                  {...register("current_reading", { valueAsNumber: true })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="rate_per_unit_bdt">Rate per Unit (BDT)</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-sm text-muted-foreground">
                    ৳
                  </span>
                  <Input
                    id="rate_per_unit_bdt"
                    type="number"
                    step="0.01"
                    className="pl-7"
                    disabled={isCreatingReading}
                    {...register("rate_per_unit_bdt", { valueAsNumber: true })}
                  />
                </div>
              </div>
            </div>

            {/* Live Meter Calculation Preview Box */}
            <div className="p-4 rounded-xl bg-accent/30 border border-border flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div>
                <p className="font-semibold text-foreground">Calculated Unit Consumption:</p>
                <p className="text-muted-foreground mt-0.5">
                  {currentReading} - {previousReading} = <span className="font-extrabold text-foreground">{unitsConsumed.toFixed(2)} Units</span>
                </p>
              </div>

              <div className="sm:text-right">
                <p className="font-semibold text-foreground">Estimated Utility Charge:</p>
                <p className="text-lg font-extrabold text-amber-600 dark:text-amber-400">
                  ৳ {estimatedCostBdt.toLocaleString("en-BD", { minimumFractionDigits: 2 })}
                </p>
              </div>
            </div>

            {/* Reading Date */}
            <div className="space-y-2">
              <Label htmlFor="reading_date">Reading Date <span className="text-destructive">*</span></Label>
              <Input
                id="reading_date"
                type="date"
                disabled={isCreatingReading}
                {...register("reading_date")}
              />
            </div>

            <div className="flex justify-end pt-4 border-t border-border gap-3">
              <Button asChild variant="outline">
                <Link href="/utilities">Cancel</Link>
              </Button>

              <Button type="submit" disabled={isCreatingReading} className="gap-2 font-semibold">
                {isCreatingReading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Logging Reading...
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4" /> Save Sub-Meter Reading
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
