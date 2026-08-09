"use client";

import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { MailCheck, Loader2, CheckCircle2, LogOut } from "lucide-react";

export default function VerifyEmailPage() {
  const { resendVerification, isResendingVerification, logout } = useAuth();
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleResend = async () => {
    setSuccessMessage(null);
    try {
      const res = await resendVerification();
      setSuccessMessage(res.message || "A new verification link has been sent to your email address.");
    } catch {
      setSuccessMessage("Failed to resend verification link. Please try again later.");
    }
  };

  return (
    <Card className="shadow-lg border-border text-center">
      <CardHeader className="space-y-2">
        <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary mb-2">
          <MailCheck className="w-6 h-6" />
        </div>
        <CardTitle className="text-2xl font-bold">Verify Your Email</CardTitle>
        <CardDescription>
          Thanks for signing up! Before getting started, please verify your email address by clicking on the link we just emailed to you.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {successMessage && (
          <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-md text-emerald-600 dark:text-emerald-400 text-xs flex items-center justify-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        <Button
          onClick={handleResend}
          className="w-full font-semibold gap-2"
          disabled={isResendingVerification}
        >
          {isResendingVerification ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Resending link...
            </>
          ) : (
            "Resend Verification Email"
          )}
        </Button>
      </CardContent>
      <CardFooter className="flex justify-center border-t py-4 text-xs text-muted-foreground">
        <button
          type="button"
          onClick={() => logout()}
          className="inline-flex items-center gap-1 text-muted-foreground hover:text-foreground font-medium transition-colors"
        >
          <LogOut className="w-3.5 h-3.5" /> Sign Out
        </button>
      </CardFooter>
    </Card>
  );
}
