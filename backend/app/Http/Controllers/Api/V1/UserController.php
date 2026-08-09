<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class UserController extends Controller
{
    /**
     * Get the authenticated user's profile data.
     */
    public function show(Request $request): JsonResponse
    {
        $user = $request->user();

        return response()->json([
            'data' => $user,
        ]);
    }
}
