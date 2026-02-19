<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Auth\AuthController;
use App\Http\Controllers\Auth\ClientAuthController;
use App\Http\Controllers\Admin\UserController;
use App\Http\Controllers\Admin\ClientController;
use App\Http\Controllers\Finance\InvoiceController;
use App\Http\Controllers\Finance\JobCostController;
use App\Http\Controllers\Finance\ExpenseController;
use App\Http\Controllers\Banking\BankConnectionController;
use App\Http\Controllers\Banking\BankTransactionController;
use App\Http\Controllers\Banking\BankReconciliationController;
use App\Http\Controllers\Banking\BankAlertController;
use App\Http\Controllers\Client\ClientShipmentController;
use App\Http\Controllers\Client\ClientInvoiceController;
use App\Http\Controllers\Client\ClientDocumentController;
use App\Http\Controllers\Client\ClientMessageController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\AI\AIChatController;
use App\Http\Controllers\ReportController;
use App\Http\Controllers\ChatController;

/*
|--------------------------------------------------------------------------
| API Routes — SLAC FreightLink 360
|--------------------------------------------------------------------------
|
| All routes are prefixed with /api/v1 (set in bootstrap/app.php or
| RouteServiceProvider). Sanctum token auth is used throughout.
|
| Middleware aliases (register in bootstrap/app.php):
|   'auth.sanctum'   => \Laravel\Sanctum\Http\Middleware\EnsureApiTokenIsValid::class
|   'inactivity'     => \App\Http\Middleware\InactivityTimeout::class
|   'not_locked'     => \App\Http\Middleware\EnsureAccountNotLocked::class
|   'pwd_changed'    => \App\Http\Middleware\EnsurePasswordChanged::class
|   'admin'          => \App\Http\Middleware\EnsureIsAdmin::class
|   'client_active'  => \App\Http\Middleware\EnsureClientIsActive::class
|   'department'     => \App\Http\Middleware\CheckDepartmentAccess::class
|   'role'           => \App\Http\Middleware\CheckRole::class
|
*/

// ══════════════════════════════════════════════════════════════
// PUBLIC — no authentication
// ══════════════════════════════════════════════════════════════

// Staff auth
Route::prefix('auth')->group(function () {
    Route::post('login', [AuthController::class, 'login'])
        ->middleware('throttle:10,1');   // 10 attempts per minute
});

// Client auth
Route::prefix('client/auth')->group(function () {
    Route::post('login', [ClientAuthController::class, 'login'])
        ->middleware('throttle:10,1');
});

// Bank webhook (secret verified inside the controller)
Route::post('banking/webhook', [\App\Http\Controllers\Banking\BankWebhookController::class, 'handle'])
    ->middleware('throttle:100,1');

// ══════════════════════════════════════════════════════════════
// STAFF — authenticated routes
// ══════════════════════════════════════════════════════════════
Route::middleware([
    'auth:sanctum',
    'inactivity',
    'not_locked',
    'pwd_changed',
])->group(function () {

    // ── Auth (own account) ─────────────────────────────────────
    Route::prefix('auth')->group(function () {
        Route::post('logout',          [AuthController::class, 'logout']);
        Route::post('change-password', [AuthController::class, 'changePassword']);
        Route::get('me',               [AuthController::class, 'me']);
    });

    // ── Admin — user & client management ──────────────────────
    Route::prefix('admin')->middleware('admin')->group(function () {
        // Staff users
        Route::apiResource('users', UserController::class);
        Route::post('users/{id}/lock',   [UserController::class, 'lock']);
        Route::post('users/{id}/unlock', [UserController::class, 'unlock']);

        // Client accounts
        Route::apiResource('clients', ClientController::class);
        Route::post('clients/{id}/activate',   [ClientController::class, 'activate']);
        Route::post('clients/{id}/deactivate', [ClientController::class, 'deactivate']);
    });

    // ── Finance ────────────────────────────────────────────────
    Route::prefix('finance')
        ->middleware('department:accounts,management,super_admin,admin')
        ->group(function () {

        // Invoices
        Route::apiResource('invoices', InvoiceController::class);
        Route::post('invoices/{id}/pay',    [InvoiceController::class, 'recordPayment']);
        Route::post('invoices/{id}/cancel', [InvoiceController::class, 'cancel']);

        // Job costs
        Route::apiResource('job-costs', JobCostController::class);
        Route::post('job-costs/{id}/approve', [JobCostController::class, 'approve'])
            ->middleware('role:super_admin,admin,manager');
        Route::post('job-costs/{id}/reject',  [JobCostController::class, 'reject'])
            ->middleware('role:super_admin,admin,manager');
        Route::post('job-costs/{id}/pay',     [JobCostController::class, 'markPaid']);

        // Expenses
        Route::apiResource('expenses', ExpenseController::class)->except(['update', 'destroy']);
        Route::post('expenses/{id}/approve', [ExpenseController::class, 'approve'])
            ->middleware('role:super_admin,admin,manager');
        Route::post('expenses/{id}/reject',  [ExpenseController::class, 'reject'])
            ->middleware('role:super_admin,admin,manager');
        Route::post('expenses/{id}/pay',     [ExpenseController::class, 'markPaid']);
    });

    // ── Banking ────────────────────────────────────────────────
    Route::prefix('banking')
        ->middleware('department:accounts,management,super_admin,admin')
        ->group(function () {

        // Connections
        Route::apiResource('connections', BankConnectionController::class)->except(['destroy']);
        Route::post('connections/{id}/deactivate', [BankConnectionController::class, 'deactivate']);
        Route::post('connections/{id}/sync',       [BankConnectionController::class, 'sync']);

        // Transactions
        Route::get('transactions',              [BankTransactionController::class, 'index']);
        Route::get('transactions/{id}',         [BankTransactionController::class, 'show']);
        Route::post('transactions/{id}/match',  [BankTransactionController::class, 'match']);
        Route::post('transactions/{id}/reconcile', [BankTransactionController::class, 'reconcile']);

        // Reconciliations
        Route::apiResource('reconciliations', BankReconciliationController::class)->except(['update', 'destroy']);
        Route::post('reconciliations/{id}/complete', [BankReconciliationController::class, 'complete']);
        Route::post('reconciliations/{id}/approve',  [BankReconciliationController::class, 'approve'])
            ->middleware('role:super_admin,admin');

        // Alerts
        Route::get('alerts',                [BankAlertController::class, 'index']);
        Route::post('alerts/{id}/read',     [BankAlertController::class, 'markRead']);
        Route::post('alerts/{id}/dismiss',  [BankAlertController::class, 'dismiss']);
    });

    // ── Notifications ──────────────────────────────────────────
    Route::prefix('notifications')->group(function () {
        Route::get('/',                   [NotificationController::class, 'index']);
        Route::post('mark-all-read',      [NotificationController::class, 'markAllRead']);
        Route::post('{id}/read',          [NotificationController::class, 'markRead']);
        Route::post('{id}/resolve',       [NotificationController::class, 'resolve']);
    });

    // ── AI Assistant ───────────────────────────────────────────
    Route::prefix('ai')
        ->middleware('throttle:10,1')   // 10 requests/minute per user
        ->group(function () {
        Route::post('chat', [AIChatController::class, 'chat']);
    });

    // ── Reports ────────────────────────────────────────────────
    Route::prefix('reports')
        ->middleware('department:accounts,management,super_admin,admin')
        ->group(function () {
        Route::get('finance-summary', [ReportController::class, 'financeSummary']);
        Route::get('audit-logs',      [ReportController::class, 'auditLogs'])
            ->middleware('role:super_admin,admin');
    });
});

// ══════════════════════════════════════════════════════════════
// CLIENT PORTAL — separate guard
// ══════════════════════════════════════════════════════════════
Route::middleware([
    'auth:sanctum',
    'client_active',
    'inactivity',
])->prefix('client')->group(function () {

    // Auth (own session)
    Route::prefix('auth')->group(function () {
        Route::post('logout', [ClientAuthController::class, 'logout']);
        Route::get('me',      [ClientAuthController::class, 'me']);
    });

    // Shipments (read-only)
    Route::get('shipments',      [ClientShipmentController::class, 'index']);
    Route::get('shipments/{id}', [ClientShipmentController::class, 'show']);

    // Invoices (read-only)
    Route::get('invoices',       [ClientInvoiceController::class, 'index']);
    Route::get('invoices/{id}',  [ClientInvoiceController::class, 'show']);

    // Documents
    Route::get('documents',              [ClientDocumentController::class, 'index']);
    Route::get('documents/{id}/download',[ClientDocumentController::class, 'download']);

    // Messages
    Route::get('messages',  [ClientMessageController::class, 'index']);
    Route::post('messages', [ClientMessageController::class, 'store'])
        ->middleware('throttle:30,1');  // 30 messages/minute
});
