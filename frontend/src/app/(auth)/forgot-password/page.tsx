"use client";

import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth } from "@/hooks/use-auth";
import { forgotPasswordSchema, type ForgotPasswordInput } from "@/lib/validations/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { KeyRound, Loader2, ArrowLeft, CheckCircle2 } from "lucide-react";

export default function ForgotPasswordPage() {
  const { forgotPassword, isSendingForgotPassword } = useAuth();
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = async (data: ForgotPasswordInput) => {
    setServerError(null);
    setSuccessMessage(null);
    try {
      const res = await forgotPassword(data);
      setSuccessMessage(res.message || "Password reset link has been sent to your email.");
    } catch {
      setServerError("Could not send password reset link. Please verify your email address.");
    }
  };

  return (
    <Card className="shadow-2xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
      <CardHeader className="space-y-1 text-center">
        <CardTitle className="text-2xl font-extrabold text-slate-900 dark:text-white">Forgot Password</CardTitle>
        <CardDescription className="text-slate-600 dark:text-slate-400">
          Enter your email address and we&apos;ll send you a password reset link
        </CardDescription>
      </CardHeader>
      <CardContent>
        {successMessage ? (
          <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-md text-emerald-600 dark:text-emerald-400 text-sm flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold mb-1">Check your inbox</p>
              <p className="text-xs text-slate-600 dark:text-slate-400">{successMessage}</p>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {serverError && (
              <p className="text-xs text-destructive font-medium bg-destructive/10 p-3 rounded-md">
                {serverError}
              </p>
            )}

            <div className="space-y-2">
              <Label htmlFor="email" className="text-slate-700 dark:text-slate-200 font-semibold">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="your-email@example.com"
                disabled={isSendingForgotPassword}
                {...register("email")}
              />
              {errors.email && (
                <p className="text-xs text-destructive font-medium">{errors.email.message}</p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full font-bold gap-2 bg-primary hover:bg-primary/90 text-white shadow-md text-sm py-2.5"
              disabled={isSendingForgotPassword}
            >
              {isSendingForgotPassword ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Sending link...
                </>
              ) : (
                <>
                  <KeyRound className="w-4 h-4" />
                  Send Reset Link
                </>
              )}
            </Button>
          </form>
        )}
      </CardContent>
      <CardFooter className="flex justify-center border-t border-slate-200 dark:border-slate-800 py-4 text-xs text-slate-600 dark:text-slate-400">
        <Link
          href="/login"
          className="inline-flex items-center gap-1 text-primary hover:underline font-bold"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Sign In
        </Link>
      </CardFooter>
    </Card>
  );
}
