<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Throwable;

class HealthCheckController extends Controller
{
    /**
     * Deep Health Check probe for AWS ELB / Kubernetes Liveness & Readiness.
     */
    public function __invoke(): JsonResponse
    {
        $dbStatus = 'healthy';
        $cacheStatus = 'healthy';
        $overallStatus = 'healthy';
        $httpCode = 200;

        // DB Ping Check
        try {
            DB::connection()->getPdo();
        } catch (Throwable $e) {
            $dbStatus = 'unhealthy: '.$e->getMessage();
            $overallStatus = 'unhealthy';
            $httpCode = 503;
        }

        // Cache Ping Check
        try {
            Cache::store()->put('sre_health_check_ping', true, 10);
            $cacheStatus = Cache::store()->get('sre_health_check_ping') ? 'healthy' : 'unhealthy';
        } catch (Throwable $e) {
            $cacheStatus = 'unhealthy: '.$e->getMessage();
            $overallStatus = 'unhealthy';
            $httpCode = 503;
        }

        return response()->json([
            'status' => $overallStatus,
            'checks' => [
                'database' => $dbStatus,
                'cache' => $cacheStatus,
            ],
            'service' => config('app.name'),
            'environment' => config('app.env'),
            'timezone' => config('app.timezone'),
            'timestamp' => now()->toIso8601String(),
        ], $httpCode);
    }
}
