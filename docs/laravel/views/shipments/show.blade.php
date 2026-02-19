@extends('layouts.app')
@section('title', $shipment->bl_number . ' — Shipment')
@section('page-title', 'Shipment Detail')

@section('content')
<div class="max-w-5xl mx-auto">

    {{-- Header --}}
    <div class="flex flex-wrap items-start justify-between gap-4 mb-6">
        <div class="flex items-center gap-4">
            <a href="{{ route('shipments.index') }}" class="text-gray-400 hover:text-white">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/></svg>
            </a>
            <div>
                <h1 class="text-xl font-bold text-white font-mono">{{ $shipment->bl_number }}</h1>
                <p class="text-sm text-gray-400 mt-0.5">{{ ucwords(str_replace('_', ' ', $shipment->shipment_type ?? 'shipment')) }} · {{ $shipment->origin }} → {{ $shipment->destination }}</p>
            </div>
        </div>
        <div class="flex items-center gap-3">
            @include('components.badge', ['status' => $shipment->status, 'type' => 'shipment'])
            <a href="{{ route('shipments.edit', $shipment) }}"
               class="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white text-sm font-medium rounded-lg transition-colors border border-gray-700">
                Edit
            </a>
        </div>
    </div>

    {{-- Status Timeline --}}
    <div class="bg-gray-900 border border-gray-800 rounded-xl p-6 mb-6">
        <h2 class="text-sm font-semibold text-white mb-4">Shipment Progress</h2>
        @php
            $stages    = ['pending','in_transit','at_port','customs_clearance','cleared','delivered'];
            $stageIdx  = array_search($shipment->status, $stages) ?: 0;
        @endphp
        <div class="flex items-center justify-between relative">
            <div class="absolute left-0 right-0 top-3 h-0.5 bg-gray-700 mx-6"></div>
            <div class="absolute left-0 top-3 h-0.5 bg-blue-500 mx-6 transition-all" style="width: {{ max(0, ($stageIdx / (count($stages)-1)) * (100 - 16)) }}%"></div>
            @foreach($stages as $i => $stage)
                <div class="relative z-10 flex flex-col items-center gap-1.5">
                    <div class="w-6 h-6 rounded-full flex items-center justify-center
                        {{ $i <= $stageIdx ? 'bg-blue-500' : 'bg-gray-700' }}">
                        @if($i < $stageIdx)
                            <svg class="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"/></svg>
                        @else
                            <span class="w-2 h-2 rounded-full {{ $i === $stageIdx ? 'bg-white' : 'bg-gray-500' }}"></span>
                        @endif
                    </div>
                    <span class="text-xs text-gray-400 hidden sm:block text-center w-16 leading-tight">{{ ucwords(str_replace('_', ' ', $stage)) }}</span>
                </div>
            @endforeach
        </div>
    </div>

    {{-- Info Grid --}}
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div class="lg:col-span-2 bg-gray-900 border border-gray-800 rounded-xl p-6">
            <h2 class="text-sm font-semibold text-white mb-4">Shipment Information</h2>
            <dl class="grid grid-cols-2 gap-x-6 gap-y-4 text-sm">
                <div>
                    <dt class="text-xs text-gray-500 mb-0.5">Container</dt>
                    <dd class="text-white font-mono">{{ $shipment->container_number ?? '—' }}</dd>
                </div>
                <div>
                    <dt class="text-xs text-gray-500 mb-0.5">Vessel / Voyage</dt>
                    <dd class="text-white">{{ $shipment->vessel_name ?? '—' }} {{ $shipment->voyage_number ? '/ ' . $shipment->voyage_number : '' }}</dd>
                </div>
                <div>
                    <dt class="text-xs text-gray-500 mb-0.5">ETA</dt>
                    <dd class="text-white">{{ $shipment->eta ? \Carbon\Carbon::parse($shipment->eta)->format('d M Y') : '—' }}</dd>
                </div>
                <div>
                    <dt class="text-xs text-gray-500 mb-0.5">ATA</dt>
                    <dd class="text-white">{{ $shipment->ata ? \Carbon\Carbon::parse($shipment->ata)->format('d M Y') : 'Not arrived' }}</dd>
                </div>
                <div>
                    <dt class="text-xs text-gray-500 mb-0.5">Weight</dt>
                    <dd class="text-white">{{ $shipment->weight_kg ? number_format($shipment->weight_kg, 0) . ' kg' : '—' }}</dd>
                </div>
                <div>
                    <dt class="text-xs text-gray-500 mb-0.5">Created</dt>
                    <dd class="text-white">{{ $shipment->created_at->format('d M Y') }}</dd>
                </div>
                @if($shipment->cargo_description)
                    <div class="col-span-2">
                        <dt class="text-xs text-gray-500 mb-0.5">Cargo Description</dt>
                        <dd class="text-gray-300">{{ $shipment->cargo_description }}</dd>
                    </div>
                @endif
                @if($shipment->notes)
                    <div class="col-span-2">
                        <dt class="text-xs text-gray-500 mb-0.5">Notes</dt>
                        <dd class="text-gray-400 text-xs">{{ $shipment->notes }}</dd>
                    </div>
                @endif
            </dl>
        </div>

        <div class="bg-gray-900 border border-gray-800 rounded-xl p-6">
            <h2 class="text-sm font-semibold text-white mb-4">Customer</h2>
            @if($shipment->customer)
                <p class="text-white font-medium">{{ $shipment->customer->company_name }}</p>
                <p class="text-xs text-gray-400 mt-0.5">{{ $shipment->customer->customer_code }}</p>
                <p class="text-xs text-gray-400 mt-1">{{ $shipment->customer->email }}</p>
                <a href="{{ route('customers.show', $shipment->customer) }}"
                   class="inline-block mt-3 text-xs text-blue-400 hover:text-blue-300">View customer →</a>
            @else
                <p class="text-gray-500 text-sm">No customer linked.</p>
            @endif
        </div>
    </div>

    {{-- Linked Documents / Invoices --}}
    @if(isset($linkedInvoices) && $linkedInvoices->count())
        <div class="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
            <div class="px-6 py-4 border-b border-gray-800">
                <h2 class="text-sm font-semibold text-white">Linked Invoices</h2>
            </div>
            <div class="divide-y divide-gray-800">
                @foreach($linkedInvoices as $inv)
                    <div class="flex items-center justify-between px-6 py-3">
                        <div>
                            <p class="text-sm font-mono text-blue-400">{{ $inv->invoice_number }}</p>
                            <p class="text-xs text-gray-400">{{ $inv->customer }} · {{ $inv->currency }} {{ number_format($inv->total_amount, 2) }}</p>
                        </div>
                        @include('components.badge', ['status' => $inv->status, 'type' => 'invoice'])
                    </div>
                @endforeach
            </div>
        </div>
    @endif
</div>
@endsection
