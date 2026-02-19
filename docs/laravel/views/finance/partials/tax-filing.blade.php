{{-- Finance Tax Filing Partial --}}
<div class="flex items-center justify-between mb-4">
    <h2 class="text-sm font-semibold text-white">Tax Filings</h2>
</div>
<div class="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
    <table class="w-full text-sm">
        <thead>
            <tr class="border-b border-gray-800 text-xs text-gray-500 uppercase tracking-wider">
                <th class="px-6 py-3 text-left font-medium">Ref</th>
                <th class="px-6 py-3 text-left font-medium">Tax Type</th>
                <th class="px-6 py-3 text-left font-medium">Period</th>
                <th class="px-6 py-3 text-left font-medium">Tax Due</th>
                <th class="px-6 py-3 text-left font-medium hidden lg:table-cell">Due Date</th>
                <th class="px-6 py-3 text-left font-medium">Status</th>
            </tr>
        </thead>
        <tbody class="divide-y divide-gray-800">
            @forelse($taxFilings ?? [] as $tax)
                <tr class="hover:bg-gray-800/40 transition-colors">
                    <td class="px-6 py-4 font-mono text-xs text-blue-400">{{ $tax->filing_ref }}</td>
                    <td class="px-6 py-4 text-white">{{ $tax->tax_type }}</td>
                    <td class="px-6 py-4 text-gray-300">{{ $tax->period }}</td>
                    <td class="px-6 py-4 text-white font-semibold">GHS {{ number_format($tax->tax_due, 2) }}</td>
                    <td class="px-6 py-4 text-xs hidden lg:table-cell {{ $tax->due_date->isPast() && $tax->status !== 'paid' ? 'text-red-400' : 'text-gray-400' }}">
                        {{ $tax->due_date->format('d M Y') }}
                    </td>
                    <td class="px-6 py-4">@include('components.badge', ['status' => $tax->status, 'type' => 'tax'])</td>
                </tr>
            @empty
                <tr><td colspan="6">@include('components.empty-state', ['message' => 'No tax filings found'])</td></tr>
            @endforelse
        </tbody>
    </table>
</div>
