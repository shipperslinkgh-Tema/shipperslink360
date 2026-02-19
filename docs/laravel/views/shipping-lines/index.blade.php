@extends('layouts.app')
@section('title', 'Shipping Lines & DOs')
@section('page-title', 'Shipping Lines')

@section('content')
<div class="mb-6">
    <h1 class="text-xl font-bold text-white">Shipping Lines & Delivery Orders</h1>
    <p class="text-sm text-gray-400 mt-0.5">DO status tracking, demurrage alerts, and shipping line management</p>
</div>

{{-- Stats --}}
<div class="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
    @include('components.stat-card', ['label' => 'Active DOs',          'value' => $stats['active_dos'] ?? 0,       'badge' => 'shipping', 'trend' => 'Pending collection',           'positive' => true])
    @include('components.stat-card', ['label' => 'Overdue DOs',         'value' => $stats['overdue_dos'] ?? 0,      'badge' => 'shipping', 'trend' => 'Past free day limit',          'positive' => false])
    @include('components.stat-card', ['label' => 'Demurrage Exposure',  'value' => 'GHS ' . number_format($stats['demurrage_total'] ?? 0, 0), 'badge' => 'finance', 'trend' => 'Accrued liability', 'positive' => false])
    @include('components.stat-card', ['label' => 'Shipping Lines',      'value' => $stats['shipping_lines'] ?? 0,  'badge' => 'shipping', 'trend' => 'Active connections',           'positive' => true])
</div>

{{-- Tabs --}}
<div x-data="{ tab: 'do_status' }" class="border-b border-gray-800 mb-6">
    <nav class="flex gap-1">
        @foreach(['do_status' => 'DO Status', 'demurrage' => 'Demurrage Tracker', 'lines' => 'Shipping Lines'] as $key => $label)
            <button @click="tab = '{{ $key }}'"
                    :class="tab === '{{ $key }}' ? 'border-b-2 border-blue-500 text-blue-400' : 'text-gray-500 hover:text-gray-300'"
                    class="px-4 py-3 text-sm font-medium transition-colors">
                {{ $label }}
            </button>
        @endforeach
    </nav>
</div>

{{-- DO Status Table --}}
<div x-data="{ tab: 'do_status' }">
    <div x-show="tab === 'do_status'">
        <div class="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
            <table class="w-full text-sm">
                <thead>
                    <tr class="border-b border-gray-800 text-xs text-gray-500 uppercase tracking-wider">
                        <th class="px-6 py-3 text-left font-medium">DO Number</th>
                        <th class="px-6 py-3 text-left font-medium">Container</th>
                        <th class="px-6 py-3 text-left font-medium hidden md:table-cell">Shipping Line</th>
                        <th class="px-6 py-3 text-left font-medium hidden lg:table-cell">Free Days</th>
                        <th class="px-6 py-3 text-left font-medium hidden lg:table-cell">DO Expiry</th>
                        <th class="px-6 py-3 text-left font-medium">Status</th>
                        <th class="px-6 py-3 text-right font-medium">Demurrage</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-gray-800">
                    @forelse($deliveryOrders ?? [] as $do)
                        <tr class="hover:bg-gray-800/40 transition-colors {{ ($do->days_overdue ?? 0) > 0 ? 'border-l-2 border-l-red-500' : '' }}">
                            <td class="px-6 py-4 font-mono text-xs text-blue-400">{{ $do->do_number }}</td>
                            <td class="px-6 py-4 font-mono text-xs text-white">{{ $do->container_number }}</td>
                            <td class="px-6 py-4 text-gray-300 hidden md:table-cell">{{ $do->shipping_line_name }}</td>
                            <td class="px-6 py-4 text-gray-300 hidden lg:table-cell">{{ $do->free_days ?? 5 }} days</td>
                            <td class="px-6 py-4 text-xs hidden lg:table-cell {{ ($do->days_overdue ?? 0) > 0 ? 'text-red-400' : 'text-gray-400' }}">
                                {{ $do->do_expiry_date ? \Carbon\Carbon::parse($do->do_expiry_date)->format('d M Y') : '—' }}
                            </td>
                            <td class="px-6 py-4">@include('components.badge', ['status' => $do->status, 'type' => 'do'])</td>
                            <td class="px-6 py-4 text-right">
                                @if(($do->demurrage_amount ?? 0) > 0)
                                    <span class="text-red-400 font-semibold text-xs">GHS {{ number_format($do->demurrage_amount, 2) }}</span>
                                @else
                                    <span class="text-gray-500 text-xs">—</span>
                                @endif
                            </td>
                        </tr>
                    @empty
                        <tr><td colspan="7">@include('components.empty-state', ['message' => 'No delivery orders found'])</td></tr>
                    @endforelse
                </tbody>
            </table>
        </div>
    </div>
</div>
@endsection
