{{--
  invoicing/edit.blade.php
  Edit an existing invoice with dynamic line items (Alpine.js).
--}}
@extends('layouts.app')
@section('title', 'Edit Invoice ' . $invoice->invoice_number . ' — FreightLink 360')

@section('content')
@php
    $taxRate = config('shipperlink.tax_rate', 0.15);
@endphp
<div class="max-w-5xl mx-auto space-y-6"
     x-data="invoiceBuilder()"
     x-init="
        items = {{ json_encode($invoice->items->map(fn($i) => [
            'description' => $i->description,
            'quantity'    => $i->quantity,
            'unit_price'  => $i->unit_price,
            'amount'      => $i->amount,
        ])) }};
        taxRate = {{ $taxRate }};
     ">

    {{-- Hidden tax rate for JS --}}
    <div id="tax-rate-meta" data-tax-rate="{{ $taxRate }}" class="sr-only"></div>

    {{-- Page header --}}
    <div class="flex items-center gap-4">
        <a href="{{ route('invoicing.show', $invoice) }}" class="btn btn-ghost btn-icon">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
            </svg>
        </a>
        <div>
            <h1 class="page-title">Edit Invoice</h1>
            <p class="text-sm text-gray-400 font-mono">{{ $invoice->invoice_number }}</p>
        </div>
        @if($invoice->status !== 'draft')
        <div class="alert alert-warning ml-4 py-2">
            ⚠️ This invoice has been {{ $invoice->status }}. Edits may affect accounting records.
        </div>
        @endif
    </div>

    <form action="{{ route('invoicing.update', $invoice) }}" method="POST">
        @csrf
        @method('PUT')

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {{-- Left: invoice details --}}
            <div class="lg:col-span-2 space-y-6">

                {{-- Header details --}}
                <div class="card space-y-5">
                    <h2 class="section-title">Invoice Details</h2>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-5">

                        <div>
                            <label class="label" for="customer_id">Customer <span class="text-danger-DEFAULT">*</span></label>
                            <select id="customer_id" name="customer_id" class="select @error('customer_id') input-error @enderror" required>
                                @foreach($customers as $c)
                                <option value="{{ $c->id }}" {{ old('customer_id', $invoice->customer_id) == $c->id ? 'selected' : '' }}>
                                    {{ $c->name }} ({{ $c->code }})
                                </option>
                                @endforeach
                            </select>
                            @error('customer_id')<p class="mt-1 text-xs text-danger-DEFAULT">{{ $message }}</p>@enderror
                        </div>

                        <div>
                            <label class="label" for="invoice_number">Invoice Number <span class="text-danger-DEFAULT">*</span></label>
                            <input type="text" id="invoice_number" name="invoice_number"
                                   class="input font-mono @error('invoice_number') input-error @enderror"
                                   value="{{ old('invoice_number', $invoice->invoice_number) }}" required readonly>
                            @error('invoice_number')<p class="mt-1 text-xs text-danger-DEFAULT">{{ $message }}</p>@enderror
                        </div>

                        <div>
                            <label class="label" for="invoice_type">Invoice Type</label>
                            <select id="invoice_type" name="invoice_type" class="select">
                                @foreach(config('shipperlink.invoice_types') as $val => $label)
                                <option value="{{ $val }}" {{ old('invoice_type', $invoice->invoice_type) == $val ? 'selected' : '' }}>
                                    {{ $label }}
                                </option>
                                @endforeach
                            </select>
                        </div>

                        <div>
                            <label class="label" for="service_type">Service Type</label>
                            <select id="service_type" name="service_type" class="select">
                                @foreach(config('shipperlink.service_types') as $val => $label)
                                <option value="{{ $val }}" {{ old('service_type', $invoice->service_type) == $val ? 'selected' : '' }}>
                                    {{ $label }}
                                </option>
                                @endforeach
                            </select>
                        </div>

                        <div>
                            <label class="label" for="issue_date">Issue Date <span class="text-danger-DEFAULT">*</span></label>
                            <input type="date" id="issue_date" name="issue_date"
                                   class="input @error('issue_date') input-error @enderror"
                                   value="{{ old('issue_date', optional($invoice->issue_date)->format('Y-m-d')) }}" required>
                            @error('issue_date')<p class="mt-1 text-xs text-danger-DEFAULT">{{ $message }}</p>@enderror
                        </div>

                        <div>
                            <label class="label" for="due_date">Due Date <span class="text-danger-DEFAULT">*</span></label>
                            <input type="date" id="due_date" name="due_date"
                                   class="input @error('due_date') input-error @enderror"
                                   value="{{ old('due_date', optional($invoice->due_date)->format('Y-m-d')) }}" required>
                            @error('due_date')<p class="mt-1 text-xs text-danger-DEFAULT">{{ $message }}</p>@enderror
                        </div>

                        <div>
                            <label class="label" for="currency">Currency</label>
                            <select id="currency" name="currency" class="select">
                                @foreach(config('shipperlink.currencies') as $code => $label)
                                <option value="{{ $code }}" {{ old('currency', $invoice->currency) == $code ? 'selected' : '' }}>
                                    {{ $label }}
                                </option>
                                @endforeach
                            </select>
                        </div>

                        <div>
                            <label class="label" for="exchange_rate">Exchange Rate (to GHS)</label>
                            <input type="number" id="exchange_rate" name="exchange_rate"
                                   class="input @error('exchange_rate') input-error @enderror"
                                   value="{{ old('exchange_rate', $invoice->exchange_rate) }}"
                                   step="0.0001" min="0.0001">
                        </div>

                        <div>
                            <label class="label" for="job_ref">Job Reference</label>
                            <input type="text" id="job_ref" name="job_ref"
                                   class="input" value="{{ old('job_ref', $invoice->job_ref) }}"
                                   placeholder="e.g. JOB-2025-001">
                        </div>

                        <div>
                            <label class="label" for="shipment_ref">Shipment Reference (B/L / AWB)</label>
                            <input type="text" id="shipment_ref" name="shipment_ref"
                                   class="input" value="{{ old('shipment_ref', $invoice->shipment_ref) }}"
                                   placeholder="e.g. MAEU1234567">
                        </div>

                        <div class="md:col-span-2">
                            <label class="label" for="description">Invoice Description / Narrative</label>
                            <textarea id="description" name="description" rows="2" class="textarea"
                                      placeholder="Brief description of services rendered…">{{ old('description', $invoice->description) }}</textarea>
                        </div>
                    </div>
                </div>

                {{-- Line items --}}
                <div class="card">
                    <div class="flex items-center justify-between mb-4">
                        <h2 class="section-title mb-0">Line Items</h2>
                        <button type="button" @click="addItem()" class="btn btn-secondary btn-sm">
                            + Add Line
                        </button>
                    </div>

                    <div class="table-wrapper border-0">
                        <table class="table">
                            <thead>
                                <tr>
                                    <th class="w-1/2">Description</th>
                                    <th class="w-24 text-right">Qty</th>
                                    <th class="w-36 text-right">Unit Price</th>
                                    <th class="w-36 text-right">Amount</th>
                                    <th class="w-10"></th>
                                </tr>
                            </thead>
                            <tbody>
                                <template x-for="(item, index) in items" :key="index">
                                    <tr>
                                        <td>
                                            <input type="text"
                                                   :name="`items[${index}][description]`"
                                                   class="input text-sm"
                                                   x-model="item.description"
                                                   placeholder="Service description…"
                                                   required>
                                        </td>
                                        <td>
                                            <input type="number"
                                                   :name="`items[${index}][quantity]`"
                                                   class="input text-sm text-right"
                                                   x-model.number="item.quantity"
                                                   @input="recalc(index)"
                                                   min="0.001" step="0.001"
                                                   required>
                                        </td>
                                        <td>
                                            <input type="number"
                                                   :name="`items[${index}][unit_price]`"
                                                   class="input text-sm text-right"
                                                   x-model.number="item.unit_price"
                                                   @input="recalc(index)"
                                                   min="0" step="0.01"
                                                   required>
                                        </td>
                                        <td class="text-right font-semibold text-gray-200">
                                            <input type="hidden"
                                                   :name="`items[${index}][amount]`"
                                                   :value="item.amount.toFixed(2)">
                                            <span x-text="fmt(item.amount)"></span>
                                        </td>
                                        <td class="text-right">
                                            <button type="button"
                                                    @click="removeItem(index)"
                                                    class="btn btn-ghost btn-icon text-danger-DEFAULT"
                                                    :disabled="items.length <= 1">
                                                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                                                </svg>
                                            </button>
                                        </td>
                                    </tr>
                                </template>
                            </tbody>
                        </table>
                    </div>

                    {{-- Totals --}}
                    <div class="mt-4 flex justify-end">
                        <div class="w-72 space-y-2 text-sm">
                            <div class="flex justify-between text-gray-400">
                                <span>Subtotal</span>
                                <span x-text="fmt(subtotal)"></span>
                            </div>
                            <div class="flex justify-between text-gray-400">
                                <span>VAT ({{ number_format($taxRate * 100, 0) }}%)</span>
                                <span x-text="fmt(taxAmount)"></span>
                            </div>
                            <div class="flex justify-between font-bold text-lg text-gray-100 border-t border-gray-700 pt-2">
                                <span>Total</span>
                                <span x-text="fmt(totalAmount)"></span>
                            </div>
                            {{-- Hidden totals for form submission --}}
                            <input type="hidden" name="subtotal"     :value="subtotal.toFixed(2)">
                            <input type="hidden" name="tax_amount"   :value="taxAmount.toFixed(2)">
                            <input type="hidden" name="total_amount" :value="totalAmount.toFixed(2)">
                        </div>
                    </div>
                </div>

                {{-- Notes --}}
                <div class="card">
                    <h2 class="section-title">Notes & Terms</h2>
                    <div class="space-y-4">
                        <div>
                            <label class="label" for="notes">Internal Notes</label>
                            <textarea id="notes" name="notes" rows="3" class="textarea"
                                      placeholder="Internal remarks (not visible on invoice)…">{{ old('notes', $invoice->notes) }}</textarea>
                        </div>
                        <div>
                            <label class="label" for="payment_terms">Payment Terms</label>
                            <input type="text" id="payment_terms" name="payment_terms"
                                   class="input" value="{{ old('payment_terms', $invoice->payment_terms ?? 'Net 30 days') }}">
                        </div>
                    </div>
                </div>

            </div>

            {{-- Right: status + actions --}}
            <div class="space-y-6">
                <div class="card">
                    <h2 class="section-title">Invoice Status</h2>
                    <div class="space-y-4">
                        <div>
                            <label class="label" for="status">Status</label>
                            <select id="status" name="status" class="select">
                                @foreach(config('shipperlink.invoice_statuses') as $val => $label)
                                <option value="{{ $val }}" {{ old('status', $invoice->status) == $val ? 'selected' : '' }}>
                                    {{ $label }}
                                </option>
                                @endforeach
                            </select>
                        </div>

                        <div class="pt-4 border-t border-gray-700 space-y-2">
                            <button type="submit" class="btn btn-primary w-full">
                                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                                </svg>
                                Save Changes
                            </button>
                            <a href="{{ route('invoicing.show', $invoice) }}" class="btn btn-secondary w-full justify-center">
                                Cancel
                            </a>
                        </div>
                    </div>
                </div>

                {{-- Audit trail --}}
                <div class="card text-sm">
                    <h2 class="section-title">Record Info</h2>
                    <div class="space-y-2 text-gray-400">
                        <div class="flex justify-between">
                            <span>Created</span>
                            <span class="text-gray-200">{{ $invoice->created_at->format('d M Y') }}</span>
                        </div>
                        <div class="flex justify-between">
                            <span>Last updated</span>
                            <span class="text-gray-200">{{ $invoice->updated_at->diffForHumans() }}</span>
                        </div>
                        <div class="flex justify-between">
                            <span>Created by</span>
                            <span class="text-gray-200">{{ $invoice->createdBy->profile->full_name ?? '—' }}</span>
                        </div>
                        @if($invoice->approved_by)
                        <div class="flex justify-between">
                            <span>Approved by</span>
                            <span class="text-gray-200">{{ $invoice->approvedBy->profile->full_name ?? '—' }}</span>
                        </div>
                        @endif
                    </div>
                </div>
            </div>
        </div>
    </form>
</div>
@endsection
