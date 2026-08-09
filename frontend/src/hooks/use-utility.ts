"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { utilityService, type MeterReadingsResponse } from "@/services/utility-service";
import type { MeterReadingInput } from "@/lib/validations/utility";
import { getApiErrorMessage } from "@/lib/api";

export function useUtilityProviders() {
  const { data: providers = [], isLoading, isError } = useQuery({
    queryKey: ["utility-providers"],
    queryFn: () => utilityService.getUtilityProviders(),
  });

  return { providers, isLoading, isError };
}

export function useMeterReadings(params?: {
  property_id?: number;
  utility_provider_id?: number;
  billing_month?: string;
  organization_id?: number | null;
}) {
  const queryClient = useQueryClient();
  const meterReadingsQueryKey = ["meter-readings", params];

  const {
    data = {
      data: [],
      meta: { total_readings: 0, total_amount_poisha: 0 },
    },
    isLoading,
    isError,
    refetch,
  } = useQuery<MeterReadingsResponse>({
    queryKey: meterReadingsQueryKey,
    queryFn: () => utilityService.getMeterReadings(params),
    enabled: !!params?.organization_id,
  });

  const createMeterReadingMutation = useMutation({
    mutationFn: (input: MeterReadingInput) =>
      utilityService.createMeterReading(input, params?.organization_id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["meter-readings"] });
    },
  });

  return {
    readings: data.data,
    meta: data.meta,
    isLoading,
    isError,
    refetchReadings: refetch,

    createMeterReading: createMeterReadingMutation.mutateAsync,
    isCreatingReading: createMeterReadingMutation.isPending,
    createReadingError: createMeterReadingMutation.error
      ? getApiErrorMessage(createMeterReadingMutation.error)
      : null,
  };
}
