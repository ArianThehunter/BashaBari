"use client";

import Link from "next/link";
import { useState } from "react";
import { useOrganization } from "@/hooks/use-organization";
import { useProperties } from "@/hooks/use-property";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Building2, Plus, Search, MapPin, Home, Users, Loader2 } from "lucide-react";

export default function PropertiesPage() {
  const { activeOrgId } = useOrganization();
  const { properties, isLoading } = useProperties(activeOrgId);
  const [searchTerm, setSearchTerm] = useState("");

  const filteredProperties = properties.filter((property) =>
    property.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    property.area?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    property.city?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div className="space-y-6">
      {/* ---- Header Section ---- */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Properties & Assets</h1>
          <p className="text-sm text-muted-foreground">
            Manage your real estate properties, buildings, floors, and flat units
          </p>
        </div>

        <Button asChild className="gap-2 font-semibold">
          <Link href="/properties/new">
            <Plus className="w-4 h-4" /> Add New Property
          </Link>
        </Button>
      </div>

      {/* ---- Filter & Search Toolbar ---- */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-card p-4 rounded-xl border border-border">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by property name or area..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>

        <div className="text-xs text-muted-foreground font-medium self-end sm:self-center">
          Showing {filteredProperties.length} of {properties.length} Properties
        </div>
      </div>

      {/* ---- Property Grid ---- */}
      {isLoading ? (
        <div className="py-12 text-center text-sm text-muted-foreground flex items-center justify-center gap-2">
          <Loader2 className="w-5 h-5 animate-spin text-primary" /> Loading properties...
        </div>
      ) : filteredProperties.length === 0 ? (
        <Card className="border-dashed border-2 border-border text-center py-12">
          <CardContent className="space-y-3">
            <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto">
              <Building2 className="w-6 h-6" />
            </div>
            <CardTitle className="text-lg font-bold">No Properties Found</CardTitle>
            <CardDescription className="max-w-md mx-auto">
              {searchTerm
                ? "No properties matched your search term. Try clearing your filter."
                : "You haven't added any properties to this organization yet. Click below to add your first property."}
            </CardDescription>
            {!searchTerm && (
              <Button asChild className="gap-2 mt-2 font-semibold">
                <Link href="/properties/new">
                  <Plus className="w-4 h-4" /> Add Property Now
                </Link>
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProperties.map((property) => (
            <Card
              key={property.id}
              className="border-border hover:shadow-md transition-shadow flex flex-col justify-between"
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-2">
                  <CardTitle className="text-lg font-bold hover:text-primary transition-colors">
                    <Link href={`/properties/${property.id}`}>{property.name}</Link>
                  </CardTitle>
                  <Badge variant="outline" className="capitalize text-emerald-600 border-emerald-500/20 bg-emerald-500/10">
                    {property.status}
                  </Badge>
                </div>

                {(property.area || property.city) && (
                  <CardDescription className="flex items-center gap-1 text-xs mt-1">
                    <MapPin className="w-3.5 h-3.5 shrink-0 text-muted-foreground" />
                    <span>
                      {[property.area, property.city].filter(Boolean).join(", ")}
                    </span>
                  </CardDescription>
                )}
              </CardHeader>

              <CardContent className="py-2 space-y-3">
                {property.address && (
                  <p className="text-xs text-muted-foreground line-clamp-2">
                    {property.address}
                  </p>
                )}

                <div className="grid grid-cols-3 gap-2 p-3 bg-accent/40 rounded-lg text-center">
                  <div>
                    <p className="text-xs text-muted-foreground">Buildings</p>
                    <p className="text-sm font-bold flex items-center justify-center gap-1 mt-0.5">
                      <Building2 className="w-3.5 h-3.5 text-primary" />
                      {property.buildings_count || 0}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-muted-foreground">Total Units</p>
                    <p className="text-sm font-bold flex items-center justify-center gap-1 mt-0.5">
                      <Home className="w-3.5 h-3.5 text-primary" />
                      {property.units_count || 0}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-muted-foreground">Occupied</p>
                    <p className="text-sm font-bold flex items-center justify-center gap-1 mt-0.5 text-emerald-600 dark:text-emerald-400">
                      <Users className="w-3.5 h-3.5" />
                      {property.occupied_units_count || 0}
                    </p>
                  </div>
                </div>
              </CardContent>

              <div className="p-4 pt-2 border-t border-border mt-2 flex justify-end">
                <Button asChild variant="outline" size="sm" className="w-full font-semibold">
                  <Link href={`/properties/${property.id}`}>
                    Manage Property & Units &rarr;
                  </Link>
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
