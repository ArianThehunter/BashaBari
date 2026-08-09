"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useOrganization } from "@/hooks/use-organization";
import { useProperties } from "@/hooks/use-property";
import { propertySchema, type PropertyInput } from "@/lib/validations/property";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, Loader2, ArrowLeft, Plus } from "lucide-react";

export default function NewPropertyPage() {
  const router = useRouter();
  const { activeOrgId } = useOrganization();
  const { createProperty, isCreatingProperty } = useProperties(activeOrgId);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<PropertyInput>({
    resolver: zodResolver(propertySchema),
    defaultValues: {
      name: "",
      address: "",
      city: "Dhaka",
      area: "",
      description: "",
    },
  });

  const onSubmit = async (data: PropertyInput) => {
    setServerError(null);
    try {
      const property = await createProperty(data);
      router.push(`/properties/${property.id}`);
    } catch {
      setServerError("Failed to create property. Please try again.");
    }
  };

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex items-center gap-2">
        <Button asChild variant="ghost" size="sm">
          <Link href="/properties">
            <ArrowLeft className="w-4 h-4 mr-1" /> Back to Properties
          </Link>
        </Button>
      </div>

      <Card className="border-border shadow-md">
        <CardHeader>
          <CardTitle className="text-xl font-bold flex items-center gap-2">
            <Building2 className="w-5 h-5 text-primary" />
            Add New Property
          </CardTitle>
          <CardDescription>
            Enter the details for your new real estate asset or building complex.
          </CardDescription>
        </CardHeader>

        <CardContent>
          {serverError && (
            <p className="mb-4 text-xs text-destructive bg-destructive/10 p-3 rounded-md">
              {serverError}
            </p>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">
                Property Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="name"
                placeholder="e.g. Gulshan Heights, Green Garden Tower"
                disabled={isCreatingProperty}
                {...register("name")}
              />
              {errors.name && (
                <p className="text-xs text-destructive">{errors.name.message}</p>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="city">City / District</Label>
                <Input
                  id="city"
                  placeholder="e.g. Dhaka, Chittagong, Sylhet"
                  disabled={isCreatingProperty}
                  {...register("city")}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="area">Area / Thana</Label>
                <Input
                  id="area"
                  placeholder="e.g. Gulshan 2, Dhanmondi, Banani"
                  disabled={isCreatingProperty}
                  {...register("area")}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Full Street Address</Label>
              <Input
                id="address"
                placeholder="e.g. House 12, Road 115, Block SE(F)"
                disabled={isCreatingProperty}
                {...register("address")}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Notes / Description (Optional)</Label>
              <Input
                id="description"
                placeholder="e.g. 10-story residential apartment building with basement parking"
                disabled={isCreatingProperty}
                {...register("description")}
              />
            </div>

            <div className="flex justify-end pt-4 gap-3">
              <Button asChild variant="outline">
                <Link href="/properties">Cancel</Link>
              </Button>

              <Button type="submit" disabled={isCreatingProperty} className="gap-2 font-semibold">
                {isCreatingProperty ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Creating...
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4" /> Create Property
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
