<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Application Constants
    |--------------------------------------------------------------------------
    | All app-level configuration constants for SLAC FreightLink 360.
    | Access via: config('shipperlink.key')
    */

    'name'    => env('APP_NAME', 'SLAC FreightLink 360'),
    'version' => '2.0.0',

    // ── Inactivity timeout (seconds) ─────────────────────────────────────
    'inactivity_timeout' => env('INACTIVITY_TIMEOUT', 900),

    // ── Login lockout ─────────────────────────────────────────────────────
    'max_failed_logins'    => 5,
    'lockout_duration_min' => 30,

    // ── Currencies ────────────────────────────────────────────────────────
    'currencies' => ['GHS', 'USD', 'EUR', 'GBP', 'CNY'],
    'base_currency' => 'GHS',

    // ── Departments ───────────────────────────────────────────────────────
    'departments' => [
        'operations',
        'documentation',
        'accounts',
        'marketing',
        'customer_service',
        'warehouse',
        'management',
        'super_admin',
    ],

    // ── Roles ─────────────────────────────────────────────────────────────
    'roles' => ['super_admin', 'admin', 'manager', 'staff'],

    // ── Finance ───────────────────────────────────────────────────────────
    'vat_rate'          => 0.15,
    'nhil_rate'         => 0.025,
    'covid_levy_rate'   => 0.01,
    'invoice_due_days'  => 30,
    'overdue_escalation_days' => 7,

    // ── Shipment statuses ─────────────────────────────────────────────────
    'shipment_statuses' => [
        'pending',
        'in_transit',
        'at_port',
        'customs_clearance',
        'cleared',
        'delivered',
        'on_hold',
        'cancelled',
    ],

    // ── Invoice statuses ──────────────────────────────────────────────────
    'invoice_statuses' => [
        'draft',
        'sent',
        'partially_paid',
        'paid',
        'overdue',
        'disputed',
        'cancelled',
    ],

    // ── Expense categories ────────────────────────────────────────────────
    'expense_categories' => [
        'fuel',
        'maintenance',
        'office',
        'utilities',
        'salary',
        'travel',
        'customs_duties',
        'port_charges',
        'miscellaneous',
    ],

    // ── Job cost categories ───────────────────────────────────────────────
    'job_cost_categories' => [
        'customs_duty',
        'port_charges',
        'shipping_freight',
        'trucking',
        'documentation',
        'handling',
        'others',
    ],

    // ── Tax types ─────────────────────────────────────────────────────────
    'tax_types' => ['VAT', 'NHIL', 'COVID_LEVY', 'INCOME_TAX', 'WITHHOLDING'],

    // ── Registration types (Registrar Renewals) ───────────────────────────
    'registration_types' => [
        'business_registration',
        'tax_certificate',
        'import_license',
        'customs_broker_license',
        'logistics_license',
    ],

    // ── File storage ──────────────────────────────────────────────────────
    'allowed_document_types' => ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'jpg', 'jpeg', 'png'],
    'max_file_size_mb'       => 20,

    // ── AI Assistant ──────────────────────────────────────────────────────
    'ai_rate_limit'     => 10,   // requests per minute per user
    'ai_model'          => env('OPENAI_MODEL', 'gpt-4o'),
    'ai_max_tokens'     => 2000,

    // ── Chat channels ─────────────────────────────────────────────────────
    'chat_channels' => [
        'general'          => 'General',
        'operations'       => 'Operations',
        'finance'          => 'Finance',
        'management'       => 'Management',
        'customer_service' => 'Customer Service',
        'warehouse'        => 'Warehouse',
    ],

    // ── Registrar renewal alert threshold (days) ──────────────────────────
    'renewal_alert_days' => 30,

    // ── Demurrage free days ───────────────────────────────────────────────
    'demurrage_free_days' => [
        'standard' => 5,
        'extended' => 14,
    ],

];
