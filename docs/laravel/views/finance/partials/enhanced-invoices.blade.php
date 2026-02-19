{{--
    Enhanced Invoices Partial
    Shown as the default tab inside finance/index.blade.php
--}}
<div class="space-y-4">

    {{-- Quick Stats --}}
    <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
        @php
            $invoiceStats = [
                ['label' => 'Total Outstanding', 'value' => 'GHS ' . number_format($stats['outstanding'] ?? 0, 2), 'color' => 'blue'],
                ['label' => 'Overdue',           'value' => $stats['overdue_count'] ?? 0,      'sub' => 'invoices',   'color' => 'red'],
                ['label' => 'Paid This Month',   'value' => 'GHS ' . number_format($stats['paid_month'] ?? 0, 2), 'color' => 'green'],
                ['label' => 'Pending Approval',  'value' => $stats['pending_count'] ?? 0,       'sub' => 'invoices',   'color' => 'amber'],
            ];
        @endphp
        @foreach($invoiceStats as $s)
        <div class="card p-4">
            <p class="text-xs text-gray-400 uppercase tracking-wide">{{ $s['label'] }}</p>
            <p class="text-xl font-bold text-white mt-1">{{ $s['value'] }}</p>
            @isset($s['sub'])<p class="text-xs text-gray-500 mt-0.5">{{ $s['sub'] }}</p>@endisset
        </div>
        @endforeach
    </div>

    {{-- Filters --}}
    <form method="GET" action="{{ route('finance.index') }}" class="flex flex-wrap gap-3 items-end card p-4">
        <input type="hidden" name="tab" value="invoices">
        <div class="flex-1 min-w-[180px]">
            <label class="label">Search</label>
            <input type="text" name="search" value="{{ request('search') }}"
                   placeholder="Invoice #, customer…" class="input w-full">
        </div>
        <div class="w-36">
            <label class="label">Status</label>
            <select name="status" class="input w-full">
                <option value="">All</option>
                @foreach(['draft','sent','partial','paid','overdue','cancelled'] as $s)
                    <option value="{{ $s }}" @selected(request('status') === $s)>{{ ucfirst($s) }}</option>
                @endforeach
            </select>
        </div>
        <div class="w-36">
            <label class="label">Type</label>
            <select name="invoice_type" class="input w-full">
                <option value="">All Types</option>
                <option value="customs_clearance" @selected(request('invoice_type') === 'customs_clearance')>Customs Clearance</option>
                <option value="freight"           @selected(request('invoice_type') === 'freight')>Freight</option>
                <option value="trucking"          @selected(request('invoice_type') === 'trucking')>Trucking</option>
                <option value="consolidation"     @selected(request('invoice_type') === 'consolidation')>Consolidation</option>
                <option value="storage"           @selected(request('invoice_type') === 'storage')>Storage</option>
            </select>
        </div>
        <div class="w-32">
            <label class="label">From</label>
            <input type="date" name="date_from" value="{{ request('date_from') }}" class="input w-full">
        </div>
        <div class="w-32">
            <label class="label">To</label>
            <input type="date" name="date_to" value="{{ request('date_to') }}" class="input w-full">
        </div>
        <div class="flex gap-2">
            <button type="submit" class="btn-primary">Filter</button>
            <a href="{{ route('finance.index') }}?tab=invoices" class="btn-ghost">Clear</a>
            <a href="{{ route('finance.index') }}?tab=invoices&export=csv{{ request()->has('search') ? '&search='.request('search') : '' }}"
               class="btn-ghost">↓ CSV</a>
        </div>
    </form>

    {{-- Invoices Table --}}
    <div class="card overflow-hidden">
        <div class="flex items-center justify-between px-6 py-4 border-b border-white/10">
            <h2 class="text-base font-semibold text-white">Invoices</h2>
            <a href="{{ route('invoices.create') }}" class="btn-primary text-sm">+ New Invoice</a>
        </div>
        <div class="overflow-x-auto">
            <table class="w-full text-sm">
                <thead>
                    <tr class="border-b border-white/10">
                        <th class="th">Invoice #</th>
                        <th class="th">Customer</th>
                        <th class="th">Type</th>
                        <th class="th">Issue Date</th>
                        <th class="th">Due Date</th>
                        <th class="th text-right">Total</th>
                        <th class="th text-right">Outstanding</th>
                        <th class="th">Status</th>
                        <th class="th text-right">Actions</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-white/5">
                    @forelse($invoices ?? [] as $invoice)
                    <tr class="table-row-hover">
                        <td class="td font-mono text-blue-400">{{ $invoice->invoice_number }}</td>
                        <td class="td">
                            <div class="font-medium text-white text-sm">{{ Str::limit($invoice->customer, 25) }}</div>
                            @if($invoice->job_ref)
                                <div class="text-xs text-gray-500">{{ $invoice->job_ref }}</div>
                            @endif
                        </td>
                        <td class="td text-gray-400 text-xs">
                            {{ ucwords(str_replace('_', ' ', $invoice->service_type ?? $invoice->invoice_type)) }}
                        </td>
                        <td class="td text-gray-300">{{ \Carbon\Carbon::parse($invoice->issue_date)->format('d M Y') }}</td>
                        <td class="td">
                            <span class="{{ \Carbon\Carbon::parse($invoice->due_date)->isPast() && !in_array($invoice->status, ['paid','cancelled']) ? 'text-red-400' : 'text-gray-300' }}">
                                {{ \Carbon\Carbon::parse($invoice->due_date)->format('d M Y') }}
                            </span>
                        </td>
                        <td class="td text-right font-medium text-white">
                            {{ $invoice->currency }} {{ number_format($invoice->total_amount, 2) }}
                        </td>
                        <td class="td text-right text-amber-400 font-medium">
                            @php $outstanding = max(0, $invoice->total_amount - $invoice->paid_amount); @endphp
                            {{ $outstanding > 0 ? $invoice->currency . ' ' . number_format($outstanding, 2) : '—' }}
                        </td>
                        <td class="td">
                            @include('components.badge', ['status' => $invoice->status])
                        </td>
                        <td class="td">
                            <div class="flex items-center justify-end gap-2">
                                <a href="{{ route('invoices.show', $invoice) }}" class="icon-btn" title="View">
                                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0zM2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                                    </svg>
                                </a>
                                @if(in_array($invoice->status, ['draft','sent']))
                                <a href="{{ route('invoices.edit', $invoice) }}" class="icon-btn" title="Edit">
                                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                                    </svg>
                                </a>
                                @endif
                                @if($invoice->status === 'draft')
                                <form method="POST" action="{{ route('invoices.send', $invoice) }}" class="inline">
                                    @csrf @method('PATCH')
                                    <button class="icon-btn text-blue-400" title="Send">
                                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"/>
                                        </svg>
                                    </button>
                                </form>
                                @endif
                            </div>
                        </td>
                    </tr>
                    @empty
                    <tr>
                        <td colspan="9" class="td text-center py-12 text-gray-500">No invoices found</td>
                    </tr>
                    @endforelse
                </tbody>
            </table>
        </div>
        @if(isset($invoices) && $invoices->hasPages())
        <div class="p-4 border-t border-white/10">
            {{ $invoices->withQueryString()->links() }}
        </div>
        @endif
    </div>
</div>
