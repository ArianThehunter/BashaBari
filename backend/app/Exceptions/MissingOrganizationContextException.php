<?php

namespace App\Exceptions;

use Illuminate\Http\JsonResponse;
use RuntimeException;
use Throwable;

/**
 * Thrown when an organization-scoped query is executed inside a tenant-scoped
 * request that has no active organization.
 *
 * This is a fail-closed guard: without it the global scope would be skipped and
 * the query would return every organization's rows.
 */
class MissingOrganizationContextException extends RuntimeException
{
    public function __construct(?string $model = null, ?Throwable $previous = null)
    {
        $subject = $model ? "[{$model}]" : 'An organization-scoped model';

        parent::__construct(
            "{$subject} was queried without an active organization context. "
            .'Refusing to run an unscoped tenant query.',
            0,
            $previous
        );
    }

    /**
     * Never leak the internal reason to the client.
     */
    public function render(): JsonResponse
    {
        return response()->json([
            'message' => 'No active organization context for this request.',
        ], 403);
    }
}
