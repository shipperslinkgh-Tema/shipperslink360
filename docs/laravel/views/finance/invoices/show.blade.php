@extends('layouts.app')

@section('title', "Invoice {$invoice->invoice_number}")
@section('page-title', 'Invoice Detail')

@section('content')
<div class="max-w-4xl">
    <div class="flex items-center justify-between mb-6">
        <a href="{{ route('finance.index') }}" class="text-sm text-gray-400 hover:text-white transition-colors">← Back to Finance</a>
        <div class="flex items-center gap-2">
            @if($invoice->status === 'draft')
                <form method="POST" action="{{ route('finance.invoices.update', $invoice) }}">
                    @csrf @method('PUT')
                    <input type="hidden" name="status" value="sent" />
                    <button class="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold rounded-lg transition-colors">Send Invoice</button>
                </form>
            @endif
            @if(in_array($invoice->status, ['sent', 'partially_paid']))
                <button onclick="document.getElementById('pay-modal').classList.remove('hidden')"
                        class="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold rounded-lg transition-colors">
                    Record Payment
                </button>
            @endif
            @if($invoice->status !== 'paid' && $invoice->status !== 'cancelled')
                <form method="POST" action="{{ route('finance.invoices.cancel', $invoice) }}"
                      onsubmit="return confirm('Cancel this invoice?')">
                    @csrf
                    <button class="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white text-sm font-semibold rounded-lg transition-colors">Cancel</button>
                </form>
            @endif
        </div>
    </div>

    {{-- Invoice card --}}
    <div class="bg-gray-900 border border-gray-800 rounded-xl p-8 space-y-8">

        {{-- Header --}}
        <div class="flex items-start justify-between">
            <div>
                <p class="text-xs text-gray-500 uppercase tracking-wider mb-1">Invoice</p>
                <h1 class="text-2xl font-bold text-white font-mono">{{ $invoice->invoice_number }}</h1>
                <p class="text-sm text-gray-400 mt-1">{{ ucwords(str_replace('_', ' ', $invoice->invoice_type)) }} · {{ $invoice->service_type }}</p>
            </div>
            <div class="text-right">
                @include('components.badge', ['status' => $invoice->status, 'type' => 'invoice'])
                <p class="text-xs text-gray-500 mt-2">Issued: {{ \Carbon\Carbon::parse($invoice->issue_date)->format('d M Y') }}</p>
                <p class="text-xs {{ now()->isAfter($invoice->due_date) && $invoice->status !== 'paid' ? 'text-red-400' : 'text-gray-500' }} mt-0.5">
                    Due: {{ \Carbon\Carbon::parse($invoice->due_date)->format('d M Y') }}
                </p>
            </div>
        </div>

        {{-- Customer & refs --}}
        <div class="grid grid-cols-2 gap-6 py-6 border-y border-gray-800">
            <div>
                <p class="text-xs text-gray-500 uppercase tracking-wider mb-2">Bill To</p>
                <p class="text-white font-semibold">{{ $invoice->customer }}</p>
                <p class="text-sm text-gray-400 font-mono">{{ $invoice->customer_id }}</p>
            </div>
            <div class="space-y-2">
                @if($invoice->shipment_ref)
                    <div class="flex gap-2"><span class="text-xs text-gray-500 w-28">Shipment Ref:</span><span class="text-xs text-gray-300 font-mono">{{ $invoice->shipment_ref }}</span></div>
                @endif
                @if($invoice->job_ref)
                    <div class="flex gap-2"><span class="text-xs text-gray-500 w-28">Job Ref:</span><span class="text-xs text-gray-300 font-mono">{{ $invoice->job_ref }}</span></div>
                @endif
                @if($invoice->consolidation_ref)
                    <div class="flex gap-2"><span class="text-xs text-gray-500 w-28">Consolidation:</span><span class="text-xs text-gray-300 font-mono">{{ $invoice->consolidation_ref }}</span></div>
                @endif
            </div>
        </div>

        {{-- Amounts --}}
        <div class="space-y-3 max-w-xs ml-auto">
            <div class="flex justify-between text-sm">
                <span class="text-gray-400">Subtotal</span>
                <span class="text-white">{{ $invoice->currency }} {{ number_format($invoice->subtotal, 2) }}</span>
            </div>
            <div class="flex justify-between text-sm">
                <span class="text-gray-400">Tax (15%)</span>
                <span class="text-white">{{ $invoice->currency }} {{ number_format($invoice->tax_amount, 2) }}</span>
            </div>
            <div class="flex justify-between text-base font-bold border-t border-gray-700 pt-3">
                <span class="text-white">Total</span>
                <span class="text-white">{{ $invoice->currency }} {{ number_format($invoice->total_amount, 2) }}</span>
            </div>
            @if($invoice->currency !== 'GHS')
                <p class="text-xs text-gray-500 text-right">≈ GHS {{ number_format($invoice->ghs_equivalent, 2) }} @ {{ $invoice->exchange_rate }}</p>
            @endif
            @if($invoice->paid_amount > 0)
                <div class="flex justify-between text-sm text-emerald-400">
                    <span>Amount Paid</span>
                    <span>{{ $invoice->currency }} {{ number_format($invoice->paid_amount, 2) }}</span>
                </div>
                <div class="flex justify-between text-sm font-semibold text-amber-400">
                    <span>Balance Due</span>
                    <span>{{ $invoice->currency }} {{ number_format($invoice->total_amount - $invoice->paid_amount, 2) }}</span>
                </div>
            @endif
        </div>

        @if($invoice->notes)
            <div class="pt-4 border-t border-gray-800">
                <p class="text-xs text-gray-500 uppercase tracking-wider mb-2">Notes</p>
                <p class="text-sm text-gray-300">{{ $invoice->notes }}</p>
            </div>
        @endif
    </div>
</div>

{{-- Record Payment Modal --}}
<div id="pay-modal" class="hidden fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
    <div class="bg-gray-900 border border-gray-800 rounded-xl p-6 w-full max-w-md">
        <div class="flex items-center justify-between mb-5">
            <h3 class="text-base font-semibold text-white">Record Payment</h3>
            <button onclick="document.getElementById('pay-modal').classList.add('hidden')" class="text-gray-500 hover:text-white text-xl">×</button>
        </div>
        <form method="POST" action="{{ route('finance.invoices.pay', $invoice) }}" class="space-y-4">
            @csrf
            <div class="space-y-1.5">
                <label class="text-sm font-medium text-gray-300">Amount ({{ $invoice->currency }}) <span class="text-red-400">*</span></label>
                <input type="number" name="amount" step="0.01" max="{{ $invoice->total_amount - $invoice->paid_amount }}"
                       value="{{ $invoice->total_amount - $invoice->paid_amount }}" required
                       class="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div class="space-y-1.5">
                <label class="text-sm font-medium text-gray-300">Payment date <span class="text-red-400">*</span></label>
                <input type="date" name="paid_date" value="{{ now()->toDateString() }}" required
                       class="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div class="space-y-1.5">
                <label class="text-sm font-medium text-gray-300">Payment method <span class="text-red-400">*</span></label>
                <select name="payment_method" required class="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="bank_transfer">Bank Transfer</option>
                    <option value="cheque">Cheque</option>
                    <option value="cash">Cash</option>
                    <option value="mobile_money">Mobile Money</option>
                </select>
            </div>
            <div class="flex gap-3 pt-2">
                <button type="submit" class="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold rounded-lg transition-colors">Record Payment</button>
                <button type="button" onclick="document.getElementById('pay-modal').classList.add('hidden')"
                        class="flex-1 py-2.5 bg-gray-700 hover:bg-gray-600 text-white text-sm font-semibold rounded-lg transition-colors">Cancel</button>
            </div>
        </form>
    </div>
</div>
@endsection
