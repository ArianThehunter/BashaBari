"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth } from "@/hooks/use-auth";
import { registerSchema, type RegisterInput } from "@/lib/validations/auth";
import { isValidationError } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { UserPlus, Loader2, AlertCircle } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const { register: registerUser, isRegistering } = useAuth();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      password: "",
      password_confirmation: "",
    },
  });

  const onSubmit = async (data: RegisterInput) => {
    setServerError(null);
    try {
      await registerUser(data);
      router.push("/dashboard");
    } catch (err: unknown) {
      if (isValidationError(err)) {
        const fieldErrors = err.response?.data?.errors;
        if (fieldErrors) {
          Object.keys(fieldErrors).forEach((field) => {
            const messages = fieldErrors[field];
            if (messages && messages.length > 0) {
              setError(field as keyof RegisterInput, {
                type: "server",
                message: messages[0],
              });
            }
          });
          return;
        }
      }
      setServerError("Registration failed. Please check your information and try again.");
    }
  };

  return (
    <Card className="shadow-2xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
      <CardHeader className="space-y-1 text-center">
        <CardTitle className="text-2xl font-extrabold text-slate-900 dark:text-white">Create Account</CardTitle>
        <CardDescription className="text-slate-600 dark:text-slate-400">
          Get started with Bariwala Hub property management
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
            <Label htmlFor="name" className="text-slate-700 dark:text-slate-200 font-semibold">Full Name</Label>
            <Input
              id="name"
              type="text"
              placeholder="e.g. Tanvir Ahmed"
              autoComplete="name"
              disabled={isRegistering}
              {...register("name")}
            />
            {errors.name && (
              <p className="text-xs text-destructive font-medium">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="text-slate-700 dark:text-slate-200 font-semibold">Email Address</Label>
            <Input
              id="email"
              type="email"
              placeholder="tanvir@example.com"
              autoComplete="email"
              disabled={isRegistering}
              {...register("email")}
            />
            {errors.email && (
              <p className="text-xs text-destructive font-medium">{errors.email.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone" className="text-slate-700 dark:text-slate-200 font-semibold">Phone Number (Optional)</Label>
            <Input
              id="phone"
              type="tel"
              placeholder="01711000000"
              autoComplete="tel"
              disabled={isRegistering}
              {...register("phone")}
            />
            {errors.phone && (
              <p className="text-xs text-destructive font-medium">{errors.phone.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-slate-700 dark:text-slate-200 font-semibold">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              autoComplete="new-password"
              disabled={isRegistering}
              {...register("password")}
            />
            {errors.password && (
              <p className="text-xs text-destructive font-medium">{errors.password.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password_confirmation" className="text-slate-700 dark:text-slate-200 font-semibold">Confirm Password</Label>
            <Input
              id="password_confirmation"
              type="password"
              placeholder="••••••••"
              autoComplete="new-password"
              disabled={isRegistering}
              {...register("password_confirmation")}
            />
            {errors.password_confirmation && (
              <p className="text-xs text-destructive font-medium">
                {errors.password_confirmation.message}
              </p>
            )}
          </div>

          <Button type="submit" className="w-full font-bold gap-2 mt-2 bg-primary hover:bg-primary/90 text-white shadow-md text-sm py-2.5" disabled={isRegistering}>
            {isRegistering ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Creating account...
              </>
            ) : (
              <>
                <UserPlus className="w-4 h-4" />
                Create Account
              </>
            )}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="flex justify-center border-t border-slate-200 dark:border-slate-800 py-4 text-xs text-slate-600 dark:text-slate-400">
        Already have an account?{" "}
        <Link href="/login" className="ml-1 text-primary hover:underline font-bold">
          Sign In
        </Link>
      </CardFooter>
    </Card>
  );
}
