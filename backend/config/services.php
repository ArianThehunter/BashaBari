<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Third Party Services
    |--------------------------------------------------------------------------
    |
    | This file is for storing the credentials for third party services such
    | as Mailgun, Postmark, AWS and more. This file provides the de facto
    | location for this type of information, allowing packages to have
    | a conventional file to locate the various service credentials.
    |
    */

    'postmark' => [
        'key' => env('POSTMARK_API_KEY'),
    ],

    'resend' => [
        'key' => env('RESEND_API_KEY'),
    ],

    'ses' => [
        'key' => env('AWS_ACCESS_KEY_ID'),
        'secret' => env('AWS_SECRET_ACCESS_KEY'),
        'region' => env('AWS_DEFAULT_REGION', 'us-east-1'),
    ],

    'slack' => [
        'notifications' => [
            'bot_user_oauth_token' => env('SLACK_BOT_USER_OAUTH_TOKEN'),
            'channel' => env('SLACK_BOT_USER_DEFAULT_CHANNEL'),
        ],
    ],

    /*
    |--------------------------------------------------------------------------
    | SSLCommerz Payment Gateway
    |--------------------------------------------------------------------------
    |
    | `driver` selects the implementation bound to PaymentGatewayInterface:
    |   sandbox — locally-signed, no network calls (local + test)
    |   live    — real server-to-server validation against SSLCommerz
    |
    */

    'sslcommerz' => [
        'driver' => env('SSLCOMMERZ_DRIVER', 'sandbox'),
        'store_id' => env('SSLCOMMERZ_STORE_ID'),
        'store_passwd' => env('SSLCOMMERZ_STORE_PASSWORD'),
        'base_url' => env('SSLCOMMERZ_BASE_URL', 'https://sandbox.sslcommerz.com'),
    ],

    /*
    |--------------------------------------------------------------------------
    | SMS Gateway (Bangladesh)
    |--------------------------------------------------------------------------
    */

    'sms' => [
        'driver' => env('SMS_DRIVER', 'log'),
        'api_key' => env('SMS_API_KEY'),
        'sender_id' => env('SMS_SENDER_ID', 'BashaBari'),
        'base_url' => env('SMS_BASE_URL'),
    ],

];
