@extends('layouts.app')

@section('title', 'Dashboard')

@push('scripts')
<script type="module" src="{{ vite('resources/js/pages/dashboard.js') }}"></script>
@endpush

@section('content')
<div class="space-y-6">

    {{-- Greeting --}}
    <div class="flex items-center justify-between">
        <div>
            <h1 class="text-2xl font-bold text-white">
                @php
                    $hour = now()->hour;
                    $greeting = $hour < 12 ? 'Good morning' : ($hour < 17 ? 'Good afternoon' : 'Good evening');
                @endphp
                {{ $greeting }}, {{ auth()->user()->profile->full_name ?? auth()->user()->name }} 👋
            </h1>
            <p class="text-sm text-gray-400 mt-1">
                {{ now()->format('l, F j, Y') }} · Here's what's happening today
            </p>
        </div>
        <div class="flex items-center gap-3">
            <a href="{{ route('shipments.create') }}" class="btn-primary flex items-center gap-2">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
                </svg>
                New Shipment
            </a>
        </div>
    </div>

    {{-- KPI Cards --}}
    @include('partials.dashboard.metric-cards', ['stats' => $stats])

    {{-- Main grid --}}
    <div class="grid grid-cols-12 gap-6">

        {{-- Recent Shipments (8 cols) --}}
        <div class="col-span-12 lg:col-span-8 space-y-6">
            @include('partials.dashboard.recent-shipments', ['recentShipments' => $recentShipments])

            {{-- Shipment Volume Chart --}}
            <div class="card p-5">
                <div class="flex items-center justify-between mb-4">
                    <h2 class="text-base font-semibold text-white">Shipment Volume — Last 6 Months</h2>
                </div>
                <div class="h-56">
                    <canvas id="shipmentVolumeChart"
                        data-labels="{{ json_encode($chartData['labels'] ?? []) }}"
                        data-sea="{{ json_encode($chartData['sea'] ?? []) }}"
                        data-air="{{ json_encode($chartData['air'] ?? []) }}"
                        data-road="{{ json_encode($chartData['road'] ?? []) }}">
                    </canvas>
                </div>
            </div>
        </div>

        {{-- Side column (4 cols) --}}
        <div class="col-span-12 lg:col-span-4 space-y-6">
            @include('partials.dashboard.alerts-panel', ['alerts' => $alerts])
            @include('partials.dashboard.clearance-status', ['clearanceStats' => $clearanceStats])
            @include('partials.dashboard.quick-actions')
        </div>
    </div>

    {{-- Integration Status --}}
    @include('partials.dashboard.integration-status', ['integrations' => $integrations ?? []])

</div>
@endsection
