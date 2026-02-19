@extends('layouts.app')
@section('title', 'Edit Shipment — ' . $shipment->bl_number)
@section('page-title', 'Edit Shipment')

@section('content')
<div class="max-w-3xl mx-auto">
    <div class="flex items-center gap-4 mb-6">
        <a href="{{ route('shipments.show', $shipment) }}" class="text-gray-400 hover:text-white transition-colors">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/></svg>
        </a>
        <div>
            <h1 class="text-xl font-bold text-white">Edit Shipment</h1>
            <p class="text-sm text-gray-400 mt-0.5 font-mono">{{ $shipment->bl_number }}</p>
        </div>
    </div>

    <form method="POST" action="{{ route('shipments.update', $shipment) }}" class="space-y-6">
        @csrf
        @method('PATCH')

        <div class="bg-gray-900 border border-gray-800 rounded-xl p-6 space-y-4">
            <h2 class="text-sm font-semibold text-white mb-2">Shipment Details</h2>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label class="block text-xs text-gray-400 mb-1.5">BL / AWB Number</label>
                    <input type="text" value="{{ $shipment->bl_number }}" disabled
                           class="w-full px-3 py-2.5 bg-gray-800/50 border border-gray-700 rounded-lg text-gray-400 text-sm font-mono cursor-not-allowed">
                </div>
                <div>
                    <label class="block text-xs text-gray-400 mb-1.5">Container Number</label>
                    <input type="text" name="container_number" value="{{ old('container_number', $shipment->container_number) }}"
                           class="w-full px-3 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500">
                </div>
                <div>
                    <label class="block text-xs text-gray-400 mb-1.5">Status</label>
                    <select name="status" class="w-full px-3 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                        @foreach(['pending','in_transit','at_port','customs_clearance','cleared','delivered','on_hold','cancelled'] as $s)
                            <option value="{{ $s }}" {{ old('status', $shipment->status) === $s ? 'selected' : '' }}>
                                {{ ucwords(str_replace('_', ' ', $s)) }}
                            </option>
                        @endforeach
                    </select>
                </div>
                <div>
                    <label class="block text-xs text-gray-400 mb-1.5">Vessel / Flight</label>
                    <input type="text" name="vessel_name" value="{{ old('vessel_name', $shipment->vessel_name) }}"
                           class="w-full px-3 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                </div>
                <div>
                    <label class="block text-xs text-gray-400 mb-1.5">ETA</label>
                    <input type="date" name="eta" value="{{ old('eta', $shipment->eta?->format('Y-m-d')) }}"
                           class="w-full px-3 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                </div>
                <div>
                    <label class="block text-xs text-gray-400 mb-1.5">ATA (Actual Arrival)</label>
                    <input type="date" name="ata" value="{{ old('ata', $shipment->ata?->format('Y-m-d')) }}"
                           class="w-full px-3 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                </div>
                <div>
                    <label class="block text-xs text-gray-400 mb-1.5">Origin</label>
                    <input type="text" name="origin" value="{{ old('origin', $shipment->origin) }}"
                           class="w-full px-3 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                </div>
                <div>
                    <label class="block text-xs text-gray-400 mb-1.5">Destination</label>
                    <input type="text" name="destination" value="{{ old('destination', $shipment->destination) }}"
                           class="w-full px-3 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                </div>
                <div>
                    <label class="block text-xs text-gray-400 mb-1.5">Weight (KG)</label>
                    <input type="number" name="weight_kg" value="{{ old('weight_kg', $shipment->weight_kg) }}" min="0" step="0.01"
                           class="w-full px-3 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                </div>
                <div>
                    <label class="block text-xs text-gray-400 mb-1.5">Voyage Number</label>
                    <input type="text" name="voyage_number" value="{{ old('voyage_number', $shipment->voyage_number) }}"
                           class="w-full px-3 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                </div>
            </div>
            <div>
                <label class="block text-xs text-gray-400 mb-1.5">Cargo Description</label>
                <textarea name="cargo_description" rows="2" class="w-full px-3 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none">{{ old('cargo_description', $shipment->cargo_description) }}</textarea>
            </div>
            <div>
                <label class="block text-xs text-gray-400 mb-1.5">Notes</label>
                <textarea name="notes" rows="2" class="w-full px-3 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none">{{ old('notes', $shipment->notes) }}</textarea>
            </div>
        </div>

        <div class="flex items-center justify-end gap-3">
            <a href="{{ route('shipments.show', $shipment) }}" class="px-4 py-2 text-sm text-gray-400 hover:text-white">Cancel</a>
            <button type="submit" class="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold rounded-lg transition-colors">
                Save Changes
            </button>
        </div>
    </form>
</div>
@endsection
