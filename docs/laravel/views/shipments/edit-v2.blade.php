{{--
  shipments/edit.blade.php
  Edit an existing shipment — pre-populated form.
--}}
@extends('layouts.app')
@section('title', 'Edit ' . $shipment->bl_number . ' — FreightLink 360')

@section('content')
<div class="max-w-4xl mx-auto space-y-6"
     x-data="{ type: '{{ old('type', $shipment->type ?? 'sea') }}' }">

    {{-- Page header --}}
    <div class="flex items-center gap-4">
        <a href="{{ route('shipments.show', $shipment) }}" class="btn btn-ghost btn-icon">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
            </svg>
        </a>
        <div>
            <h1 class="page-title">Edit Shipment</h1>
            <p class="text-sm text-gray-400 mt-0.5 font-mono">{{ $shipment->bl_number }}</p>
        </div>
    </div>

    <form action="{{ route('shipments.update', $shipment) }}" method="POST" enctype="multipart/form-data">
        @csrf
        @method('PUT')
        <input type="hidden" name="type" :value="type">

        {{-- Type selector --}}
        <div class="card mb-4">
            <p class="label mb-3">Shipment Type</p>
            <div class="grid grid-cols-2 gap-3">
                <label class="relative flex cursor-pointer rounded-xl border-2 p-4 transition-all"
                       :class="type === 'sea' ? 'border-brand-500 bg-brand-500/10' : 'border-gray-600 hover:border-gray-500'"
                       @click="type = 'sea'">
                    <div class="flex items-center gap-3">
                        <span class="text-2xl">🚢</span>
                        <div>
                            <p class="font-semibold text-gray-100">Sea Freight</p>
                            <p class="text-xs text-gray-400">FCL / LCL containers</p>
                        </div>
                    </div>
                </label>
                <label class="relative flex cursor-pointer rounded-xl border-2 p-4 transition-all"
                       :class="type === 'air' ? 'border-brand-500 bg-brand-500/10' : 'border-gray-600 hover:border-gray-500'"
                       @click="type = 'air'">
                    <div class="flex items-center gap-3">
                        <span class="text-2xl">✈️</span>
                        <div>
                            <p class="font-semibold text-gray-100">Air Freight</p>
                            <p class="text-xs text-gray-400">Express & standard air cargo</p>
                        </div>
                    </div>
                </label>
            </div>
        </div>

        {{-- Main form --}}
        <div class="card space-y-6">
            <h2 class="section-title">General Information</h2>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                    <label class="label" for="customer_id">Customer <span class="text-danger-DEFAULT">*</span></label>
                    <select id="customer_id" name="customer_id" class="select @error('customer_id') input-error @enderror" required>
                        @foreach($customers as $c)
                            <option value="{{ $c->id }}" {{ old('customer_id', $shipment->customer_id) == $c->id ? 'selected' : '' }}>
                                {{ $c->name }} ({{ $c->code }})
                            </option>
                        @endforeach
                    </select>
                    @error('customer_id')<p class="mt-1 text-xs text-danger-DEFAULT">{{ $message }}</p>@enderror
                </div>

                <div>
                    <label class="label" for="bl_number">
                        <span x-text="type === 'sea' ? 'B/L Number' : 'AWB Number'"></span> *
                    </label>
                    <input type="text" id="bl_number" name="bl_number"
                           class="input @error('bl_number') input-error @enderror"
                           value="{{ old('bl_number', $shipment->bl_number) }}" required>
                    @error('bl_number')<p class="mt-1 text-xs text-danger-DEFAULT">{{ $message }}</p>@enderror
                </div>

                <div>
                    <label class="label" for="origin">Origin <span class="text-danger-DEFAULT">*</span></label>
                    <input type="text" id="origin" name="origin"
                           class="input @error('origin') input-error @enderror"
                           value="{{ old('origin', $shipment->origin) }}" required>
                    @error('origin')<p class="mt-1 text-xs text-danger-DEFAULT">{{ $message }}</p>@enderror
                </div>

                <div>
                    <label class="label" for="destination">Destination <span class="text-danger-DEFAULT">*</span></label>
                    <input type="text" id="destination" name="destination"
                           class="input @error('destination') input-error @enderror"
                           value="{{ old('destination', $shipment->destination) }}" required>
                    @error('destination')<p class="mt-1 text-xs text-danger-DEFAULT">{{ $message }}</p>@enderror
                </div>

                <div>
                    <label class="label" for="status">Status <span class="text-danger-DEFAULT">*</span></label>
                    <select id="status" name="status" class="select @error('status') input-error @enderror" required>
                        @foreach(config('shipperlink.shipment_statuses') as $val => $label)
                            <option value="{{ $val }}" {{ old('status', $shipment->status) == $val ? 'selected' : '' }}>
                                {{ $label }}
                            </option>
                        @endforeach
                    </select>
                    @error('status')<p class="mt-1 text-xs text-danger-DEFAULT">{{ $message }}</p>@enderror
                </div>

                <div>
                    <label class="label" for="eta">ETA</label>
                    <input type="date" id="eta" name="eta"
                           class="input @error('eta') input-error @enderror"
                           value="{{ old('eta', optional($shipment->eta)->format('Y-m-d')) }}">
                    @error('eta')<p class="mt-1 text-xs text-danger-DEFAULT">{{ $message }}</p>@enderror
                </div>

                <div>
                    <label class="label" for="ata">ATA (Actual Arrival)</label>
                    <input type="date" id="ata" name="ata"
                           class="input @error('ata') input-error @enderror"
                           value="{{ old('ata', optional($shipment->ata)->format('Y-m-d')) }}">
                    @error('ata')<p class="mt-1 text-xs text-danger-DEFAULT">{{ $message }}</p>@enderror
                </div>
            </div>

            {{-- Sea-specific --}}
            <div x-show="type === 'sea'" class="space-y-5 border-t border-gray-700 pt-5">
                <h3 class="text-sm font-semibold text-gray-300">Sea Freight Details</h3>
                <div class="grid grid-cols-1 md:grid-cols-3 gap-5">
                    <div>
                        <label class="label" for="vessel_name">Vessel Name</label>
                        <input type="text" id="vessel_name" name="vessel_name"
                               class="input" value="{{ old('vessel_name', $shipment->vessel_name) }}">
                    </div>
                    <div>
                        <label class="label" for="voyage_number">Voyage Number</label>
                        <input type="text" id="voyage_number" name="voyage_number"
                               class="input" value="{{ old('voyage_number', $shipment->voyage_number) }}">
                    </div>
                    <div>
                        <label class="label" for="container_number">Container Number</label>
                        <input type="text" id="container_number" name="container_number"
                               class="input" value="{{ old('container_number', $shipment->container_number) }}">
                    </div>
                    <div>
                        <label class="label" for="container_size">Container Size</label>
                        <select id="container_size" name="container_size" class="select">
                            <option value="">Select…</option>
                            @foreach(['20GP','40GP','40HC','45HC','20RF','40RF','LCL'] as $sz)
                            <option value="{{ $sz }}" {{ old('container_size', $shipment->container_size) == $sz ? 'selected' : '' }}>
                                {{ $sz }}
                            </option>
                            @endforeach
                        </select>
                    </div>
                    <div>
                        <label class="label" for="shipping_line_id">Shipping Line</label>
                        <select id="shipping_line_id" name="shipping_line_id" class="select">
                            <option value="">Select…</option>
                            @foreach($shippingLines ?? [] as $sl)
                                <option value="{{ $sl->id }}" {{ old('shipping_line_id', $shipment->shipping_line_id) == $sl->id ? 'selected' : '' }}>
                                    {{ $sl->name }}
                                </option>
                            @endforeach
                        </select>
                    </div>
                    <div>
                        <label class="label" for="free_days">Free Days</label>
                        <input type="number" id="free_days" name="free_days"
                               class="input" value="{{ old('free_days', $shipment->free_days) }}" min="0">
                    </div>
                </div>
            </div>

            {{-- Air-specific --}}
            <div x-show="type === 'air'" class="space-y-5 border-t border-gray-700 pt-5">
                <h3 class="text-sm font-semibold text-gray-300">Air Freight Details</h3>
                <div class="grid grid-cols-1 md:grid-cols-3 gap-5">
                    <div>
                        <label class="label" for="airline">Airline</label>
                        <input type="text" id="airline" name="airline"
                               class="input" value="{{ old('airline', $shipment->airline) }}">
                    </div>
                    <div>
                        <label class="label" for="flight_number">Flight Number</label>
                        <input type="text" id="flight_number" name="flight_number"
                               class="input" value="{{ old('flight_number', $shipment->flight_number) }}">
                    </div>
                    <div>
                        <label class="label" for="pieces">Number of Pieces</label>
                        <input type="number" id="pieces" name="pieces"
                               class="input" value="{{ old('pieces', $shipment->pieces) }}" min="1">
                    </div>
                </div>
            </div>

            {{-- Cargo --}}
            <div class="border-t border-gray-700 pt-5 space-y-5">
                <h3 class="text-sm font-semibold text-gray-300">Cargo Details</h3>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div class="md:col-span-2">
                        <label class="label" for="cargo_description">Cargo Description</label>
                        <textarea id="cargo_description" name="cargo_description" rows="3"
                                  class="textarea">{{ old('cargo_description', $shipment->cargo_description) }}</textarea>
                    </div>
                    <div>
                        <label class="label" for="weight_kg">Weight (kg)</label>
                        <input type="number" id="weight_kg" name="weight_kg" step="0.001"
                               class="input" value="{{ old('weight_kg', $shipment->weight_kg) }}">
                    </div>
                    <div>
                        <label class="label" for="cbm">Volume (CBM)</label>
                        <input type="number" id="cbm" name="cbm" step="0.001"
                               class="input" value="{{ old('cbm', $shipment->cbm) }}">
                    </div>
                    <div>
                        <label class="label" for="hs_code">HS Code</label>
                        <input type="text" id="hs_code" name="hs_code"
                               class="input" value="{{ old('hs_code', $shipment->hs_code) }}">
                    </div>
                    <div>
                        <label class="label" for="declared_value">Declared Value (USD)</label>
                        <input type="number" id="declared_value" name="declared_value" step="0.01"
                               class="input" value="{{ old('declared_value', $shipment->declared_value) }}">
                    </div>
                    <div class="md:col-span-2">
                        <label class="label" for="notes">Internal Notes</label>
                        <textarea id="notes" name="notes" rows="3"
                                  class="textarea">{{ old('notes', $shipment->notes) }}</textarea>
                    </div>
                </div>
            </div>

            <div class="flex items-center justify-between pt-4 border-t border-gray-700">
                <a href="{{ route('shipments.show', $shipment) }}" class="btn btn-secondary">Cancel</a>
                <button type="submit" class="btn btn-primary">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                    </svg>
                    Save Changes
                </button>
            </div>
        </div>
    </form>
</div>
@endsection
