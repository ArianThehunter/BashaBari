"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, Suspense } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth } from "@/hooks/use-auth";
import { resetPasswordSchema, type ResetPasswordInput } from "@/lib/validations/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { KeyRound, Loader2, CheckCircle2 } from "lucide-react";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";
  const emailParam = searchParams.get("email") || "";

  const { resetPassword, isResettingPassword } = useAuth();
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordInput>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      email: emailParam,
      token: token,
      password: "",
      password_confirmation: "",
    },
  });

  const onSubmit = async (data: ResetPasswordInput) => {
    setServerError(null);
    setSuccessMessage(null);
    try {
      const res = await resetPassword(data);
      setSuccessMessage(res.message || "Your password has been successfully reset.");
      setTimeout(() => {
        router.push("/login");
      }, 2500);
    } catch {
      setServerError("Password reset failed. The link may have expired or is invalid.");
    }
  };

  return (
    <Card className="shadow-lg border-border">
      <CardHeader className="space-y-1 text-center">
        <CardTitle className="text-2xl font-bold">Reset Password</CardTitle>
        <CardDescription>
          Enter your new password below
        </CardDescription>
      </CardHeader>
      <CardContent>
        {successMessage ? (
          <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-md text-emerald-600 dark:text-emerald-400 text-sm flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold mb-1">Password Reset Successful</p>
              <p className="text-xs text-muted-foreground">{successMessage} Redirecting to sign in...</p>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {serverError && (
              <p className="text-xs text-destructive bg-destructive/10 p-3 rounded-md">
                {serverError}
              </p>
            )}

            <input type="hidden" {...register("token")} />

            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="your-email@example.com"
                disabled={isResettingPassword}
                {...register("email")}
              />
              {errors.email && (
                <p className="text-xs text-destructive">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">New Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                disabled={isResettingPassword}
                {...register("password")}
              />
              {errors.password && (
                <p className="text-xs text-destructive">{errors.password.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password_confirmation">Confirm New Password</Label>
              <Input
                id="password_confirmation"
                type="password"
                placeholder="••••••••"
                disabled={isResettingPassword}
                {...register("password_confirmation")}
              />
              {errors.password_confirmation && (
                <p className="text-xs text-destructive">
                  {errors.password_confirmation.message}
                </p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full font-semibold gap-2"
              disabled={isResettingPassword}
            >
              {isResettingPassword ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Updating password...
                </>
              ) : (
                <>
                  <KeyRound className="w-4 h-4" />
                  Reset Password
                </>
              )}
            </Button>
          </form>
        )}
      </CardContent>
      <CardFooter className="flex justify-center border-t py-4 text-xs text-muted-foreground">
        Remember your password?{" "}
        <Link href="/login" className="ml-1 text-primary hover:underline font-semibold">
          Sign In
        </Link>
      </CardFooter>
    </Card>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="text-center text-sm">Loading reset form...</div>}>
      <ResetPasswordForm />
    </Suspense>
  );
}
