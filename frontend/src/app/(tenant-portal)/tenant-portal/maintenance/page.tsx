"use client";

import Link from "next/link";
import { useTenantMaintenance } from "@/hooks/use-tenant-portal";
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
import { Wrench, Plus, Loader2, Phone } from "lucide-react";

export default function TenantMaintenancePage() {
  const { tickets, isLoading } = useTenantMaintenance();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Maintenance & Repair Tickets</h1>
          <p className="text-sm text-muted-foreground">
            Track reported plumbing, electrical, and appliance issues for your flat
          </p>
        </div>

        <Button asChild className="gap-2 font-semibold">
          <Link href="/maintenance/new">
            <Plus className="w-4 h-4" /> Request Maintenance Repair
          </Link>
        </Button>
      </div>

      <Card className="border-border">
        <CardHeader>
          <CardTitle className="text-lg font-bold flex items-center gap-2">
            <Wrench className="w-5 h-5 text-primary" />
            My Reported Maintenance Issues
          </CardTitle>
          <CardDescription>
            Ticket priority, vendor technician contacts, and repair statuses.
          </CardDescription>
        </CardHeader>

        <CardContent>
          {isLoading ? (
            <div className="py-12 text-center text-sm text-muted-foreground flex items-center justify-center gap-2">
              <Loader2 className="w-5 h-5 animate-spin text-primary" /> Loading maintenance tickets...
            </div>
          ) : tickets.length === 0 ? (
            <div className="py-12 text-center text-sm text-muted-foreground space-y-3">
              <Wrench className="w-10 h-10 mx-auto text-muted-foreground" />
              <p className="font-semibold text-base">No Maintenance Tickets Logged</p>
              <p className="text-xs max-w-sm mx-auto">
                You have no active maintenance issues. Click below to submit a repair request.
              </p>
              <Button asChild size="sm" className="gap-2 font-semibold mt-2">
                <Link href="/maintenance/new">
                  <Plus className="w-4 h-4" /> Request Maintenance Repair
                </Link>
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Issue Title & Category</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Assigned Technician / Vendor</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Reported Date</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {tickets.map((t) => (
                  <TableRow key={t.id}>
                    <TableCell className="font-bold">
                      <div className="space-y-0.5">
                        <p className="text-sm font-semibold text-foreground">{t.title}</p>
                        <Badge variant="outline" className="capitalize text-[10px] font-semibold bg-accent/30">
                          {t.category}
                        </Badge>
                      </div>
                    </TableCell>

                    <TableCell>
                      <Badge
                        variant="outline"
                        className={`capitalize text-xs font-bold ${
                          t.priority === "emergency"
                            ? "bg-destructive text-white border-destructive"
                            : t.priority === "high"
                              ? "text-destructive border-destructive/30 bg-destructive/10"
                              : "text-amber-600 border-amber-500/30 bg-amber-500/10"
                        }`}
                      >
                        {t.priority}
                      </Badge>
                    </TableCell>

                    <TableCell>
                      <div className="text-xs">
                        {t.assigned_vendor_name ? (
                          <>
                            <p className="font-semibold text-foreground">{t.assigned_vendor_name}</p>
                            {t.assigned_vendor_phone && (
                              <p className="text-muted-foreground flex items-center gap-1 text-[11px]">
                                <Phone className="w-3 h-3" /> {t.assigned_vendor_phone}
                              </p>
                            )}
                          </>
                        ) : (
                          <span className="text-muted-foreground italic">Dispatches Pending</span>
                        )}
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="space-y-1">
                        <Badge
                          variant={t.status === "completed" ? "default" : "outline"}
                          className={`capitalize text-xs ${
                            t.status === "completed"
                              ? "bg-emerald-600 text-white"
                              : t.status === "in_progress"
                                ? "text-blue-600 border-blue-500/30 bg-blue-500/10"
                                : "text-amber-600 border-amber-500/30 bg-amber-500/10"
                          }`}
                        >
                          {t.status === "completed" ? "resolved" : t.status.replace("_", " ")}
                        </Badge>

                        {t.is_escalated_to_owner && (
                          <Badge className="bg-destructive text-white text-[10px] block w-fit gap-1">
                            ⚠️ Reported to Owner
                          </Badge>
                        )}
                      </div>
                    </TableCell>

                    <TableCell className="text-right text-xs text-muted-foreground font-mono space-y-1">
                      <p>{new Date(t.created_at).toLocaleDateString()}</p>
                      {!t.is_escalated_to_owner && t.status !== "completed" && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={async () => {
                            const reason = prompt("Enter reason for reporting unresolved issue to Property Owner (Bariwala):");
                            if (reason) {
                              await fetch(`/api/v1/maintenance-requests/${t.id}/escalate`, {
                                method: "POST",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({ reason, escalated_by: "tenant" }),
                              });
                              alert("Reported directly to Property Owner (Bariwala).");
                              window.location.reload();
                            }
                          }}
                          className="text-[11px] font-semibold text-destructive hover:bg-destructive/10 block ml-auto"
                        >
                          ⚠️ Report to Owner
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
