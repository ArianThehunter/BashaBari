<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Organization;
use App\Models\OrganizationMember;
use App\Models\Role;
use App\Support\BusinessTime;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class OrganizationController extends Controller
{
    /**
     * Display a listing of organizations for the authenticated user.
     */
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();

        $organizations = Organization::query()
            ->whereHas('members', function ($query) use ($user) {
                $query->where('user_id', $user->id)
                    ->where('status', 'active');
            })
            ->with(['members' => function ($query) use ($user) {
                $query->where('user_id', $user->id)->with('role');
            }])
            ->get();

        return response()->json([
            'data' => $organizations,
        ]);
    }

    /**
     * Store a newly created organization (Onboarding).
     */
    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'phone' => ['nullable', 'string', 'max:20'],
            'email' => ['nullable', 'email', 'max:255'],
            'address' => ['nullable', 'string'],
        ]);

        $baseSlug = Str::slug($request->name);
        $slug = $baseSlug;
        $count = 1;
        while (Organization::where('slug', $slug)->exists()) {
            $slug = $baseSlug.'-'.$count;
            $count++;
        }

        // BD-001: 5-day trial period from creation date
        $trialEndsAt = BusinessTime::today()->addDays(5);

        $organization = Organization::create([
            'name' => $request->name,
            'slug' => $slug,
            'address' => $request->address,
            'phone' => $request->phone,
            'email' => $request->email,
            'status' => 'trial',
            'settings' => [],
            'trial_ends_at' => $trialEndsAt,
        ]);

        // Find system 'owner' role
        $ownerRole = Role::where('slug', 'owner')->whereNull('organization_id')->first();

        // Create OrganizationMember record for creator as owner
        OrganizationMember::create([
            'user_id' => $request->user()->id,
            'organization_id' => $organization->id,
            'role_id' => $ownerRole?->id,
            'is_owner' => true,
            'status' => 'active',
        ]);

        return response()->json([
            'message' => 'Organization created successfully.',
            'data' => $organization->load('members.role'),
        ], 201);
    }

    /**
     * Display the specified organization.
     */
    public function show(Request $request, string $id): JsonResponse
    {
        $user = $request->user();

        $organization = Organization::query()
            ->whereHas('members', function ($query) use ($user) {
                $query->where('user_id', $user->id)
                    ->where('status', 'active');
            })
            ->with(['members.user', 'members.role'])
            ->findOrFail($id);

        return response()->json([
            'data' => $organization,
        ]);
    }

    /**
     * Update the specified organization settings.
     */
    public function update(Request $request, string $id): JsonResponse
    {
        $user = $request->user();

        $organization = Organization::query()
            ->whereHas('members', function ($query) use ($user) {
                $query->where('user_id', $user->id)
                    ->where('is_owner', true);
            })
            ->findOrFail($id);

        $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'phone' => ['nullable', 'string', 'max:20'],
            'email' => ['nullable', 'email', 'max:255'],
            'address' => ['nullable', 'string'],
        ]);

        $organization->update($request->only('name', 'phone', 'email', 'address'));

        return response()->json([
            'message' => 'Organization updated successfully.',
            'data' => $organization,
        ]);
    }
}
