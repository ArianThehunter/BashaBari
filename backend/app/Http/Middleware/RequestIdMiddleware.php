<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Symfony\Component\HttpFoundation\Response;

class RequestIdMiddleware
{
    /**
     * Handle incoming request by injecting a unique correlation Request ID.
     */
    public function handle(Request $request, Closure $next): Response
    {
        $requestId = $request->header('X-Request-Id') ?: (string) Str::uuid();

        // Pass Request ID to request attributes & log context
        $request->headers->set('X-Request-Id', $requestId);
        Log::shareContext(['request_id' => $requestId]);

        $response = $next($request);

        // Attach Request ID to response headers
        $response->headers->set('X-Request-Id', $requestId);

        return $response;
    }
}
