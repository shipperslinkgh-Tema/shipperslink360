{{-- Finance partials: payables, credit-control, director-tax, accounts-table --}}

{{-- resources/views/finance/partials/payables.blade.php --}}
{{-- Included inline in finance/index.blade.php via @include('finance.partials.payables') --}}
<div class="space-y-4">
    <div class="rounded-xl border border-border bg-card overflow-hidden">
        <div class="p-5 border-b border-border flex items-center justify-between">
            <h3 class="font-semibold text-foreground">Vendor & Shipping Line Payables</h3>
            <button class="px-3 py-1.5 bg-primary text-primary-foreground rounded-lg text-sm">+ Add Payable</button>
        </div>
        <table class="w-full">
            <thead><tr class="border-b border-border bg-muted/30">
                <th class="px-5 py-3 text-left text-xs font-medium uppercase text-muted-foreground">Vendor</th>
                <th class="px-5 py-3 text-left text-xs font-medium uppercase text-muted-foreground">Amount</th>
                <th class="px-5 py-3 text-left text-xs font-medium uppercase text-muted-foreground">Due Date</th>
                <th class="px-5 py-3 text-left text-xs font-medium uppercase text-muted-foreground">Status</th>
                <th class="px-5 py-3 text-right text-xs font-medium uppercase text-muted-foreground">Actions</th>
            </tr></thead>
            <tbody class="divide-y divide-border">
                @foreach($payables ?? [] as $payable)
                <tr class="data-row">
                    <td class="px-5 py-4"><p class="text-sm font-medium text-foreground">{{ $payable->vendor }}</p><p class="text-xs text-muted-foreground capitalize">{{ str_replace('_',' ',$payable->vendor_category ?? '') }}</p></td>
                    <td class="px-5 py-4 text-sm font-semibold text-foreground">{{ $payable->currency }} {{ number_format($payable->amount, 2) }}</td>
                    <td class="px-5 py-4 text-sm text-muted-foreground">{{ $payable->due_date->format('M d, Y') }}</td>
                    <td class="px-5 py-4"><span class="status-badge {{ $payable->status === 'paid' ? 'status-success' : ($payable->status === 'overdue' ? 'status-danger' : 'status-warning') }}">{{ ucfirst($payable->status) }}</span></td>
                    <td class="px-5 py-4 text-right"><button class="text-xs text-primary hover:underline">Pay</button></td>
                </tr>
                @endforeach
            </tbody>
        </table>
    </div>
</div>
