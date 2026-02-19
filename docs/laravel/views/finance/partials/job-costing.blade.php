{{-- Finance Job Costing Partial --}}
<div class="flex items-center justify-between mb-4">
    <h2 class="text-sm font-semibold text-white">Job Costing</h2>
</div>
<div class="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
    <table class="w-full text-sm">
        <thead>
            <tr class="border-b border-gray-800 text-xs text-gray-500 uppercase tracking-wider">
                <th class="px-6 py-3 text-left font-medium">Job Ref</th>
                <th class="px-6 py-3 text-left font-medium">Customer</th>
                <th class="px-6 py-3 text-left font-medium hidden md:table-cell">Category</th>
                <th class="px-6 py-3 text-left font-medium">Cost (GHS)</th>
                <th class="px-6 py-3 text-left font-medium hidden lg:table-cell">Billed</th>
                <th class="px-6 py-3 text-left font-medium hidden lg:table-cell">P/L</th>
                <th class="px-6 py-3 text-left font-medium">Status</th>
            </tr>
        </thead>
        <tbody class="divide-y divide-gray-800">
            @forelse($jobCosts ?? [] as $jc)
                <tr class="hover:bg-gray-800/40 transition-colors">
                    <td class="px-6 py-4 font-mono text-xs text-blue-400">{{ $jc->job_ref }}</td>
                    <td class="px-6 py-4 text-white">{{ $jc->customer_name }}</td>
                    <td class="px-6 py-4 text-gray-400 text-xs hidden md:table-cell">{{ ucwords(str_replace('_',' ',$jc->cost_category)) }}</td>
                    <td class="px-6 py-4 text-white font-semibold">{{ number_format($jc->ghs_equivalent, 2) }}</td>
                    <td class="px-6 py-4 text-gray-300 hidden lg:table-cell">{{ number_format($jc->amount_billed, 2) }}</td>
                    <td class="px-6 py-4 hidden lg:table-cell {{ ($jc->profit_loss ?? 0) >= 0 ? 'text-emerald-400' : 'text-red-400' }} font-semibold">
                        {{ ($jc->profit_loss ?? 0) >= 0 ? '+' : '' }}{{ number_format($jc->profit_loss ?? 0, 2) }}
                    </td>
                    <td class="px-6 py-4">@include('components.badge', ['status' => $jc->approval_status, 'type' => 'approval'])</td>
                </tr>
            @empty
                <tr><td colspan="7">@include('components.empty-state', ['message' => 'No job costs found'])</td></tr>
            @endforelse
        </tbody>
    </table>
</div>
