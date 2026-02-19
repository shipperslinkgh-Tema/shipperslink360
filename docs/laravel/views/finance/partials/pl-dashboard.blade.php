{{-- Finance P&L Dashboard Partial --}}
<div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
    <div class="bg-gray-900 border border-gray-800 rounded-xl p-6">
        <p class="text-xs text-gray-500 uppercase tracking-wider mb-1">Gross Revenue</p>
        <p class="text-2xl font-bold text-white">GHS {{ number_format($pl['gross_revenue'] ?? 0, 0) }}</p>
        <p class="text-xs text-emerald-400 mt-1">↑ {{ $pl['revenue_growth'] ?? '0' }}% vs last month</p>
    </div>
    <div class="bg-gray-900 border border-gray-800 rounded-xl p-6">
        <p class="text-xs text-gray-500 uppercase tracking-wider mb-1">COGS (Job Costs)</p>
        <p class="text-2xl font-bold text-white">GHS {{ number_format($pl['cogs'] ?? 0, 0) }}</p>
        <p class="text-xs text-gray-400 mt-1">{{ number_format(($pl['gross_margin'] ?? 0), 1) }}% gross margin</p>
    </div>
    <div class="bg-gray-900 border border-gray-800 rounded-xl p-6">
        <p class="text-xs text-gray-500 uppercase tracking-wider mb-1">Net Profit</p>
        <p class="text-2xl font-bold {{ ($pl['net_profit'] ?? 0) >= 0 ? 'text-emerald-400' : 'text-red-400' }}">
            GHS {{ number_format($pl['net_profit'] ?? 0, 0) }}
        </p>
        <p class="text-xs text-gray-400 mt-1">{{ number_format(($pl['net_margin'] ?? 0), 1) }}% net margin</p>
    </div>
</div>

{{-- Monthly breakdown --}}
<div class="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
    <div class="px-6 py-4 border-b border-gray-800 flex justify-between">
        <h2 class="text-sm font-semibold text-white">P&L Summary</h2>
        <span class="text-xs text-gray-500">{{ now()->format('F Y') }}</span>
    </div>
    <div class="p-6 space-y-3">
        @foreach([
            ['Revenue',           $pl['gross_revenue'] ?? 0, 'text-white'],
            ['COGS',              -($pl['cogs'] ?? 0),        'text-red-400'],
            ['Gross Profit',      $pl['gross_profit'] ?? 0,  'text-emerald-400'],
            ['Operating Expenses',-($pl['opex'] ?? 0),       'text-red-400'],
            ['EBITDA',            $pl['ebitda'] ?? 0,        'text-blue-400'],
            ['Net Profit',        $pl['net_profit'] ?? 0,    ($pl['net_profit'] ?? 0) >= 0 ? 'text-emerald-400' : 'text-red-400'],
        ] as [$label, $value, $color])
            <div class="flex justify-between items-center py-1.5 {{ in_array($label, ['Gross Profit','Net Profit']) ? 'border-t border-gray-700 font-semibold' : '' }}">
                <span class="text-sm text-gray-300">{{ $label }}</span>
                <span class="text-sm font-mono {{ $color }}">
                    {{ $value < 0 ? '-' : '' }}GHS {{ number_format(abs($value), 0) }}
                </span>
            </div>
        @endforeach
    </div>
</div>
