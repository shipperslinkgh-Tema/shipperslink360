@extends('layouts.app')
@section('title', $customer->company_name)
@section('page-title', 'Customer Detail')

@section('content')
<div class="max-w-6xl mx-auto">

    {{-- Header --}}
    <div class="flex flex-wrap items-start justify-between gap-4 mb-6">
        <div class="flex items-center gap-4">
            <a href="{{ route('customers.index') }}" class="text-gray-400 hover:text-white">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/></svg>
            </a>
            <div>
                <h1 class="text-xl font-bold text-white">{{ $customer->company_name }}</h1>
                <p class="text-sm text-gray-400 mt-0.5 font-mono">{{ $customer->customer_code }}</p>
            </div>
        </div>
        <div class="flex items-center gap-3">
            <span class="px-2.5 py-1 text-xs rounded-full {{ $customer->is_active ? 'bg-emerald-500/20 text-emerald-400' : 'bg-gray-700 text-gray-400' }}">
                {{ $customer->is_active ? 'Active' : 'Inactive' }}
            </span>
            <a href="{{ route('customers.edit', $customer) }}"
               class="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white text-sm font-medium rounded-lg border border-gray-700 transition-colors">
                Edit
            </a>
        </div>
    </div>

    {{-- Info Row --}}
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div class="bg-gray-900 border border-gray-800 rounded-xl p-6">
            <h2 class="text-xs text-gray-500 uppercase tracking-wider mb-3">Contact Info</h2>
            <p class="text-white font-medium">{{ $customer->contact_name ?? '—' }}</p>
            <p class="text-sm text-gray-400 mt-1">{{ $customer->email }}</p>
            <p class="text-sm text-gray-400">{{ $customer->phone ?? '—' }}</p>
            @if($customer->address)<p class="text-xs text-gray-500 mt-2">{{ $customer->address }}</p>@endif
        </div>
        <div class="bg-gray-900 border border-gray-800 rounded-xl p-6">
            <h2 class="text-xs text-gray-500 uppercase tracking-wider mb-3">Financial Summary</h2>
            <div class="space-y-2">
                <div class="flex justify-between text-sm">
                    <span class="text-gray-400">Total Billed</span>
                    <span class="text-white font-semibold">GHS {{ number_format($financials['total_billed'] ?? 0, 0) }}</span>
                </div>
                <div class="flex justify-between text-sm">
                    <span class="text-gray-400">Outstanding</span>
                    <span class="text-amber-400 font-semibold">GHS {{ number_format($financials['outstanding'] ?? 0, 0) }}</span>
                </div>
                <div class="flex justify-between text-sm">
                    <span class="text-gray-400">Overdue</span>
                    <span class="{{ ($financials['overdue'] ?? 0) > 0 ? 'text-red-400' : 'text-gray-400' }} font-semibold">GHS {{ number_format($financials['overdue'] ?? 0, 0) }}</span>
                </div>
            </div>
        </div>
        <div class="bg-gray-900 border border-gray-800 rounded-xl p-6">
            <h2 class="text-xs text-gray-500 uppercase tracking-wider mb-3">Activity</h2>
            <div class="space-y-2 text-sm">
                <div class="flex justify-between">
                    <span class="text-gray-400">Total Shipments</span>
                    <span class="text-white font-semibold">{{ $customer->shipments_count ?? 0 }}</span>
                </div>
                <div class="flex justify-between">
                    <span class="text-gray-400">Active Shipments</span>
                    <span class="text-blue-400 font-semibold">{{ $customer->active_shipments_count ?? 0 }}</span>
                </div>
                <div class="flex justify-between">
                    <span class="text-gray-400">TIN</span>
                    <span class="text-white font-mono text-xs">{{ $customer->tin ?? '—' }}</span>
                </div>
            </div>
        </div>
    </div>

    {{-- Tabs --}}
    <div x-data="{ tab: 'shipments' }" class="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
        <div class="border-b border-gray-800">
            <nav class="flex gap-1 px-4">
                @foreach(['shipments' => 'Shipments', 'invoices' => 'Invoices', 'documents' => 'Documents'] as $key => $label)
                    <button @click="tab = '{{ $key }}'"
                            :class="tab === '{{ $key }}' ? 'border-b-2 border-blue-500 text-blue-400' : 'text-gray-500 hover:text-gray-300'"
                            class="px-4 py-3 text-sm font-medium transition-colors">
                        {{ $label }}
                    </button>
                @endforeach
            </nav>
        </div>

        {{-- Shipments Tab --}}
        <div x-show="tab === 'shipments'" class="divide-y divide-gray-800">
            @forelse($customer->shipments ?? [] as $shipment)
                <div class="flex items-center justify-between px-6 py-3">
                    <div>
                        <p class="text-sm font-mono text-white">{{ $shipment->bl_number }}</p>
                        <p class="text-xs text-gray-400">{{ $shipment->origin }} → {{ $shipment->destination }}</p>
                    </div>
                    @include('components.badge', ['status' => $shipment->status, 'type' => 'shipment'])
                </div>
            @empty
                @include('components.empty-state', ['message' => 'No shipments for this customer'])
            @endforelse
        </div>

        {{-- Invoices Tab --}}
        <div x-show="tab === 'invoices'" class="divide-y divide-gray-800">
            @forelse($customer->invoices ?? [] as $inv)
                <div class="flex items-center justify-between px-6 py-3">
                    <div>
                        <p class="text-sm font-mono text-blue-400">{{ $inv->invoice_number }}</p>
                        <p class="text-xs text-gray-400">{{ $inv->currency }} {{ number_format($inv->total_amount, 2) }} · Due {{ \Carbon\Carbon::parse($inv->due_date)->format('d M Y') }}</p>
                    </div>
                    @include('components.badge', ['status' => $inv->status, 'type' => 'invoice'])
                </div>
            @empty
                @include('components.empty-state', ['message' => 'No invoices for this customer'])
            @endforelse
        </div>

        {{-- Documents Tab --}}
        <div x-show="tab === 'documents'" class="divide-y divide-gray-800">
            @forelse($customer->documents ?? [] as $doc)
                <div class="flex items-center justify-between px-6 py-3">
                    <div>
                        <p class="text-sm text-white">{{ $doc->document_name }}</p>
                        <p class="text-xs text-gray-400">{{ $doc->document_type }} · {{ $doc->created_at->format('d M Y') }}</p>
                    </div>
                    @if($doc->file_url)
                        <a href="{{ $doc->file_url }}" target="_blank" class="text-xs text-blue-400 hover:text-blue-300">Download</a>
                    @endif
                </div>
            @empty
                @include('components.empty-state', ['message' => 'No documents uploaded'])
            @endforelse
        </div>
    </div>
</div>
@endsection
