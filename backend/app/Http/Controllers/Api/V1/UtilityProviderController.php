<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\UtilityProvider;
use Illuminate\Http\JsonResponse;

class UtilityProviderController extends Controller
{
    /**
     * Display a listing of Bangladesh utility providers (DPDC, DESCO, BREB, Titas, DWASA, etc.).
     */
    public function index(): JsonResponse
    {
        $providers = UtilityProvider::all();

        return response()->json([
            'data' => $providers,
            'meta' => [
                'total' => $providers->count(),
                'electricity_count' => $providers->where('type', 'electricity')->count(),
                'gas_count' => $providers->where('type', 'gas')->count(),
                'water_count' => $providers->where('type', 'water')->count(),
            ],
        ]);
    }
}
