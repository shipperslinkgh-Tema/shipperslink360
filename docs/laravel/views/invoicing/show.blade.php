@extends('layouts.app')
@section('title', $invoice->invoice_number)
@section('content')
<div class="max-w-4xl mx-auto space-y-6">
    <div class="flex items-center justify-between">
        <div>
            <h1 class="text-2xl font-bold text-foreground">{{ $invoice->invoice_number }}</h1>
            <p class="text-sm text-muted-foreground mt-1 capitalize">{{ str_replace('_',' ',$invoice->invoice_type) }} · {{ $invoice->service_type }}</p>
        </div>
        <div class="flex gap-2">
            @if($invoice->status === 'draft')
            <form action="{{ route('invoicing.send', $invoice) }}" method="POST">
                @csrf
                <button type="submit" class="px-4 py-2 bg-success text-success-foreground rounded-lg text-sm font-medium hover:bg-success/90">Send Invoice</button>
            </form>
            @endif
            <button onclick="window.print()" class="px-4 py-2 border border-border rounded-lg text-sm text-foreground hover:bg-muted/50">🖨 Print</button>
            <a href="{{ route('invoicing.edit', $invoice) }}" class="px-4 py-2 border border-border rounded-lg text-sm text-foreground hover:bg-muted/50">Edit</a>
        </div>
    </div>

    {{-- Print-ready invoice card --}}
    <div class="rounded-xl border border-border bg-card p-8 print:shadow-none print:border-0" id="invoice-print">
        {{-- Header --}}
        <div class="flex justify-between items-start mb-8">
            <div>
                <h2 class="text-xl font-bold text-foreground">Shippers Link Agencies</h2>
                <p class="text-sm text-muted-foreground">Freight Forwarding & Customs Clearing</p>
                <p class="text-sm text-muted-foreground">Tema, Greater Accra, Ghana</p>
            </div>
            <div class="text-right">
                <h3 class="text-2xl font-bold text-primary uppercase">{{ str_replace('_',' ',$invoice->invoice_type) }}</h3>
                <p class="text-sm font-mono text-foreground">{{ $invoice->invoice_number }}</p>
                @php $statusColors = ['paid' => 'status-success','overdue' => 'status-danger','sent' => 'status-info','draft' => 'status-pending']; @endphp
                <span class="status-badge {{ $statusColors[$invoice->status] ?? 'status-pending' }} mt-2 inline-block">{{ ucfirst($invoice->status) }}</span>
            </div>
        </div>

        {{-- Bill To / Details --}}
        <div class="grid grid-cols-2 gap-8 mb-8">
            <div>
                <p class="text-xs font-medium uppercase text-muted-foreground mb-2">Bill To</p>
                <p class="text-sm font-semibold text-foreground">{{ $invoice->customer->company_name }}</p>
                <p class="text-sm text-muted-foreground">{{ $invoice->customer->contact_name }}</p>
                <p class="text-sm text-muted-foreground">{{ $invoice->customer->email }}</p>
                @if($invoice->customer->tin_number) <p class="text-xs text-muted-foreground">TIN: {{ $invoice->customer->tin_number }}</p> @endif
            </div>
            <div class="text-right">
                <div class="space-y-1 text-sm">
                    <div class="flex justify-between"><span class="text-muted-foreground">Issue Date:</span><span class="text-foreground">{{ $invoice->issue_date->format('M d, Y') }}</span></div>
                    <div class="flex justify-between"><span class="text-muted-foreground">Due Date:</span><span class="text-foreground {{ $invoice->isOverdue() ? 'text-destructive font-semibold' : '' }}">{{ $invoice->due_date->format('M d, Y') }}</span></div>
                    @if($invoice->job_ref) <div class="flex justify-between"><span class="text-muted-foreground">Job Ref:</span><span class="font-mono text-foreground">{{ $invoice->job_ref }}</span></div> @endif
                    <div class="flex justify-between"><span class="text-muted-foreground">Currency:</span><span class="text-foreground">{{ $invoice->currency }}</span></div>
                </div>
            </div>
        </div>

        {{-- Line Items --}}
        <table class="w-full mb-8">
            <thead>
                <tr class="border-b-2 border-border">
                    <th class="pb-3 text-left text-xs font-medium uppercase text-muted-foreground">Description</th>
                    <th class="pb-3 text-right text-xs font-medium uppercase text-muted-foreground">Qty</th>
                    <th class="pb-3 text-right text-xs font-medium uppercase text-muted-foreground">Unit Price</th>
                    <th class="pb-3 text-right text-xs font-medium uppercase text-muted-foreground">Tax</th>
                    <th class="pb-3 text-right text-xs font-medium uppercase text-muted-foreground">Amount</th>
                </tr>
            </thead>
            <tbody class="divide-y divide-border">
                @foreach($invoice->items as $item)
                <tr>
                    <td class="py-3 text-sm text-foreground">{{ $item->description }}</td>
                    <td class="py-3 text-sm text-right text-foreground">{{ $item->quantity }}</td>
                    <td class="py-3 text-sm text-right text-foreground">{{ number_format($item->unit_price, 2) }}</td>
                    <td class="py-3 text-sm text-right text-muted-foreground">{{ $item->tax_rate }}%</td>
                    <td class="py-3 text-sm text-right font-medium text-foreground">{{ number_format($item->total_amount, 2) }}</td>
                </tr>
                @endforeach
            </tbody>
        </table>

        {{-- Totals --}}
        <div class="flex justify-end">
            <div class="w-64 space-y-2">
                <div class="flex justify-between text-sm"><span class="text-muted-foreground">Subtotal</span><span class="text-foreground">{{ $invoice->currency }} {{ number_format($invoice->subtotal, 2) }}</span></div>
                <div class="flex justify-between text-sm"><span class="text-muted-foreground">Tax</span><span class="text-foreground">{{ $invoice->currency }} {{ number_format($invoice->tax_amount, 2) }}</span></div>
                <div class="flex justify-between text-base font-bold border-t border-border pt-2"><span class="text-foreground">TOTAL</span><span class="text-foreground">{{ $invoice->currency }} {{ number_format($invoice->total_amount, 2) }}</span></div>
                @if($invoice->paid_amount > 0)
                <div class="flex justify-between text-sm text-success"><span>Paid</span><span>{{ $invoice->currency }} {{ number_format($invoice->paid_amount, 2) }}</span></div>
                <div class="flex justify-between text-base font-bold text-destructive"><span>Balance Due</span><span>{{ $invoice->currency }} {{ number_format($invoice->outstanding_amount, 2) }}</span></div>
                @endif
            </div>
        </div>

        @if($invoice->notes)
        <div class="mt-8 pt-4 border-t border-border">
            <p class="text-xs font-medium uppercase text-muted-foreground mb-1">Notes</p>
            <p class="text-sm text-foreground">{{ $invoice->notes }}</p>
        </div>
        @endif
    </div>
</div>
@endsection
