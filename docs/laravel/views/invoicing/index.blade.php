@extends('layouts.app')
@section('title', 'Invoicing')
@section('content')
<div class="space-y-6">
    <div class="flex items-center justify-between">
        <div>
            <h1 class="text-2xl font-bold text-foreground">Invoicing</h1>
            <p class="text-sm text-muted-foreground mt-1">Proforma, commercial invoices, credit & debit notes</p>
        </div>
        <a href="{{ route('invoicing.create') }}" class="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>
            New Invoice
        </a>
    </div>

    <div class="grid grid-cols-3 gap-4">
        <div class="metric-card"><p class="text-sm text-muted-foreground">Total Outstanding</p><p class="text-2xl font-bold text-foreground mt-2">GH₵ {{ number_format($stats['total_outstanding'], 2) }}</p></div>
        <div class="metric-card"><p class="text-sm text-muted-foreground">Overdue Invoices</p><p class="text-2xl font-bold text-destructive mt-2">{{ $stats['overdue_count'] }}</p></div>
        <div class="metric-card"><p class="text-sm text-muted-foreground">Paid This Month</p><p class="text-2xl font-bold text-success mt-2">GH₵ {{ number_format($stats['paid_mtd'], 2) }}</p></div>
    </div>

    <div class="flex gap-3">
        <form method="GET" class="flex gap-3 flex-1">
            <input type="text" name="search" value="{{ request('search') }}" placeholder="Search invoice, customer, job ref..." class="flex-1 px-4 py-2 bg-card border border-border rounded-lg text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary">
            <select name="status" class="px-3 py-2 bg-card border border-border rounded-lg text-sm text-foreground">
                <option value="">All Status</option>
                @foreach(['draft','sent','partially_paid','paid','overdue','cancelled'] as $s)
                <option value="{{ $s }}" {{ request('status') === $s ? 'selected' : '' }}>{{ ucfirst(str_replace('_',' ',$s)) }}</option>
                @endforeach
            </select>
            <select name="type" class="px-3 py-2 bg-card border border-border rounded-lg text-sm text-foreground">
                <option value="">All Types</option>
                @foreach(['proforma','commercial','credit_note','debit_note'] as $t)
                <option value="{{ $t }}" {{ request('type') === $t ? 'selected' : '' }}>{{ ucfirst(str_replace('_',' ',$t)) }}</option>
                @endforeach
            </select>
            <button type="submit" class="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm">Filter</button>
        </form>
    </div>

    <div class="rounded-xl border border-border bg-card overflow-hidden">
        <table class="w-full">
            <thead>
                <tr class="border-b border-border bg-muted/30">
                    <th class="px-5 py-3 text-left text-xs font-medium uppercase text-muted-foreground">Invoice #</th>
                    <th class="px-5 py-3 text-left text-xs font-medium uppercase text-muted-foreground">Customer</th>
                    <th class="px-5 py-3 text-left text-xs font-medium uppercase text-muted-foreground">Type</th>
                    <th class="px-5 py-3 text-left text-xs font-medium uppercase text-muted-foreground">Amount</th>
                    <th class="px-5 py-3 text-left text-xs font-medium uppercase text-muted-foreground">Status</th>
                    <th class="px-5 py-3 text-left text-xs font-medium uppercase text-muted-foreground">Due</th>
                    <th class="px-5 py-3 text-right text-xs font-medium uppercase text-muted-foreground">Actions</th>
                </tr>
            </thead>
            <tbody class="divide-y divide-border">
                @forelse($invoices as $invoice)
                @php
                    $statusColors = ['paid' => 'status-success','overdue' => 'status-danger','sent' => 'status-info','draft' => 'status-pending','partially_paid' => 'status-warning','cancelled' => 'status-pending'];
                @endphp
                <tr class="data-row">
                    <td class="px-5 py-4 font-mono text-sm font-medium text-foreground">{{ $invoice->invoice_number }}</td>
                    <td class="px-5 py-4 text-sm text-foreground">{{ $invoice->customer->company_name }}</td>
                    <td class="px-5 py-4"><span class="status-badge status-pending text-xs capitalize">{{ str_replace('_',' ',$invoice->invoice_type) }}</span></td>
                    <td class="px-5 py-4 text-sm font-semibold text-foreground">{{ $invoice->currency }} {{ number_format($invoice->total_amount, 2) }}</td>
                    <td class="px-5 py-4"><span class="status-badge {{ $statusColors[$invoice->status] ?? 'status-pending' }}">{{ ucfirst(str_replace('_',' ',$invoice->status)) }}</span></td>
                    <td class="px-5 py-4 text-sm {{ $invoice->due_date->isPast() && $invoice->status !== 'paid' ? 'text-destructive font-medium' : 'text-muted-foreground' }}">{{ $invoice->due_date->format('M d, Y') }}</td>
                    <td class="px-5 py-4 text-right">
                        <div class="flex items-center justify-end gap-2">
                            <a href="{{ route('invoicing.show', $invoice) }}" class="text-xs text-primary hover:underline">View</a>
                            @if($invoice->status === 'draft')
                            <form action="{{ route('invoicing.send', $invoice) }}" method="POST" class="inline">@csrf <button type="submit" class="text-xs text-success hover:underline">Send</button></form>
                            @endif
                        </div>
                    </td>
                </tr>
                @empty
                <tr><td colspan="7">@include('components.empty-state', ['message' => 'No invoices found.', 'icon' => '🧾'])</td></tr>
                @endforelse
            </tbody>
        </table>
        <div class="p-4 border-t border-border">{{ $invoices->links() }}</div>
    </div>
</div>
@endsection
