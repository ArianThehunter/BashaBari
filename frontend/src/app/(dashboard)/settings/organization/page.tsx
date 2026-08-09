"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useOrganization } from "@/hooks/use-organization";
import {
  updateOrganizationSchema,
  type UpdateOrganizationInput,
} from "@/lib/validations/organization";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, Loader2, Save, CheckCircle2, AlertCircle } from "lucide-react";

export default function OrganizationSettingsPage() {
  const { activeOrganization, updateOrganization, isUpdatingOrganization } = useOrganization();
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<UpdateOrganizationInput>({
    resolver: zodResolver(updateOrganizationSchema),
    defaultValues: {
      name: activeOrganization?.name || "",
      phone: activeOrganization?.phone || "",
      email: activeOrganization?.email || "",
      address: activeOrganization?.address || "",
    },
  });

  useEffect(() => {
    if (activeOrganization) {
      reset({
        name: activeOrganization.name || "",
        phone: activeOrganization.phone || "",
        email: activeOrganization.email || "",
        address: activeOrganization.address || "",
      });
    }
  }, [activeOrganization, reset]);

  const onSubmit = async (data: UpdateOrganizationInput) => {
    if (!activeOrganization) return;
    setServerError(null);
    setSuccessMessage(null);
    try {
      await updateOrganization({ id: activeOrganization.id, input: data });
      setSuccessMessage("Organization settings updated successfully.");
    } catch {
      setServerError("Failed to update organization. Please check your inputs.");
    }
  };

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Organization Settings</h1>
        <p className="text-sm text-muted-foreground">
          Manage your organization profile, contact details, and business information
        </p>
      </div>

      <Card className="border-border">
        <CardHeader>
          <CardTitle className="text-lg font-bold flex items-center gap-2">
            <Building2 className="w-5 h-5 text-primary" />
            General Information
          </CardTitle>
          <CardDescription>
            This information will appear on digital receipts, invoices, and tenant notifications.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {successMessage && (
            <div className="mb-4 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-md text-emerald-600 dark:text-emerald-400 text-sm flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {serverError && (
            <div className="mb-4 p-3 bg-destructive/10 border border-destructive/20 rounded-md text-destructive text-sm flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{serverError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Organization Name</Label>
              <Input
                id="name"
                disabled={isUpdatingOrganization}
                {...register("name")}
              />
              {errors.name && (
                <p className="text-xs text-destructive">{errors.name.message}</p>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  disabled={isUpdatingOrganization}
                  {...register("phone")}
                />
                {errors.phone && (
                  <p className="text-xs text-destructive">{errors.phone.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Official Email</Label>
                <Input
                  id="email"
                  type="email"
                  disabled={isUpdatingOrganization}
                  {...register("email")}
                />
                {errors.email && (
                  <p className="text-xs text-destructive">{errors.email.message}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Address / Head Office</Label>
              <Input
                id="address"
                disabled={isUpdatingOrganization}
                {...register("address")}
              />
            </div>

            <div className="flex justify-end pt-2">
              <Button
                type="submit"
                disabled={isUpdatingOrganization || !isDirty}
                className="gap-2 font-semibold"
              >
                {isUpdatingOrganization ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" /> Save Changes
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
