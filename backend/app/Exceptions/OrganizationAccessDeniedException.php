<?php

namespace App\Exceptions;

use Illuminate\Http\JsonResponse;
use RuntimeException;

/**
 * Thrown when a user requests an organization they are not an active member of.
 */
class OrganizationAccessDeniedException extends RuntimeException
{
    public function render(): JsonResponse
    {
        return response()->json([
            'message' => $this->getMessage() ?: 'You do not have access to this organization.',
        ], 403);
    }
}
