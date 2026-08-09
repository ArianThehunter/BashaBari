"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useOrganization } from "@/hooks/use-organization";
import { useTenants } from "@/hooks/use-tenant";
import { tenantSchema, type TenantInput } from "@/lib/validations/tenant";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { UserPlus, ArrowLeft, Loader2, ShieldCheck, AlertCircle } from "lucide-react";

export default function NewTenantOnboardingPage() {
  const router = useRouter();
  const { activeOrgId } = useOrganization();
  const { createTenant, isCreatingTenant } = useTenants({ organization_id: activeOrgId });
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<TenantInput>({
    resolver: zodResolver(tenantSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      nid_number: "",
      passport_number: "",
      father_name: "",
      permanent_address: "",
      occupation: "",
      emergency_contact_name: "",
      emergency_contact_phone: "",
      emergency_contact_relation: "",
      status: "active",
    },
  });

  const onSubmit = async (data: TenantInput) => {
    setServerError(null);
    try {
      const tenant = await createTenant(data);
      router.push(`/tenants/${tenant.id}`);
    } catch {
      setServerError("Failed to create tenant profile. Please verify your inputs.");
    }
  };

  return (
    <div className="max-w-3xl space-y-6">
      <div className="flex items-center gap-2">
        <Button asChild variant="ghost" size="sm">
          <Link href="/tenants">
            <ArrowLeft className="w-4 h-4 mr-1" /> Back to Tenants
          </Link>
        </Button>
      </div>

      <Card className="border-border shadow-sm">
        <CardHeader>
          <CardTitle className="text-xl font-bold flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-primary" />
            Add New Tenant Profile
          </CardTitle>
          <CardDescription>
            Register tenant identity details compliant with Bangladesh Rent Act 1992 (BD-002).
          </CardDescription>
        </CardHeader>

        <CardContent>
          {/* BD-002 Compliance Notice */}
          <div className="mb-6 p-4 bg-primary/5 border border-primary/20 rounded-xl flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-primary shrink-0 mt-0.5" />
            <div className="text-xs space-y-1">
              <p className="font-bold text-foreground">BD-002 Legal Compliance Requirement</p>
              <p className="text-muted-foreground">
                Under the Bangladesh Premises Rent Control Act 1992, landlords are required to maintain verified NID/Passport records, permanent address details, and emergency contact information before executing lease agreements.
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
            {/* Section 1: Basic Identity */}
            <div className="space-y-4">
              <h3 className="text-sm font-bold border-b border-border pb-2 text-foreground">
                1. Personal Information
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">
                    Full Legal Name <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="name"
                    placeholder="e.g. Mohammad Rahim"
                    disabled={isCreatingTenant}
                    {...register("name")}
                  />
                  {errors.name && (
                    <p className="text-xs text-destructive">{errors.name.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">
                    Mobile Phone Number <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="phone"
                    placeholder="e.g. 01711223344"
                    disabled={isCreatingTenant}
                    {...register("phone")}
                  />
                  {errors.phone && (
                    <p className="text-xs text-destructive">{errors.phone.message}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address (Optional)</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="rahim@example.com"
                    disabled={isCreatingTenant}
                    {...register("email")}
                  />
                  {errors.email && (
                    <p className="text-xs text-destructive">{errors.email.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="occupation">Occupation / Profession</Label>
                  <Input
                    id="occupation"
                    placeholder="e.g. Software Engineer, Businessman"
                    disabled={isCreatingTenant}
                    {...register("occupation")}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="father_name">Father&apos;s Name</Label>
                <Input
                  id="father_name"
                  placeholder="e.g. Abdul Karim"
                  disabled={isCreatingTenant}
                  {...register("father_name")}
                />
              </div>
            </div>

            {/* Section 2: National Identity (NID / Passport) */}
            <div className="space-y-4">
              <h3 className="text-sm font-bold border-b border-border pb-2 text-foreground">
                2. Government Identity Verification
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="nid_number">National ID (NID Number)</Label>
                  <Input
                    id="nid_number"
                    placeholder="10 or 17 digit NID number"
                    disabled={isCreatingTenant}
                    {...register("nid_number")}
                  />
                  {errors.nid_number && (
                    <p className="text-xs text-destructive">{errors.nid_number.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="passport_number">Passport Number (Optional)</Label>
                  <Input
                    id="passport_number"
                    placeholder="e.g. A01234567"
                    disabled={isCreatingTenant}
                    {...register("passport_number")}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="permanent_address">Permanent Home Address</Label>
                <Input
                  id="permanent_address"
                  placeholder="Village/Road, Post Office, Upazila/Thana, District"
                  disabled={isCreatingTenant}
                  {...register("permanent_address")}
                />
              </div>
            </div>

            {/* Section 3: Emergency Contact */}
            <div className="space-y-4">
              <h3 className="text-sm font-bold border-b border-border pb-2 text-foreground">
                3. Emergency Contact Details
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="emergency_contact_name">Contact Name</Label>
                  <Input
                    id="emergency_contact_name"
                    placeholder="e.g. Abdur Rahman"
                    disabled={isCreatingTenant}
                    {...register("emergency_contact_name")}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="emergency_contact_phone">Contact Phone</Label>
                  <Input
                    id="emergency_contact_phone"
                    placeholder="e.g. 01811998877"
                    disabled={isCreatingTenant}
                    {...register("emergency_contact_phone")}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="emergency_contact_relation">Relationship</Label>
                  <Input
                    id="emergency_contact_relation"
                    placeholder="e.g. Brother, Father, Spouse"
                    disabled={isCreatingTenant}
                    {...register("emergency_contact_relation")}
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-4 gap-3 border-t border-border">
              <Button asChild variant="outline">
                <Link href="/tenants">Cancel</Link>
              </Button>

              <Button type="submit" disabled={isCreatingTenant} className="gap-2 font-semibold">
                {isCreatingTenant ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Creating Profile...
                  </>
                ) : (
                  <>
                    <UserPlus className="w-4 h-4" /> Save Tenant Profile
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
