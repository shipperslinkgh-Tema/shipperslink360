@extends('layouts.app')
@section('title', 'New ICUMS Filing')
@section('page-title', 'ICUMS Filing')

@section('content')
<div class="max-w-3xl mx-auto">
    <div class="flex items-center gap-4 mb-6">
        <a href="{{ route('icums.index') }}" class="text-gray-400 hover:text-white">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/></svg>
        </a>
        <h1 class="text-xl font-bold text-white">New ICUMS Declaration</h1>
    </div>

    <form method="POST" action="{{ route('icums.store') }}" class="space-y-6">
        @csrf

        <div class="bg-gray-900 border border-gray-800 rounded-xl p-6 space-y-4">
            <h2 class="text-sm font-semibold text-white">Declaration Details</h2>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label class="block text-xs text-gray-400 mb-1.5">BL / AWB Number <span class="text-red-400">*</span></label>
                    <input type="text" name="bl_number" value="{{ old('bl_number') }}" required
                           class="w-full px-3 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500">
                    @error('bl_number') <p class="text-red-400 text-xs mt-1">{{ $message }}</p> @enderror
                </div>
                <div>
                    <label class="block text-xs text-gray-400 mb-1.5">Customer <span class="text-red-400">*</span></label>
                    <select name="customer_id" required class="w-full px-3 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                        <option value="">Select customer…</option>
                        @foreach($customers ?? [] as $c)
                            <option value="{{ $c->id }}" {{ old('customer_id') == $c->id ? 'selected' : '' }}>{{ $c->company_name }}</option>
                        @endforeach
                    </select>
                </div>
                <div>
                    <label class="block text-xs text-gray-400 mb-1.5">Declaration Type</label>
                    <select name="declaration_type" class="w-full px-3 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                        @foreach(['import','export','transit','re_export'] as $t)
                            <option value="{{ $t }}" {{ old('declaration_type','import') === $t ? 'selected' : '' }}>{{ ucfirst(str_replace('_',' ',$t)) }}</option>
                        @endforeach
                    </select>
                </div>
                <div>
                    <label class="block text-xs text-gray-400 mb-1.5">HS Code</label>
                    <input type="text" name="hs_code" value="{{ old('hs_code') }}"
                           class="w-full px-3 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
                           placeholder="8471.30">
                </div>
                <div>
                    <label class="block text-xs text-gray-400 mb-1.5">CIF Value (USD)</label>
                    <input type="number" name="cif_value_usd" value="{{ old('cif_value_usd') }}" min="0" step="0.01"
                           class="w-full px-3 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                </div>
                <div>
                    <label class="block text-xs text-gray-400 mb-1.5">Exchange Rate (GHS/USD)</label>
                    <input type="number" name="exchange_rate" value="{{ old('exchange_rate', '15.00') }}" min="0.0001" step="0.0001"
                           class="w-full px-3 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                </div>
                <div>
                    <label class="block text-xs text-gray-400 mb-1.5">Import Duty Rate (%)</label>
                    <input type="number" name="duty_rate" value="{{ old('duty_rate', '20') }}" min="0" max="100" step="0.01"
                           class="w-full px-3 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                </div>
                <div>
                    <label class="block text-xs text-gray-400 mb-1.5">Container / Packages</label>
                    <input type="text" name="container_number" value="{{ old('container_number') }}"
                           class="w-full px-3 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500">
                </div>
                <div class="md:col-span-2">
                    <label class="block text-xs text-gray-400 mb-1.5">Goods Description <span class="text-red-400">*</span></label>
                    <textarea name="goods_description" rows="2" required
                              class="w-full px-3 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none">{{ old('goods_description') }}</textarea>
                </div>
                <div class="md:col-span-2">
                    <label class="block text-xs text-gray-400 mb-1.5">Notes</label>
                    <textarea name="notes" rows="2"
                              class="w-full px-3 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none">{{ old('notes') }}</textarea>
                </div>
            </div>
        </div>

        <div class="flex items-center justify-end gap-3">
            <a href="{{ route('icums.index') }}" class="px-4 py-2 text-sm text-gray-400 hover:text-white">Cancel</a>
            <button type="submit" class="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold rounded-lg transition-colors">
                Submit Declaration
            </button>
        </div>
    </form>
</div>
@endsection
