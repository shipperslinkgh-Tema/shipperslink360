@extends('layouts.app')
@section('title', 'Customers')
@section('page-title', 'Customers')

@section('content')
<div class="flex flex-wrap items-center justify-between gap-4 mb-6">
    <div>
        <h1 class="text-xl font-bold text-white">Customers</h1>
        <p class="text-sm text-gray-400 mt-0.5">Manage client accounts and company profiles</p>
    </div>
    <a href="{{ route('customers.create') }}"
       class="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold rounded-lg transition-colors">
        + New Customer
    </a>
</div>

{{-- Stats --}}
<div class="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
    @include('components.stat-card', ['label' => 'Total Customers', 'value' => $stats['total'] ?? 0, 'badge' => 'customers', 'trend' => ($stats['new_this_month'] ?? 0) . ' new this month', 'positive' => true])
    @include('components.stat-card', ['label' => 'Active',          'value' => $stats['active'] ?? 0, 'badge' => 'customers', 'trend' => 'With active shipments', 'positive' => true])
    @include('components.stat-card', ['label' => 'Outstanding AR',  'value' => 'GHS ' . number_format($stats['outstanding_ar'] ?? 0, 0), 'badge' => 'finance', 'trend' => ($stats['overdue_count'] ?? 0) . ' overdue', 'positive' => false])
    @include('components.stat-card', ['label' => 'Total Revenue',   'value' => 'GHS ' . number_format($stats['total_revenue'] ?? 0, 0), 'badge' => 'finance', 'trend' => 'All time', 'positive' => true])
</div>

{{-- Filters --}}
<div class="mb-4">
    <form method="GET" class="flex flex-wrap gap-3">
        <input type="text" name="search" value="{{ request('search') }}" placeholder="Search company, email, code…"
               class="flex-1 min-w-48 px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"/>
        <select name="status" class="px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option value="">All Statuses</option>
            <option value="active"   {{ request('status') === 'active'   ? 'selected' : '' }}>Active</option>
            <option value="inactive" {{ request('status') === 'inactive' ? 'selected' : '' }}>Inactive</option>
        </select>
        <button type="submit" class="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white text-sm rounded-lg">Filter</button>
        @if(request()->hasAny(['search','status']))
            <a href="{{ route('customers.index') }}" class="px-4 py-2 text-sm text-gray-400 hover:text-white">Clear</a>
        @endif
    </form>
</div>

{{-- Table --}}
<div class="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
    <table class="w-full text-sm">
        <thead>
            <tr class="border-b border-gray-800 text-xs text-gray-500 uppercase tracking-wider">
                <th class="px-6 py-3 text-left font-medium">Company</th>
                <th class="px-6 py-3 text-left font-medium hidden md:table-cell">Code</th>
                <th class="px-6 py-3 text-left font-medium hidden lg:table-cell">Contact</th>
                <th class="px-6 py-3 text-left font-medium hidden lg:table-cell">Shipments</th>
                <th class="px-6 py-3 text-left font-medium">Status</th>
                <th class="px-6 py-3 text-right font-medium">Actions</th>
            </tr>
        </thead>
        <tbody class="divide-y divide-gray-800">
            @forelse($customers ?? [] as $customer)
                <tr class="hover:bg-gray-800/40 transition-colors">
                    <td class="px-6 py-4">
                        <p class="text-white font-medium">{{ $customer->company_name }}</p>
                        <p class="text-xs text-gray-400">{{ $customer->email }}</p>
                    </td>
                    <td class="px-6 py-4 hidden md:table-cell font-mono text-xs text-blue-400">{{ $customer->customer_code }}</td>
                    <td class="px-6 py-4 hidden lg:table-cell text-gray-300">{{ $customer->contact_name ?? '—' }}</td>
                    <td class="px-6 py-4 hidden lg:table-cell text-gray-300">{{ $customer->shipments_count ?? 0 }}</td>
                    <td class="px-6 py-4">
                        <span class="px-2 py-0.5 text-xs rounded-full {{ $customer->is_active ? 'bg-emerald-500/20 text-emerald-400' : 'bg-gray-700 text-gray-400' }}">
                            {{ $customer->is_active ? 'Active' : 'Inactive' }}
                        </span>
                    </td>
                    <td class="px-6 py-4 text-right">
                        <a href="{{ route('customers.show', $customer) }}" class="text-xs text-blue-400 hover:text-blue-300">View →</a>
                    </td>
                </tr>
            @empty
                <tr><td colspan="6">@include('components.empty-state', ['message' => 'No customers found'])</td></tr>
            @endforelse
        </tbody>
    </table>
</div>
@if(isset($customers)) <div class="mt-4">{{ $customers->withQueryString()->links('components.pagination') }}</div> @endif
@endsection
