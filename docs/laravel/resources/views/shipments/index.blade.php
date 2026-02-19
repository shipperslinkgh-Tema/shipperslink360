@extends('layouts.app')

@section('title', 'Shipments')

@section('content')
<div class="space-y-6">

    {{-- Header --}}
    <div class="flex items-center justify-between">
        <div>
            <h1 class="text-2xl font-bold text-white">Shipments</h1>
            <p class="text-sm text-gray-400 mt-1">Manage all freight shipments</p>
        </div>
        <a href="{{ route('shipments.create') }}"
           class="btn-primary flex items-center gap-2">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
            </svg>
            New Shipment
        </a>
    </div>

    {{-- Stats Row --}}
    <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
        @php
            $statCards = [
                ['label' => 'Total Active',    'value' => $stats['active'] ?? 0,    'color' => 'blue'],
                ['label' => 'At Port',         'value' => $stats['at_port'] ?? 0,   'color' => 'amber'],
                ['label' => 'In Transit',      'value' => $stats['in_transit'] ?? 0,'color' => 'cyan'],
                ['label' => 'Delivered',       'value' => $stats['delivered'] ?? 0, 'color' => 'green'],
            ];
        @endphp
        @foreach($statCards as $s)
        <div class="card p-4">
            <p class="text-xs text-gray-400 uppercase tracking-wide">{{ $s['label'] }}</p>
            <p class="text-2xl font-bold text-white mt-1">{{ number_format($s['value']) }}</p>
        </div>
        @endforeach
    </div>

    {{-- Filters --}}
    <div class="card p-4">
        <form method="GET" action="{{ route('shipments.index') }}" class="flex flex-wrap gap-3 items-end">
            <div class="flex-1 min-w-[200px]">
                <label class="label">Search</label>
                <input type="text" name="search" value="{{ request('search') }}"
                       placeholder="BL, container, customer…"
                       class="input w-full">
            </div>
            <div class="w-40">
                <label class="label">Type</label>
                <select name="type" class="input w-full">
                    <option value="">All Types</option>
                    <option value="fcl_sea" @selected(request('type') === 'fcl_sea')>FCL Sea</option>
                    <option value="lcl_sea" @selected(request('type') === 'lcl_sea')>LCL Sea</option>
                    <option value="air"     @selected(request('type') === 'air')>Air</option>
                    <option value="road"    @selected(request('type') === 'road')>Road</option>
                </select>
            </div>
            <div class="w-40">
                <label class="label">Status</label>
                <select name="status" class="input w-full">
                    <option value="">All Statuses</option>
                    @foreach(config('shipperlink.shipment_statuses', []) as $status)
                        <option value="{{ $status }}" @selected(request('status') === $status)>
                            {{ ucwords(str_replace('_', ' ', $status)) }}
                        </option>
                    @endforeach
                </select>
            </div>
            <div class="w-36">
                <label class="label">Date From</label>
                <input type="date" name="date_from" value="{{ request('date_from') }}" class="input w-full">
            </div>
            <div class="w-36">
                <label class="label">Date To</label>
                <input type="date" name="date_to" value="{{ request('date_to') }}" class="input w-full">
            </div>
            <div class="flex gap-2">
                <button type="submit" class="btn-primary">Filter</button>
                <a href="{{ route('shipments.index') }}" class="btn-ghost">Clear</a>
            </div>
        </form>
    </div>

    {{-- Table --}}
    <div class="card overflow-hidden">
        <div class="overflow-x-auto">
            <table class="w-full text-sm">
                <thead>
                    <tr class="border-b border-white/10">
                        <th class="th">Ref / BL</th>
                        <th class="th">Customer</th>
                        <th class="th">Type</th>
                        <th class="th">Origin → Destination</th>
                        <th class="th">ETA</th>
                        <th class="th">Status</th>
                        <th class="th">Officer</th>
                        <th class="th text-right">Actions</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-white/5">
                    @forelse($shipments as $shipment)
                    <tr class="table-row-hover">
                        <td class="td">
                            <div class="font-mono text-blue-400 font-medium">
                                {{ $shipment->shipment_ref }}
                            </div>
                            @if($shipment->bl_number)
                            <div class="text-xs text-gray-500 mt-0.5">{{ $shipment->bl_number }}</div>
                            @endif
                        </td>
                        <td class="td">
                            <div class="font-medium text-white">{{ $shipment->customer_name }}</div>
                            @if($shipment->container_number)
                            <div class="text-xs text-gray-500">{{ $shipment->container_number }}</div>
                            @endif
                        </td>
                        <td class="td">
                            @php
                                $typeColors = [
                                    'fcl_sea' => 'bg-blue-500/20 text-blue-400',
                                    'lcl_sea' => 'bg-cyan-500/20 text-cyan-400',
                                    'air'     => 'bg-purple-500/20 text-purple-400',
                                    'road'    => 'bg-amber-500/20 text-amber-400',
                                ];
                                $typeColor = $typeColors[$shipment->shipment_type] ?? 'bg-gray-500/20 text-gray-400';
                            @endphp
                            <span class="badge {{ $typeColor }} text-xs">
                                {{ strtoupper(str_replace('_', ' ', $shipment->shipment_type)) }}
                            </span>
                        </td>
                        <td class="td text-gray-300">
                            {{ $shipment->origin_port ?? $shipment->origin_country }}
                            <span class="text-gray-500 mx-1">→</span>
                            {{ $shipment->destination_port ?? 'Tema' }}
                        </td>
                        <td class="td text-gray-300">
                            @if($shipment->eta)
                                {{ \Carbon\Carbon::parse($shipment->eta)->format('d M Y') }}
                                @if(\Carbon\Carbon::parse($shipment->eta)->isPast() && $shipment->status !== 'delivered')
                                    <span class="text-red-400 text-xs block">Overdue</span>
                                @endif
                            @else
                                <span class="text-gray-500">—</span>
                            @endif
                        </td>
                        <td class="td">
                            @include('components.badge', ['status' => $shipment->status, 'type' => 'shipment'])
                        </td>
                        <td class="td text-gray-300 text-xs">
                            {{ $shipment->assigned_officer ?? '—' }}
                        </td>
                        <td class="td">
                            <div class="flex items-center justify-end gap-2">
                                <a href="{{ route('shipments.show', $shipment) }}"
                                   class="icon-btn" title="View">
                                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                                    </svg>
                                </a>
                                <a href="{{ route('shipments.edit', $shipment) }}"
                                   class="icon-btn" title="Edit">
                                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                                    </svg>
                                </a>
                                @can('delete', $shipment)
                                <form method="POST" action="{{ route('shipments.destroy', $shipment) }}"
                                      onsubmit="return confirm('Delete this shipment?')">
                                    @csrf @method('DELETE')
                                    <button class="icon-btn text-red-400 hover:text-red-300" title="Delete">
                                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                                        </svg>
                                    </button>
                                </form>
                                @endcan
                            </div>
                        </td>
                    </tr>
                    @empty
                    <tr>
                        <td colspan="8" class="td text-center py-16">
                            @include('components.empty-state', [
                                'title'   => 'No shipments found',
                                'message' => 'Try adjusting your search filters or create a new shipment.',
                                'action'  => ['url' => route('shipments.create'), 'label' => 'New Shipment'],
                            ])
                        </td>
                    </tr>
                    @endforelse
                </tbody>
            </table>
        </div>

        @if($shipments->hasPages())
        <div class="p-4 border-t border-white/10">
            {{ $shipments->withQueryString()->links() }}
        </div>
        @endif
    </div>
</div>
@endsection
