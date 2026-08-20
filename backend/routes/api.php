<?php

use App\Http\Controllers\Api\HealthCheckController;
use App\Http\Controllers\Api\V1\AuditLogController;
use App\Http\Controllers\Api\V1\BuildingController;
use App\Http\Controllers\Api\V1\BuildingStaffController;
use App\Http\Controllers\Api\V1\ExpenseController;
use App\Http\Controllers\Api\V1\ExternalVendorController;
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
use App\Http\Controllers\Api\V1\ScheduledMaintenanceController;
use App\Http\Controllers\Api\V1\TenantController;
use App\Http\Controllers\Api\V1\TenantMoveOutNoticeController;
use App\Http\Controllers\Api\V1\TenantPortalController;
use App\Http\Controllers\Api\V1\TenantWarningController;
use App\Http\Controllers\Api\V1\UnitController;
use App\Http\Controllers\Api\V1\UserController;
use App\Http\Controllers\Api\V1\UtilityProviderController;
use App\Http\Controllers\Api\V1\VendorVisitLogController;
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
| BashaBari — API Routes
|--------------------------------------------------------------------------
|
| Four access tiers:
|
|  1. Public / auth      — no organization context.
|  2. Account scope      — authenticated but pre-organization (onboarding,
|                          listing your own memberships).
|  3. Organization scope — the `organization` middleware resolves and enforces
|                          the active tenant; `org.permission` enforces RBAC.
|  4. Tenant portal      — `tenant.portal` derives context from the tenant
|                          record linked to the user account.
|
| Every route in tier 3 runs with a mandatory organization context. Org-scoped
| models refuse to execute a query without one, so a routing mistake fails
| closed rather than leaking across tenants.
|
*/

Route::get('/health', HealthCheckController::class);

// ---- Authentication (Sanctum SPA, cookie session) ----
Route::middleware([StartSession::class])->group(function () {
    Route::post('/register', [RegisteredUserController::class, 'store'])
        ->middleware('throttle:6,1');
    Route::post('/login', [AuthenticatedSessionController::class, 'store'])
        ->middleware('throttle:login');
    Route::post('/forgot-password', [PasswordResetLinkController::class, 'store'])
        ->middleware('throttle:6,1');
    Route::post('/reset-password', [NewPasswordController::class, 'store'])
        ->middleware('throttle:6,1');

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

Route::prefix('v1')->group(function () {
    Route::get('/health', HealthCheckController::class);

    Route::middleware(['auth:sanctum', StartSession::class])->group(function () {

        /* ---- Tier 2: account scope (no organization required) ---- */

        Route::get('/user', [UserController::class, 'show']);
        Route::get('/roles', [RoleController::class, 'index']);

        // Listing and creating organizations necessarily precedes membership.
        Route::get('/organizations', [OrganizationController::class, 'index']);
        Route::post('/organizations', [OrganizationController::class, 'store']);
        Route::get('/organizations/{id}', [OrganizationController::class, 'show']);

        /* ---- Tier 4: tenant portal ---- */

        Route::middleware('tenant.portal')->prefix('tenant-portal')->group(function () {
            Route::get('/overview', [TenantPortalController::class, 'overview']);
            Route::get('/invoices', [TenantPortalController::class, 'invoices']);
            Route::get('/maintenance', [TenantPortalController::class, 'maintenance']);
            Route::post('/move-out-notices', [TenantMoveOutNoticeController::class, 'store']);
        });

        /* ---- Tier 3: organization scope ---- */

        Route::middleware('organization')->group(function () {

            // Organization settings & team
            Route::put('/organizations/{id}', [OrganizationController::class, 'update'])
                ->middleware('org.permission:organization.settings');

            Route::get('/organizations/{id}/members', [OrganizationMemberController::class, 'index'])
                ->middleware('org.permission:organization.members.manage');
            Route::post('/organizations/{id}/members', [OrganizationMemberController::class, 'store'])
                ->middleware('org.permission:organization.members.manage');
            Route::delete('/organizations/{id}/members/{memberId}', [OrganizationMemberController::class, 'destroy'])
                ->middleware('org.permission:organization.members.manage');

            // Properties
            Route::get('/properties', [PropertyController::class, 'index'])
                ->middleware('org.permission:properties.view');
            Route::post('/properties', [PropertyController::class, 'store'])
                ->middleware('org.permission:properties.create');
            Route::get('/properties/{id}', [PropertyController::class, 'show'])
                ->middleware('org.permission:properties.view');
            Route::put('/properties/{id}', [PropertyController::class, 'update'])
                ->middleware('org.permission:properties.update');
            Route::delete('/properties/{id}', [PropertyController::class, 'destroy'])
                ->middleware('org.permission:properties.delete');

            // Buildings
            Route::post('/buildings', [BuildingController::class, 'store'])
                ->middleware('org.permission:properties.create');
            Route::put('/buildings/{id}', [BuildingController::class, 'update'])
                ->middleware('org.permission:properties.update');
            Route::delete('/buildings/{id}', [BuildingController::class, 'destroy'])
                ->middleware('org.permission:properties.delete');

            // Units
            Route::get('/units', [UnitController::class, 'index'])
                ->middleware('org.permission:properties.view');
            Route::post('/units', [UnitController::class, 'store'])
                ->middleware('org.permission:properties.create');
            Route::post('/units/{id}/revise-rent', [UnitController::class, 'reviseRent'])
                ->middleware(['org.permission:properties.update', 'throttle:sensitive']);
            Route::put('/units/{id}', [UnitController::class, 'update'])
                ->middleware('org.permission:properties.update');
            Route::delete('/units/{id}', [UnitController::class, 'destroy'])
                ->middleware('org.permission:properties.delete');

            // Tenants
            Route::get('/tenants', [TenantController::class, 'index'])
                ->middleware('org.permission:tenants.view');
            Route::post('/tenants', [TenantController::class, 'store'])
                ->middleware('org.permission:tenants.create');
            Route::get('/tenants/{id}', [TenantController::class, 'show'])
                ->middleware('org.permission:tenants.view');
            Route::get('/tenants/{id}/dmp-form', [TenantController::class, 'dmpForm'])
                ->middleware('org.permission:tenants.view');
            Route::put('/tenants/{id}', [TenantController::class, 'update'])
                ->middleware('org.permission:tenants.update');
            Route::delete('/tenants/{id}', [TenantController::class, 'destroy'])
                ->middleware('org.permission:tenants.delete');

            // Leases
            Route::get('/leases', [LeaseController::class, 'index'])
                ->middleware('org.permission:tenants.view');
            Route::post('/leases', [LeaseController::class, 'store'])
                ->middleware('org.permission:tenants.create');
            Route::get('/leases/{id}', [LeaseController::class, 'show'])
                ->middleware('org.permission:tenants.view');
            Route::put('/leases/{id}', [LeaseController::class, 'update'])
                ->middleware('org.permission:tenants.update');
            Route::post('/leases/{id}/terminate', [LeaseController::class, 'terminate'])
                ->middleware('org.permission:tenants.update');
            Route::delete('/leases/{id}', [LeaseController::class, 'destroy'])
                ->middleware('org.permission:tenants.delete');

            // Invoices
            Route::get('/invoices', [InvoiceController::class, 'index'])
                ->middleware('org.permission:finances.view');
            Route::post('/invoices', [InvoiceController::class, 'store'])
                ->middleware('org.permission:finances.invoices.generate');
            Route::post('/invoices/generate', [InvoiceController::class, 'generate'])
                ->middleware(['org.permission:finances.invoices.generate', 'throttle:sensitive']);
            Route::get('/invoices/{id}', [InvoiceController::class, 'show'])
                ->middleware('org.permission:finances.view');
            Route::delete('/invoices/{id}', [InvoiceController::class, 'destroy'])
                ->middleware('org.permission:finances.invoices.generate');

            // Payments
            Route::get('/payments', [PaymentController::class, 'index'])
                ->middleware('org.permission:finances.view');
            Route::post('/payments', [PaymentController::class, 'store'])
                ->middleware(['org.permission:finances.payments.record', 'throttle:sensitive']);
            Route::post('/payments/initiate-sslcommerz', [PaymentController::class, 'initiateSslcommerz'])
                ->middleware(['org.permission:finances.payments.record', 'throttle:sensitive']);
            Route::get('/payments/{id}', [PaymentController::class, 'show'])
                ->middleware('org.permission:finances.view');
            Route::post('/payments/{id}/refund', [PaymentController::class, 'refund'])
                ->middleware(['org.permission:finances.payments.record', 'throttle:sensitive']);

            // Maintenance
            Route::get('/maintenance-requests', [MaintenanceRequestController::class, 'index'])
                ->middleware('org.permission:maintenance.view');
            Route::post('/maintenance-requests', [MaintenanceRequestController::class, 'store'])
                ->middleware('org.permission:maintenance.manage');
            Route::get('/maintenance-requests/{id}', [MaintenanceRequestController::class, 'show'])
                ->middleware('org.permission:maintenance.view');
            Route::put('/maintenance-requests/{id}', [MaintenanceRequestController::class, 'update'])
                ->middleware('org.permission:maintenance.manage');
            Route::delete('/maintenance-requests/{id}', [MaintenanceRequestController::class, 'destroy'])
                ->middleware('org.permission:maintenance.manage');
            Route::post('/maintenance-requests/{id}/escalate', [MaintenanceRequestController::class, 'escalate'])
                ->middleware('org.permission:maintenance.manage');

            // External vendor directory
            Route::get('/external-vendors', [ExternalVendorController::class, 'index'])
                ->middleware('org.permission:maintenance.view');
            Route::post('/external-vendors', [ExternalVendorController::class, 'store'])
                ->middleware('org.permission:maintenance.manage');
            Route::get('/external-vendors/{id}', [ExternalVendorController::class, 'show'])
                ->middleware('org.permission:maintenance.view');
            Route::delete('/external-vendors/{id}', [ExternalVendorController::class, 'destroy'])
                ->middleware('org.permission:maintenance.manage');

            // Expenses
            Route::get('/expenses', [ExpenseController::class, 'index'])
                ->middleware('org.permission:expenses.view');
            Route::post('/expenses', [ExpenseController::class, 'store'])
                ->middleware('org.permission:expenses.create');
            Route::get('/expenses/{id}', [ExpenseController::class, 'show'])
                ->middleware('org.permission:expenses.view');
            Route::delete('/expenses/{id}', [ExpenseController::class, 'destroy'])
                ->middleware('org.permission:expenses.approve');

            // Building staff
            Route::get('/building-staff', [BuildingStaffController::class, 'index'])
                ->middleware('org.permission:properties.view');
            Route::post('/building-staff', [BuildingStaffController::class, 'store'])
                ->middleware('org.permission:properties.update');
            Route::get('/building-staff/{id}', [BuildingStaffController::class, 'show'])
                ->middleware('org.permission:properties.view');
            Route::put('/building-staff/{id}', [BuildingStaffController::class, 'update'])
                ->middleware('org.permission:properties.update');
            Route::delete('/building-staff/{id}', [BuildingStaffController::class, 'destroy'])
                ->middleware('org.permission:properties.delete');
            Route::post('/building-staff/{id}/pay-salary', [BuildingStaffController::class, 'paySalary'])
                ->middleware(['org.permission:expenses.create', 'throttle:sensitive']);

            // Vendor & technician visit register
            Route::get('/vendor-visit-logs', [VendorVisitLogController::class, 'index'])
                ->middleware('org.permission:maintenance.view');
            Route::post('/vendor-visit-logs', [VendorVisitLogController::class, 'store'])
                ->middleware('org.permission:maintenance.manage');
            Route::get('/vendor-visit-logs/{id}', [VendorVisitLogController::class, 'show'])
                ->middleware('org.permission:maintenance.view');
            Route::put('/vendor-visit-logs/{id}', [VendorVisitLogController::class, 'update'])
                ->middleware('org.permission:maintenance.manage');
            Route::delete('/vendor-visit-logs/{id}', [VendorVisitLogController::class, 'destroy'])
                ->middleware('org.permission:maintenance.manage');

            // Utility billing & sub-meters
            Route::get('/utility-providers', [UtilityProviderController::class, 'index'])
                ->middleware('org.permission:properties.view');
            Route::get('/meter-readings', [MeterReadingController::class, 'index'])
                ->middleware('org.permission:properties.view');
            Route::post('/meter-readings', [MeterReadingController::class, 'store'])
                ->middleware('org.permission:properties.update');
            Route::get('/meter-readings/{id}', [MeterReadingController::class, 'show'])
                ->middleware('org.permission:properties.view');
            Route::delete('/meter-readings/{id}', [MeterReadingController::class, 'destroy'])
                ->middleware('org.permission:properties.delete');

            // Scheduled maintenance (3-day advance notice policy)
            Route::get('/scheduled-maintenances', [ScheduledMaintenanceController::class, 'index'])
                ->middleware('org.permission:maintenance.view');
            Route::post('/scheduled-maintenances', [ScheduledMaintenanceController::class, 'store'])
                ->middleware('org.permission:maintenance.manage');

            // Move-out notices (landlord-side view)
            Route::get('/move-out-notices', [TenantMoveOutNoticeController::class, 'index'])
                ->middleware('org.permission:tenants.view');

            // Property damage warnings & tenant fines
            Route::get('/tenant-warnings', [TenantWarningController::class, 'index'])
                ->middleware('org.permission:tenants.view');
            Route::post('/tenant-warnings', [TenantWarningController::class, 'store'])
                ->middleware('org.permission:tenants.update');

            // Financial reports
            Route::get('/reports/cash-flow', [FinancialReportController::class, 'cashFlow'])
                ->middleware('org.permission:finances.reports.view');

            // Security audit logs
            Route::get('/audit-logs', [AuditLogController::class, 'index'])
                ->middleware('org.permission:organization.settings');
        });
    });
});

/*
|--------------------------------------------------------------------------
| Payment gateway callbacks
|--------------------------------------------------------------------------
|
| SSLCommerz posts server-to-server and cannot present a session cookie, so
| this route sits outside auth. It is protected by gateway-side validation in
| the controller — never by trusting the posted body.
|
*/
Route::prefix('v1/gateway/sslcommerz')->middleware('throttle:60,1')->group(function () {
    Route::post('/ipn', [PaymentController::class, 'sslcommerzIpn'])->name('sslcommerz.ipn');
});
