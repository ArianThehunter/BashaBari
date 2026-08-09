"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useOrganization } from "@/hooks/use-organization";
import { useInvoices } from "@/hooks/use-invoice";
import { useTenants } from "@/hooks/use-tenant";
import {
  generateInvoicesSchema,
  invoiceSchema,
  type GenerateInvoicesInput,
  type InvoiceInput,
} from "@/lib/validations/invoice";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileText, ArrowLeft, Loader2, Plus, Trash2, CheckCircle2, AlertCircle, Sparkles } from "lucide-react";

function getDefaultInvoiceDates() {
  const today = new Date();
  const dueDate = new Date(today);
  dueDate.setDate(today.getDate() + 5);

  return {
    issue_date: today.toISOString().split("T")[0],
    due_date: dueDate.toISOString().split("T")[0],
  };
}

export default function NewInvoicePage() {
  const router = useRouter();
  const { activeOrgId } = useOrganization();

  const [activeTab, setActiveTab] = useState<"batch" | "custom">("batch");
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);

  const { generateInvoices, isGeneratingInvoices, createInvoice, isCreatingInvoice } = useInvoices({
    organization_id: activeOrgId,
  });

  const { tenants, isLoading: isLoadingTenants } = useTenants({
    organization_id: activeOrgId,
    status: "active",
  });

  const defaultDates = getDefaultInvoiceDates();
  const currentMonth = new Date().getMonth() + 1;
  const currentYear = new Date().getFullYear();

  const batchForm = useForm<GenerateInvoicesInput>({
    resolver: zodResolver(generateInvoicesSchema),
    defaultValues: {
      month: currentMonth,
      year: currentYear,
    },
  });

  const onBatchSubmit = async (data: GenerateInvoicesInput) => {
    setServerError(null);
    setSuccessMessage(null);
    try {
      const res = await generateInvoices(data);
      setSuccessMessage(res.message);
      setTimeout(() => router.push("/invoices"), 1500);
    } catch {
      setServerError("Failed to generate monthly invoices.");
    }
  };

  // ---- Custom Invoice Form ----
  const customForm = useForm<InvoiceInput>({
    resolver: zodResolver(invoiceSchema),
    defaultValues: {
      tenant_id: undefined,
      billing_period_month: currentMonth,
      billing_period_year: currentYear,
      issue_date: defaultDates.issue_date,
      due_date: defaultDates.due_date,
      items: [
        { description: "Monthly Base Rent", quantity: 1, unit_amount_bdt: 20000 },
      ],
      notes: "",
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: customForm.control,
    name: "items",
  });

  const onCustomSubmit = async (data: InvoiceInput) => {
    setServerError(null);
    try {
      const inv = await createInvoice(data);
      router.push(`/invoices/${inv.id}`);
    } catch {
      setServerError("Failed to create custom invoice.");
    }
  };

  const months = [
    { value: 1, name: "January" },
    { value: 2, name: "February" },
    { value: 3, name: "March" },
    { value: 4, name: "April" },
    { value: 5, name: "May" },
    { value: 6, name: "June" },
    { value: 7, name: "July" },
    { value: 8, name: "August" },
    { value: 9, name: "September" },
    { value: 10, name: "October" },
    { value: 11, name: "November" },
    { value: 12, name: "December" },
  ];

  return (
    <div className="max-w-3xl space-y-6">
      <div className="flex items-center gap-2">
        <Button asChild variant="ghost" size="sm">
          <Link href="/invoices">
            <ArrowLeft className="w-4 h-4 mr-1" /> Back to Invoices
          </Link>
        </Button>
      </div>

      {/* ---- Mode Switcher Tabs ---- */}
      <div className="flex items-center gap-2 border-b border-border pb-2">
        <Button
          variant={activeTab === "batch" ? "default" : "outline"}
          onClick={() => setActiveTab("batch")}
          className="gap-2 text-xs font-semibold"
        >
          <Sparkles className="w-4 h-4 text-amber-400" /> Automated Monthly Generator
        </Button>

        <Button
          variant={activeTab === "custom" ? "default" : "outline"}
          onClick={() => setActiveTab("custom")}
          className="gap-2 text-xs font-semibold"
        >
          <Plus className="w-4 h-4" /> Create Custom Invoice
        </Button>
      </div>

      {/* ---- Mode 1: Batch Generator ---- */}
      {activeTab === "batch" && (
        <Card className="border-border shadow-sm">
          <CardHeader>
            <CardTitle className="text-xl font-bold flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              Automated Monthly Bill Generator
            </CardTitle>
            <CardDescription>
              Scans all active leases in your organization and generates monthly rent invoices with auto-numbering (`INV-YYYYMM-XXX`). Duplicate billing is automatically prevented.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            {successMessage && (
              <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-md text-emerald-600 dark:text-emerald-400 text-sm flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{successMessage}</span>
              </div>
            )}

            {serverError && (
              <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-md text-destructive text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{serverError}</span>
              </div>
            )}

            <form onSubmit={batchForm.handleSubmit(onBatchSubmit)} className="space-y-4 py-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="month">Target Billing Month</Label>
                  <Select
                    defaultValue={String(currentMonth)}
                    onValueChange={(val) => batchForm.setValue("month", Number(val))}
                  >
                    <SelectTrigger id="month">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {months.map((m) => (
                        <SelectItem key={m.value} value={String(m.value)}>
                          {m.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="year">Target Billing Year</Label>
                  <Input
                    id="year"
                    type="number"
                    min={2020}
                    max={2100}
                    disabled={isGeneratingInvoices}
                    {...batchForm.register("year", { valueAsNumber: true })}
                  />
                </div>
              </div>

              <div className="flex justify-end pt-4 border-t border-border">
                <Button type="submit" disabled={isGeneratingInvoices} className="gap-2 font-semibold">
                  {isGeneratingInvoices ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" /> Generating Invoices...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" /> Run Monthly Generator Now
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* ---- Mode 2: Custom Manual Invoice ---- */}
      {activeTab === "custom" && (
        <Card className="border-border shadow-sm">
          <CardHeader>
            <CardTitle className="text-xl font-bold flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary" />
              Create Custom Itemized Invoice
            </CardTitle>
            <CardDescription>
              Create a custom invoice with line item charges (Utilities, Repair, Service Charge).
            </CardDescription>
          </CardHeader>

          <CardContent>
            {serverError && (
              <div className="mb-4 p-3 bg-destructive/10 border border-destructive/20 rounded-md text-destructive text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{serverError}</span>
              </div>
            )}

            <form onSubmit={customForm.handleSubmit(onCustomSubmit)} className="space-y-6">
              {/* Tenant Selection */}
              <div className="space-y-2">
                <Label htmlFor="tenant_id">Select Tenant</Label>
                <Select
                  disabled={isLoadingTenants || isCreatingInvoice}
                  onValueChange={(val) => customForm.setValue("tenant_id", Number(val))}
                >
                  <SelectTrigger id="tenant_id">
                    <SelectValue placeholder="Choose a tenant..." />
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

              {/* Dates & Period */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="issue_date">Issue Date</Label>
                  <Input
                    id="issue_date"
                    type="date"
                    disabled={isCreatingInvoice}
                    {...customForm.register("issue_date")}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="due_date">Due Date</Label>
                  <Input
                    id="due_date"
                    type="date"
                    disabled={isCreatingInvoice}
                    {...customForm.register("due_date")}
                  />
                </div>
              </div>

              {/* Line Items Array */}
              <div className="space-y-3">
                <div className="flex items-center justify-between border-b border-border pb-2">
                  <h3 className="text-sm font-bold text-foreground">Line Item Breakdown</h3>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => append({ description: "Utility Charge", quantity: 1, unit_amount_bdt: 1000 })}
                    className="gap-1 text-xs"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Line Item
                  </Button>
                </div>

                {fields.map((field, index) => (
                  <div key={field.id} className="grid grid-cols-12 gap-2 items-center">
                    <div className="col-span-6">
                      <Input
                        placeholder="Description (e.g. Base Rent, Water Bill)"
                        disabled={isCreatingInvoice}
                        {...customForm.register(`items.${index}.description`)}
                      />
                    </div>

                    <div className="col-span-2">
                      <Input
                        type="number"
                        min={1}
                        placeholder="Qty"
                        disabled={isCreatingInvoice}
                        {...customForm.register(`items.${index}.quantity`, { valueAsNumber: true })}
                      />
                    </div>

                    <div className="col-span-3">
                      <div className="relative">
                        <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs font-bold text-muted-foreground">
                          ৳
                        </span>
                        <Input
                          type="number"
                          placeholder="Amount BDT"
                          className="pl-6"
                          disabled={isCreatingInvoice}
                          {...customForm.register(`items.${index}.unit_amount_bdt`, { valueAsNumber: true })}
                        />
                      </div>
                    </div>

                    <div className="col-span-1 text-right">
                      {fields.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => remove(index)}
                          className="text-destructive hover:bg-destructive/10"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex justify-end pt-4 border-t border-border gap-3">
                <Button asChild variant="outline">
                  <Link href="/invoices">Cancel</Link>
                </Button>

                <Button type="submit" disabled={isCreatingInvoice} className="gap-2 font-semibold">
                  {isCreatingInvoice ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" /> Creating Invoice...
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4" /> Save Custom Invoice
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
