<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Cross-Origin Resource Sharing (CORS) Configuration
    |--------------------------------------------------------------------------
    |
    | Configured for Sanctum cookie-based SPA authentication with Next.js.
    | `supports_credentials: true` is mandatory for sending cookies.
    |
    */

    'paths' => ['*'],

    'allowed_methods' => ['*'],

    'allowed_origins' => [env('FRONTEND_URL', 'http://localhost:3000'), 'http://localhost', 'capacitor://localhost', 'ionic://localhost'],

    'allowed_origins_patterns' => ['#^https?://localhost:\d+$#'],

    'allowed_headers' => ['*'],

    'exposed_headers' => [],

    'max_age' => 0,

    'supports_credentials' => true,

];
