<?php

use App\Http\Controllers\Api\HealthCheckController;
use App\Http\Controllers\Api\V1\AuditLogController;
use App\Http\Controllers\Api\V1\BuildingStaffController;
use App\Http\Controllers\Api\V1\BuildingController;
use App\Http\Controllers\Api\V1\VendorVisitLogController;
use App\Http\Controllers\Api\V1\ExternalVendorController;
use App\Http\Controllers\Api\V1\ScheduledMaintenanceController;
use App\Http\Controllers\Api\V1\TenantMoveOutNoticeController;
use App\Http\Controllers\Api\V1\TenantWarningController;
use App\Http\Controllers\Api\V1\ExpenseController;
use App\Http\Controllers\Api\V1\FinancialReportController;
use App\Http\Controllers\Api\V1\InvoiceController;
use App\Http\Controllers\Api\V1\LeaseController;
use App\Http\Controllers\Api\V1\MaintenanceRequestController;
use App\Http\Controllers\Api\V1\MeterReadingController;
use App\Http\Controllers\Api\V1\OrganizationController;
use App\Http\Controllers\Api\V1\OrganizationMemberController;
use App\Http\Controllers\Api\V1\PaymentController;
use App\Http\Controllers\Api\V1\PropertyController;
use App\Http\Controllers\Api\V1\RoleController;
use App\Http\Controllers\Api\V1\TenantController;
use App\Http\Controllers\Api\V1\TenantPortalController;
use App\Http\Controllers\Api\V1\UnitController;
use App\Http\Controllers\Api\V1\UserController;
use App\Http\Controllers\Api\V1\UtilityProviderController;
use App\Http\Controllers\Auth\AuthenticatedSessionController;
use App\Http\Controllers\Auth\EmailVerificationNotificationController;
use App\Http\Controllers\Auth\NewPasswordController;
use App\Http\Controllers\Auth\PasswordResetLinkController;
use App\Http\Controllers\Auth\RegisteredUserController;
use App\Http\Controllers\Auth\VerifyEmailController;
use Illuminate\Session\Middleware\StartSession;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Bariwala Hub — API Routes
|--------------------------------------------------------------------------
*/

// Health check endpoint (AWS ELB & K8s Liveness & Readiness Probes)
Route::get('/health', HealthCheckController::class);

// Authentication Routes (Sanctum SPA Session-Based)
Route::middleware([StartSession::class])->group(function () {
    // Auth Routes
    Route::post('/register', [RegisteredUserController::class, 'store']);
    Route::post('/login', [AuthenticatedSessionController::class, 'store'])
        ->middleware('throttle:login');
    Route::post('/forgot-password', [PasswordResetLinkController::class, 'store'])
        ->middleware('throttle:6,1');
    Route::post('/reset-password', [NewPasswordController::class, 'store']);

    // Authenticated Auth Routes
    Route::middleware('auth:sanctum')->group(function () {
        Route::post('/logout', [AuthenticatedSessionController::class, 'destroy']);

        Route::get('/verify-email/{id}/{hash}', VerifyEmailController::class)
            ->middleware(['signed', 'throttle:6,1'])
            ->name('verification.verify');

        Route::post('/email/verification-notification', [EmailVerificationNotificationController::class, 'store'])
            ->middleware('throttle:6,1')
            ->name('verification.send');
    });
});

// Version 1 API Routes
Route::prefix('v1')->group(function () {
    Route::get('/health', HealthCheckController::class);

    // Authenticated API Endpoints
    Route::middleware(['auth:sanctum', StartSession::class])->group(function () {
        Route::get('/user', [UserController::class, 'show']);

        // Organizations
        Route::get('/organizations', [OrganizationController::class, 'index']);
        Route::post('/organizations', [OrganizationController::class, 'store']);
        Route::get('/organizations/{id}', [OrganizationController::class, 'show']);
        Route::put('/organizations/{id}', [OrganizationController::class, 'update']);

        // Organization Members
        Route::get('/organizations/{id}/members', [OrganizationMemberController::class, 'index']);
        Route::post('/organizations/{id}/members', [OrganizationMemberController::class, 'store']);
        Route::delete('/organizations/{id}/members/{memberId}', [OrganizationMemberController::class, 'destroy']);

        // Roles
        Route::get('/roles', [RoleController::class, 'index']);

        // Properties
        Route::get('/properties', [PropertyController::class, 'index']);
        Route::post('/properties', [PropertyController::class, 'store']);
        Route::get('/properties/{id}', [PropertyController::class, 'show']);
        Route::put('/properties/{id}', [PropertyController::class, 'update']);
        Route::delete('/properties/{id}', [PropertyController::class, 'destroy']);

        // Buildings
        Route::post('/buildings', [BuildingController::class, 'store']);
        Route::put('/buildings/{id}', [BuildingController::class, 'update']);
        Route::delete('/buildings/{id}', [BuildingController::class, 'destroy']);

        // Units
        Route::get('/units', [UnitController::class, 'index']);
        Route::post('/units', [UnitController::class, 'store']);
        Route::post('/units/{id}/revise-rent', [UnitController::class, 'reviseRent']);
        Route::put('/units/{id}', [UnitController::class, 'update']);
        Route::delete('/units/{id}', [UnitController::class, 'destroy']);

        // Tenants
        Route::get('/tenants', [TenantController::class, 'index']);
        Route::post('/tenants', [TenantController::class, 'store']);
        Route::get('/tenants/{id}', [TenantController::class, 'show']);
        Route::get('/tenants/{id}/dmp-form', [TenantController::class, 'dmpForm']);
        Route::put('/tenants/{id}', [TenantController::class, 'update']);
        Route::delete('/tenants/{id}', [TenantController::class, 'destroy']);

        // Leases
        Route::get('/leases', [LeaseController::class, 'index']);
        Route::post('/leases', [LeaseController::class, 'store']);
        Route::get('/leases/{id}', [LeaseController::class, 'show']);
        Route::put('/leases/{id}', [LeaseController::class, 'update']);
        Route::post('/leases/{id}/terminate', [LeaseController::class, 'terminate']);
        Route::delete('/leases/{id}', [LeaseController::class, 'destroy']);

        // Invoices
        Route::get('/invoices', [InvoiceController::class, 'index']);
        Route::post('/invoices', [InvoiceController::class, 'store']);
        Route::post('/invoices/generate', [InvoiceController::class, 'generate']);
        Route::get('/invoices/{id}', [InvoiceController::class, 'show']);
        Route::delete('/invoices/{id}', [InvoiceController::class, 'destroy']);

        // Payments & SSLCommerz Gateway
        Route::get('/payments', [PaymentController::class, 'index']);
        Route::post('/payments/initiate-sslcommerz', [PaymentController::class, 'initiateSslcommerz']);
        Route::post('/payments/sslcommerz/success', [PaymentController::class, 'sslcommerzSuccess']);
        Route::post('/payments/sslcommerz/ipn', [PaymentController::class, 'sslcommerzSuccess']);
        Route::post('/payments', [PaymentController::class, 'store']);
        Route::get('/payments/{id}', [PaymentController::class, 'show']);
        Route::post('/payments/{id}/refund', [PaymentController::class, 'refund']);

        // Maintenance Requests
        Route::get('/maintenance-requests', [MaintenanceRequestController::class, 'index']);
        Route::post('/maintenance-requests', [MaintenanceRequestController::class, 'store']);
        Route::get('/maintenance-requests/{id}', [MaintenanceRequestController::class, 'show']);
        Route::put('/maintenance-requests/{id}', [MaintenanceRequestController::class, 'update']);
        Route::delete('/maintenance-requests/{id}', [MaintenanceRequestController::class, 'destroy']);
        Route::post('/maintenance-requests/{id}/escalate', [MaintenanceRequestController::class, 'escalate']);

        // External Service Provider Directory (Future Lead Referral Expansion)
        Route::get('/external-vendors', [ExternalVendorController::class, 'index']);
        Route::post('/external-vendors', [ExternalVendorController::class, 'store']);
        Route::get('/external-vendors/{id}', [ExternalVendorController::class, 'show']);
        Route::delete('/external-vendors/{id}', [ExternalVendorController::class, 'destroy']);

        // Expenses
        Route::get('/expenses', [ExpenseController::class, 'index']);
        Route::post('/expenses', [ExpenseController::class, 'store']);
        Route::get('/expenses/{id}', [ExpenseController::class, 'show']);
        Route::delete('/expenses/{id}', [ExpenseController::class, 'destroy']);

        // Building Staff & Security Guards
        Route::get('/building-staff', [BuildingStaffController::class, 'index']);
        Route::post('/building-staff', [BuildingStaffController::class, 'store']);
        Route::get('/building-staff/{id}', [BuildingStaffController::class, 'show']);
        Route::put('/building-staff/{id}', [BuildingStaffController::class, 'update']);
        Route::delete('/building-staff/{id}', [BuildingStaffController::class, 'destroy']);
        Route::post('/building-staff/{id}/pay-salary', [BuildingStaffController::class, 'paySalary']);

        // Vendor & Technician Visit Register
        Route::get('/vendor-visit-logs', [VendorVisitLogController::class, 'index']);
        Route::post('/vendor-visit-logs', [VendorVisitLogController::class, 'store']);
        Route::get('/vendor-visit-logs/{id}', [VendorVisitLogController::class, 'show']);
        Route::put('/vendor-visit-logs/{id}', [VendorVisitLogController::class, 'update']);
        Route::delete('/vendor-visit-logs/{id}', [VendorVisitLogController::class, 'destroy']);

        // Utility Billing & Sub-Meters
        Route::get('/utility-providers', [UtilityProviderController::class, 'index']);
        Route::get('/meter-readings', [MeterReadingController::class, 'index']);
        Route::post('/meter-readings', [MeterReadingController::class, 'store']);
        Route::get('/meter-readings/{id}', [MeterReadingController::class, 'show']);
        Route::delete('/meter-readings/{id}', [MeterReadingController::class, 'destroy']);

        // Scheduled Maintenance (3-Day Advance Notice Policy)
        Route::get('/scheduled-maintenances', [ScheduledMaintenanceController::class, 'index']);
        Route::post('/scheduled-maintenances', [ScheduledMaintenanceController::class, 'store']);

        // Tenant Move-Out Notices via Portal
        Route::get('/move-out-notices', [TenantMoveOutNoticeController::class, 'index']);
        Route::post('/tenant-portal/move-out-notices', [TenantMoveOutNoticeController::class, 'store']);

        // Property Damage Warnings & Tenant Fines
        Route::get('/tenant-warnings', [TenantWarningController::class, 'index']);
        Route::post('/tenant-warnings', [TenantWarningController::class, 'store']);

        // Tenant Portal Self-Service Endpoints
        Route::get('/tenant-portal/overview', [TenantPortalController::class, 'overview']);
        Route::get('/tenant-portal/invoices', [TenantPortalController::class, 'invoices']);
        Route::get('/tenant-portal/maintenance', [TenantPortalController::class, 'maintenance']);

        // Financial Reports
        Route::get('/reports/cash-flow', [FinancialReportController::class, 'cashFlow']);

        // Security Audit Logs
        Route::get('/audit-logs', [AuditLogController::class, 'index']);
    });
});
