<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Role;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class RoleController extends Controller
{
    /**
     * Display a listing of system & organization roles.
     */
    public function index(Request $request): JsonResponse
    {
        $organizationId = $request->query('organization_id');

        $roles = Role::query()
            ->where(function ($query) use ($organizationId) {
                $query->whereNull('organization_id'); // System roles
                if ($organizationId) {
                    $query->orWhere('organization_id', $organizationId); // Org custom roles
                }
            })
            ->with('permissions')
            ->get();

        return response()->json([
            'data' => $roles,
        ]);
    }
}
