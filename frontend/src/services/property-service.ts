import api from "@/lib/api";
import { bdtToPoisha } from "@/lib/money";
import type { BuildingInput, PropertyInput, UnitInput } from "@/lib/validations/property";
import type { Building, Property, Unit } from "@/types";

export const propertyService = {
  /**
   * Fetch all properties for active organization.
   */
  async getProperties(organizationId?: number | null): Promise<Property[]> {
    const headers = organizationId ? { "X-Organization-Id": String(organizationId) } : undefined;
    const response = await api.get<{ data: Property[] }>("/api/v1/properties", { headers });
    return response.data.data;
  },

  /**
   * Create a new property.
   */
  async createProperty(data: PropertyInput, organizationId?: number | null): Promise<Property> {
    const headers = organizationId ? { "X-Organization-Id": String(organizationId) } : undefined;
    const response = await api.post<{ data: Property }>("/api/v1/properties", data, { headers });
    return response.data.data;
  },

  /**
   * Fetch property details with building/floor/unit hierarchy.
   */
  async getProperty(id: number): Promise<Property> {
    const response = await api.get<{ data: Property }>(`/api/v1/properties/${id}`);
    return response.data.data;
  },

  /**
   * Update property details.
   */
  async updateProperty(id: number, data: PropertyInput): Promise<Property> {
    const response = await api.put<{ data: Property }>(`/api/v1/properties/${id}`, data);
    return response.data.data;
  },

  /**
   * Delete property.
   */
  async deleteProperty(id: number): Promise<void> {
    await api.delete(`/api/v1/properties/${id}`);
  },

  /**
   * Create building under a property.
   */
  async createBuilding(data: BuildingInput): Promise<Building> {
    const response = await api.post<{ data: Building }>("/api/v1/buildings", data);
    return response.data.data;
  },

  /**
   * Fetch all units with optional filters.
   */
  async getUnits(params?: {
    property_id?: number;
    unit_type?: string;
    occupancy_status?: string;
    organization_id?: number | null;
  }): Promise<Unit[]> {
    const headers = params?.organization_id
      ? { "X-Organization-Id": String(params.organization_id) }
      : undefined;

    const response = await api.get<{ data: Unit[] }>("/api/v1/units", {
      params,
      headers,
    });
    return response.data.data;
  },

  /**
   * Create flat unit (converts base_rent_bdt to poisha integer).
   */
  async createUnit(data: UnitInput): Promise<Unit> {
    const payload = {
      ...data,
      base_rent_amount: bdtToPoisha(data.base_rent_bdt),
    };
    const response = await api.post<{ data: Unit }>("/api/v1/units", payload);
    return response.data.data;
  },

  /**
   * Update unit.
   */
  async updateUnit(id: number, data: UnitInput): Promise<Unit> {
    const payload = {
      ...data,
      base_rent_amount: bdtToPoisha(data.base_rent_bdt),
    };
    const response = await api.put<{ data: Unit }>(`/api/v1/units/${id}`, payload);
    return response.data.data;
  },

  /**
   * Delete unit.
   */
  async deleteUnit(id: number): Promise<void> {
    await api.delete(`/api/v1/units/${id}`);
  },
};
