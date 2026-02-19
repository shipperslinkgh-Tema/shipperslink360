<?php

use App\Http\Controllers\Auth\LoginController;
use App\Http\Controllers\Auth\ChangePasswordController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\ShipmentController;
use App\Http\Controllers\IcumsController;
use App\Http\Controllers\GphaController;
use App\Http\Controllers\ShippingLineController;
use App\Http\Controllers\TruckingController;
use App\Http\Controllers\ConsolidationController;
use App\Http\Controllers\CustomerController;
use App\Http\Controllers\FinanceController;
use App\Http\Controllers\InvoicingController;
use App\Http\Controllers\ExpenseController;
use App\Http\Controllers\AdminUserController;
use Illuminate\Support\Facades\Route;

// ── Auth ──────────────────────────────────────────────────────
Route::get('/login', [LoginController::class, 'showLoginForm'])->name('login')->middleware('guest');
Route::post('/login', [LoginController::class, 'login'])->middleware('guest');
Route::post('/logout', [LoginController::class, 'logout'])->name('logout');

// ── Change Password ───────────────────────────────────────────
Route::middleware('auth')->group(function () {
    Route::get('/change-password', [ChangePasswordController::class, 'show'])->name('password.change');
    Route::post('/change-password', [ChangePasswordController::class, 'update'])->name('password.update');
});

// ── Authenticated & Active Routes ────────────────────────────
Route::middleware(['auth', 'must_change_password', 'not_locked'])->group(function () {

    // Dashboard
    Route::get('/', [DashboardController::class, 'index'])->name('dashboard');

    // Shipments
    Route::resource('shipments', ShipmentController::class);
    Route::patch('/shipments/{shipment}/status', [ShipmentController::class, 'updateStatus'])->name('shipments.update-status');
    Route::get('/shipments/sea', fn() => redirect()->route('shipments.index', ['type' => 'sea']))->name('shipments.sea');
    Route::get('/shipments/air', fn() => redirect()->route('shipments.index', ['type' => 'air']))->name('shipments.air');

    // Customers
    Route::resource('customers', CustomerController::class);

    // Customs
    Route::prefix('customs')->name('customs.')->group(function () {
        Route::resource('icums', IcumsController::class)->parameter('icums', 'icum');
        Route::patch('/icums/{icum}/status', [IcumsController::class, 'updateStatus'])->name('icums.update-status');
        Route::get('/gpha', [GphaController::class, 'index'])->name('gpha.index');
    });

    // Shipping Lines & DOs
    Route::get('/shipping-lines', [ShippingLineController::class, 'index'])->name('shipping-lines.index');

    // Trucking
    Route::get('/trucking', [TruckingController::class, 'index'])->name('trucking.index');
    Route::patch('/trucking/jobs/{job}/status', [TruckingController::class, 'updateJobStatus'])->name('trucking.jobs.status');

    // Consolidation
    Route::get('/consolidation', [ConsolidationController::class, 'index'])->name('consolidation.index');
    Route::post('/consolidation', [ConsolidationController::class, 'store'])->name('consolidation.store');

    // Finance
    Route::prefix('finance')->name('finance.')->group(function () {
        Route::get('/', [FinanceController::class, 'index'])->name('index');
        Route::post('/expenses', [FinanceController::class, 'storeExpense'])->name('expenses.store');
        Route::post('/expenses/{expense}/approve', [FinanceController::class, 'approveExpense'])->name('expenses.approve');
        Route::post('/payments', [FinanceController::class, 'storePayment'])->name('payments.store');
    });

    // Invoicing
    Route::resource('invoicing', InvoicingController::class)->except(['destroy']);
    Route::post('/invoicing/{invoice}/send', [InvoicingController::class, 'send'])->name('invoicing.send');

    // Admin
    Route::middleware('role:super_admin,admin')->prefix('admin')->name('admin.')->group(function () {
        Route::resource('users', AdminUserController::class);
        Route::post('/users/{user}/toggle-lock', [AdminUserController::class, 'toggleLock'])->name('users.toggle-lock');
        Route::post('/users/{user}/reset-password', [AdminUserController::class, 'resetPassword'])->name('users.reset-password');
    });
});
