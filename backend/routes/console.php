<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

// Run automated invoice generation on 1st of every month at 00:05 AM Asia/Dhaka
Schedule::command('invoices:generate-monthly')
    ->monthlyOn(1, '00:05')
    ->timezone('Asia/Dhaka')
    ->withoutOverlapping()
    ->runInBackground();
