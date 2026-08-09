"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth } from "@/hooks/use-auth";
import { loginSchema, type LoginInput } from "@/lib/validations/auth";
import { isValidationError } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { LogIn, Loader2, AlertCircle } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const { login, isLoggingIn } = useAuth();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
      remember: false,
    },
  });

  const onSubmit = async (data: LoginInput) => {
    setServerError(null);
    try {
      await login(data);
      router.push("/dashboard");
    } catch (err: unknown) {
      if (isValidationError(err)) {
        const fieldErrors = err.response?.data?.errors;
        if (fieldErrors) {
          Object.keys(fieldErrors).forEach((field) => {
            const messages = fieldErrors[field];
            if (messages && messages.length > 0) {
              setError(field as keyof LoginInput, {
                type: "server",
                message: messages[0],
              });
            }
          });
          return;
        }
      }
      setServerError("Invalid credentials. Please check your email and password.");
    }
  };

  return (
    <Card className="shadow-2xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
      <CardHeader className="space-y-1 text-center">
        <CardTitle className="text-2xl font-extrabold text-slate-900 dark:text-white">Sign In</CardTitle>
        <CardDescription className="text-muted-foreground">
          Enter your credentials to access your BashaBari account
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
            <Label htmlFor="email" className="text-slate-700 dark:text-slate-200 font-semibold">Email Address</Label>
            <Input
              id="email"
              type="email"
              placeholder="landlord@example.com"
              autoComplete="email"
              disabled={isLoggingIn}
              {...register("email")}
            />
            {errors.email && (
              <p className="text-xs text-destructive font-medium">{errors.email.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password" className="text-slate-700 dark:text-slate-200 font-semibold">Password</Label>
              <Link
                href="/forgot-password"
                className="text-xs text-primary hover:underline font-semibold"
              >
                Forgot password?
              </Link>
            </div>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              autoComplete="current-password"
              disabled={isLoggingIn}
              {...register("password")}
            />
            {errors.password && (
              <p className="text-xs text-destructive font-medium">{errors.password.message}</p>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="remember"
              className="h-4 w-4 rounded border-slate-400 dark:border-slate-600 text-primary focus:ring-primary accent-primary cursor-pointer"
              disabled={isLoggingIn}
              {...register("remember")}
            />
            <label htmlFor="remember" className="text-xs text-slate-600 dark:text-slate-300 font-medium cursor-pointer select-none">
              Remember me for 30 days
            </label>
          </div>

          <Button type="submit" className="w-full font-bold gap-2 bg-primary hover:bg-primary/90 text-white shadow-md text-sm py-2.5" disabled={isLoggingIn}>
            {isLoggingIn ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Signing in...
              </>
            ) : (
              <>
                <LogIn className="w-4 h-4" />
                Sign In
              </>
            )}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="flex justify-center border-t border-slate-200 dark:border-slate-800 py-4 text-xs text-slate-600 dark:text-slate-400">
        Don&apos;t have an account?{" "}
        <Link href="/register" className="ml-1 text-primary hover:underline font-bold">
          Create an account
        </Link>
      </CardFooter>
    </Card>
  );
}
