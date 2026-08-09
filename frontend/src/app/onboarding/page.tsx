"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useOrganization } from "@/hooks/use-organization";
import {
  createOrganizationSchema,
  type CreateOrganizationInput,
} from "@/lib/validations/organization";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Building2, Loader2, Sparkles, AlertCircle } from "lucide-react";

export default function OnboardingPage() {
  const router = useRouter();
  const { createOrganization, isCreatingOrganization } = useOrganization();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateOrganizationInput>({
    resolver: zodResolver(createOrganizationSchema),
    defaultValues: {
      name: "",
      phone: "",
      email: "",
      address: "",
    },
  });

  const onSubmit = async (data: CreateOrganizationInput) => {
    setServerError(null);
    try {
      await createOrganization(data);
      router.push("/dashboard");
    } catch {
      setServerError("Failed to set up organization. Please try again.");
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8 bg-slate-50 dark:bg-slate-950">
      <div className="sm:mx-auto sm:w-full sm:max-w-lg text-center mb-6">
        <div className="mx-auto w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary mb-3 shadow-sm">
          <Sparkles className="w-6 h-6" />
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
          Welcome to Bariwala Hub
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Let&apos;s create your property management organization to get started
        </p>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-lg px-4 sm:px-0">
        <Card className="shadow-lg border-border">
          <CardHeader className="space-y-1">
            <CardTitle className="text-xl font-bold flex items-center gap-2">
              <Building2 className="w-5 h-5 text-primary" />
              Set Up Your Organization
            </CardTitle>
            <CardDescription>
              Your organization will contain your properties, buildings, units, tenants, and financial records.
            </CardDescription>
          </CardHeader>

          <CardContent>
            {serverError && (
              <div className="mb-4 p-3 bg-destructive/10 border border-destructive/20 rounded-md text-destructive text-sm flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{serverError}</span>
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">
                  Organization Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="e.g. Dhaka Heights Management"
                  disabled={isCreatingOrganization}
                  {...register("name")}
                />
                {errors.name && (
                  <p className="text-xs text-destructive">{errors.name.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Official Phone Number (Optional)</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="01711000000"
                  disabled={isCreatingOrganization}
                  {...register("phone")}
                />
                {errors.phone && (
                  <p className="text-xs text-destructive">{errors.phone.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Official Email Address (Optional)</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="contact@dhakaheights.com"
                  disabled={isCreatingOrganization}
                  {...register("email")}
                />
                {errors.email && (
                  <p className="text-xs text-destructive">{errors.email.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Address / Head Office (Optional)</Label>
                <Input
                  id="address"
                  type="text"
                  placeholder="e.g. Gulshan 2, Dhaka"
                  disabled={isCreatingOrganization}
                  {...register("address")}
                />
              </div>

              <div className="bg-primary/5 p-3 rounded-lg border border-primary/10 text-xs text-muted-foreground flex items-center gap-2 mt-2">
                <span className="text-primary font-bold text-base">ℹ</span>
                <span>
                  Your new organization includes a <strong>5-day full access trial</strong>. No payment card required.
                </span>
              </div>

              <Button
                type="submit"
                className="w-full font-semibold gap-2 mt-4"
                disabled={isCreatingOrganization}
              >
                {isCreatingOrganization ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Creating Organization...
                  </>
                ) : (
                  "Create Organization & Launch Dashboard"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
