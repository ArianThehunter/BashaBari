"use client";

import Link from "next/link";
import { useState } from "react";
import { useOrganization } from "@/hooks/use-organization";
import { useMeterReadings, useUtilityProviders } from "@/hooks/use-utility";
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
import { Zap, Plus, Home, Calendar, Loader2, Gauge, Flame, Droplets } from "lucide-react";

export default function UtilitiesDirectoryPage() {
  const { activeOrgId } = useOrganization();
  const [providerFilter, setProviderFilter] = useState<string>("all");

  const { providers } = useUtilityProviders();
  const { readings, meta, isLoading } = useMeterReadings({
    organization_id: activeOrgId,
    utility_provider_id: providerFilter === "all" ? undefined : Number(providerFilter),
  });

  return (
    <div className="space-y-6">
      {/* ---- Header Section ---- */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Sub-Meter Utilities & Billing</h1>
          <p className="text-sm text-muted-foreground">
            Track electricity, gas, and WASA water meter consumption across DPDC, DESCO, BREB, Titas, and DWASA
          </p>
        </div>

        <Button asChild className="gap-2 font-semibold">
          <Link href="/utilities/new">
            <Plus className="w-4 h-4" /> Log Sub-Meter Reading
          </Link>
        </Button>
      </div>

      {/* ---- Summary Metric Cards ---- */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-border">
          <CardHeader className="py-3 px-4 flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-xs font-semibold text-muted-foreground">
              Total Logged Meter Readings
            </CardTitle>
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              <Gauge className="w-4 h-4" />
            </div>
          </CardHeader>
          <CardContent className="px-4 pb-3">
            <p className="text-2xl font-extrabold text-foreground">{meta.total_readings}</p>
            <p className="text-[11px] text-muted-foreground mt-0.5">Recorded meter cycles</p>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardHeader className="py-3 px-4 flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-xs font-semibold text-muted-foreground">
              Total Consumption Value
            </CardTitle>
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-600">
              <Zap className="w-4 h-4" />
            </div>
          </CardHeader>
          <CardContent className="px-4 pb-3">
            <p className="text-2xl font-extrabold text-amber-600 dark:text-amber-400">
              {formatMoney(meta.total_amount_poisha)}
            </p>
            <p className="text-[11px] text-muted-foreground mt-0.5">Calculated utility cost</p>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardHeader className="py-3 px-4 flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-xs font-semibold text-muted-foreground">
              Supported BD Utility Companies
            </CardTitle>
            <div className="p-2 rounded-lg bg-blue-500/10 text-blue-600">
              <Droplets className="w-4 h-4" />
            </div>
          </CardHeader>
          <CardContent className="px-4 pb-3">
            <p className="text-2xl font-extrabold text-blue-600 dark:text-blue-400">10 Providers</p>
            <p className="text-[11px] text-muted-foreground mt-0.5">DPDC, DESCO, BREB, Titas, DWASA, CWASA</p>
          </CardContent>
        </Card>
      </div>

      {/* ---- Utility Provider Filter Pills ---- */}
      <div className="flex flex-wrap items-center gap-1.5 bg-card p-4 rounded-xl border border-border">
        <Button
          variant={providerFilter === "all" ? "default" : "outline"}
          size="sm"
          onClick={() => setProviderFilter("all")}
          className="text-xs font-semibold"
        >
          All Utility Providers
        </Button>
        {providers.map((p) => (
          <Button
            key={p.id}
            variant={providerFilter === String(p.id) ? "default" : "outline"}
            size="sm"
            onClick={() => setProviderFilter(String(p.id))}
            className="text-xs font-semibold capitalize gap-1"
          >
            {p.type === "electricity" && <Zap className="w-3 h-3 text-amber-500" />}
            {p.type === "gas" && <Flame className="w-3 h-3 text-red-500" />}
            {p.type === "water" && <Droplets className="w-3 h-3 text-blue-500" />}
            {p.code}
          </Button>
        ))}
      </div>

      {/* ---- Readings Directory Table ---- */}
      <Card className="border-border">
        <CardHeader>
          <CardTitle className="text-lg font-bold flex items-center gap-2">
            <Gauge className="w-5 h-5 text-primary" />
            Sub-Meter Reading Log Records
          </CardTitle>
          <CardDescription>
            Meter numbers, consumption units, and utility tariffs across Bangladesh power, gas, and WASA companies.
          </CardDescription>
        </CardHeader>

        <CardContent>
          {isLoading ? (
            <div className="py-12 text-center text-sm text-muted-foreground flex items-center justify-center gap-2">
              <Loader2 className="w-5 h-5 animate-spin text-primary" /> Loading meter reading logs...
            </div>
          ) : readings.length === 0 ? (
            <div className="py-12 text-center text-sm text-muted-foreground space-y-3">
              <Gauge className="w-10 h-10 mx-auto text-muted-foreground" />
              <p className="font-semibold text-base">No Sub-Meter Readings Logged</p>
              <p className="text-xs max-w-sm mx-auto">
                No meter logs match your provider selection. Click below to record monthly sub-meter units.
              </p>
              <Button asChild size="sm" className="gap-2 font-semibold mt-2">
                <Link href="/utilities/new">
                  <Plus className="w-4 h-4" /> Log Sub-Meter Reading
                </Link>
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Meter # & Provider</TableHead>
                  <TableHead>Property & Flat</TableHead>
                  <TableHead>Previous Reading</TableHead>
                  <TableHead>Current Reading</TableHead>
                  <TableHead>Units Consumed</TableHead>
                  <TableHead>Reading Date</TableHead>
                  <TableHead className="text-right">Total Utility Amount</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {readings.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell className="font-bold">
                      <div className="space-y-0.5 font-mono text-xs">
                        <p className="text-foreground">{r.meter_number}</p>
                        <Badge variant="outline" className="capitalize text-[10px] font-bold bg-accent/30 font-sans gap-1">
                          {r.utilityProvider?.type === "electricity" && <Zap className="w-2.5 h-2.5 text-amber-500" />}
                          {r.utilityProvider?.type === "gas" && <Flame className="w-2.5 h-2.5 text-red-500" />}
                          {r.utilityProvider?.type === "water" && <Droplets className="w-2.5 h-2.5 text-blue-500" />}
                          {r.utilityProvider?.code}
                        </Badge>
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="text-xs">
                        <p className="font-semibold text-foreground flex items-center gap-1">
                          <Home className="w-3.5 h-3.5 text-primary" />
                          {r.property?.name}
                        </p>
                        {r.unit && <p className="text-muted-foreground">{r.unit.unit_number}</p>}
                      </div>
                    </TableCell>

                    <TableCell className="text-xs font-mono text-muted-foreground">
                      {r.previous_reading}
                    </TableCell>

                    <TableCell className="text-xs font-mono font-semibold text-foreground">
                      {r.current_reading}
                    </TableCell>

                    <TableCell className="text-xs font-extrabold text-foreground">
                      {r.units_consumed} Units
                    </TableCell>

                    <TableCell>
                      <div className="text-xs flex items-center gap-1 font-medium text-muted-foreground">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>{r.reading_date}</span>
                      </div>
                    </TableCell>

                    <TableCell className="text-right font-extrabold text-amber-600 dark:text-amber-400 text-sm">
                      {formatMoney(r.total_amount_poisha)}
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
