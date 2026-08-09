"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { usePropertyDetail } from "@/hooks/use-property";
import { formatMoney } from "@/lib/money";
import {
  buildingSchema,
  unitSchema,
  type BuildingInput,
  type UnitInput,
} from "@/lib/validations/property";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Building2,
  Home,
  Plus,
  ArrowLeft,
  MapPin,
  Loader2,
  Bed,
  Bath,
  Square,
  AlertCircle,
} from "lucide-react";

export default function PropertyDetailPage() {
  const params = useParams();
  const propertyId = Number(params.id);

  const {
    property,
    isLoading,
    createBuilding,
    isCreatingBuilding,
    createUnit,
    isCreatingUnit,
  } = usePropertyDetail(propertyId);

  const [isBuildingDialogOpen, setIsBuildingDialogOpen] = useState(false);
  const [isUnitDialogOpen, setIsUnitDialogOpen] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  // ---- Building Form ----
  const buildingForm = useForm<BuildingInput>({
    resolver: zodResolver(buildingSchema),
    defaultValues: {
      property_id: propertyId,
      name: "",
      total_floors: 5,
    },
  });

  // ---- Unit Form ----
  const unitForm = useForm<UnitInput>({
    resolver: zodResolver(unitSchema),
    defaultValues: {
      floor_id: undefined,
      unit_number: "",
      unit_type: "residential",
      bedrooms: 3,
      bathrooms: 2,
      area_sqft: 1200,
      base_rent_bdt: 20000,
      occupancy_status: "vacant",
      notes: "",
    },
  });

  const onBuildingSubmit = async (data: BuildingInput) => {
    setServerError(null);
    try {
      await createBuilding({ ...data, property_id: propertyId });
      setIsBuildingDialogOpen(false);
      buildingForm.reset();
    } catch {
      setServerError("Failed to add building. Please try again.");
    }
  };

  const onUnitSubmit = async (data: UnitInput) => {
    setServerError(null);
    try {
      await createUnit(data);
      setIsUnitDialogOpen(false);
      unitForm.reset();
    } catch {
      setServerError("Failed to add unit. Please check your inputs.");
    }
  };

  const openAddUnitModal = (floorId: number) => {
    unitForm.setValue("floor_id", floorId);
    setIsUnitDialogOpen(true);
  };

  if (isLoading) {
    return (
      <div className="py-16 text-center text-sm text-muted-foreground flex items-center justify-center gap-2">
        <Loader2 className="w-6 h-6 animate-spin text-primary" /> Loading property details...
      </div>
    );
  }

  if (!property) {
    return (
      <div className="text-center py-12 space-y-3">
        <h2 className="text-xl font-bold">Property Not Found</h2>
        <p className="text-sm text-muted-foreground">The property you requested does not exist or was deleted.</p>
        <Button asChild variant="outline">
          <Link href="/properties">&larr; Back to Properties</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* ---- Navigation Header ---- */}
      <div className="flex items-center justify-between">
        <Button asChild variant="ghost" size="sm">
          <Link href="/properties">
            <ArrowLeft className="w-4 h-4 mr-1" /> Back to Properties
          </Link>
        </Button>
      </div>

      {/* ---- Property Overview Card ---- */}
      <Card className="border-border shadow-xs">
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold tracking-tight">{property.name}</h1>
                <Badge variant="outline" className="capitalize text-emerald-600 border-emerald-500/20 bg-emerald-500/10">
                  {property.status}
                </Badge>
              </div>

              {(property.area || property.city || property.address) && (
                <p className="text-sm text-muted-foreground flex items-center gap-1.5 mt-1">
                  <MapPin className="w-4 h-4 text-primary shrink-0" />
                  <span>
                    {[property.address, property.area, property.city].filter(Boolean).join(", ")}
                  </span>
                </p>
              )}
            </div>

            {/* ---- Add Building Modal Trigger ---- */}
            <Dialog open={isBuildingDialogOpen} onOpenChange={setIsBuildingDialogOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2 font-semibold">
                  <Plus className="w-4 h-4" /> Add Building / Tower
                </Button>
              </DialogTrigger>

              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <Building2 className="w-5 h-5 text-primary" />
                    Add Building / Tower
                  </DialogTitle>
                  <DialogDescription>
                    Add a building block to {property.name}. Standard floors will be auto-generated.
                  </DialogDescription>
                </DialogHeader>

                <form onSubmit={buildingForm.handleSubmit(onBuildingSubmit)} className="space-y-4 py-2">
                  <div className="space-y-2">
                    <Label htmlFor="building_name">Building Name</Label>
                    <Input
                      id="building_name"
                      placeholder="e.g. Tower A, Block B, Main Building"
                      disabled={isCreatingBuilding}
                      {...buildingForm.register("name")}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="total_floors">Total Floors (Auto-generates floor entries)</Label>
                    <Input
                      id="total_floors"
                      type="number"
                      min={1}
                      max={100}
                      disabled={isCreatingBuilding}
                      {...buildingForm.register("total_floors", { valueAsNumber: true })}
                    />
                  </div>

                  <DialogFooter className="pt-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsBuildingDialogOpen(false)}
                      disabled={isCreatingBuilding}
                    >
                      Cancel
                    </Button>
                    <Button type="submit" disabled={isCreatingBuilding} className="gap-2">
                      {isCreatingBuilding ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" /> Creating...
                        </>
                      ) : (
                        "Create Building"
                      )}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
      </Card>

      {/* ---- Buildings & Units Breakdown ---- */}
      <div className="space-y-6">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <Building2 className="w-5 h-5 text-primary" />
          Buildings & Flat Units
        </h2>

        {!property.buildings || property.buildings.length === 0 ? (
          <Card className="border-dashed border-2 border-border text-center py-10">
            <CardContent className="space-y-3">
              <Building2 className="w-10 h-10 text-muted-foreground mx-auto" />
              <p className="font-semibold text-sm">No Buildings Added Yet</p>
              <p className="text-xs text-muted-foreground">
                Add a building or tower to start adding floors and flat units.
              </p>
              <Button onClick={() => setIsBuildingDialogOpen(true)} variant="outline" size="sm" className="gap-1 mt-2">
                <Plus className="w-4 h-4" /> Add Building
              </Button>
            </CardContent>
          </Card>
        ) : (
          property.buildings.map((building) => (
            <Card key={building.id} className="border-border">
              <CardHeader className="bg-accent/30 py-3 border-b border-border flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-lg font-bold flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-primary" />
                    {building.name}
                  </CardTitle>
                  <CardDescription className="text-xs">
                    {building.floors?.length || 0} Floors
                  </CardDescription>
                </div>
              </CardHeader>

              <CardContent className="p-4 space-y-4">
                {building.floors?.map((floor) => (
                  <div key={floor.id} className="border border-border rounded-xl p-4 bg-card space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-sm text-foreground flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-primary" />
                        {floor.name}
                      </h4>

                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => openAddUnitModal(floor.id)}
                        className="gap-1 text-xs"
                      >
                        <Plus className="w-3.5 h-3.5" /> Add Unit / Flat
                      </Button>
                    </div>

                    {/* Unit Cards Grid */}
                    {!floor.units || floor.units.length === 0 ? (
                      <p className="text-xs text-muted-foreground italic py-1">
                        No units added to this floor yet.
                      </p>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {floor.units.map((unit) => (
                          <div
                            key={unit.id}
                            className="p-3 bg-accent/40 rounded-lg border border-border flex flex-col justify-between space-y-2 hover:border-primary/50 transition-colors"
                          >
                            <div className="flex items-start justify-between">
                              <div>
                                <h5 className="font-bold text-sm">{unit.unit_number}</h5>
                                <span className="text-[10px] text-muted-foreground uppercase font-semibold">
                                  {unit.unit_type}
                                </span>
                              </div>

                              <Badge
                                variant={unit.occupancy_status === "occupied" ? "default" : "outline"}
                                className={`capitalize text-[10px] px-2 py-0.5 ${
                                  unit.occupancy_status === "vacant"
                                    ? "text-emerald-600 border-emerald-500/20 bg-emerald-500/10"
                                    : unit.occupancy_status === "occupied"
                                      ? "bg-primary text-primary-foreground"
                                      : "text-amber-600 border-amber-500/20 bg-amber-500/10"
                                }`}
                              >
                                {unit.occupancy_status}
                              </Badge>
                            </div>

                            {/* Specs */}
                            <div className="flex items-center gap-3 text-xs text-muted-foreground pt-1">
                              {unit.bedrooms !== null && (
                                <span className="flex items-center gap-1">
                                  <Bed className="w-3.5 h-3.5 text-primary" /> {unit.bedrooms} Bed
                                </span>
                              )}
                              {unit.bathrooms !== null && (
                                <span className="flex items-center gap-1">
                                  <Bath className="w-3.5 h-3.5 text-primary" /> {unit.bathrooms} Bath
                                </span>
                              )}
                              {unit.area_sqft !== null && (
                                <span className="flex items-center gap-1">
                                  <Square className="w-3.5 h-3.5 text-primary" /> {unit.area_sqft} sqft
                                </span>
                              )}
                            </div>

                            {/* Rent Amount (formatted via formatMoney) */}
                            <div className="border-t border-border/50 pt-2 flex items-center justify-between">
                              <span className="text-xs text-muted-foreground">Base Rent:</span>
                              <span className="font-extrabold text-sm text-foreground">
                                {formatMoney(unit.base_rent_amount)}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* ---- Add Unit Dialog ---- */}
      <Dialog open={isUnitDialogOpen} onOpenChange={setIsUnitDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Home className="w-5 h-5 text-primary" />
              Add Flat Unit
            </DialogTitle>
            <DialogDescription>
              Create a new flat or unit. Base rent will be saved in integer poisha.
            </DialogDescription>
          </DialogHeader>

          {serverError && (
            <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-md text-destructive text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{serverError}</span>
            </div>
          )}

          <form onSubmit={unitForm.handleSubmit(onUnitSubmit)} className="space-y-4 py-2">
            <input type="hidden" {...unitForm.register("floor_id", { valueAsNumber: true })} />

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="unit_number">Unit / Flat No.</Label>
                <Input
                  id="unit_number"
                  placeholder="e.g. Flat 3-A, Shop 102"
                  disabled={isCreatingUnit}
                  {...unitForm.register("unit_number")}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="unit_type">Unit Type</Label>
                <Select
                  defaultValue="residential"
                  onValueChange={(val) =>
                    unitForm.setValue(
                      "unit_type",
                      val as "residential" | "commercial" | "garage" | "storage"
                    )
                  }
                >
                  <SelectTrigger id="unit_type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="residential">Residential Flat</SelectItem>
                    <SelectItem value="commercial">Commercial Space</SelectItem>
                    <SelectItem value="garage">Garage / Parking</SelectItem>
                    <SelectItem value="storage">Storage Room</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-2">
                <Label htmlFor="bedrooms">Bedrooms</Label>
                <Input
                  id="bedrooms"
                  type="number"
                  min={0}
                  disabled={isCreatingUnit}
                  {...unitForm.register("bedrooms", { valueAsNumber: true })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="bathrooms">Bathrooms</Label>
                <Input
                  id="bathrooms"
                  type="number"
                  min={0}
                  disabled={isCreatingUnit}
                  {...unitForm.register("bathrooms", { valueAsNumber: true })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="area_sqft">Area (sqft)</Label>
                <Input
                  id="area_sqft"
                  type="number"
                  min={0}
                  disabled={isCreatingUnit}
                  {...unitForm.register("area_sqft", { valueAsNumber: true })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="base_rent_bdt">Monthly Base Rent (BDT)</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-sm text-muted-foreground">
                  ৳
                </span>
                <Input
                  id="base_rent_bdt"
                  type="number"
                  placeholder="20000"
                  className="pl-7"
                  disabled={isCreatingUnit}
                  {...unitForm.register("base_rent_bdt", { valueAsNumber: true })}
                />
              </div>
            </div>

            <DialogFooter className="pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsUnitDialogOpen(false)}
                disabled={isCreatingUnit}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isCreatingUnit} className="gap-2 font-semibold">
                {isCreatingUnit ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Adding...
                  </>
                ) : (
                  "Add Flat Unit"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
