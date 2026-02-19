{{-- Finance Registrar Renewal Partial --}}
<div class="flex items-center justify-between mb-4">
    <h2 class="text-sm font-semibold text-white">Registrar Renewals</h2>
</div>
<div class="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
    <table class="w-full text-sm">
        <thead>
            <tr class="border-b border-gray-800 text-xs text-gray-500 uppercase tracking-wider">
                <th class="px-6 py-3 text-left font-medium">Registration</th>
                <th class="px-6 py-3 text-left font-medium">Type</th>
                <th class="px-6 py-3 text-left font-medium hidden md:table-cell">Expiry</th>
                <th class="px-6 py-3 text-left font-medium hidden lg:table-cell">Days Left</th>
                <th class="px-6 py-3 text-left font-medium hidden lg:table-cell">Fee</th>
                <th class="px-6 py-3 text-left font-medium">Status</th>
            </tr>
        </thead>
        <tbody class="divide-y divide-gray-800">
            @forelse($renewals ?? [] as $renewal)
                @php $days = $renewal->getDaysUntilExpiry(); @endphp
                <tr class="hover:bg-gray-800/40 transition-colors {{ $days <= 30 && $days >= 0 ? 'border-l-2 border-l-amber-500' : ($days < 0 ? 'border-l-2 border-l-red-500' : '') }}">
                    <td class="px-6 py-4">
                        <p class="text-white font-medium">{{ $renewal->entity_name }}</p>
                        <p class="text-xs text-gray-400 font-mono">{{ $renewal->registration_number ?? '—' }}</p>
                    </td>
                    <td class="px-6 py-4 text-gray-300 text-xs">{{ ucwords(str_replace('_',' ',$renewal->registration_type)) }}</td>
                    <td class="px-6 py-4 text-gray-400 text-xs hidden md:table-cell">{{ $renewal->expiry_date->format('d M Y') }}</td>
                    <td class="px-6 py-4 hidden lg:table-cell">
                        <span class="{{ $days < 0 ? 'text-red-400' : ($days <= 30 ? 'text-amber-400' : 'text-emerald-400') }} font-semibold text-xs">
                            {{ $days < 0 ? abs($days) . 'd overdue' : $days . 'd left' }}
                        </span>
                    </td>
                    <td class="px-6 py-4 text-gray-300 hidden lg:table-cell">GHS {{ number_format($renewal->renewal_fee, 2) }}</td>
                    <td class="px-6 py-4">@include('components.badge', ['status' => $renewal->status, 'type' => 'renewal'])</td>
                </tr>
            @empty
                <tr><td colspan="6">@include('components.empty-state', ['message' => 'No registrar renewals found'])</td></tr>
            @endforelse
        </tbody>
    </table>
</div>
