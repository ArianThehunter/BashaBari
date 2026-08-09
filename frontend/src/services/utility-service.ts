import api from "@/lib/api";
import type { MeterReadingInput } from "@/lib/validations/utility";

export interface UtilityProviderItem {
  id: number;
  name: string;
  code: string;
  type: "electricity" | "gas" | "water";
  default_rate_per_unit_poisha: number;
  description: string | null;
}

export interface MeterReadingItem {
  id: number;
  organization_id: number;
  property_id: number;
  building_id: number | null;
  unit_id: number | null;
  utility_provider_id: number;
  meter_number: string;
  previous_reading: number;
  current_reading: number;
  units_consumed: number;
  rate_per_unit_poisha: number;
  total_amount_poisha: number;
  reading_date: string;
  billing_month: string;
  status: "pending" | "invoiced";
  property?: { id: number; name: string };
  unit?: { id: number; unit_number: string };
  utilityProvider?: UtilityProviderItem;
}

export interface MeterReadingsResponse {
  data: MeterReadingItem[];
  meta: {
    total_readings: number;
    total_amount_poisha: number;
  };
}

export const utilityService = {
  /**
   * Fetch nationwide BD utility providers.
   */
  async getUtilityProviders(): Promise<UtilityProviderItem[]> {
    const response = await api.get<{ data: UtilityProviderItem[] }>("/api/v1/utility-providers");
    return response.data.data;
  },

  /**
   * Fetch sub-meter readings for active organization.
   */
  async getMeterReadings(params?: {
    property_id?: number;
    utility_provider_id?: number;
    billing_month?: string;
    organization_id?: number | null;
  }): Promise<MeterReadingsResponse> {
    const headers = params?.organization_id
      ? { "X-Organization-Id": String(params.organization_id) }
      : undefined;

    const response = await api.get<MeterReadingsResponse>("/api/v1/meter-readings", {
      params,
      headers,
    });
    return response.data;
  },

  /**
   * Log sub-meter reading.
   */
  async createMeterReading(
    data: MeterReadingInput,
    organizationId?: number | null,
  ): Promise<MeterReadingItem> {
    const headers = organizationId ? { "X-Organization-Id": String(organizationId) } : undefined;
    const response = await api.post<{ data: MeterReadingItem }>("/api/v1/meter-readings", data, {
      headers,
    });
    return response.data.data;
  },
};
