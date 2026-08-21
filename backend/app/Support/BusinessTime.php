<?php

namespace App\Support;

use Carbon\CarbonImmutable;

/**
 * The current date and time in the timezone the business actually operates in.
 *
 * `config('app.timezone')` is UTC, which is correct for stored timestamps —
 * docs/timezone.md rule 1. But rule 4 says business *dates* must be compared
 * against the current date in Asia/Dhaka, and a bare `now()->toDateString()`
 * does the opposite: between 00:00 and 06:00 Dhaka it returns yesterday.
 *
 * Anything written to a DATE column, or compared against one, goes through
 * here. Timestamps (created_at, resolved_at, terminated_at) stay on `now()`
 * in UTC.
 */
final class BusinessTime
{
    public static function timezone(): string
    {
        return (string) config('app.business_timezone', 'Asia/Dhaka');
    }

    /**
     * Current instant in the business timezone.
     */
    public static function now(): CarbonImmutable
    {
        return CarbonImmutable::now(self::timezone());
    }

    /**
     * Start of the current business day.
     */
    public static function today(): CarbonImmutable
    {
        return self::now()->startOfDay();
    }

    /**
     * Today as a Y-m-d string, for writing to and comparing against DATE columns.
     */
    public static function todayString(): string
    {
        return self::today()->toDateString();
    }

    /**
     * A business day offset from today, as Y-m-d.
     *
     * Used for statutory windows such as the three-day advance notice required
     * before scheduled maintenance.
     */
    public static function daysFromTodayString(int $days): string
    {
        return self::today()->addDays($days)->toDateString();
    }

    /**
     * The business-time year and month, as used in document number prefixes.
     *
     * @return array{0: int, 1: int}
     */
    public static function yearMonth(): array
    {
        $now = self::now();

        return [(int) $now->year, (int) $now->month];
    }
}
