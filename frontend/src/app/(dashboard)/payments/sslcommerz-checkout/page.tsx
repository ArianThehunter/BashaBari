"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useState, Suspense } from "react";
import { paymentService } from "@/services/payment-service";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ShieldCheck, Loader2, Smartphone, CreditCard, CheckCircle2, XCircle } from "lucide-react";

function SslcommerzCheckoutContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  // These arrive from the checkout URL the backend signed. They are forwarded
  // untouched; the server re-verifies the signature before crediting anything.
  const tranId = searchParams.get("tran_id") ?? "";
  const invoiceId = searchParams.get("invoice_id");
  const amount = searchParams.get("amount") ?? "";
  const signature = searchParams.get("signature") ?? "";

  const [selectedChannel, setSelectedChannel] = useState<string>("BKASH-BKASH");
  const [accountNo, setAccountNo] = useState("01712345678");
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const channels = [
    { id: "BKASH-BKASH", name: "bKash", type: "mfs", color: "bg-pink-600 text-white" },
    { id: "NAGAD-NAGAD", name: "Nagad", type: "mfs", color: "bg-orange-600 text-white" },
    { id: "ROCKET-ROCKET", name: "Rocket", type: "mfs", color: "bg-purple-600 text-white" },
    { id: "VISA-CITY", name: "Visa Card", type: "card", color: "bg-blue-600 text-white" },
    { id: "MASTER-DBBL", name: "Mastercard", type: "card", color: "bg-amber-600 text-white" },
    { id: "NEXUS-DBBL", name: "DBBL Nexus", type: "card", color: "bg-emerald-600 text-white" },
  ];

  const handleSimulateSuccess = async () => {
    if (!tranId || !signature) {
      setErrorMessage(
        "This checkout link is incomplete. Start the payment again from the invoice.",
      );
      return;
    }

    setIsProcessing(true);
    setErrorMessage(null);
    try {
      await paymentService.completeSslcommerzSuccess({
        tran_id: tranId,
        amount,
        signature,
        val_id: `VAL-SSL-${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
        card_type: selectedChannel,
        bank_tran_id: `BANK-${Date.now()}`,
        card_no: accountNo
          ? `${accountNo.substring(0, 4)}****${accountNo.substring(accountNo.length - 3)}`
          : "0171****890",
      });

      if (invoiceId) {
        router.push(`/invoices/${invoiceId}`);
      } else {
        router.push("/payments");
      }
    } catch {
      setErrorMessage("Failed to authorize simulated SSLCommerz payment.");
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-xl bg-slate-800 border-slate-700 shadow-2xl text-slate-100">
        {/* SSLCommerz Gateway Header */}
        <CardHeader className="border-b border-slate-700 pb-4 bg-slate-950/50 rounded-t-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-lg font-black tracking-tight flex items-center gap-2">
                  SSLCommerz Secure Checkout
                </h1>
                <p className="text-xs text-slate-400">Merchant: BashaBari Property Management</p>
              </div>
            </div>

            <Badge variant="outline" className="border-emerald-500/30 text-emerald-400 bg-emerald-500/10 text-xs">
              Sandbox Simulator
            </Badge>
          </div>

          <div className="flex items-center justify-between text-xs pt-3 border-t border-slate-800/80 mt-3 text-slate-300">
            <span>
              Tran #: <strong className="font-mono text-white">{tranId}</strong>
            </span>
            <span>
              Currency: <strong className="text-white">BDT</strong>
            </span>
          </div>
        </CardHeader>

        <CardContent className="py-6 space-y-6">
          {errorMessage && (
            <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-xs flex items-center gap-2">
              <XCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Payment Method Selector */}
          <div className="space-y-3">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
              1. Select Payment Channel
            </label>

            <div className="grid grid-cols-3 gap-2">
              {channels.map((ch) => (
                <button
                  key={ch.id}
                  type="button"
                  onClick={() => setSelectedChannel(ch.id)}
                  className={`p-3 rounded-xl border text-xs font-semibold flex flex-col items-center justify-center gap-1.5 transition-all ${
                    selectedChannel === ch.id
                      ? "border-emerald-500 bg-emerald-500/20 text-white shadow-md ring-2 ring-emerald-500/50"
                      : "border-slate-700 bg-slate-800/60 text-slate-300 hover:bg-slate-700/50"
                  }`}
                >
                  {ch.type === "mfs" ? (
                    <Smartphone className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <CreditCard className="w-4 h-4 text-blue-400" />
                  )}
                  <span>{ch.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Simulated Account Form */}
          <div className="space-y-3 p-4 bg-slate-900/60 rounded-xl border border-slate-700/60">
            <label className="text-xs font-bold text-slate-300 block">
              2. Simulated Account / Card Number
            </label>
            <Input
              value={accountNo}
              onChange={(e) => setAccountNo(e.target.value)}
              placeholder="e.g. 01712345678"
              className="bg-slate-950 border-slate-700 text-white placeholder:text-slate-500"
            />
            <p className="text-[11px] text-slate-400">
              Selected Channel: <strong className="text-emerald-400">{selectedChannel}</strong>
            </p>
          </div>

          {/* Simulator Action Controls */}
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              disabled={isProcessing}
              className="border-slate-700 text-slate-300 hover:bg-slate-700"
            >
              Cancel Payment
            </Button>

            <Button
              type="button"
              onClick={handleSimulateSuccess}
              disabled={isProcessing}
              className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold gap-2"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Authorizing Payment...
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" /> Simulate Successful SSLCommerz Payment
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function SslcommerzCheckoutPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-900 text-slate-100 flex items-center justify-center p-4">
          <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
        </div>
      }
    >
      <SslcommerzCheckoutContent />
    </Suspense>
  );
}
