{{-- Dashboard Metric Cards Partial --}}
<div class="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
    @include('components.stat-card', [
        'label'    => 'Active Shipments',
        'value'    => $stats['active_shipments'] ?? 0,
        'badge'    => 'operations',
        'trend'    => '+' . ($stats['new_shipments_week'] ?? 0) . ' this week',
        'positive' => true,
        'icon'     => 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4',
    ])
    @include('components.stat-card', [
        'label'    => 'Outstanding Invoices',
        'value'    => 'GHS ' . number_format($stats['outstanding_invoices'] ?? 0, 0),
        'badge'    => 'finance',
        'trend'    => ($stats['overdue_count'] ?? 0) . ' overdue',
        'positive' => ($stats['overdue_count'] ?? 0) === 0,
        'icon'     => 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
    ])
    @include('components.stat-card', [
        'label'    => 'Bank Balance (GHS)',
        'value'    => 'GHS ' . number_format($stats['total_bank_balance'] ?? 0, 0),
        'badge'    => 'banking',
        'trend'    => 'Updated ' . ($stats['last_sync'] ?? 'recently'),
        'positive' => true,
        'icon'     => 'M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z',
    ])
    @include('components.stat-card', [
        'label'    => 'Unread Notifications',
        'value'    => $stats['unread_notifications'] ?? 0,
        'badge'    => 'system',
        'trend'    => 'Across all priorities',
        'positive' => ($stats['unread_notifications'] ?? 0) === 0,
        'icon'     => 'M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9',
    ])
</div>
