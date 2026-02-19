{{-- finance/partials/credit-control.blade.php --}}
<div class="rounded-xl border border-border bg-card overflow-hidden">
    <div class="p-5 border-b border-border">
        <h3 class="font-semibold text-foreground">Customer Credit Control</h3>
        <p class="text-sm text-muted-foreground mt-1">Credit limits, utilization and payment history</p>
    </div>
    <table class="w-full">
        <thead><tr class="border-b border-border bg-muted/30">
            <th class="px-5 py-3 text-left text-xs font-medium uppercase text-muted-foreground">Customer</th>
            <th class="px-5 py-3 text-left text-xs font-medium uppercase text-muted-foreground">Limit</th>
            <th class="px-5 py-3 text-left text-xs font-medium uppercase text-muted-foreground">Balance</th>
            <th class="px-5 py-3 text-left text-xs font-medium uppercase text-muted-foreground">Utilization</th>
            <th class="px-5 py-3 text-left text-xs font-medium uppercase text-muted-foreground">Status</th>
        </tr></thead>
        <tbody class="divide-y divide-border">
            @foreach($credits ?? [] as $credit)
            @php $util = $credit->credit_limit > 0 ? ($credit->outstanding_balance / $credit->credit_limit * 100) : 0; @endphp
            <tr class="data-row">
                <td class="px-5 py-4 text-sm font-medium text-foreground">{{ $credit->company_name }}</td>
                <td class="px-5 py-4 text-sm text-foreground">GH₵ {{ number_format($credit->credit_limit, 2) }}</td>
                <td class="px-5 py-4 text-sm text-destructive font-semibold">GH₵ {{ number_format($credit->outstanding_balance, 2) }}</td>
                <td class="px-5 py-4">
                    <div class="flex items-center gap-2">
                        <div class="w-24 bg-muted rounded-full h-2"><div class="h-2 rounded-full {{ $util > 80 ? 'bg-destructive' : ($util > 60 ? 'bg-warning' : 'bg-success') }}" style="width: {{ min($util, 100) }}%"></div></div>
                        <span class="text-xs text-muted-foreground">{{ number_format($util, 0) }}%</span>
                    </div>
                </td>
                <td class="px-5 py-4">
                    @php $creditColors = ['good' => 'status-success', 'watch' => 'status-warning', 'hold' => 'status-danger', 'suspend' => 'status-danger']; @endphp
                    <span class="status-badge {{ $creditColors[$credit->credit_status] ?? 'status-pending' }}">{{ ucfirst($credit->credit_status) }}</span>
                </td>
            </tr>
            @endforeach
        </tbody>
    </table>
</div>
