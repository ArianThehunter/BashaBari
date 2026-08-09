<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use App\Models\OrganizationMember;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AuditLogController extends Controller
{
    /**
     * Display a listing of security audit logs for active organization.
     */
    public function index(Request $request): JsonResponse
    {
        $organizationId = $request->header('X-Organization-Id') ?: $request->query('organization_id');
        $user = $request->user();

        $member = OrganizationMember::where('user_id', $user->id)
            ->where('status', 'active')
            ->when($organizationId, fn ($q) => $q->where('organization_id', $organizationId))
            ->first();

        if (! $member) {
            return response()->json(['message' => 'No active organization selected.'], 400);
        }

        $event = $request->query('event');
        $search = $request->query('search');

        $query = AuditLog::query()
            ->where('organization_id', $member->organization_id)
            ->when($event, fn ($q) => $q->where('event', $event))
            ->when($search, function ($q, $term) {
                $q->where(function ($sub) use ($term) {
                    $sub->where('event', 'like', "%{$term}%")
                        ->orWhere('ip_address', 'like', "%{$term}%")
                        ->orWhereHas('user', fn ($u) => $u->where('name', 'like', "%{$term}%"));
                });
            })
            ->with(['user'])
            ->latest();

        $logs = $query->paginate($request->query('per_page', 50));

        return response()->json($logs);
    }
}
