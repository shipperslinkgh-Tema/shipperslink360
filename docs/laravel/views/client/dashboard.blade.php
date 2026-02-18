@extends('layouts.client')

@section('title', 'Dashboard')

@section('content')
<div class="mb-6">
    <h1 class="text-xl font-bold text-white">Welcome back, {{ Auth::user()->clientProfile?->contact_name }}</h1>
    <p class="text-sm text-gray-400 mt-1">{{ Auth::user()->clientProfile?->company_name }} · {{ now()->format('l, F j, Y') }}</p>
</div>

{{-- Quick stats --}}
<div class="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
    @include('components.stat-card', ['label' => 'Active Shipments', 'value' => $stats['active_shipments'] ?? 0, 'badge' => 'shipments'])
    @include('components.stat-card', ['label' => 'Pending Invoices', 'value' => 'GHS ' . number_format($stats['pending_invoices'] ?? 0, 0), 'badge' => 'finance'])
    @include('components.stat-card', ['label' => 'Documents', 'value' => $stats['document_count'] ?? 0, 'badge' => 'docs'])
    @include('components.stat-card', ['label' => 'Unread Messages', 'value' => $stats['unread_messages'] ?? 0, 'badge' => 'messages'])
</div>

<div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
    {{-- Recent Shipments --}}
    <div class="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
        <div class="flex items-center justify-between px-6 py-4 border-b border-gray-800">
            <h3 class="text-sm font-semibold text-white">My Shipments</h3>
            <a href="{{ route('client.shipments.index') }}" class="text-xs text-blue-400 hover:text-blue-300 transition-colors">View all →</a>
        </div>
        <div class="divide-y divide-gray-800">
            @forelse($recentShipments ?? [] as $s)
                <div class="px-6 py-4">
                    <div class="flex items-center justify-between">
                        <div>
                            <p class="text-sm font-mono font-medium text-white">{{ $s->bl_number }}</p>
                            <p class="text-xs text-gray-400 mt-0.5">{{ $s->origin }} → {{ $s->destination }}</p>
                            @if($s->eta)
                                <p class="text-xs text-gray-500 mt-0.5">ETA: {{ \Carbon\Carbon::parse($s->eta)->format('d M Y') }}</p>
                            @endif
                        </div>
                        @include('components.badge', ['status' => $s->status, 'type' => 'shipment'])
                    </div>
                </div>
            @empty
                @include('components.empty-state', ['message' => 'No shipments yet'])
            @endforelse
        </div>
    </div>

    {{-- Recent Invoices --}}
    <div class="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
        <div class="flex items-center justify-between px-6 py-4 border-b border-gray-800">
            <h3 class="text-sm font-semibold text-white">Recent Invoices</h3>
            <a href="{{ route('client.invoices.index') }}" class="text-xs text-blue-400 hover:text-blue-300 transition-colors">View all →</a>
        </div>
        <div class="divide-y divide-gray-800">
            @forelse($recentInvoices ?? [] as $inv)
                <div class="flex items-center justify-between px-6 py-4">
                    <div>
                        <p class="text-sm font-mono text-white">{{ $inv->invoice_number }}</p>
                        <p class="text-xs text-gray-400">{{ $inv->currency }} {{ number_format($inv->amount, 2) }}</p>
                    </div>
                    @include('components.badge', ['status' => $inv->status, 'type' => 'invoice'])
                </div>
            @empty
                @include('components.empty-state', ['message' => 'No invoices yet'])
            @endforelse
        </div>
    </div>
</div>
@endsection
