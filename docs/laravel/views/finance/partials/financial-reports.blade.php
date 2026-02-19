{{-- finance/partials/financial-reports.blade.php --}}
<div class="space-y-6">
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div class="metric-card"><p class="text-sm text-muted-foreground">MTD Revenue</p><p class="text-2xl font-bold text-foreground mt-2">GH₵ {{ number_format($metrics['mtd_revenue'] ?? 0, 2) }}</p></div>
        <div class="metric-card"><p class="text-sm text-muted-foreground">MTD Costs</p><p class="text-2xl font-bold text-foreground mt-2">GH₵ {{ number_format($metrics['mtd_costs'] ?? 0, 2) }}</p></div>
        <div class="metric-card">
            <p class="text-sm text-muted-foreground">Gross Profit</p>
            @php $profit = ($metrics['mtd_revenue'] ?? 0) - ($metrics['mtd_costs'] ?? 0); @endphp
            <p class="text-2xl font-bold {{ $profit >= 0 ? 'text-success' : 'text-destructive' }} mt-2">GH₵ {{ number_format($profit, 2) }}</p>
        </div>
        <div class="metric-card">
            <p class="text-sm text-muted-foreground">Cash Position</p>
            <p class="text-2xl font-bold text-foreground mt-2">GH₵ {{ number_format($metrics['cash_position'] ?? 0, 2) }}</p>
        </div>
    </div>

    {{-- Revenue by Service --}}
    <div class="rounded-xl border border-border bg-card p-6">
        <h3 class="font-semibold text-foreground mb-4">Revenue by Service (MTD)</h3>
        <div class="space-y-3">
            @foreach($revenueByService ?? [] as $service)
            <div class="flex items-center gap-4">
                <span class="text-sm text-muted-foreground w-40 truncate">{{ $service['name'] ?? '' }}</span>
                <div class="flex-1 bg-muted rounded-full h-2">
                    <div class="h-2 rounded-full bg-primary" style="width: {{ $service['percentage'] ?? 0 }}%"></div>
                </div>
                <span class="text-sm font-medium text-foreground w-32 text-right">GH₵ {{ number_format($service['amount'] ?? 0, 2) }}</span>
                <span class="text-xs text-muted-foreground">{{ $service['percentage'] ?? 0 }}%</span>
            </div>
            @endforeach
        </div>
    </div>

    {{-- Cost Breakdown --}}
    <div class="rounded-xl border border-border bg-card p-6">
        <h3 class="font-semibold text-foreground mb-4">Cost Breakdown</h3>
        <div class="space-y-3">
            @foreach($costBreakdown ?? [] as $cost)
            <div class="flex items-center justify-between py-2 border-b border-border last:border-0">
                <span class="text-sm text-foreground capitalize">{{ str_replace('_', ' ', $cost['category'] ?? '') }}</span>
                <span class="text-sm font-semibold text-foreground">GH₵ {{ number_format($cost['amount'] ?? 0, 2) }}</span>
            </div>
            @endforeach
        </div>
    </div>
</div>
