@extends('layouts.app')

@section('title', 'Finance — Invoices')
@section('page-title', 'Finance')

@section('content')
<div class="flex items-center justify-between mb-6">
    <div>
        <h1 class="text-xl font-bold text-white">Finance</h1>
        <p class="text-sm text-gray-400 mt-1">Invoices, job costs, and expense management</p>
    </div>
    <a href="{{ route('finance.invoices.create') }}"
       class="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold rounded-lg transition-colors shadow shadow-blue-600/20">
        + New Invoice
    </a>
</div>

{{-- Finance stats --}}
<div class="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
    @include('components.stat-card', ['label' => 'Total Revenue (GHS)', 'value' => 'GHS ' . number_format($stats['total_revenue'] ?? 0, 0), 'badge' => 'finance', 'trend' => 'This month'])
    @include('components.stat-card', ['label' => 'Outstanding', 'value' => 'GHS ' . number_format($stats['outstanding'] ?? 0, 0), 'badge' => 'finance', 'trend' => ($stats['overdue_count'] ?? 0) . ' overdue', 'positive' => false])
    @include('components.stat-card', ['label' => 'Total Expenses', 'value' => 'GHS ' . number_format($stats['total_expenses'] ?? 0, 0), 'badge' => 'finance', 'trend' => 'Approved & paid'])
    @include('components.stat-card', ['label' => 'Net Profit', 'value' => 'GHS ' . number_format($stats['net_profit'] ?? 0, 0), 'badge' => 'finance', 'trend' => 'This month', 'positive' => ($stats['net_profit'] ?? 0) >= 0])
</div>

{{-- Tabs --}}
<div class="border-b border-gray-800 mb-6" x-data="{ tab: '{{ request('tab', 'invoices') }}' }">
    <nav class="flex gap-1">
        @foreach(['invoices' => 'Invoices', 'job-costs' => 'Job Costs', 'expenses' => 'Expenses'] as $key => $label)
            <button @click="tab = '{{ $key }}'; history.pushState(null, '', '?tab={{ $key }}')"
                    :class="tab === '{{ $key }}' ? 'border-b-2 border-blue-500 text-blue-400' : 'text-gray-500 hover:text-gray-300'"
                    class="px-4 py-3 text-sm font-medium transition-colors">
                {{ $label }}
            </button>
        @endforeach
    </nav>

    {{-- Invoices panel --}}
    <div x-show="tab === 'invoices'" class="mt-6">
        <div class="flex flex-wrap gap-3 mb-4">
            <form method="GET" class="flex flex-wrap gap-3 w-full">
                <input type="hidden" name="tab" value="invoices" />
                <input type="text" name="search" value="{{ request('search') }}"
                       placeholder="Search invoice # or customer…"
                       class="flex-1 min-w-48 px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                <select name="status" class="px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="">All Statuses</option>
                    @foreach(['draft','sent','partially_paid','paid','overdue','disputed','cancelled'] as $s)
                        <option value="{{ $s }}" {{ request('status') === $s ? 'selected' : '' }}>{{ ucwords(str_replace('_',' ',$s)) }}</option>
                    @endforeach
                </select>
                <button type="submit" class="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white text-sm rounded-lg transition-colors">Filter</button>
            </form>
        </div>

        <div class="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
            <table class="w-full text-sm">
                <thead>
                    <tr class="border-b border-gray-800 text-xs text-gray-500 uppercase tracking-wider">
                        <th class="px-6 py-3 text-left font-medium">Invoice #</th>
                        <th class="px-6 py-3 text-left font-medium">Customer</th>
                        <th class="px-6 py-3 text-left font-medium">Amount</th>
                        <th class="px-6 py-3 text-left font-medium">Due Date</th>
                        <th class="px-6 py-3 text-left font-medium">Status</th>
                        <th class="px-6 py-3 text-right font-medium">Actions</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-gray-800">
                    @forelse($invoices ?? [] as $inv)
                        <tr class="hover:bg-gray-800/40 transition-colors">
                            <td class="px-6 py-4 font-mono text-xs text-blue-400">{{ $inv->invoice_number }}</td>
                            <td class="px-6 py-4">
                                <p class="text-white font-medium">{{ $inv->customer }}</p>
                                <p class="text-xs text-gray-400">{{ $inv->service_type }}</p>
                            </td>
                            <td class="px-6 py-4">
                                <p class="text-white font-semibold">{{ $inv->currency }} {{ number_format($inv->total_amount, 2) }}</p>
                                @if($inv->currency !== 'GHS')
                                    <p class="text-xs text-gray-400">≈ GHS {{ number_format($inv->ghs_equivalent, 0) }}</p>
                                @endif
                            </td>
                            <td class="px-6 py-4 text-gray-300 text-xs">{{ \Carbon\Carbon::parse($inv->due_date)->format('d M Y') }}</td>
                            <td class="px-6 py-4">
                                @include('components.badge', ['status' => $inv->status, 'type' => 'invoice'])
                            </td>
                            <td class="px-6 py-4 text-right">
                                <a href="{{ route('finance.invoices.show', $inv) }}"
                                   class="text-xs text-blue-400 hover:text-blue-300 transition-colors">View →</a>
                            </td>
                        </tr>
                    @empty
                        <tr><td colspan="6">@include('components.empty-state', ['message' => 'No invoices found'])</td></tr>
                    @endforelse
                </tbody>
            </table>
        </div>
        @if(isset($invoices)) <div class="mt-4">{{ $invoices->withQueryString()->links('components.pagination') }}</div> @endif
    </div>

    {{-- Job costs & expenses panels included via partials --}}
    <div x-show="tab === 'job-costs'" class="mt-6">
        @include('finance.partials.job-costs-table')
    </div>
    <div x-show="tab === 'expenses'" class="mt-6">
        @include('finance.partials.expenses-table')
    </div>
</div>
@endsection
