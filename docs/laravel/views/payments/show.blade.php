{{--
  payments/show.blade.php
  Single payment receipt / detail view.
--}}
@extends('layouts.app')
@section('title', 'Payment ' . $payment->reference_number . ' — FreightLink 360')

@section('content')
<div class="max-w-3xl mx-auto space-y-6" id="payment-{{ $payment->id }}">

    {{-- Header --}}
    <div class="flex items-center justify-between">
        <div class="flex items-center gap-4">
            <a href="{{ route('payments.index') }}" class="btn btn-ghost btn-icon">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
                </svg>
            </a>
            <div>
                <h1 class="page-title font-mono">{{ $payment->reference_number }}</h1>
                <p class="text-sm text-gray-400">
                    Payment for invoice <a href="{{ route('invoicing.show', $payment->invoice_id) }}"
                        class="text-brand-400 hover:underline font-mono">{{ $payment->invoice->invoice_number }}</a>
                </p>
            </div>
        </div>
        <div class="flex gap-2 no-print">
            <button onclick="window.print()" class="btn btn-secondary btn-sm">🖨 Print Receipt</button>
            @if($payment->status === 'pending' && auth()->user()->isAdmin())
            <form action="{{ route('payments.approve', $payment) }}" method="POST">
                @csrf @method('PATCH')
                <button type="submit" class="btn btn-success btn-sm">✓ Approve</button>
            </form>
            @endif
        </div>
    </div>

    {{-- Receipt card --}}
    <div class="card print-invoice relative overflow-hidden">
        {{-- Watermark --}}
        @if($payment->status === 'completed')
        <div class="invoice-watermark text-success-DEFAULT">RECEIVED</div>
        @elseif($payment->status === 'reversed')
        <div class="invoice-watermark text-danger-DEFAULT">REVERSED</div>
        @endif

        {{-- Top: company + receipt info --}}
        <div class="flex flex-col sm:flex-row sm:justify-between gap-6 pb-6 border-b border-gray-700 invoice-header">
            <div>
                <div class="flex items-center gap-3 mb-3">
                    <div class="w-10 h-10 rounded-xl bg-brand-500 flex items-center justify-center font-bold text-white text-sm">FL</div>
                    <div>
                        <p class="font-bold text-gray-100">SLAC FreightLink 360</p>
                        <p class="text-xs text-gray-400">Freight & Logistics Management</p>
                    </div>
                </div>
                <p class="text-xs text-gray-400">P.O. Box TN 123, Tema, Ghana</p>
                <p class="text-xs text-gray-400">Tel: +233 30 000 0000</p>
            </div>
            <div class="text-right">
                <p class="text-2xl font-bold text-gray-100">PAYMENT RECEIPT</p>
                <p class="font-mono text-brand-400 text-lg">{{ $payment->reference_number }}</p>
                <div class="mt-2 space-y-1 text-sm text-gray-400">
                    <p>Date: <span class="text-gray-200">{{ \Carbon\Carbon::parse($payment->payment_date)->format('d M Y') }}</span></p>
                    <p>Status:
                        <span class="badge {{ match($payment->status) {
                            'completed' => 'badge-green',
                            'pending'   => 'badge-yellow',
                            'failed'    => 'badge-red',
                            'reversed'  => 'badge-gray',
                            default     => 'badge-gray',
                        } }}">{{ ucfirst($payment->status) }}</span>
                    </p>
                </div>
            </div>
        </div>

        {{-- Customer + invoice info --}}
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-6 py-6 border-b border-gray-700">
            <div>
                <p class="text-xs text-gray-400 font-semibold uppercase tracking-wider mb-2">Received From</p>
                <p class="font-semibold text-gray-100">{{ $payment->invoice->customer->name ?? '—' }}</p>
                <p class="text-sm text-gray-400">{{ $payment->invoice->customer->email ?? '' }}</p>
                <p class="text-sm text-gray-400">{{ $payment->invoice->customer->phone ?? '' }}</p>
            </div>
            <div>
                <p class="text-xs text-gray-400 font-semibold uppercase tracking-wider mb-2">Applied To Invoice</p>
                <p class="font-mono font-semibold text-brand-400">{{ $payment->invoice->invoice_number }}</p>
                <p class="text-sm text-gray-400">Invoice date: {{ \Carbon\Carbon::parse($payment->invoice->issue_date)->format('d M Y') }}</p>
                <p class="text-sm text-gray-400">Due date: {{ \Carbon\Carbon::parse($payment->invoice->due_date)->format('d M Y') }}</p>
                <p class="text-sm text-gray-400">Invoice total: <span class="text-gray-200 font-medium">{{ $payment->invoice->currency }} {{ number_format($payment->invoice->total_amount, 2) }}</span></p>
            </div>
        </div>

        {{-- Payment breakdown --}}
        <div class="py-6">
            <table class="table">
                <thead>
                    <tr>
                        <th>Description</th>
                        <th class="text-right">Currency</th>
                        <th class="text-right">Amount</th>
                        <th class="text-right">Rate</th>
                        <th class="text-right">GHS Equiv.</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>Payment via {{ config('shipperlink.payment_methods.' . $payment->payment_method, $payment->payment_method) }}</td>
                        <td class="text-right font-mono">{{ $payment->currency }}</td>
                        <td class="text-right font-semibold">{{ number_format($payment->amount, 2) }}</td>
                        <td class="text-right text-gray-400">{{ $payment->exchange_rate ?? 1 }}</td>
                        <td class="text-right font-bold text-success-DEFAULT text-lg">
                            GHS {{ number_format($payment->amount_ghs, 2) }}
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>

        {{-- Payment method details --}}
        <div class="bg-gray-900 rounded-xl p-4 space-y-2 text-sm mb-6">
            <p class="font-semibold text-gray-300 mb-3">Payment Details</p>
            <div class="grid grid-cols-2 gap-y-2 text-gray-400">
                <span>Payment Method:</span>
                <span class="text-gray-200">{{ config('shipperlink.payment_methods.' . $payment->payment_method, $payment->payment_method) }}</span>
                @if($payment->bank_name)
                <span>Bank:</span>
                <span class="text-gray-200">{{ $payment->bank_name }}</span>
                @endif
                @if($payment->cheque_number)
                <span>Cheque No.:</span>
                <span class="text-gray-200 font-mono">{{ $payment->cheque_number }}</span>
                @endif
                @if($payment->transaction_id)
                <span>Transaction ID:</span>
                <span class="text-gray-200 font-mono">{{ $payment->transaction_id }}</span>
                @endif
                <span>Recorded By:</span>
                <span class="text-gray-200">{{ $payment->recordedBy->profile->full_name ?? '—' }}</span>
                <span>Recorded At:</span>
                <span class="text-gray-200">{{ $payment->created_at->format('d M Y H:i') }}</span>
            </div>
        </div>

        {{-- Notes --}}
        @if($payment->notes)
        <div class="border-t border-gray-700 pt-4">
            <p class="text-xs text-gray-400 font-semibold uppercase tracking-wider mb-1">Notes</p>
            <p class="text-sm text-gray-300">{{ $payment->notes }}</p>
        </div>
        @endif

        {{-- Footer --}}
        <div class="mt-8 pt-6 border-t border-gray-700 text-center text-xs text-gray-500">
            <p>This is a computer-generated receipt. Thank you for your payment.</p>
            <p class="mt-1">SLAC FreightLink 360 · Tema, Ghana · {{ config('app.url') }}</p>
        </div>
    </div>

    {{-- Invoice balance summary --}}
    <div class="card text-sm">
        <h2 class="section-title">Invoice Balance</h2>
        <div class="space-y-2">
            <div class="flex justify-between">
                <span class="text-gray-400">Invoice Total</span>
                <span class="text-gray-100 font-medium">{{ $payment->invoice->currency }} {{ number_format($payment->invoice->total_amount, 2) }}</span>
            </div>
            <div class="flex justify-between">
                <span class="text-gray-400">Total Paid</span>
                <span class="text-success-DEFAULT font-medium">{{ $payment->invoice->currency }} {{ number_format($payment->invoice->total_paid, 2) }}</span>
            </div>
            <div class="divider"></div>
            <div class="flex justify-between font-bold">
                <span class="text-gray-300">Outstanding Balance</span>
                <span class="{{ $payment->invoice->balance > 0 ? 'text-danger-DEFAULT' : 'text-success-DEFAULT' }} text-lg">
                    {{ $payment->invoice->currency }} {{ number_format($payment->invoice->balance, 2) }}
                </span>
            </div>
        </div>
    </div>
</div>
@endsection
