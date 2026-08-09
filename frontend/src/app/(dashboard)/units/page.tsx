"use client";

import { useState } from "react";
import { useOrganization } from "@/hooks/use-organization";
import { useUnits } from "@/hooks/use-property";
import { formatMoney } from "@/lib/money";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Home, Loader2, Bed, Bath, Square, Building2 } from "lucide-react";

export default function MasterUnitsPage() {
  const { activeOrgId } = useOrganization();
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");

  const { units, isLoading } = useUnits({
    organization_id: activeOrgId,
    occupancy_status: statusFilter === "all" ? undefined : statusFilter,
    unit_type: typeFilter === "all" ? undefined : typeFilter,
  });

  const statusPills = [
    { id: "all", label: "All Units" },
    { id: "vacant", label: "Vacant" },
    { id: "occupied", label: "Occupied" },
    { id: "maintenance", label: "Maintenance" },
    { id: "reserved", label: "Reserved" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Master Units Inventory</h1>
        <p className="text-sm text-muted-foreground">
          Overview of all flat units, commercial spaces, and garages across your organization
        </p>
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

        {/* Type Filter */}
        <div className="flex items-center gap-3">
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="text-xs bg-background border border-input rounded-md px-3 py-1.5 font-medium focus:outline-none focus:ring-1 focus:ring-primary"
          >
            <option value="all">All Unit Types</option>
            <option value="residential">Residential</option>
            <option value="commercial">Commercial</option>
            <option value="garage">Garage</option>
            <option value="storage">Storage</option>
          </select>

          <div className="text-xs text-muted-foreground font-medium">
            Total: <strong>{units.length}</strong> Units
          </div>
        </div>
      </div>

      {/* ---- Units Data Table ---- */}
      <Card className="border-border">
        <CardHeader>
          <CardTitle className="text-lg font-bold flex items-center gap-2">
            <Home className="w-5 h-5 text-primary" />
            Units Directory
          </CardTitle>
          <CardDescription>
            Live occupancy status and monthly base rent amounts.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="py-12 text-center text-sm text-muted-foreground flex items-center justify-center gap-2">
              <Loader2 className="w-5 h-5 animate-spin text-primary" /> Loading units inventory...
            </div>
          ) : units.length === 0 ? (
            <div className="py-12 text-center text-sm text-muted-foreground space-y-2">
              <Home className="w-8 h-8 mx-auto text-muted-foreground" />
              <p className="font-semibold">No units found</p>
              <p className="text-xs">No units match the selected occupancy status filter.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Unit / Flat</TableHead>
                  <TableHead>Property & Building</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Specifications</TableHead>
                  <TableHead>Base Rent</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {units.map((unit) => (
                  <TableRow key={unit.id}>
                    <TableCell className="font-bold text-foreground">
                      {unit.unit_number}
                    </TableCell>

                    <TableCell>
                      <div className="text-xs">
                        <p className="font-semibold text-foreground flex items-center gap-1">
                          <Building2 className="w-3.5 h-3.5 text-primary" />
                          {unit.property?.name || "Property"}
                        </p>
                        <p className="text-muted-foreground">
                          {[unit.building?.name, unit.floor?.name].filter(Boolean).join(" • ")}
                        </p>
                      </div>
                    </TableCell>

                    <TableCell>
                      <Badge variant="secondary" className="capitalize text-[10px]">
                        {unit.unit_type}
                      </Badge>
                    </TableCell>

                    <TableCell>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        {unit.bedrooms !== null && (
                          <span className="flex items-center gap-1">
                            <Bed className="w-3.5 h-3.5" /> {unit.bedrooms} Bed
                          </span>
                        )}
                        {unit.bathrooms !== null && (
                          <span className="flex items-center gap-1">
                            <Bath className="w-3.5 h-3.5" /> {unit.bathrooms} Bath
                          </span>
                        )}
                        {unit.area_sqft !== null && (
                          <span className="flex items-center gap-1">
                            <Square className="w-3.5 h-3.5" /> {unit.area_sqft} sqft
                          </span>
                        )}
                      </div>
                    </TableCell>

                    <TableCell className="font-bold text-foreground">
                      {formatMoney(unit.base_rent_amount)}
                    </TableCell>

                    <TableCell>
                      <Badge
                        variant={unit.occupancy_status === "occupied" ? "default" : "outline"}
                        className={`capitalize text-xs ${
                          unit.occupancy_status === "vacant"
                            ? "text-emerald-600 border-emerald-500/20 bg-emerald-500/10"
                            : unit.occupancy_status === "occupied"
                              ? "bg-primary text-primary-foreground"
                              : "text-amber-600 border-amber-500/20 bg-amber-500/10"
                        }`}
                      >
                        {unit.occupancy_status}
                      </Badge>
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
