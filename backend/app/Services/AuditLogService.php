<?php

namespace App\Services;

use App\Models\AuditLog;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Request;

class AuditLogService
{
    /**
     * Record a security audit event log entry.
     */
    public static function log(string $event, Model $model, array $oldValues = [], array $newValues = []): ?AuditLog
    {
        $user = Auth::user();
        $organizationId = Request::header('X-Organization-Id')
            ?: ($model->organization_id ?? null);

        return AuditLog::create([
            'organization_id' => $organizationId,
            'user_id' => $user?->id,
            'event' => $event,
            'auditable_type' => get_class($model),
            'auditable_id' => $model->getKey(),
            'old_values' => ! empty($oldValues) ? $oldValues : null,
            'new_values' => ! empty($newValues) ? $newValues : null,
            'ip_address' => Request::ip(),
            'user_agent' => Request::userAgent(),
        ]);
    }
}
