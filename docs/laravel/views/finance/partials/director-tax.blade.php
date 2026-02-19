{{-- finance/partials/director-tax.blade.php --}}
<div class="rounded-xl border border-border bg-card overflow-hidden">
    <div class="p-5 border-b border-border flex items-center justify-between">
        <div>
            <h3 class="font-semibold text-foreground">Director Tax Reminders</h3>
            <p class="text-sm text-muted-foreground mt-1">Personal income tax and compliance deadlines</p>
        </div>
        <button class="px-3 py-1.5 bg-primary text-primary-foreground rounded-lg text-sm">+ Add Reminder</button>
    </div>
    <table class="w-full">
        <thead><tr class="border-b border-border bg-muted/30">
            <th class="px-5 py-3 text-left text-xs font-medium uppercase text-muted-foreground">Director</th>
            <th class="px-5 py-3 text-left text-xs font-medium uppercase text-muted-foreground">Tax Type</th>
            <th class="px-5 py-3 text-left text-xs font-medium uppercase text-muted-foreground">Amount</th>
            <th class="px-5 py-3 text-left text-xs font-medium uppercase text-muted-foreground">Due Date</th>
            <th class="px-5 py-3 text-left text-xs font-medium uppercase text-muted-foreground">Status</th>
        </tr></thead>
        <tbody class="divide-y divide-border">
            @forelse($directorTaxReminders ?? [] as $reminder)
            <tr class="data-row">
                <td class="px-5 py-4 text-sm font-medium text-foreground">{{ $reminder->directorName ?? '' }}</td>
                <td class="px-5 py-4 text-sm text-foreground">{{ $reminder->taxType ?? '' }}</td>
                <td class="px-5 py-4 text-sm font-semibold text-foreground">{{ $reminder->currency ?? 'GHS' }} {{ number_format($reminder->amount ?? 0, 2) }}</td>
                <td class="px-5 py-4 text-sm text-muted-foreground">{{ isset($reminder->dueDate) ? \Carbon\Carbon::parse($reminder->dueDate)->format('M d, Y') : '' }}</td>
                <td class="px-5 py-4">
                    @php $sc = ['pending' => 'status-warning','filed' => 'status-info','paid' => 'status-success','overdue' => 'status-danger']; @endphp
                    <span class="status-badge {{ $sc[$reminder->status ?? 'pending'] ?? 'status-pending' }}">{{ ucfirst($reminder->status ?? 'pending') }}</span>
                </td>
            </tr>
            @empty
            <tr><td colspan="5">@include('components.empty-state', ['message' => 'No director tax reminders.', 'icon' => '📋'])</td></tr>
            @endforelse
        </tbody>
    </table>
</div>
