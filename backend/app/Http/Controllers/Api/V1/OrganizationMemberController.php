<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Organization;
use App\Models\OrganizationMember;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class OrganizationMemberController extends Controller
{
    /**
     * List members of a specific organization.
     */
    public function index(Request $request, string $organizationId): JsonResponse
    {
        $user = $request->user();

        // Verify requesting user is a member of the organization
        $isMember = OrganizationMember::where('organization_id', $organizationId)
            ->where('user_id', $user->id)
            ->where('status', 'active')
            ->exists();

        if (! $isMember) {
            return response()->json(['message' => 'Access denied.'], 403);
        }

        $members = OrganizationMember::where('organization_id', $organizationId)
            ->with(['user', 'role'])
            ->get();

        return response()->json([
            'data' => $members,
        ]);
    }

    /**
     * Add/invite a team member to the organization.
     */
    public function store(Request $request, string $organizationId): JsonResponse
    {
        $user = $request->user();

        // Check if user is owner of organization
        $isOwner = OrganizationMember::where('organization_id', $organizationId)
            ->where('user_id', $user->id)
            ->where('is_owner', true)
            ->exists();

        if (! $isOwner) {
            return response()->json(['message' => 'Only organization owners can manage team members.'], 403);
        }

        $request->validate([
            'email' => ['required', 'email'],
            'role_id' => ['required', 'exists:roles,id'],
            'property_access' => ['nullable', 'array'],
        ]);

        // Find or locate existing user by email
        $targetUser = User::where('email', $request->email)->first();

        if (! $targetUser) {
            return response()->json([
                'message' => 'No user account found with this email. The user must register first.',
            ], 404);
        }

        // Check if user is already a member
        $existing = OrganizationMember::where('organization_id', $organizationId)
            ->where('user_id', $targetUser->id)
            ->first();

        if ($existing) {
            return response()->json([
                'message' => 'This user is already a member of this organization.',
            ], 422);
        }

        $member = OrganizationMember::create([
            'user_id' => $targetUser->id,
            'organization_id' => $organizationId,
            'role_id' => $request->role_id,
            'is_owner' => false,
            'property_access' => $request->property_access,
            'status' => 'active',
        ]);

        return response()->json([
            'message' => 'Team member added successfully.',
            'data' => $member->load(['user', 'role']),
        ], 201);
    }

    /**
     * Remove a member from the organization.
     */
    public function destroy(Request $request, string $organizationId, string $memberId): JsonResponse
    {
        $user = $request->user();

        // Check owner rights
        $isOwner = OrganizationMember::where('organization_id', $organizationId)
            ->where('user_id', $user->id)
            ->where('is_owner', true)
            ->exists();

        if (! $isOwner) {
            return response()->json(['message' => 'Only organization owners can remove team members.'], 403);
        }

        $member = OrganizationMember::where('organization_id', $organizationId)
            ->findOrFail($memberId);

        if ($member->is_owner) {
            return response()->json(['message' => 'The primary organization owner cannot be removed.'], 422);
        }

        $member->delete();

        return response()->json([
            'message' => 'Member removed successfully.',
        ]);
    }
}
