"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { propertyService } from "@/services/property-service";
import type { BuildingInput, PropertyInput, UnitInput } from "@/lib/validations/property";
import type { Property, Unit } from "@/types";
import { getApiErrorMessage } from "@/lib/api";

export function useProperties(organizationId?: number | null) {
  const queryClient = useQueryClient();
  const propertiesQueryKey = ["properties", organizationId];

  const {
    data: properties = [],
    isLoading,
    isError,
    refetch,
  } = useQuery<Property[]>({
    queryKey: propertiesQueryKey,
    queryFn: () => propertyService.getProperties(organizationId),
    enabled: !!organizationId,
  });

  const createPropertyMutation = useMutation({
    mutationFn: (data: PropertyInput) => propertyService.createProperty(data, organizationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: propertiesQueryKey });
    },
  });

  const deletePropertyMutation = useMutation({
    mutationFn: (id: number) => propertyService.deleteProperty(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: propertiesQueryKey });
    },
  });

  return {
    properties,
    isLoading,
    isError,
    refetchProperties: refetch,

    createProperty: createPropertyMutation.mutateAsync,
    isCreatingProperty: createPropertyMutation.isPending,
    createPropertyError: createPropertyMutation.error
      ? getApiErrorMessage(createPropertyMutation.error)
      : null,

    deleteProperty: deletePropertyMutation.mutateAsync,
    isDeletingProperty: deletePropertyMutation.isPending,
  };
}

export function usePropertyDetail(propertyId: number | null) {
  const queryClient = useQueryClient();
  const propertyQueryKey = ["property", propertyId];

  const {
    data: property = null,
    isLoading,
    isError,
    refetch,
  } = useQuery<Property | null>({
    queryKey: propertyQueryKey,
    queryFn: () => (propertyId ? propertyService.getProperty(propertyId) : null),
    enabled: !!propertyId,
  });

  const createBuildingMutation = useMutation({
    mutationFn: (data: BuildingInput) => propertyService.createBuilding(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: propertyQueryKey });
    },
  });

  const createUnitMutation = useMutation({
    mutationFn: (data: UnitInput) => propertyService.createUnit(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: propertyQueryKey });
      queryClient.invalidateQueries({ queryKey: ["units"] });
    },
  });

  return {
    property,
    isLoading,
    isError,
    refetchProperty: refetch,

    createBuilding: createBuildingMutation.mutateAsync,
    isCreatingBuilding: createBuildingMutation.isPending,

    createUnit: createUnitMutation.mutateAsync,
    isCreatingUnit: createUnitMutation.isPending,
  };
}

export function useUnits(filters?: {
  property_id?: number;
  unit_type?: string;
  occupancy_status?: string;
  organization_id?: number | null;
}) {
  const queryClient = useQueryClient();
  const unitsQueryKey = ["units", filters];

  const {
    data: units = [],
    isLoading,
    isError,
    refetch,
  } = useQuery<Unit[]>({
    queryKey: unitsQueryKey,
    queryFn: () => propertyService.getUnits(filters),
    enabled: !!filters?.organization_id,
  });

  const deleteUnitMutation = useMutation({
    mutationFn: (id: number) => propertyService.deleteUnit(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["units"] });
      queryClient.invalidateQueries({ queryKey: ["property"] });
    },
  });

  return {
    units,
    isLoading,
    isError,
    refetchUnits: refetch,

    deleteUnit: deleteUnitMutation.mutateAsync,
    isDeletingUnit: deleteUnitMutation.isPending,
  };
}
