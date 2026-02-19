{{-- Finance Stats Partial --}}
<div class="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
    @include('components.stat-card', ['label' => 'Total Revenue',   'value' => 'GHS ' . number_format($stats['total_revenue'] ?? 0, 0),   'badge' => 'finance', 'trend' => 'This month',                                  'positive' => true])
    @include('components.stat-card', ['label' => 'Outstanding AR',  'value' => 'GHS ' . number_format($stats['outstanding'] ?? 0, 0),      'badge' => 'finance', 'trend' => ($stats['overdue_count'] ?? 0) . ' overdue',   'positive' => false])
    @include('components.stat-card', ['label' => 'Total Expenses',  'value' => 'GHS ' . number_format($stats['total_expenses'] ?? 0, 0),   'badge' => 'finance', 'trend' => 'Approved & paid',                             'positive' => true])
    @include('components.stat-card', ['label' => 'Net Profit',      'value' => 'GHS ' . number_format($stats['net_profit'] ?? 0, 0),       'badge' => 'finance', 'trend' => 'This month',                                  'positive' => ($stats['net_profit'] ?? 0) >= 0])
</div>
