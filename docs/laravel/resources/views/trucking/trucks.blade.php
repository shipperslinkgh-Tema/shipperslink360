@extends('layouts.app')

@section('title', 'Fleet Management')

@section('content')
<div class="space-y-6">

    {{-- Header --}}
    <div class="flex items-center justify-between">
        <div>
            <h1 class="text-2xl font-bold text-white">Fleet Management</h1>
            <p class="text-sm text-gray-400">Manage your truck fleet and drivers</p>
        </div>
        <button onclick="document.getElementById('addTruckModal').dispatchEvent(new CustomEvent('open'))"
                class="btn-primary flex items-center gap-2">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
            </svg>
            Add Truck
        </button>
    </div>

    {{-- Stats --}}
    <div class="grid grid-cols-2 md:grid-cols-5 gap-4">
        @php
            $fleetStats = [
                ['label' => 'Total Fleet',   'value' => $fleet->total(),                          'color' => 'gray'],
                ['label' => 'Available',     'value' => $fleet->where('status','available')->count(), 'color' => 'green'],
                ['label' => 'On Trip',       'value' => $fleet->where('status','on_trip')->count(),   'color' => 'blue'],
                ['label' => 'Maintenance',   'value' => $fleet->where('status','maintenance')->count(),'color' => 'amber'],
                ['label' => 'Retired',       'value' => $fleet->where('status','retired')->count(),   'color' => 'red'],
            ];
        @endphp
        @foreach($fleetStats as $s)
        <div class="card p-4 text-center">
            <p class="text-2xl font-bold text-white">{{ $s['value'] }}</p>
            <p class="text-xs text-gray-400 mt-1">{{ $s['label'] }}</p>
        </div>
        @endforeach
    </div>

    {{-- Fleet Table --}}
    <div class="card overflow-hidden">
        <div class="flex items-center justify-between px-6 py-4 border-b border-white/10">
            <h2 class="font-semibold text-white">All Trucks</h2>
            <form method="GET" class="flex gap-2">
                <input type="text" name="search" value="{{ request('search') }}"
                       placeholder="Search trucks…" class="input text-sm w-48">
                <select name="status" class="input text-sm w-36">
                    <option value="">All Statuses</option>
                    @foreach(['available','on_trip','maintenance','retired'] as $s)
                        <option value="{{ $s }}" @selected(request('status') === $s)>{{ ucwords(str_replace('_',' ',$s)) }}</option>
                    @endforeach
                </select>
                <button type="submit" class="btn-primary text-sm">Filter</button>
            </form>
        </div>
        <div class="overflow-x-auto">
            <table class="w-full text-sm">
                <thead>
                    <tr class="border-b border-white/10">
                        <th class="th">Registration</th>
                        <th class="th">Make / Model</th>
                        <th class="th">Type</th>
                        <th class="th">Driver</th>
                        <th class="th">Insurance Expiry</th>
                        <th class="th">Roadworthy Expiry</th>
                        <th class="th">Status</th>
                        <th class="th text-right">Actions</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-white/5">
                    @forelse($fleet as $truck)
                    <tr class="table-row-hover">
                        <td class="td font-mono text-blue-400 font-medium">{{ $truck->registration_number }}</td>
                        <td class="td text-gray-300">{{ $truck->make }} {{ $truck->model }} ({{ $truck->year }})</td>
                        <td class="td text-gray-400 text-xs uppercase">{{ str_replace('_',' ',$truck->type) }}</td>
                        <td class="td">
                            @if($truck->driver_name)
                                <div class="text-white text-sm">{{ $truck->driver_name }}</div>
                                <div class="text-xs text-gray-500">{{ $truck->driver_phone }}</div>
                            @else
                                <span class="text-gray-500">—</span>
                            @endif
                        </td>
                        <td class="td">
                            @if($truck->insurance_expiry)
                                @php $exp = \Carbon\Carbon::parse($truck->insurance_expiry); @endphp
                                <span class="{{ $exp->isPast() ? 'text-red-400' : ($exp->diffInDays() < 30 ? 'text-amber-400' : 'text-gray-300') }}">
                                    {{ $exp->format('d M Y') }}
                                </span>
                            @else
                                <span class="text-gray-500">—</span>
                            @endif
                        </td>
                        <td class="td">
                            @if($truck->roadworthy_expiry)
                                @php $rw = \Carbon\Carbon::parse($truck->roadworthy_expiry); @endphp
                                <span class="{{ $rw->isPast() ? 'text-red-400' : ($rw->diffInDays() < 30 ? 'text-amber-400' : 'text-gray-300') }}">
                                    {{ $rw->format('d M Y') }}
                                </span>
                            @else
                                <span class="text-gray-500">—</span>
                            @endif
                        </td>
                        <td class="td">@include('components.badge', ['status' => $truck->status])</td>
                        <td class="td">
                            <div class="flex items-center justify-end gap-2">
                                <a href="{{ route('trucking.trucks.show', $truck) }}" class="icon-btn" title="View">
                                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0zM2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                                    </svg>
                                </a>
                                <a href="{{ route('trucking.trucks.edit', $truck) }}" class="icon-btn" title="Edit">
                                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                                    </svg>
                                </a>
                                <form method="POST" action="{{ route('trucking.trucks.destroy', $truck) }}"
                                      onsubmit="return confirm('Remove this truck?')">
                                    @csrf @method('DELETE')
                                    <button class="icon-btn text-red-400 hover:text-red-300" title="Delete">
                                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                                        </svg>
                                    </button>
                                </form>
                            </div>
                        </td>
                    </tr>
                    @empty
                    <tr>
                        <td colspan="8" class="td text-center py-12 text-gray-500">No trucks found</td>
                    </tr>
                    @endforelse
                </tbody>
            </table>
        </div>
        @if($fleet->hasPages())
        <div class="p-4 border-t border-white/10">
            {{ $fleet->withQueryString()->links() }}
        </div>
        @endif
    </div>
</div>
@endsection
