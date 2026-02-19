@extends('layouts.app')
@section('title', 'ICUMS — ' . ($declaration->entry_number ?? $declaration->bl_number))
@section('page-title', 'ICUMS Declaration')

@section('content')
<div class="max-w-4xl mx-auto">
    <div class="flex items-center gap-4 mb-6">
        <a href="{{ route('icums.index') }}" class="text-gray-400 hover:text-white">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/></svg>
        </a>
        <div>
            <h1 class="text-xl font-bold text-white">{{ $declaration->entry_number ?? 'Draft Filing' }}</h1>
            <p class="text-sm text-gray-400 mt-0.5 font-mono">{{ $declaration->bl_number }}</p>
        </div>
        <div class="ml-auto">@include('components.badge', ['status' => $declaration->status, 'type' => 'icums'])</div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div class="lg:col-span-2 bg-gray-900 border border-gray-800 rounded-xl p-6">
            <h2 class="text-sm font-semibold text-white mb-4">Declaration Details</h2>
            <dl class="grid grid-cols-2 gap-x-6 gap-y-4 text-sm">
                <div><dt class="text-xs text-gray-500 mb-0.5">Customer</dt><dd class="text-white">{{ $declaration->customer_name }}</dd></div>
                <div><dt class="text-xs text-gray-500 mb-0.5">Declaration Type</dt><dd class="text-white">{{ ucwords(str_replace('_',' ',$declaration->declaration_type)) }}</dd></div>
                <div><dt class="text-xs text-gray-500 mb-0.5">HS Code</dt><dd class="text-white font-mono">{{ $declaration->hs_code ?? '—' }}</dd></div>
                <div><dt class="text-xs text-gray-500 mb-0.5">Container</dt><dd class="text-white font-mono">{{ $declaration->container_number ?? '—' }}</dd></div>
                <div><dt class="text-xs text-gray-500 mb-0.5">CIF Value (USD)</dt><dd class="text-white">USD {{ number_format($declaration->cif_value_usd ?? 0, 2) }}</dd></div>
                <div><dt class="text-xs text-gray-500 mb-0.5">Exchange Rate</dt><dd class="text-white">{{ number_format($declaration->exchange_rate ?? 1, 4) }}</dd></div>
                <div><dt class="text-xs text-gray-500 mb-0.5">CIF (GHS)</dt><dd class="text-white font-semibold">GHS {{ number_format($declaration->cif_value_ghs ?? 0, 2) }}</dd></div>
                <div><dt class="text-xs text-gray-500 mb-0.5">Duty Rate</dt><dd class="text-white">{{ $declaration->duty_rate ?? 0 }}%</dd></div>
                @if($declaration->filed_date)
                    <div><dt class="text-xs text-gray-500 mb-0.5">Filed Date</dt><dd class="text-white">{{ \Carbon\Carbon::parse($declaration->filed_date)->format('d M Y') }}</dd></div>
                @endif
                <div class="col-span-2"><dt class="text-xs text-gray-500 mb-0.5">Goods Description</dt><dd class="text-gray-300">{{ $declaration->goods_description }}</dd></div>
            </dl>
        </div>

        <div class="space-y-4">
            <div class="bg-gray-900 border border-gray-800 rounded-xl p-6">
                <h2 class="text-sm font-semibold text-white mb-4">Duty Summary</h2>
                <div class="space-y-2 text-sm">
                    <div class="flex justify-between"><span class="text-gray-400">Import Duty</span><span class="text-white">GHS {{ number_format($declaration->import_duty ?? 0, 2) }}</span></div>
                    <div class="flex justify-between"><span class="text-gray-400">VAT (15%)</span><span class="text-white">GHS {{ number_format($declaration->vat_amount ?? 0, 2) }}</span></div>
                    <div class="flex justify-between"><span class="text-gray-400">NHIL (2.5%)</span><span class="text-white">GHS {{ number_format($declaration->nhil_amount ?? 0, 2) }}</span></div>
                    <div class="flex justify-between"><span class="text-gray-400">COVID Levy (1%)</span><span class="text-white">GHS {{ number_format($declaration->covid_levy ?? 0, 2) }}</span></div>
                    <div class="border-t border-gray-700 pt-2 flex justify-between font-semibold">
                        <span class="text-white">Total Duty</span>
                        <span class="text-blue-400">GHS {{ number_format($declaration->total_duty ?? 0, 2) }}</span>
                    </div>
                </div>
            </div>

            @if($declaration->status === 'draft')
                <form method="POST" action="{{ route('icums.submit', $declaration) }}">
                    @csrf
                    <button type="submit" class="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold rounded-lg transition-colors">
                        Submit to ICUMS
                    </button>
                </form>
            @endif
        </div>
    </div>
</div>
@endsection
