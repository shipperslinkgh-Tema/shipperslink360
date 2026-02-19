{{-- Finance Expenses Partial --}}
<div class="flex items-center justify-between mb-4">
    <h2 class="text-sm font-semibold text-white">Expenses</h2>
    <a href="{{ route('finance.expenses.create') }}" class="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-lg transition-colors">+ Log Expense</a>
</div>
<form method="GET" class="flex flex-wrap gap-3 mb-4">
    <input type="hidden" name="tab" value="expenses"/>
    <select name="status" class="px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500">
        <option value="">All Statuses</option>
        @foreach(['pending','approved','rejected','paid'] as $s)
            <option value="{{ $s }}" {{ request('status') === $s ? 'selected' : '' }}>{{ ucfirst($s) }}</option>
        @endforeach
    </select>
    <select name="category" class="px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500">
        <option value="">All Categories</option>
        @foreach(config('shipperlink.expense_categories', []) as $cat)
            <option value="{{ $cat }}" {{ request('category') === $cat ? 'selected' : '' }}>{{ ucwords(str_replace('_',' ',$cat)) }}</option>
        @endforeach
    </select>
    <button type="submit" class="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white text-sm rounded-lg">Filter</button>
</form>
<div class="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
    <table class="w-full text-sm">
        <thead>
            <tr class="border-b border-gray-800 text-xs text-gray-500 uppercase tracking-wider">
                <th class="px-6 py-3 text-left font-medium">Ref</th>
                <th class="px-6 py-3 text-left font-medium">Description</th>
                <th class="px-6 py-3 text-left font-medium hidden md:table-cell">Category</th>
                <th class="px-6 py-3 text-left font-medium">Amount (GHS)</th>
                <th class="px-6 py-3 text-left font-medium hidden lg:table-cell">Date</th>
                <th class="px-6 py-3 text-left font-medium">Status</th>
                <th class="px-6 py-3 text-right font-medium">Action</th>
            </tr>
        </thead>
        <tbody class="divide-y divide-gray-800">
            @forelse($expenses ?? [] as $exp)
                <tr class="hover:bg-gray-800/40 transition-colors">
                    <td class="px-6 py-4 font-mono text-xs text-blue-400">{{ $exp->expense_ref }}</td>
                    <td class="px-6 py-4 text-white max-w-xs truncate">{{ $exp->description }}</td>
                    <td class="px-6 py-4 text-gray-400 hidden md:table-cell text-xs">{{ ucwords(str_replace('_',' ',$exp->category)) }}</td>
                    <td class="px-6 py-4 text-white font-semibold">{{ number_format($exp->ghs_equivalent, 2) }}</td>
                    <td class="px-6 py-4 text-gray-400 text-xs hidden lg:table-cell">{{ \Carbon\Carbon::parse($exp->expense_date)->format('d M Y') }}</td>
                    <td class="px-6 py-4">@include('components.badge', ['status' => $exp->status, 'type' => 'expense'])</td>
                    <td class="px-6 py-4 text-right">
                        @if($exp->status === 'pending')
                            <form method="POST" action="{{ route('finance.expenses.approve', $exp) }}" class="inline">
                                @csrf
                                <button type="submit" class="text-xs text-emerald-400 hover:text-emerald-300 mr-3">Approve</button>
                            </form>
                        @endif
                    </td>
                </tr>
            @empty
                <tr><td colspan="7">@include('components.empty-state', ['message' => 'No expenses found'])</td></tr>
            @endforelse
        </tbody>
    </table>
</div>
