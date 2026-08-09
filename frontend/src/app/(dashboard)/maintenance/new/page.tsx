"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useOrganization } from "@/hooks/use-organization";
import { useMaintenanceRequests } from "@/hooks/use-maintenance";
import { useProperties, useUnits } from "@/hooks/use-property";
import { maintenanceRequestSchema, type MaintenanceRequestInput } from "@/lib/validations/maintenance";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Wrench, ArrowLeft, Loader2, Plus, AlertCircle } from "lucide-react";

export default function NewMaintenanceRequestPage() {
  const router = useRouter();
  const { activeOrgId } = useOrganization();

  const [serverError, setServerError] = useState<string | null>(null);

  const { createMaintenanceRequest, isCreatingTicket } = useMaintenanceRequests({
    organization_id: activeOrgId,
  });

  const { properties, isLoading: isLoadingProperties } = useProperties(activeOrgId);

  const { units, isLoading: isLoadingUnits } = useUnits({
    organization_id: activeOrgId,
  });

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<MaintenanceRequestInput>({
    resolver: zodResolver(maintenanceRequestSchema),
    defaultValues: {
      property_id: undefined,
      unit_id: null,
      title: "",
      description: "",
      category: "repairs",
      priority: "medium",
      estimated_cost_bdt: 0,
      assigned_vendor_name: "",
      assigned_vendor_phone: "",
    },
  });

  const onSubmit = async (data: MaintenanceRequestInput) => {
    setServerError(null);
    try {
      await createMaintenanceRequest(data);
      router.push("/maintenance");
    } catch {
      setServerError("Failed to submit maintenance request ticket.");
    }
  };

  return (
    <div className="max-w-3xl space-y-6">
      <div className="flex items-center gap-2">
        <Button asChild variant="ghost" size="sm">
          <Link href="/maintenance">
            <ArrowLeft className="w-4 h-4 mr-1" /> Back to Maintenance Directory
          </Link>
        </Button>
      </div>

      <Card className="border-border shadow-sm">
        <CardHeader>
          <CardTitle className="text-xl font-bold flex items-center gap-2">
            <Wrench className="w-5 h-5 text-primary" />
            Submit Maintenance Request Ticket
          </CardTitle>
          <CardDescription>
            Report a property maintenance issue, select category, assign priority level, and dispatch vendor.
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
            {/* Property & Unit Selection */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="property_id">Select Property <span className="text-destructive">*</span></Label>
                <Select
                  disabled={isLoadingProperties || isCreatingTicket}
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
                  disabled={isLoadingUnits || isCreatingTicket}
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

            {/* Title & Description */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Issue Title <span className="text-destructive">*</span></Label>
                <Input
                  id="title"
                  placeholder="e.g. Elevator Emergency Sensor Failure, Main Water Pipe Leak"
                  disabled={isCreatingTicket}
                  {...register("title")}
                />
                {errors.title && (
                  <p className="text-xs text-destructive">{errors.title.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Detailed Description <span className="text-destructive">*</span></Label>
                <Textarea
                  id="description"
                  placeholder="Describe the issue, location details, and urgency..."
                  rows={4}
                  disabled={isCreatingTicket}
                  {...register("description")}
                />
                {errors.description && (
                  <p className="text-xs text-destructive">{errors.description.message}</p>
                )}
              </div>
            </div>

            {/* Category & Priority */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select
                  defaultValue="repairs"
                  onValueChange={(val: string) => setValue("category", val as MaintenanceRequestInput["category"])}
                >
                  <SelectTrigger id="category">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="plumbing">Plumbing</SelectItem>
                    <SelectItem value="electrical">Electrical</SelectItem>
                    <SelectItem value="painting">Painting</SelectItem>
                    <SelectItem value="elevator">Elevator</SelectItem>
                    <SelectItem value="cleaning">Cleaning</SelectItem>
                    <SelectItem value="repairs">General Repairs</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="priority">Priority Level</Label>
                <Select
                  defaultValue="medium"
                  onValueChange={(val: string) => setValue("priority", val as MaintenanceRequestInput["priority"])}
                >
                  <SelectTrigger id="priority">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="emergency">Emergency</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="estimated_cost_bdt">Estimated Cost (BDT)</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-sm text-muted-foreground">
                    ৳
                  </span>
                  <Input
                    id="estimated_cost_bdt"
                    type="number"
                    placeholder="0"
                    className="pl-7"
                    disabled={isCreatingTicket}
                    {...register("estimated_cost_bdt", { valueAsNumber: true })}
                  />
                </div>
              </div>
            </div>

            {/* Vendor Details */}
            <div className="space-y-4 pt-2 border-t border-border">
              <h3 className="text-sm font-bold text-foreground">Assigned Vendor / Technician (Optional)</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="assigned_vendor_name">Vendor Name</Label>
                  <Input
                    id="assigned_vendor_name"
                    placeholder="e.g. Dhaka Elevator Services"
                    disabled={isCreatingTicket}
                    {...register("assigned_vendor_name")}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="assigned_vendor_phone">Vendor Phone Number</Label>
                  <Input
                    id="assigned_vendor_phone"
                    placeholder="e.g. 01711223344"
                    disabled={isCreatingTicket}
                    {...register("assigned_vendor_phone")}
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-border gap-3">
              <Button asChild variant="outline">
                <Link href="/maintenance">Cancel</Link>
              </Button>

              <Button type="submit" disabled={isCreatingTicket} className="gap-2 font-semibold">
                {isCreatingTicket ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Submitting Ticket...
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4" /> Submit Maintenance Request
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
