@extends('layouts.app')
@section('title', 'GPHA Port Status')
@section('page-title', 'GPHA Port Status')

@section('content')
<div class="flex flex-wrap items-center justify-between gap-4 mb-6">
    <div>
        <h1 class="text-xl font-bold text-white">GPHA Port Status</h1>
        <p class="text-sm text-gray-400 mt-0.5">Ghana Ports and Harbours Authority — Tema Port vessel & cargo status</p>
    </div>
    <div class="flex items-center gap-2">
        <span class="flex items-center gap-1.5 text-xs text-emerald-400">
            <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            Port Online
        </span>
        <button onclick="window.location.reload()" class="px-4 py-2 bg-gray-800 hover:bg-gray-700 border border-gray-700 text-white text-sm rounded-lg transition-colors">
            Refresh
        </button>
    </div>
</div>

{{-- Stats --}}
<div class="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
    @include('components.stat-card', ['label' => 'Vessels in Port',  'value' => $portStats['vessels_in_port'] ?? 0,  'badge' => 'port', 'trend' => 'Active at anchorage/berth', 'positive' => true])
    @include('components.stat-card', ['label' => 'Expected Today',   'value' => $portStats['expected_today'] ?? 0,   'badge' => 'port', 'trend' => 'Estimated arrivals',          'positive' => true])
    @include('components.stat-card', ['label' => 'Containers Gated', 'value' => $portStats['gated_out'] ?? 0,        'badge' => 'port', 'trend' => 'Last 24 hours',               'positive' => true])
    @include('components.stat-card', ['label' => 'Our Cargo Dwell',  'value' => ($portStats['avg_dwell'] ?? 0) . ' days', 'badge' => 'port', 'trend' => 'Average dwell time', 'positive' => ($portStats['avg_dwell'] ?? 0) <= 5])
</div>

{{-- Vessel List --}}
<div class="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden mb-6">
    <div class="px-6 py-4 border-b border-gray-800">
        <h2 class="text-sm font-semibold text-white">Vessels at Tema Port</h2>
    </div>
    <div class="overflow-x-auto">
        <table class="w-full text-sm">
            <thead>
                <tr class="border-b border-gray-800 text-xs text-gray-500 uppercase tracking-wider">
                    <th class="px-6 py-3 text-left font-medium">Vessel Name</th>
                    <th class="px-6 py-3 text-left font-medium">Voyage</th>
                    <th class="px-6 py-3 text-left font-medium hidden md:table-cell">ETA / ATA</th>
                    <th class="px-6 py-3 text-left font-medium hidden lg:table-cell">Berth</th>
                    <th class="px-6 py-3 text-left font-medium">Status</th>
                </tr>
            </thead>
            <tbody class="divide-y divide-gray-800">
                @forelse($vessels ?? [] as $vessel)
                    <tr class="hover:bg-gray-800/40 transition-colors">
                        <td class="px-6 py-4">
                            <p class="text-white font-medium">{{ $vessel['name'] }}</p>
                            <p class="text-xs text-gray-400">{{ $vessel['shipping_line'] ?? '' }}</p>
                        </td>
                        <td class="px-6 py-4 font-mono text-xs text-gray-300">{{ $vessel['voyage'] }}</td>
                        <td class="px-6 py-4 text-gray-300 text-xs hidden md:table-cell">{{ $vessel['eta'] ?? $vessel['ata'] ?? '—' }}</td>
                        <td class="px-6 py-4 text-gray-300 hidden lg:table-cell">{{ $vessel['berth'] ?? '—' }}</td>
                        <td class="px-6 py-4">
                            <span class="px-2 py-0.5 text-xs rounded-full
                                {{ $vessel['status'] === 'at_berth' ? 'bg-emerald-500/20 text-emerald-400' :
                                   ($vessel['status'] === 'at_anchorage' ? 'bg-yellow-500/20 text-yellow-400' :
                                    'bg-blue-500/20 text-blue-400') }}">
                                {{ ucwords(str_replace('_', ' ', $vessel['status'])) }}
                            </span>
                        </td>
                    </tr>
                @empty
                    <tr><td colspan="5">@include('components.empty-state', ['message' => 'No vessel data available'])</td></tr>
                @endforelse
            </tbody>
        </table>
    </div>
</div>

{{-- Our Cargo Status --}}
<div class="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
    <div class="px-6 py-4 border-b border-gray-800">
        <h2 class="text-sm font-semibold text-white">Our Cargo at Port</h2>
        <p class="text-xs text-gray-500 mt-0.5">Containers tracked under SLAC FreightLink</p>
    </div>
    <div class="divide-y divide-gray-800">
        @forelse($ourCargo ?? [] as $cargo)
            <div class="flex items-center justify-between px-6 py-3.5">
                <div>
                    <p class="text-sm font-mono text-white">{{ $cargo['container'] }}</p>
                    <p class="text-xs text-gray-400">{{ $cargo['customer'] }} · BL: {{ $cargo['bl_number'] }}</p>
                </div>
                <div class="text-right">
                    <p class="text-xs text-gray-300">{{ $cargo['dwell_days'] ?? 0 }} days at port</p>
                    <span class="text-xs {{ ($cargo['dwell_days'] ?? 0) > 5 ? 'text-red-400' : 'text-emerald-400' }}">
                        {{ ($cargo['dwell_days'] ?? 0) > 5 ? '⚠ Demurrage Risk' : '✓ Within Free Days' }}
                    </span>
                </div>
            </div>
        @empty
            @include('components.empty-state', ['message' => 'No containers currently tracked at port'])
        @endforelse
    </div>
</div>
@endsection
