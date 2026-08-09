import api from "@/lib/api";
import type {
  AddMemberInput,
  CreateOrganizationInput,
  UpdateOrganizationInput,
} from "@/lib/validations/organization";
import type { Organization, OrganizationMember, Role } from "@/types";

export const organizationService = {
  /**
   * Fetch all organizations for the current user.
   */
  async getOrganizations(): Promise<Organization[]> {
    const response = await api.get<{ data: Organization[] }>("/api/v1/organizations");
    return response.data.data;
  },

  /**
   * Create a new organization (Onboarding).
   */
  async createOrganization(data: CreateOrganizationInput): Promise<Organization> {
    const response = await api.post<{ data: Organization }>("/api/v1/organizations", data);
    return response.data.data;
  },

  /**
   * Fetch single organization details.
   */
  async getOrganization(id: number): Promise<Organization> {
    const response = await api.get<{ data: Organization }>(`/api/v1/organizations/${id}`);
    return response.data.data;
  },

  /**
   * Update organization settings.
   */
  async updateOrganization(id: number, data: UpdateOrganizationInput): Promise<Organization> {
    const response = await api.put<{ data: Organization }>(`/api/v1/organizations/${id}`, data);
    return response.data.data;
  },

  /**
   * Fetch members of an organization.
   */
  async getMembers(organizationId: number): Promise<OrganizationMember[]> {
    const response = await api.get<{ data: OrganizationMember[] }>(
      `/api/v1/organizations/${organizationId}/members`,
    );
    return response.data.data;
  },

  /**
   * Add a new member to an organization.
   */
  async addMember(organizationId: number, data: AddMemberInput): Promise<OrganizationMember> {
    const response = await api.post<{ data: OrganizationMember }>(
      `/api/v1/organizations/${organizationId}/members`,
      data,
    );
    return response.data.data;
  },

  /**
   * Remove a member from an organization.
   */
  async removeMember(organizationId: number, memberId: number): Promise<void> {
    await api.delete(`/api/v1/organizations/${organizationId}/members/${memberId}`);
  },

  /**
   * Fetch available system and organization roles.
   */
  async getRoles(organizationId?: number): Promise<Role[]> {
    const params = organizationId ? { organization_id: organizationId } : undefined;
    const response = await api.get<{ data: Role[] }>("/api/v1/roles", { params });
    return response.data.data;
  },
};
