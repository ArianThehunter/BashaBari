"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { organizationService } from "@/services/organization-service";
import type {
  AddMemberInput,
  CreateOrganizationInput,
  UpdateOrganizationInput,
} from "@/lib/validations/organization";
import type { Organization, OrganizationMember, Role } from "@/types";
import { getApiErrorMessage } from "@/lib/api";

const ORGANIZATIONS_QUERY_KEY = ["organizations"];
const ACTIVE_ORG_STORAGE_KEY = "bariwala_active_org_id";

export function useOrganization() {
  const queryClient = useQueryClient();
  const [activeOrgId, setActiveOrgId] = useState<number | null>(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem(ACTIVE_ORG_STORAGE_KEY);
      return stored ? Number(stored) : null;
    }
    return null;
  });

  // ---- Query: User Organizations ----
  const {
    data: organizations = [],
    isLoading: isLoadingOrganizations,
    isError: isOrganizationsError,
    refetch: refetchOrganizations,
  } = useQuery<Organization[]>({
    queryKey: ORGANIZATIONS_QUERY_KEY,
    queryFn: () => organizationService.getOrganizations(),
    staleTime: 5 * 60 * 1000,
  });

  // Auto-select first organization if activeOrgId is not set or not in list
  const activeOrganization =
    organizations.find((org) => org.id === activeOrgId) ||
    organizations[0] ||
    null;

  const selectOrganization = (id: number) => {
    setActiveOrgId(id);
    if (typeof window !== "undefined") {
      localStorage.setItem(ACTIVE_ORG_STORAGE_KEY, String(id));
    }
  };

  // ---- Mutation: Create Organization ----
  const createOrgMutation = useMutation({
    mutationFn: (data: CreateOrganizationInput) =>
      organizationService.createOrganization(data),
    onSuccess: (newOrg) => {
      queryClient.setQueryData<Organization[]>(ORGANIZATIONS_QUERY_KEY, (old) =>
        old ? [...old, newOrg] : [newOrg],
      );
      selectOrganization(newOrg.id);
    },
  });

  // ---- Mutation: Update Organization ----
  const updateOrgMutation = useMutation({
    mutationFn: (data: { id: number; input: UpdateOrganizationInput }) =>
      organizationService.updateOrganization(data.id, data.input),
    onSuccess: (updatedOrg) => {
      queryClient.setQueryData<Organization[]>(ORGANIZATIONS_QUERY_KEY, (old) =>
        old ? old.map((o) => (o.id === updatedOrg.id ? updatedOrg : o)) : [updatedOrg],
      );
    },
  });

  return {
    organizations,
    activeOrganization,
    activeOrgId: activeOrganization?.id || null,
    selectOrganization,
    isLoadingOrganizations,
    isOrganizationsError,
    refetchOrganizations,

    // Create
    createOrganization: createOrgMutation.mutateAsync,
    isCreatingOrganization: createOrgMutation.isPending,
    createOrgError: createOrgMutation.error
      ? getApiErrorMessage(createOrgMutation.error)
      : null,

    // Update
    updateOrganization: updateOrgMutation.mutateAsync,
    isUpdatingOrganization: updateOrgMutation.isPending,
    updateOrgError: updateOrgMutation.error
      ? getApiErrorMessage(updateOrgMutation.error)
      : null,
  };
}

/**
 * Hook for managing organization team members.
 */
export function useOrganizationMembers(organizationId: number | null) {
  const queryClient = useQueryClient();
  const membersQueryKey = ["organization", organizationId, "members"];

  const {
    data: members = [],
    isLoading: isLoadingMembers,
    refetch: refetchMembers,
  } = useQuery<OrganizationMember[]>({
    queryKey: membersQueryKey,
    queryFn: () => (organizationId ? organizationService.getMembers(organizationId) : []),
    enabled: !!organizationId,
  });

  const { data: roles = [] } = useQuery<Role[]>({
    queryKey: ["roles", organizationId],
    queryFn: () => organizationService.getRoles(organizationId || undefined),
    enabled: !!organizationId,
  });

  const addMemberMutation = useMutation({
    mutationFn: (data: AddMemberInput) => {
      if (!organizationId) throw new Error("No active organization");
      return organizationService.addMember(organizationId, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: membersQueryKey });
    },
  });

  const removeMemberMutation = useMutation({
    mutationFn: (memberId: number) => {
      if (!organizationId) throw new Error("No active organization");
      return organizationService.removeMember(organizationId, memberId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: membersQueryKey });
    },
  });

  return {
    members,
    roles,
    isLoadingMembers,
    refetchMembers,

    addMember: addMemberMutation.mutateAsync,
    isAddingMember: addMemberMutation.isPending,
    addMemberError: addMemberMutation.error
      ? getApiErrorMessage(addMemberMutation.error)
      : null,

    removeMember: removeMemberMutation.mutateAsync,
    isRemovingMember: removeMemberMutation.isPending,
  };
}
