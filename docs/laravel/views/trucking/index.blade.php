@extends('layouts.app')
@section('title', 'Trucking & Fleet')
@section('page-title', 'Trucking')

@section('content')
<div class="mb-6">
    <h1 class="text-xl font-bold text-white">Trucking & Fleet Management</h1>
    <p class="text-sm text-gray-400 mt-0.5">Fleet status, driver assignments, and trip tracking</p>
</div>

{{-- Stats --}}
<div class="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
    @include('components.stat-card', ['label' => 'Total Trucks',    'value' => $stats['total_trucks'] ?? 0,    'badge' => 'trucking', 'trend' => ($stats['active_trucks'] ?? 0) . ' active today',   'positive' => true])
    @include('components.stat-card', ['label' => 'Active Trips',   'value' => $stats['active_trips'] ?? 0,   'badge' => 'trucking', 'trend' => 'In progress now',                                  'positive' => true])
    @include('components.stat-card', ['label' => 'Total Drivers',  'value' => $stats['total_drivers'] ?? 0, 'badge' => 'trucking', 'trend' => ($stats['on_duty'] ?? 0) . ' on duty',               'positive' => true])
    @include('components.stat-card', ['label' => 'Revenue (Month)','value' => 'GHS ' . number_format($stats['monthly_revenue'] ?? 0, 0), 'badge' => 'finance', 'trend' => 'Trucking revenue', 'positive' => true])
</div>

{{-- Tabs --}}
<div x-data="{ tab: 'fleet' }" >
    <div class="border-b border-gray-800 mb-6">
        <nav class="flex gap-1">
            @foreach(['fleet' => 'Fleet', 'trips' => 'Trips', 'drivers' => 'Drivers'] as $key => $label)
                <button @click="tab = '{{ $key }}'"
                        :class="tab === '{{ $key }}' ? 'border-b-2 border-blue-500 text-blue-400' : 'text-gray-500 hover:text-gray-300'"
                        class="px-4 py-3 text-sm font-medium transition-colors">
                    {{ $label }}
                </button>
            @endforeach
        </nav>
    </div>

    {{-- Fleet Table --}}
    <div x-show="tab === 'fleet'">
        <div class="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
            <table class="w-full text-sm">
                <thead>
                    <tr class="border-b border-gray-800 text-xs text-gray-500 uppercase tracking-wider">
                        <th class="px-6 py-3 text-left font-medium">Truck / Plate</th>
                        <th class="px-6 py-3 text-left font-medium">Type</th>
                        <th class="px-6 py-3 text-left font-medium hidden md:table-cell">Capacity</th>
                        <th class="px-6 py-3 text-left font-medium hidden lg:table-cell">Assigned Driver</th>
                        <th class="px-6 py-3 text-left font-medium">Status</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-gray-800">
                    @forelse($trucks ?? [] as $truck)
                        <tr class="hover:bg-gray-800/40 transition-colors">
                            <td class="px-6 py-4">
                                <p class="text-white font-medium">{{ $truck->truck_name ?? $truck->plate_number }}</p>
                                <p class="text-xs text-gray-400 font-mono">{{ $truck->plate_number }}</p>
                            </td>
                            <td class="px-6 py-4 text-gray-300">{{ $truck->truck_type }}</td>
                            <td class="px-6 py-4 text-gray-300 hidden md:table-cell">{{ $truck->capacity_tons ?? '—' }} tons</td>
                            <td class="px-6 py-4 text-gray-300 hidden lg:table-cell">{{ $truck->driver?->name ?? '—' }}</td>
                            <td class="px-6 py-4">
                                <span class="px-2 py-0.5 text-xs rounded-full
                                    {{ $truck->status === 'available' ? 'bg-emerald-500/20 text-emerald-400' :
                                       ($truck->status === 'on_trip' ? 'bg-blue-500/20 text-blue-400' :
                                        ($truck->status === 'maintenance' ? 'bg-orange-500/20 text-orange-400' : 'bg-gray-700 text-gray-400')) }}">
                                    {{ ucwords(str_replace('_',' ',$truck->status)) }}
                                </span>
                            </td>
                        </tr>
                    @empty
                        <tr><td colspan="5">@include('components.empty-state', ['message' => 'No trucks in fleet'])</td></tr>
                    @endforelse
                </tbody>
            </table>
        </div>
    </div>

    {{-- Trips Table --}}
    <div x-show="tab === 'trips'">
        <div class="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
            <table class="w-full text-sm">
                <thead>
                    <tr class="border-b border-gray-800 text-xs text-gray-500 uppercase tracking-wider">
                        <th class="px-6 py-3 text-left font-medium">Trip Ref</th>
                        <th class="px-6 py-3 text-left font-medium">Truck</th>
                        <th class="px-6 py-3 text-left font-medium hidden md:table-cell">Driver</th>
                        <th class="px-6 py-3 text-left font-medium hidden lg:table-cell">Route</th>
                        <th class="px-6 py-3 text-left font-medium hidden lg:table-cell">Customer</th>
                        <th class="px-6 py-3 text-left font-medium">Status</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-gray-800">
                    @forelse($trips ?? [] as $trip)
                        <tr class="hover:bg-gray-800/40 transition-colors">
                            <td class="px-6 py-4 font-mono text-xs text-blue-400">{{ $trip->trip_ref }}</td>
                            <td class="px-6 py-4 text-white font-mono text-xs">{{ $trip->truck?->plate_number }}</td>
                            <td class="px-6 py-4 text-gray-300 hidden md:table-cell">{{ $trip->driver?->name ?? '—' }}</td>
                            <td class="px-6 py-4 text-gray-300 text-xs hidden lg:table-cell">{{ $trip->origin }} → {{ $trip->destination }}</td>
                            <td class="px-6 py-4 text-gray-300 hidden lg:table-cell">{{ $trip->customer_name ?? '—' }}</td>
                            <td class="px-6 py-4">@include('components.badge', ['status' => $trip->status, 'type' => 'trip'])</td>
                        </tr>
                    @empty
                        <tr><td colspan="6">@include('components.empty-state', ['message' => 'No trips found'])</td></tr>
                    @endforelse
                </tbody>
            </table>
        </div>
    </div>

    {{-- Drivers Table --}}
    <div x-show="tab === 'drivers'">
        <div class="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
            <table class="w-full text-sm">
                <thead>
                    <tr class="border-b border-gray-800 text-xs text-gray-500 uppercase tracking-wider">
                        <th class="px-6 py-3 text-left font-medium">Driver</th>
                        <th class="px-6 py-3 text-left font-medium hidden md:table-cell">License</th>
                        <th class="px-6 py-3 text-left font-medium hidden md:table-cell">Phone</th>
                        <th class="px-6 py-3 text-left font-medium hidden lg:table-cell">Assigned Truck</th>
                        <th class="px-6 py-3 text-left font-medium">Status</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-gray-800">
                    @forelse($drivers ?? [] as $driver)
                        <tr class="hover:bg-gray-800/40 transition-colors">
                            <td class="px-6 py-4">
                                <p class="text-white font-medium">{{ $driver->name }}</p>
                                <p class="text-xs text-gray-400">{{ $driver->employee_id ?? '' }}</p>
                            </td>
                            <td class="px-6 py-4 text-gray-300 font-mono text-xs hidden md:table-cell">{{ $driver->license_number }}</td>
                            <td class="px-6 py-4 text-gray-300 hidden md:table-cell">{{ $driver->phone }}</td>
                            <td class="px-6 py-4 text-gray-300 font-mono text-xs hidden lg:table-cell">{{ $driver->assignedTruck?->plate_number ?? '—' }}</td>
                            <td class="px-6 py-4">
                                <span class="px-2 py-0.5 text-xs rounded-full {{ $driver->is_available ? 'bg-emerald-500/20 text-emerald-400' : 'bg-yellow-500/20 text-yellow-400' }}">
                                    {{ $driver->is_available ? 'Available' : 'On Duty' }}
                                </span>
                            </td>
                        </tr>
                    @empty
                        <tr><td colspan="5">@include('components.empty-state', ['message' => 'No drivers found'])</td></tr>
                    @endforelse
                </tbody>
            </table>
        </div>
    </div>
</div>
@endsection
