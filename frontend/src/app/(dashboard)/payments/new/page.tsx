"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useOrganization } from "@/hooks/use-organization";
import { usePayments } from "@/hooks/use-payment";
import { useInvoices } from "@/hooks/use-invoice";
import { useTenants } from "@/hooks/use-tenant";
import { formatMoney } from "@/lib/money";
import { paymentSchema, type PaymentInput } from "@/lib/validations/payment";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CreditCard, ArrowLeft, Loader2, Plus, ShieldCheck, AlertCircle, Sparkles } from "lucide-react";

export default function NewPaymentPage() {
  const router = useRouter();
  const { activeOrgId } = useOrganization();

  const [activeTab, setActiveTab] = useState<"sslcommerz" | "manual">("sslcommerz");
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<number | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);

  const { initiateSslcommerz, isInitiatingSslcommerz, createPayment, isCreatingPayment } = usePayments({
    organization_id: activeOrgId,
  });

  const { invoices, isLoading: isLoadingInvoices } = useInvoices({
    organization_id: activeOrgId,
    status: "unpaid",
  });

  const { tenants, isLoading: isLoadingTenants } = useTenants({
    organization_id: activeOrgId,
    status: "active",
  });

  // ---- Option A: SSLCommerz Initiation ----
  const handleInitiateSslcommerz = async () => {
    if (!selectedInvoiceId) return;
    setServerError(null);
    try {
      const res = await initiateSslcommerz({ invoice_id: selectedInvoiceId });
      if (res.gateway_url) {
        router.push(res.gateway_url);
      }
    } catch {
      setServerError("Failed to initiate SSLCommerz gateway session.");
    }
  };

  // ---- Option B: Manual Payment Form ----
  const manualForm = useForm<PaymentInput>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      tenant_id: undefined,
      invoice_id: null,
      unit_id: null,
      payment_method: "cash",
      amount_bdt: 20000,
      payment_date: new Date().toISOString().split("T")[0],
      reference_number: "",
      notes: "",
    },
  });

  const onManualSubmit = async (data: PaymentInput) => {
    setServerError(null);
    try {
      await createPayment(data);
      router.push("/payments");
    } catch {
      setServerError("Failed to record manual payment.");
    }
  };

  return (
    <div className="max-w-3xl space-y-6">
      <div className="flex items-center gap-2">
        <Button asChild variant="ghost" size="sm">
          <Link href="/payments">
            <ArrowLeft className="w-4 h-4 mr-1" /> Back to Payments
          </Link>
        </Button>
      </div>

      {/* ---- Mode Switcher Tabs ---- */}
      <div className="flex items-center gap-2 border-b border-border pb-2">
        <Button
          variant={activeTab === "sslcommerz" ? "default" : "outline"}
          onClick={() => setActiveTab("sslcommerz")}
          className="gap-2 text-xs font-semibold"
        >
          <CreditCard className="w-4 h-4 text-emerald-400" /> Pay Online via SSLCommerz Gateway
        </Button>

        <Button
          variant={activeTab === "manual" ? "default" : "outline"}
          onClick={() => setActiveTab("manual")}
          className="gap-2 text-xs font-semibold"
        >
          <Plus className="w-4 h-4" /> Record Offline Manual Payment
        </Button>
      </div>

      {/* ---- Mode 1: SSLCommerz Gateway Initiator ---- */}
      {activeTab === "sslcommerz" && (
        <Card className="border-border shadow-sm">
          <CardHeader>
            <CardTitle className="text-xl font-bold flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-600" />
              SSLCommerz Payment Gateway
            </CardTitle>
            <CardDescription>
              Accept payments online via Bangladesh Mobile Financial Services (bKash, Nagad, Rocket) and Cards (Visa, Mastercard, DBBL Nexus).
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* SSLCommerz Supported Channels Banner */}
            <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl space-y-2">
              <p className="font-bold text-xs text-foreground flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-emerald-600" /> Supported Payment Channels (SSLCommerz)
              </p>
              <div className="flex flex-wrap gap-2 text-[11px]">
                <span className="px-2 py-0.5 bg-background rounded-md border font-semibold">bKash</span>
                <span className="px-2 py-0.5 bg-background rounded-md border font-semibold">Nagad</span>
                <span className="px-2 py-0.5 bg-background rounded-md border font-semibold">Rocket</span>
                <span className="px-2 py-0.5 bg-background rounded-md border font-semibold">Visa / Mastercard</span>
                <span className="px-2 py-0.5 bg-background rounded-md border font-semibold">DBBL Nexus</span>
                <span className="px-2 py-0.5 bg-background rounded-md border font-semibold">City Bank AMEX</span>
              </div>
            </div>

            {serverError && (
              <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-md text-destructive text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{serverError}</span>
              </div>
            )}

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="invoice_select">Select Unpaid Invoice to Pay</Label>
                <Select
                  disabled={isLoadingInvoices || isInitiatingSslcommerz}
                  onValueChange={(val) => setSelectedInvoiceId(Number(val))}
                >
                  <SelectTrigger id="invoice_select">
                    <SelectValue placeholder="Choose an unpaid invoice..." />
                  </SelectTrigger>
                  <SelectContent>
                    {invoices.map((inv) => (
                      <SelectItem key={inv.id} value={String(inv.id)}>
                        <span className="font-mono font-bold">{inv.invoice_number}</span> — {inv.tenant?.name} ({formatMoney(inv.due_amount)})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex justify-end pt-4 border-t border-border">
                <Button
                  onClick={handleInitiateSslcommerz}
                  disabled={!selectedInvoiceId || isInitiatingSslcommerz}
                  className="gap-2 font-semibold bg-emerald-600 hover:bg-emerald-700 text-white"
                >
                  {isInitiatingSslcommerz ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" /> Launching SSLCommerz...
                    </>
                  ) : (
                    <>
                      <CreditCard className="w-4 h-4" /> Launch SSLCommerz Checkout Simulator &rarr;
                    </>
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ---- Mode 2: Offline Manual Payment ---- */}
      {activeTab === "manual" && (
        <Card className="border-border shadow-sm">
          <CardHeader>
            <CardTitle className="text-xl font-bold flex items-center gap-2">
              <Plus className="w-5 h-5 text-primary" />
              Record Offline Manual Payment
            </CardTitle>
            <CardDescription>
              Record a cash payment, bank cheque, or direct bank transfer receipt.
            </CardDescription>
          </CardHeader>

          <CardContent>
            {serverError && (
              <div className="mb-4 p-3 bg-destructive/10 border border-destructive/20 rounded-md text-destructive text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{serverError}</span>
              </div>
            )}

            <form onSubmit={manualForm.handleSubmit(onManualSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="tenant_id">Select Tenant</Label>
                  <Select
                    disabled={isLoadingTenants || isCreatingPayment}
                    onValueChange={(val) => manualForm.setValue("tenant_id", Number(val))}
                  >
                    <SelectTrigger id="tenant_id">
                      <SelectValue placeholder="Choose tenant..." />
                    </SelectTrigger>
                    <SelectContent>
                      {tenants.map((t) => (
                        <SelectItem key={t.id} value={String(t.id)}>
                          <span className="font-semibold">{t.name}</span> ({t.phone})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="invoice_id">Link Unpaid Invoice (Optional)</Label>
                  <Select
                    disabled={isLoadingInvoices || isCreatingPayment}
                    onValueChange={(val) => manualForm.setValue("invoice_id", Number(val))}
                  >
                    <SelectTrigger id="invoice_id">
                      <SelectValue placeholder="Select unpaid invoice..." />
                    </SelectTrigger>
                    <SelectContent>
                      {invoices.map((inv) => (
                        <SelectItem key={inv.id} value={String(inv.id)}>
                          {inv.invoice_number} ({formatMoney(inv.due_amount)})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="payment_method">Payment Method</Label>
                  <Select
                    defaultValue="cash"
                    onValueChange={(val: string) => manualForm.setValue("payment_method", val as PaymentInput["payment_method"])}
                  >
                    <SelectTrigger id="payment_method">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cash">Cash</SelectItem>
                      <SelectItem value="bkash">bKash (Direct)</SelectItem>
                      <SelectItem value="nagad">Nagad (Direct)</SelectItem>
                      <SelectItem value="rocket">Rocket (Direct)</SelectItem>
                      <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                      <SelectItem value="cheque">Bank Cheque</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="amount_bdt">Amount (BDT)</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-sm text-muted-foreground">
                      ৳
                    </span>
                    <Input
                      id="amount_bdt"
                      type="number"
                      placeholder="20000"
                      className="pl-7"
                      disabled={isCreatingPayment}
                      {...manualForm.register("amount_bdt", { valueAsNumber: true })}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="payment_date">Payment Date</Label>
                  <Input
                    id="payment_date"
                    type="date"
                    disabled={isCreatingPayment}
                    {...manualForm.register("payment_date")}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="reference_number">Reference / MFS Transaction ID / Cheque No</Label>
                <Input
                  id="reference_number"
                  placeholder="e.g. TrxID: 9X82K1 or Cheque #001248"
                  disabled={isCreatingPayment}
                  {...manualForm.register("reference_number")}
                />
              </div>

              <div className="flex justify-end pt-4 border-t border-border gap-3">
                <Button asChild variant="outline">
                  <Link href="/payments">Cancel</Link>
                </Button>

                <Button type="submit" disabled={isCreatingPayment} className="gap-2 font-semibold">
                  {isCreatingPayment ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" /> Recording Payment...
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4" /> Save Payment Record
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
