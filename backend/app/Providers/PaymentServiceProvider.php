<?php

namespace App\Providers;

use App\Services\Payment\Drivers\MockSSLCommerzDriver;
use App\Services\Payment\Drivers\SSLCommerzDriver;
use App\Services\Payment\PaymentGatewayInterface;
use App\Services\Sms\Drivers\MockBDSmsDriver;
use App\Services\Sms\SmsGatewayInterface;
use Illuminate\Support\ServiceProvider;

/**
 * Binds gateway implementations by configuration.
 *
 * Previously the controller did `new MockSSLCommerzDriver()` inline, so the
 * interface existed but going live meant editing controllers.
 */
class PaymentServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        $this->app->bind(PaymentGatewayInterface::class, function () {
            return match (config('services.sslcommerz.driver', 'sandbox')) {
                'live' => new SSLCommerzDriver,
                default => new MockSSLCommerzDriver,
            };
        });

        $this->app->bind(SmsGatewayInterface::class, fn () => new MockBDSmsDriver);
    }
}
