"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useOrganization } from "@/hooks/use-organization";
import { useExpenses } from "@/hooks/use-expense";
import { useProperties, useUnits } from "@/hooks/use-property";
import { useMaintenanceRequests } from "@/hooks/use-maintenance";
import { expenseSchema, type ExpenseInput } from "@/lib/validations/maintenance";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ShoppingBag, ArrowLeft, Loader2, Plus, AlertCircle } from "lucide-react";

export default function NewExpensePage() {
  const router = useRouter();
  const { activeOrgId } = useOrganization();

  const [serverError, setServerError] = useState<string | null>(null);

  const { createExpense, isCreatingExpense } = useExpenses({
    organization_id: activeOrgId,
  });

  const { properties, isLoading: isLoadingProperties } = useProperties(activeOrgId);

  const { units, isLoading: isLoadingUnits } = useUnits({
    organization_id: activeOrgId,
  });

  const { tickets, isLoading: isLoadingTickets } = useMaintenanceRequests({
    organization_id: activeOrgId,
  });

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<ExpenseInput>({
    resolver: zodResolver(expenseSchema),
    defaultValues: {
      property_id: null,
      unit_id: null,
      maintenance_request_id: null,
      category: "repairs",
      amount_bdt: 5000,
      expense_date: new Date().toISOString().split("T")[0],
      vendor_name: "",
      payment_method: "cash",
      receipt_reference: "",
      notes: "",
    },
  });

  const onSubmit = async (data: ExpenseInput) => {
    setServerError(null);
    try {
      await createExpense(data);
      router.push("/expenses");
    } catch {
      setServerError("Failed to log operating expense.");
    }
  };

  return (
    <div className="max-w-3xl space-y-6">
      <div className="flex items-center gap-2">
        <Button asChild variant="ghost" size="sm">
          <Link href="/expenses">
            <ArrowLeft className="w-4 h-4 mr-1" /> Back to Expenses
          </Link>
        </Button>
      </div>

      <Card className="border-border shadow-sm">
        <CardHeader>
          <CardTitle className="text-xl font-bold flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-primary" />
            Log Property Operating Expense
          </CardTitle>
          <CardDescription>
            Record vendor bills, repair costs, or utility payments. Logs auto-populate double-entry general ledger.
          </CardDescription>
        </CardHeader>

        <CardContent>
          {serverError && (
            <div className="mb-4 p-3 bg-destructive/10 border border-destructive/20 rounded-md text-destructive text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{serverError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Property & Unit Linkage */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="property_id">Property (Optional)</Label>
                <Select
                  disabled={isLoadingProperties || isCreatingExpense}
                  onValueChange={(val) => setValue("property_id", Number(val))}
                >
                  <SelectTrigger id="property_id">
                    <SelectValue placeholder="Select property..." />
                  </SelectTrigger>
                  <SelectContent>
                    {properties.map((p) => (
                      <SelectItem key={p.id} value={String(p.id)}>
                        <span className="font-semibold">{p.name}</span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="unit_id">Flat Unit (Optional)</Label>
                <Select
                  disabled={isLoadingUnits || isCreatingExpense}
                  onValueChange={(val) => setValue("unit_id", Number(val))}
                >
                  <SelectTrigger id="unit_id">
                    <SelectValue placeholder="Select flat unit..." />
                  </SelectTrigger>
                  <SelectContent>
                    {units.map((u) => (
                      <SelectItem key={u.id} value={String(u.id)}>
                        {u.unit_number} — {u.property?.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Maintenance Ticket Linker */}
            <div className="space-y-2">
              <Label htmlFor="maintenance_request_id">Link Maintenance Request Ticket (Optional)</Label>
              <Select
                disabled={isLoadingTickets || isCreatingExpense}
                onValueChange={(val) => setValue("maintenance_request_id", Number(val))}
              >
                <SelectTrigger id="maintenance_request_id">
                  <SelectValue placeholder="Link a maintenance ticket..." />
                </SelectTrigger>
                <SelectContent>
                  {tickets.map((t) => (
                    <SelectItem key={t.id} value={String(t.id)}>
                      <span className="font-semibold">{t.title}</span> ({t.category})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Category & Amount */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category">Category <span className="text-destructive">*</span></Label>
                <Select
                  defaultValue="repairs"
                  onValueChange={(val: string) => setValue("category", val as ExpenseInput["category"])}
                >
                  <SelectTrigger id="category">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="plumbing">Plumbing</SelectItem>
                    <SelectItem value="electrical">Electrical</SelectItem>
                    <SelectItem value="painting">Painting</SelectItem>
                    <SelectItem value="elevator">Elevator</SelectItem>
                    <SelectItem value="cleaning">Cleaning</SelectItem>
                    <SelectItem value="utility_bill">Utility Bill</SelectItem>
                    <SelectItem value="tax">Tax & Compliance</SelectItem>
                    <SelectItem value="repairs">General Repairs</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="amount_bdt">Amount (BDT) <span className="text-destructive">*</span></Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-sm text-muted-foreground">
                    ৳
                  </span>
                  <Input
                    id="amount_bdt"
                    type="number"
                    placeholder="5000"
                    className="pl-7"
                    disabled={isCreatingExpense}
                    {...register("amount_bdt", { valueAsNumber: true })}
                  />
                </div>
                {errors.amount_bdt && (
                  <p className="text-xs text-destructive">{errors.amount_bdt.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="expense_date">Expense Date <span className="text-destructive">*</span></Label>
                <Input
                  id="expense_date"
                  type="date"
                  disabled={isCreatingExpense}
                  {...register("expense_date")}
                />
              </div>
            </div>

            {/* Vendor & Payment Details */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="vendor_name">Vendor / Supplier Name</Label>
                <Input
                  id="vendor_name"
                  placeholder="e.g. Rahim Plumbing Shop"
                  disabled={isCreatingExpense}
                  {...register("vendor_name")}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="payment_method">Payment Method</Label>
                <Select
                  defaultValue="cash"
                  onValueChange={(val: string) => setValue("payment_method", val as ExpenseInput["payment_method"])}
                >
                  <SelectTrigger id="payment_method">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cash">Cash</SelectItem>
                    <SelectItem value="bkash">bKash</SelectItem>
                    <SelectItem value="nagad">Nagad</SelectItem>
                    <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                    <SelectItem value="cheque">Bank Cheque</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="receipt_reference">Receipt / Voucher #</Label>
                <Input
                  id="receipt_reference"
                  placeholder="e.g. VOUCHER-9842"
                  disabled={isCreatingExpense}
                  {...register("receipt_reference")}
                />
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-border gap-3">
              <Button asChild variant="outline">
                <Link href="/expenses">Cancel</Link>
              </Button>

              <Button type="submit" disabled={isCreatingExpense} className="gap-2 font-semibold">
                {isCreatingExpense ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Logging Expense...
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4" /> Save Operating Expense
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
