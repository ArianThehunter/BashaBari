"use client";

import Link from "next/link";
import { useState } from "react";
import { useOrganization } from "@/hooks/use-organization";
import { useMaintenanceRequests } from "@/hooks/use-maintenance";
import { formatMoney } from "@/lib/money";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { Wrench, Plus, Search, Home, Loader2, AlertTriangle, Clock, CheckCircle2, Phone } from "lucide-react";

export default function MaintenanceDirectoryPage() {
  const { activeOrgId } = useOrganization();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const { tickets, meta, isLoading, updateMaintenanceRequest, isUpdatingTicket } = useMaintenanceRequests({
    organization_id: activeOrgId,
    search: searchTerm || undefined,
    status: statusFilter === "all" ? undefined : statusFilter,
  });

  const statusPills = [
    { id: "all", label: "All Tickets" },
    { id: "pending", label: "Pending" },
    { id: "in_progress", label: "In Progress" },
    { id: "completed", label: "Completed" },
  ];

  return (
    <div className="space-y-6">
      {/* ---- Header Section ---- */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Maintenance Requests & Repairs</h1>
          <p className="text-sm text-muted-foreground">
            Manage property maintenance tickets, priority dispatch, and vendor repairs
          </p>
        </div>

        <Button asChild className="gap-2 font-semibold">
          <Link href="/maintenance/new">
            <Plus className="w-4 h-4" /> Submit Maintenance Request
          </Link>
        </Button>
      </div>

      {/* ---- Summary Metric Cards ---- */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card className="border-border">
          <CardHeader className="py-3 px-4 flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-xs font-semibold text-muted-foreground">
              Total Tickets
            </CardTitle>
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              <Wrench className="w-4 h-4" />
            </div>
          </CardHeader>
          <CardContent className="px-4 pb-3">
            <p className="text-2xl font-extrabold text-foreground">{meta.total_tickets}</p>
            <p className="text-[11px] text-muted-foreground mt-0.5">Total logged issues</p>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardHeader className="py-3 px-4 flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-xs font-semibold text-muted-foreground">
              Pending Tickets
            </CardTitle>
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-600">
              <Clock className="w-4 h-4" />
            </div>
          </CardHeader>
          <CardContent className="px-4 pb-3">
            <p className="text-2xl font-extrabold text-amber-600 dark:text-amber-400">
              {meta.pending_count}
            </p>
            <p className="text-[11px] text-muted-foreground mt-0.5">Awaiting vendor dispatch</p>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardHeader className="py-3 px-4 flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-xs font-semibold text-muted-foreground">
              In Progress
            </CardTitle>
            <div className="p-2 rounded-lg bg-blue-500/10 text-blue-600">
              <Wrench className="w-4 h-4" />
            </div>
          </CardHeader>
          <CardContent className="px-4 pb-3">
            <p className="text-2xl font-extrabold text-blue-600 dark:text-blue-400">
              {meta.in_progress_count}
            </p>
            <p className="text-[11px] text-muted-foreground mt-0.5">Under active repair</p>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardHeader className="py-3 px-4 flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-xs font-semibold text-muted-foreground">
              Emergency Tickets
            </CardTitle>
            <div className="p-2 rounded-lg bg-destructive/10 text-destructive">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </CardHeader>
          <CardContent className="px-4 pb-3">
            <p className="text-2xl font-extrabold text-destructive">{meta.emergency_count}</p>
            <p className="text-[11px] text-muted-foreground mt-0.5">High priority issues</p>
          </CardContent>
        </Card>
      </div>

      {/* ---- Filter Toolbar ---- */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-card p-4 rounded-xl border border-border">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by title, description, vendor..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Status Filter Pills */}
        <div className="flex flex-wrap items-center gap-1.5">
          {statusPills.map((pill) => (
            <Button
              key={pill.id}
              variant={statusFilter === pill.id ? "default" : "outline"}
              size="sm"
              onClick={() => setStatusFilter(pill.id)}
              className="text-xs font-semibold capitalize"
            >
              {pill.label}
            </Button>
          ))}
        </div>
      </div>

      {/* ---- Maintenance Directory Table ---- */}
      <Card className="border-border">
        <CardHeader>
          <CardTitle className="text-lg font-bold flex items-center gap-2">
            <Wrench className="w-5 h-5 text-primary" />
            Maintenance Ticket Records
          </CardTitle>
          <CardDescription>
            Property maintenance issues, estimated costs, and vendor dispatches.
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
              <p className="font-semibold text-base">No Maintenance Tickets Found</p>
              <p className="text-xs max-w-sm mx-auto">
                No tickets match your selected filters. Click below to submit a new issue.
              </p>
              <Button asChild size="sm" className="gap-2 font-semibold mt-2">
                <Link href="/maintenance/new">
                  <Plus className="w-4 h-4" /> Submit Maintenance Request
                </Link>
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Ticket Title & Category</TableHead>
                  <TableHead>Property & Unit</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Assigned Vendor</TableHead>
                  <TableHead>Estimated Cost</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
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
                      <div className="text-xs space-y-0.5">
                        <p className="font-semibold text-foreground flex items-center gap-1">
                          <Home className="w-3.5 h-3.5 text-primary" />
                          {t.property?.name}
                        </p>
                        {t.unit && <p className="text-muted-foreground">{t.unit.unit_number}</p>}
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
                              : t.priority === "medium"
                                ? "text-amber-600 border-amber-500/30 bg-amber-500/10"
                                : "text-muted-foreground"
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
                          <span className="text-muted-foreground italic">Unassigned</span>
                        )}
                      </div>
                    </TableCell>

                    <TableCell className="font-extrabold text-foreground text-xs">
                      {formatMoney(t.estimated_cost_amount)}
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
                            <AlertTriangle className="w-3 h-3 inline" /> Escalated to Owner
                          </Badge>
                        )}
                      </div>
                    </TableCell>

                    <TableCell className="text-right space-y-1">
                      {t.status === "pending" && (
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={isUpdatingTicket}
                          onClick={() => updateMaintenanceRequest({ id: t.id, data: { status: "in_progress" } })}
                          className="text-xs font-semibold text-blue-600 border-blue-500/30 hover:bg-blue-500/10"
                        >
                          Mark In Progress
                        </Button>
                      )}
                      {t.status === "in_progress" && (
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={isUpdatingTicket}
                          onClick={() => updateMaintenanceRequest({ id: t.id, data: { status: "completed" } })}
                          className="text-xs font-semibold text-emerald-600 border-emerald-500/30 hover:bg-emerald-500/10"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Resolve Ticket
                        </Button>
                      )}

                      {!t.is_escalated_to_owner && t.status !== "completed" && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={async () => {
                            const reason = prompt("Enter reason for reporting/escalating to Property Owner (Bariwala):");
                            if (reason) {
                              await fetch(`/api/v1/maintenance-requests/${t.id}/escalate`, {
                                method: "POST",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({ reason, escalated_by: "caretaker" }),
                              });
                              alert("Ticket escalated directly to Property Owner (Bariwala).");
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
