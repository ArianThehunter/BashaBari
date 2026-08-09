"use client";

import Link from "next/link";
import { useState } from "react";
import { useOrganization } from "@/hooks/use-organization";
import { useLeases } from "@/hooks/use-lease";
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
import { FileText, Plus, Calendar, Home, Users, Loader2, DollarSign } from "lucide-react";

export default function LeasesDirectoryPage() {
  const { activeOrgId } = useOrganization();
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const { leases, meta, isLoading } = useLeases({
    organization_id: activeOrgId,
    status: statusFilter === "all" ? undefined : statusFilter,
  });

  const statusPills = [
    { id: "all", label: "All Leases" },
    { id: "active", label: "Active" },
    { id: "pending", label: "Pending" },
    { id: "expired", label: "Expired" },
    { id: "terminated", label: "Terminated" },
  ];

  return (
    <div className="space-y-6">
      {/* ---- Header Section ---- */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Lease Agreements & Rent Roll</h1>
          <p className="text-sm text-muted-foreground">
            Manage rental contracts, tenant agreements, and monthly rent roll metrics
          </p>
        </div>

        <Button asChild className="gap-2 font-semibold">
          <Link href="/leases/new">
            <Plus className="w-4 h-4" /> Create Lease Agreement
          </Link>
        </Button>
      </div>

      {/* ---- Rent Roll Summary Metric Cards ---- */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card className="border-border">
          <CardHeader className="py-3 px-4 flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-xs font-semibold text-muted-foreground">
              Total Monthly Rent Roll
            </CardTitle>
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-600">
              <DollarSign className="w-4 h-4" />
            </div>
          </CardHeader>
          <CardContent className="px-4 pb-3">
            <p className="text-2xl font-extrabold text-foreground">
              {formatMoney(meta.total_rent_roll_poisha)}
            </p>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              Active monthly rental revenue
            </p>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardHeader className="py-3 px-4 flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-xs font-semibold text-muted-foreground">
              Active Lease Contracts
            </CardTitle>
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              <FileText className="w-4 h-4" />
            </div>
          </CardHeader>
          <CardContent className="px-4 pb-3">
            <p className="text-2xl font-extrabold text-foreground">{meta.active_leases_count}</p>
            <p className="text-[11px] text-muted-foreground mt-0.5">Currently active tenants</p>
          </CardContent>
        </Card>
      </div>

      {/* ---- Filter Toolbar ---- */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-card p-4 rounded-xl border border-border">
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

        <div className="text-xs text-muted-foreground font-medium">
          Showing <strong>{leases.length}</strong> Contracts
        </div>
      </div>

      {/* ---- Leases Directory Table ---- */}
      <Card className="border-border">
        <CardHeader>
          <CardTitle className="text-lg font-bold flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary" />
            Lease Agreements Directory
          </CardTitle>
          <CardDescription>
            Digital lease agreements with unit assignments and Bangladesh Rent Act compliance status.
          </CardDescription>
        </CardHeader>

        <CardContent>
          {isLoading ? (
            <div className="py-12 text-center text-sm text-muted-foreground flex items-center justify-center gap-2">
              <Loader2 className="w-5 h-5 animate-spin text-primary" /> Loading lease agreements...
            </div>
          ) : leases.length === 0 ? (
            <div className="py-12 text-center text-sm text-muted-foreground space-y-3">
              <FileText className="w-10 h-10 mx-auto text-muted-foreground" />
              <p className="font-semibold text-base">No Lease Contracts Found</p>
              <p className="text-xs max-w-sm mx-auto">
                No active or past lease agreements match your selected filter. Click below to execute a new lease.
              </p>
              <Button asChild size="sm" className="gap-2 font-semibold mt-2">
                <Link href="/leases/new">
                  <Plus className="w-4 h-4" /> Create Lease Agreement
                </Link>
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tenant</TableHead>
                  <TableHead>Property & Flat Unit</TableHead>
                  <TableHead>Contract Period</TableHead>
                  <TableHead>Monthly Rent</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {leases.map((lease) => (
                  <TableRow key={lease.id}>
                    <TableCell className="font-bold">
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-primary shrink-0" />
                        <div>
                          <p className="text-sm font-semibold">{lease.tenant?.name || "Tenant"}</p>
                          <p className="text-xs text-muted-foreground font-normal">
                            {lease.tenant?.phone}
                          </p>
                        </div>
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="text-xs space-y-0.5">
                        <p className="font-semibold text-foreground flex items-center gap-1">
                          <Home className="w-3.5 h-3.5 text-primary" />
                          {lease.unit?.unit_number}
                        </p>
                        <p className="text-muted-foreground">
                          {lease.unit?.property?.name || "Property"}
                        </p>
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="text-xs flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
                        <span>
                          {lease.start_date} to {lease.end_date}
                        </span>
                      </div>
                    </TableCell>

                    <TableCell className="font-extrabold text-foreground">
                      {formatMoney(lease.rent_amount)}
                    </TableCell>

                    <TableCell>
                      <Badge
                        variant={lease.status === "active" ? "default" : "outline"}
                        className={`capitalize text-xs ${
                          lease.status === "active"
                            ? "bg-primary text-primary-foreground"
                            : lease.status === "terminated"
                              ? "text-destructive border-destructive/20 bg-destructive/10"
                              : "text-muted-foreground"
                        }`}
                      >
                        {lease.status}
                      </Badge>
                    </TableCell>

                    <TableCell className="text-right">
                      <Button asChild variant="outline" size="sm" className="font-semibold text-xs">
                        <Link href={`/leases/${lease.id}`}>View Contract &rarr;</Link>
                      </Button>
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
