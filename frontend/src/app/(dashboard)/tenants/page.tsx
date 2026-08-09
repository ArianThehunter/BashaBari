"use client";

import Link from "next/link";
import { useState } from "react";
import { useOrganization } from "@/hooks/use-organization";
import { useTenants } from "@/hooks/use-tenant";
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
import { Users, UserPlus, Search, Phone, Mail, ShieldCheck, AlertCircle, Loader2 } from "lucide-react";

export default function TenantsDirectoryPage() {
  const { activeOrgId } = useOrganization();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const { tenants, isLoading } = useTenants({
    organization_id: activeOrgId,
    search: searchTerm || undefined,
    status: statusFilter === "all" ? undefined : statusFilter,
  });

  const statusPills = [
    { id: "all", label: "All Tenants" },
    { id: "active", label: "Active" },
    { id: "inactive", label: "Inactive" },
    { id: "archived", label: "Archived" },
  ];

  return (
    <div className="space-y-6">
      {/* ---- Header Section ---- */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Tenants Directory</h1>
          <p className="text-sm text-muted-foreground">
            Manage tenant profiles, identity verification (NID), and emergency contacts
          </p>
        </div>

        <Button asChild className="gap-2 font-semibold">
          <Link href="/tenants/new">
            <UserPlus className="w-4 h-4" /> Add New Tenant
          </Link>
        </Button>
      </div>

      {/* ---- Filter & Search Toolbar ---- */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-card p-4 rounded-xl border border-border">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by name, phone, or NID..."
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

      {/* ---- Tenants Directory Table ---- */}
      <Card className="border-border">
        <CardHeader>
          <CardTitle className="text-lg font-bold flex items-center gap-2">
            <Users className="w-5 h-5 text-primary" />
            Registered Tenants
          </CardTitle>
          <CardDescription>
            List of tenants with identity verification status (Bangladesh Rent Act 1992 compliant).
          </CardDescription>
        </CardHeader>

        <CardContent>
          {isLoading ? (
            <div className="py-12 text-center text-sm text-muted-foreground flex items-center justify-center gap-2">
              <Loader2 className="w-5 h-5 animate-spin text-primary" /> Loading tenants directory...
            </div>
          ) : tenants.length === 0 ? (
            <div className="py-12 text-center text-sm text-muted-foreground space-y-3">
              <Users className="w-10 h-10 mx-auto text-muted-foreground" />
              <p className="font-semibold text-base">No Tenants Found</p>
              <p className="text-xs max-w-sm mx-auto">
                {searchTerm
                  ? "No tenants matched your search criteria. Try clearing your search."
                  : "You haven't registered any tenants in this organization yet."}
              </p>
              {!searchTerm && (
                <Button asChild size="sm" className="gap-2 font-semibold mt-2">
                  <Link href="/tenants/new">
                    <UserPlus className="w-4 h-4" /> Add Tenant Now
                  </Link>
                </Button>
              )}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tenant Name</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>NID / Identity</TableHead>
                  <TableHead>Emergency Contact</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {tenants.map((tenant) => (
                  <TableRow key={tenant.id}>
                    <TableCell className="font-bold">
                      <Link
                        href={`/tenants/${tenant.id}`}
                        className="hover:text-primary transition-colors flex items-center gap-2"
                      >
                        <div className="w-8 h-8 rounded-full bg-primary/10 text-primary font-bold text-xs flex items-center justify-center shrink-0">
                          {tenant.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm font-semibold">{tenant.name}</p>
                          {tenant.occupation && (
                            <p className="text-xs text-muted-foreground font-normal">
                              {tenant.occupation}
                            </p>
                          )}
                        </div>
                      </Link>
                    </TableCell>

                    <TableCell>
                      <div className="text-xs space-y-0.5">
                        <p className="font-medium flex items-center gap-1">
                          <Phone className="w-3 h-3 text-muted-foreground" />
                          {tenant.phone}
                        </p>
                        {tenant.email && (
                          <p className="text-muted-foreground flex items-center gap-1">
                            <Mail className="w-3 h-3 text-muted-foreground" />
                            {tenant.email}
                          </p>
                        )}
                      </div>
                    </TableCell>

                    <TableCell>
                      {tenant.nid_number ? (
                        <Badge variant="outline" className="text-xs font-mono gap-1 text-emerald-600 border-emerald-500/20 bg-emerald-500/10">
                          <ShieldCheck className="w-3 h-3 text-emerald-600" />
                          NID: {tenant.nid_number}
                        </Badge>
                      ) : tenant.passport_number ? (
                        <Badge variant="outline" className="text-xs font-mono gap-1">
                          Passport: {tenant.passport_number}
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-xs gap-1 text-amber-600 border-amber-500/20 bg-amber-500/10">
                          <AlertCircle className="w-3 h-3 text-amber-600" />
                          Pending NID
                        </Badge>
                      )}
                    </TableCell>

                    <TableCell>
                      {tenant.emergency_contact_name ? (
                        <div className="text-xs">
                          <p className="font-semibold">{tenant.emergency_contact_name}</p>
                          <p className="text-muted-foreground">
                            {[tenant.emergency_contact_relation, tenant.emergency_contact_phone]
                              .filter(Boolean)
                              .join(" • ")}
                          </p>
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </TableCell>

                    <TableCell>
                      <Badge
                        variant={tenant.status === "active" ? "default" : "secondary"}
                        className="capitalize text-xs"
                      >
                        {tenant.status}
                      </Badge>
                    </TableCell>

                    <TableCell className="text-right">
                      <Button asChild variant="outline" size="sm" className="font-semibold text-xs">
                        <Link href={`/tenants/${tenant.id}`}>View Profile &rarr;</Link>
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
