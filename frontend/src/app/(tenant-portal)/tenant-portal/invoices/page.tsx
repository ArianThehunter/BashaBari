"use client";

import Link from "next/link";
import { useTenantInvoices } from "@/hooks/use-tenant-portal";
import { formatMoney } from "@/lib/money";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Receipt, CreditCard, Printer, Loader2 } from "lucide-react";

export default function TenantInvoicesPage() {
  const { invoices, isLoading } = useTenantInvoices();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">My Rent Invoices & Receipts</h1>
        <p className="text-sm text-muted-foreground">
          View monthly rent billing history, pay online via SSLCommerz, and print official payment receipts
        </p>
      </div>

      <Card className="border-border">
        <CardHeader>
          <CardTitle className="text-lg font-bold flex items-center gap-2">
            <Receipt className="w-5 h-5 text-primary" />
            Monthly Rent Invoices
          </CardTitle>
          <CardDescription>
            All generated invoices with subtotal, tax, paid amount, and due balance.
          </CardDescription>
        </CardHeader>

        <CardContent>
          {isLoading ? (
            <div className="py-12 text-center text-sm text-muted-foreground flex items-center justify-center gap-2">
              <Loader2 className="w-5 h-5 animate-spin text-primary" /> Loading your invoices...
            </div>
          ) : invoices.length === 0 ? (
            <div className="py-12 text-center text-sm text-muted-foreground space-y-2">
              <Receipt className="w-10 h-10 mx-auto text-muted-foreground" />
              <p className="font-semibold text-base">No Invoices Found</p>
              <p className="text-xs max-w-sm mx-auto">
                You have no monthly rent invoices issued yet.
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Invoice # & Month</TableHead>
                  <TableHead>Billing Period</TableHead>
                  <TableHead>Total Amount</TableHead>
                  <TableHead>Paid Amount</TableHead>
                  <TableHead>Due Balance</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {invoices.map((inv) => (
                  <TableRow key={inv.id}>
                    <TableCell className="font-bold">
                      <div className="font-mono text-xs">
                        <p className="text-foreground">{inv.invoice_number}</p>
                        <p className="text-muted-foreground font-sans text-[11px]">{inv.billing_month}</p>
                      </div>
                    </TableCell>

                    <TableCell className="text-xs">
                      {inv.issue_date} to {inv.due_date}
                    </TableCell>

                    <TableCell className="font-bold text-xs">
                      {formatMoney(inv.total_amount)}
                    </TableCell>

                    <TableCell className="text-xs text-emerald-600 font-semibold">
                      {formatMoney(inv.paid_amount)}
                    </TableCell>

                    <TableCell className="font-extrabold text-xs text-amber-600 dark:text-amber-400">
                      {formatMoney(inv.due_amount)}
                    </TableCell>

                    <TableCell>
                      <Badge
                        variant={inv.status === "paid" ? "default" : "outline"}
                        className={`capitalize text-xs ${
                          inv.status === "paid"
                            ? "bg-emerald-600 text-white"
                            : inv.status === "partially_paid"
                              ? "text-blue-600 border-blue-500/30 bg-blue-500/10"
                              : "text-amber-600 border-amber-500/30 bg-amber-500/10"
                        }`}
                      >
                        {inv.status.replace("_", " ")}
                      </Badge>
                    </TableCell>

                    <TableCell className="text-right space-x-2">
                      <Button asChild variant="ghost" size="sm" className="text-xs font-semibold">
                        <Link href={`/invoices/${inv.id}/print`} target="_blank">
                          <Printer className="w-3.5 h-3.5 mr-1" /> Receipt PDF
                        </Link>
                      </Button>

                      {inv.status !== "paid" && (
                        <Button asChild size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold">
                          <Link href={`/payments/sslcommerz-checkout?invoice_id=${inv.id}`}>
                            <CreditCard className="w-3.5 h-3.5 mr-1" /> Pay Now
                          </Link>
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
