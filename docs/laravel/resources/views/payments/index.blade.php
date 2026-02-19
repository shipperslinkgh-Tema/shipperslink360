{{--
  payments/index.blade.php
  All payment records with filters and summary stats.
--}}
@extends('layouts.app')
@section('title', 'Payments — FreightLink 360')

@section('content')
<div class="space-y-6">

    {{-- Header --}}
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
            <h1 class="page-title">Payments</h1>
            <p class="text-sm text-gray-400 mt-0.5">All received and recorded payment transactions</p>
        </div>
        <div class="flex items-center gap-2">
            <a href="{{ route('payments.create') }}" class="btn btn-primary">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
                </svg>
                Record Payment
            </a>
        </div>
    </div>

    {{-- Summary stats --}}
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
        @php
            $totalReceived  = $payments->where('status', 'completed')->sum('amount_ghs');
            $totalPending   = $payments->where('status', 'pending')->sum('amount_ghs');
            $todayCount     = $payments->where('payment_date', today()->toDateString())->count();
            $overdueInv     = $overdueInvoicesCount ?? 0;
        @endphp
        <div class="stat-card kpi-glow-green">
            <p class="text-xs text-gray-400 mb-1">Total Received (GHS)</p>
            <p class="text-2xl font-bold text-success-DEFAULT">{{ number_format($totalReceived, 2) }}</p>
            <p class="text-xs text-gray-500 mt-1">{{ $payments->where('status','completed')->count() }} transactions</p>
        </div>
        <div class="stat-card kpi-glow-gold">
            <p class="text-xs text-gray-400 mb-1">Pending Clearance (GHS)</p>
            <p class="text-2xl font-bold text-warning-DEFAULT">{{ number_format($totalPending, 2) }}</p>
            <p class="text-xs text-gray-500 mt-1">{{ $payments->where('status','pending')->count() }} awaiting</p>
        </div>
        <div class="stat-card">
            <p class="text-xs text-gray-400 mb-1">Received Today</p>
            <p class="text-2xl font-bold text-gray-100">{{ $todayCount }}</p>
            <p class="text-xs text-gray-500 mt-1">payments</p>
        </div>
        <div class="stat-card kpi-glow-red">
            <p class="text-xs text-gray-400 mb-1">Overdue Invoices</p>
            <p class="text-2xl font-bold text-danger-DEFAULT">{{ $overdueInv }}</p>
            <p class="text-xs text-gray-500 mt-1">needing follow-up</p>
        </div>
    </div>

    {{-- Filters --}}
    <div class="card">
        <form method="GET" action="{{ route('payments.index') }}" class="flex flex-wrap gap-3 items-end">
            <div class="flex-1 min-w-[180px]">
                <label class="label" for="search">Search</label>
                <input type="text" id="search" name="search" class="input"
                       placeholder="Invoice no., customer, reference…"
                       value="{{ request('search') }}">
            </div>
            <div class="w-40">
                <label class="label" for="status">Status</label>
                <select id="status" name="status" class="select">
                    <option value="">All Status</option>
                    <option value="completed" {{ request('status') === 'completed' ? 'selected' : '' }}>Completed</option>
                    <option value="pending"   {{ request('status') === 'pending'   ? 'selected' : '' }}>Pending</option>
                    <option value="failed"    {{ request('status') === 'failed'    ? 'selected' : '' }}>Failed</option>
                    <option value="reversed"  {{ request('status') === 'reversed'  ? 'selected' : '' }}>Reversed</option>
                </select>
            </div>
            <div class="w-40">
                <label class="label" for="method">Method</label>
                <select id="method" name="method" class="select">
                    <option value="">All Methods</option>
                    @foreach(config('shipperlink.payment_methods') as $key => $label)
                    <option value="{{ $key }}" {{ request('method') === $key ? 'selected' : '' }}>{{ $label }}</option>
                    @endforeach
                </select>
            </div>
            <div class="w-36">
                <label class="label" for="date_from">From</label>
                <input type="date" id="date_from" name="date_from" class="input" value="{{ request('date_from') }}">
            </div>
            <div class="w-36">
                <label class="label" for="date_to">To</label>
                <input type="date" id="date_to" name="date_to" class="input" value="{{ request('date_to') }}">
            </div>
            <button type="submit" class="btn btn-secondary">Filter</button>
            @if(request()->hasAny(['search','status','method','date_from','date_to']))
            <a href="{{ route('payments.index') }}" class="btn btn-ghost">Clear</a>
            @endif
        </form>
    </div>

    {{-- Payments table --}}
    <div class="card p-0">
        <div class="flex items-center justify-between px-6 py-4 border-b border-gray-700">
            <h2 class="section-title mb-0">
                Payment Records
                <span class="text-gray-500 font-normal text-sm ml-2">({{ $payments->total() }})</span>
            </h2>
            <a href="{{ route('payments.export') }}{{ '?' . http_build_query(request()->all()) }}"
               class="btn btn-ghost btn-sm">
                ⬇ Export CSV
            </a>
        </div>

        <div class="table-wrapper rounded-none border-0">
            <table class="table">
                <thead>
                    <tr>
                        <th>Date</th>
                        <th>Reference</th>
                        <th>Customer</th>
                        <th>Invoice</th>
                        <th>Method</th>
                        <th>Amount (GHS)</th>
                        <th>Status</th>
                        <th>Recorded By</th>
                        <th></th>
                    </tr>
                </thead>
                <tbody>
                    @forelse($payments as $payment)
                    <tr>
                        <td class="whitespace-nowrap">
                            {{ \Carbon\Carbon::parse($payment->payment_date)->format('d M Y') }}
                        </td>
                        <td class="font-mono text-xs text-brand-400">{{ $payment->reference_number }}</td>
                        <td>
                            <a href="{{ route('customers.show', $payment->invoice->customer_id) }}"
                               class="text-gray-200 hover:text-brand-400 transition-colors">
                                {{ $payment->invoice->customer->name ?? '—' }}
                            </a>
                        </td>
                        <td>
                            <a href="{{ route('invoicing.show', $payment->invoice_id) }}"
                               class="text-brand-400 hover:underline font-mono text-xs">
                                {{ $payment->invoice->invoice_number ?? '—' }}
                            </a>
                        </td>
                        <td>
                            <span class="badge badge-blue text-xs">
                                {{ config('shipperlink.payment_methods.' . $payment->payment_method, $payment->payment_method) }}
                            </span>
                        </td>
                        <td class="font-semibold text-success-DEFAULT">
                            {{ number_format($payment->amount_ghs, 2) }}
                        </td>
                        <td>
                            <span class="badge {{ match($payment->status) {
                                'completed' => 'badge-green',
                                'pending'   => 'badge-yellow',
                                'failed'    => 'badge-red',
                                'reversed'  => 'badge-gray',
                                default     => 'badge-gray',
                            } }}">
                                {{ ucfirst($payment->status) }}
                            </span>
                        </td>
                        <td class="text-gray-400 text-xs">{{ $payment->recordedBy->profile->full_name ?? '—' }}</td>
                        <td>
                            <a href="{{ route('payments.show', $payment) }}" class="btn btn-ghost btn-sm">View</a>
                        </td>
                    </tr>
                    @empty
                    <tr>
                        <td colspan="9">
                            <div class="empty-state py-10">
                                <p class="text-3xl mb-2">💳</p>
                                <p class="font-medium text-gray-400">No payments found</p>
                                <p class="text-sm text-gray-500">Try adjusting your filters.</p>
                            </div>
                        </td>
                    </tr>
                    @endforelse
                </tbody>
            </table>
        </div>

        @if($payments->hasPages())
        <div class="px-6 py-4 border-t border-gray-700">
            {{ $payments->withQueryString()->links('vendor.pagination.tailwind') }}
        </div>
        @endif
    </div>
</div>
@endsection
