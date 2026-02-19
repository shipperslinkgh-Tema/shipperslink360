{{-- Finance Receivables Partial --}}
<div class="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
    <div class="px-6 py-4 border-b border-gray-800">
        <h2 class="text-sm font-semibold text-white">Accounts Receivable</h2>
    </div>
    <table class="w-full text-sm">
        <thead>
            <tr class="border-b border-gray-800 text-xs text-gray-500 uppercase tracking-wider">
                <th class="px-6 py-3 text-left font-medium">Invoice</th>
                <th class="px-6 py-3 text-left font-medium">Customer</th>
                <th class="px-6 py-3 text-left font-medium">Amount</th>
                <th class="px-6 py-3 text-left font-medium hidden lg:table-cell">Days Outstanding</th>
                <th class="px-6 py-3 text-left font-medium">Status</th>
            </tr>
        </thead>
        <tbody class="divide-y divide-gray-800">
            @forelse($receivables ?? [] as $inv)
                @php $days = now()->diffInDays(\Carbon\Carbon::parse($inv->due_date)); @endphp
                <tr class="hover:bg-gray-800/40 transition-colors">
                    <td class="px-6 py-4 font-mono text-xs text-blue-400">{{ $inv->invoice_number }}</td>
                    <td class="px-6 py-4 text-white">{{ $inv->customer }}</td>
                    <td class="px-6 py-4 text-white font-semibold">GHS {{ number_format($inv->ghs_equivalent, 0) }}</td>
                    <td class="px-6 py-4 hidden lg:table-cell">
                        <span class="{{ $days > 30 ? 'text-red-400' : ($days > 14 ? 'text-amber-400' : 'text-gray-400') }} text-xs font-medium">
                            {{ $days }}d
                        </span>
                    </td>
                    <td class="px-6 py-4">@include('components.badge', ['status' => $inv->status, 'type' => 'invoice'])</td>
                </tr>
            @empty
                <tr><td colspan="5">@include('components.empty-state', ['message' => 'No outstanding receivables'])</td></tr>
            @endforelse
        </tbody>
    </table>
</div>
