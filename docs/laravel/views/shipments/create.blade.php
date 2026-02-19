@extends('layouts.app')
@section('title', 'New Shipment')
@section('page-title', 'Create Shipment')

@section('content')
<div class="max-w-3xl mx-auto">
    <div class="flex items-center gap-4 mb-6">
        <a href="{{ route('shipments.index') }}" class="text-gray-400 hover:text-white transition-colors">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/></svg>
        </a>
        <div>
            <h1 class="text-xl font-bold text-white">New Shipment</h1>
            <p class="text-sm text-gray-400 mt-0.5">Register a new import or export shipment</p>
        </div>
    </div>

    <form method="POST" action="{{ route('shipments.store') }}" class="space-y-6">
        @csrf

        {{-- Shipment Type --}}
        <div class="bg-gray-900 border border-gray-800 rounded-xl p-6">
            <h2 class="text-sm font-semibold text-white mb-4">Shipment Type</h2>
            <div class="grid grid-cols-3 gap-3">
                @foreach(['sea_import' => '🚢 Sea Import', 'sea_export' => '🚢 Sea Export', 'air_import' => '✈️ Air Import', 'air_export' => '✈️ Air Export', 'road' => '🚛 Road', 'consolidation' => '📦 Consolidation'] as $val => $label)
                    <label class="cursor-pointer">
                        <input type="radio" name="shipment_type" value="{{ $val }}" {{ old('shipment_type', 'sea_import') === $val ? 'checked' : '' }} class="peer sr-only">
                        <div class="peer-checked:bg-blue-600/20 peer-checked:border-blue-500 border border-gray-700 rounded-lg p-3 text-center text-sm text-gray-300 hover:border-gray-500 transition-colors">
                            {{ $label }}
                        </div>
                    </label>
                @endforeach
            </div>
            @error('shipment_type') <p class="text-red-400 text-xs mt-1">{{ $message }}</p> @enderror
        </div>

        {{-- Core Details --}}
        <div class="bg-gray-900 border border-gray-800 rounded-xl p-6">
            <h2 class="text-sm font-semibold text-white mb-4">Shipment Details</h2>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label class="block text-xs text-gray-400 mb-1.5">BL / AWB Number <span class="text-red-400">*</span></label>
                    <input type="text" name="bl_number" value="{{ old('bl_number') }}" required
                           class="w-full px-3 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                           placeholder="MSCUXXXXXXXX">
                    @error('bl_number') <p class="text-red-400 text-xs mt-1">{{ $message }}</p> @enderror
                </div>
                <div>
                    <label class="block text-xs text-gray-400 mb-1.5">Container Number</label>
                    <input type="text" name="container_number" value="{{ old('container_number') }}"
                           class="w-full px-3 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                           placeholder="MSCU1234567">
                </div>
                <div>
                    <label class="block text-xs text-gray-400 mb-1.5">Customer <span class="text-red-400">*</span></label>
                    <select name="customer_id" required class="w-full px-3 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                        <option value="">Select customer…</option>
                        @foreach($customers ?? [] as $customer)
                            <option value="{{ $customer->id }}" {{ old('customer_id') == $customer->id ? 'selected' : '' }}>
                                {{ $customer->company_name }} ({{ $customer->customer_code }})
                            </option>
                        @endforeach
                    </select>
                    @error('customer_id') <p class="text-red-400 text-xs mt-1">{{ $message }}</p> @enderror
                </div>
                <div>
                    <label class="block text-xs text-gray-400 mb-1.5">Vessel / Flight</label>
                    <input type="text" name="vessel_name" value="{{ old('vessel_name') }}"
                           class="w-full px-3 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                           placeholder="MSC LORETTA">
                </div>
                <div>
                    <label class="block text-xs text-gray-400 mb-1.5">Origin Port <span class="text-red-400">*</span></label>
                    <input type="text" name="origin" value="{{ old('origin') }}" required
                           class="w-full px-3 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                           placeholder="CNSHA — Shanghai">
                    @error('origin') <p class="text-red-400 text-xs mt-1">{{ $message }}</p> @enderror
                </div>
                <div>
                    <label class="block text-xs text-gray-400 mb-1.5">Destination Port <span class="text-red-400">*</span></label>
                    <input type="text" name="destination" value="{{ old('destination', 'GHTMA — Tema') }}" required
                           class="w-full px-3 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                           placeholder="GHTMA — Tema">
                    @error('destination') <p class="text-red-400 text-xs mt-1">{{ $message }}</p> @enderror
                </div>
                <div>
                    <label class="block text-xs text-gray-400 mb-1.5">ETA</label>
                    <input type="date" name="eta" value="{{ old('eta') }}"
                           class="w-full px-3 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                </div>
                <div>
                    <label class="block text-xs text-gray-400 mb-1.5">Weight (KG)</label>
                    <input type="number" name="weight_kg" value="{{ old('weight_kg') }}" min="0" step="0.01"
                           class="w-full px-3 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                </div>
            </div>
            <div class="mt-4">
                <label class="block text-xs text-gray-400 mb-1.5">Cargo Description</label>
                <textarea name="cargo_description" rows="2" class="w-full px-3 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" placeholder="General merchandise…">{{ old('cargo_description') }}</textarea>
            </div>
            <div class="mt-4">
                <label class="block text-xs text-gray-400 mb-1.5">Notes</label>
                <textarea name="notes" rows="2" class="w-full px-3 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" placeholder="Internal notes…">{{ old('notes') }}</textarea>
            </div>
        </div>

        <div class="flex items-center justify-end gap-3">
            <a href="{{ route('shipments.index') }}" class="px-4 py-2 text-sm text-gray-400 hover:text-white transition-colors">Cancel</a>
            <button type="submit" class="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold rounded-lg transition-colors">
                Create Shipment
            </button>
        </div>
    </form>
</div>
@endsection
