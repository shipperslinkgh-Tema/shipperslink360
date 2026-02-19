@extends('layouts.app')
@section('title', 'Consolidation Portal')
@section('page-title', 'Consolidation')

@section('content')
<div class="flex flex-wrap items-center justify-between gap-4 mb-6">
    <div>
        <h1 class="text-xl font-bold text-white">Consolidation Portal</h1>
        <p class="text-sm text-gray-400 mt-0.5">LCL consolidation lots, shipper details, and cargo tracking</p>
    </div>
    <button onclick="document.getElementById('newLotModal').showModal()"
            class="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold rounded-lg transition-colors">
        + New Lot
    </button>
</div>

{{-- Stats --}}
<div class="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
    @include('components.stat-card', ['label' => 'Active Lots',        'value' => $stats['active_lots'] ?? 0,   'badge' => 'consolidation', 'trend' => 'Open for booking',         'positive' => true])
    @include('components.stat-card', ['label' => 'Total Shippers',     'value' => $stats['total_shippers'] ?? 0,'badge' => 'consolidation', 'trend' => 'Across all lots',          'positive' => true])
    @include('components.stat-card', ['label' => 'CBM Booked',         'value' => ($stats['total_cbm'] ?? 0) . ' m³', 'badge' => 'consolidation', 'trend' => 'Total cargo volume', 'positive' => true])
    @include('components.stat-card', ['label' => 'Revenue (Month)',    'value' => 'GHS ' . number_format($stats['monthly_revenue'] ?? 0, 0), 'badge' => 'finance', 'trend' => 'Consolidation revenue', 'positive' => true])
</div>

{{-- Lot Table + Detail Panel --}}
<div class="grid grid-cols-1 lg:grid-cols-3 gap-6" x-data="{ selectedLot: null }">

    {{-- Lots Table --}}
    <div class="lg:col-span-2 bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
        <div class="px-6 py-4 border-b border-gray-800">
            <h2 class="text-sm font-semibold text-white">Consolidation Lots</h2>
        </div>
        <div class="divide-y divide-gray-800">
            @forelse($lots ?? [] as $lot)
                <div @click="selectedLot = {{ $lot->id }}"
                     :class="selectedLot === {{ $lot->id }} ? 'bg-blue-600/10 border-l-2 border-l-blue-500' : 'hover:bg-gray-800/40'"
                     class="flex items-center justify-between px-6 py-3.5 cursor-pointer transition-colors">
                    <div>
                        <p class="text-sm font-mono text-white">{{ $lot->lot_number }}</p>
                        <p class="text-xs text-gray-400 mt-0.5">
                            {{ $lot->origin }} → {{ $lot->destination }}
                            · {{ $lot->shippers_count ?? 0 }} shippers
                            · {{ $lot->total_cbm ?? 0 }} m³
                        </p>
                    </div>
                    <div class="flex items-center gap-3">
                        <span class="text-xs text-gray-500">{{ $lot->eta ? \Carbon\Carbon::parse($lot->eta)->format('d M') : '—' }}</span>
                        @include('components.badge', ['status' => $lot->status, 'type' => 'consolidation'])
                    </div>
                </div>
            @empty
                @include('components.empty-state', ['message' => 'No consolidation lots found'])
            @endforelse
        </div>
    </div>

    {{-- Detail Panel --}}
    <div class="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden" x-show="selectedLot !== null">
        <div class="px-6 py-4 border-b border-gray-800">
            <h2 class="text-sm font-semibold text-white">Lot Details</h2>
        </div>
        <div class="p-6">
            <p class="text-xs text-gray-500 text-center">Select a lot to view details</p>
            {{-- Populated via Alpine.js / AJAX in real implementation --}}
        </div>
    </div>
</div>

{{-- New Lot Modal --}}
<dialog id="newLotModal" class="bg-gray-900 border border-gray-800 rounded-xl p-6 w-full max-w-lg backdrop:bg-black/60">
    <h2 class="text-lg font-bold text-white mb-4">New Consolidation Lot</h2>
    <form method="POST" action="{{ route('consolidation.store') }}" class="space-y-4">
        @csrf
        <div class="grid grid-cols-2 gap-4">
            <div>
                <label class="block text-xs text-gray-400 mb-1.5">Vessel / BL</label>
                <input type="text" name="bl_number" class="w-full px-3 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
            </div>
            <div>
                <label class="block text-xs text-gray-400 mb-1.5">Origin</label>
                <input type="text" name="origin" class="w-full px-3 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
            </div>
            <div>
                <label class="block text-xs text-gray-400 mb-1.5">Destination</label>
                <input type="text" name="destination" value="GHTMA — Tema" class="w-full px-3 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
            </div>
            <div>
                <label class="block text-xs text-gray-400 mb-1.5">ETA</label>
                <input type="date" name="eta" class="w-full px-3 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
            </div>
        </div>
        <div class="flex justify-end gap-3 mt-4">
            <button type="button" onclick="document.getElementById('newLotModal').close()" class="px-4 py-2 text-sm text-gray-400 hover:text-white">Cancel</button>
            <button type="submit" class="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold rounded-lg">Create Lot</button>
        </div>
    </form>
</dialog>
@endsection
