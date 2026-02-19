{{-- finance/partials/payment-voucher-form.blade.php --}}
<div x-data="{ open: false }">
    <button @click="open = true" class="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90">
        + Payment Voucher
    </button>

    <div x-show="open" x-cloak class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" @click.self="open = false">
        <div class="bg-card border border-border rounded-xl shadow-2xl w-full max-w-lg">
            <div class="flex items-center justify-between p-5 border-b border-border">
                <h3 class="font-semibold text-foreground">Create Payment Voucher</h3>
                <button @click="open = false" class="text-muted-foreground hover:text-foreground">✕</button>
            </div>
            <form action="{{ route('finance.payments.store') }}" method="POST" class="p-5 space-y-4">
                @csrf
                <input type="hidden" name="type" value="outgoing">
                <div class="grid grid-cols-2 gap-4">
                    <div>
                        <label class="block text-xs font-medium text-muted-foreground mb-1">Pay To (Vendor) *</label>
                        <input type="text" name="description" required placeholder="Vendor / Beneficiary name" class="w-full px-3 py-2 bg-background border border-input rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary">
                    </div>
                    <div>
                        <label class="block text-xs font-medium text-muted-foreground mb-1">Category *</label>
                        <select name="category" required class="w-full px-3 py-2 bg-background border border-input rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary">
                            <option value="customs_duty">Customs Duty</option>
                            <option value="freight">Freight</option>
                            <option value="gpha_charges">GPHA Charges</option>
                            <option value="trucking">Trucking</option>
                            <option value="agency_fee">Agency Fee</option>
                            <option value="other">Other</option>
                        </select>
                    </div>
                    <div>
                        <label class="block text-xs font-medium text-muted-foreground mb-1">Amount *</label>
                        <input type="number" name="amount" step="0.01" min="0.01" required class="w-full px-3 py-2 bg-background border border-input rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary">
                    </div>
                    <div>
                        <label class="block text-xs font-medium text-muted-foreground mb-1">Currency *</label>
                        <select name="currency" required class="w-full px-3 py-2 bg-background border border-input rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary">
                            @foreach(config('shipperlink.currencies') as $cur)
                            <option value="{{ $cur }}" {{ $cur === 'GHS' ? 'selected' : '' }}>{{ $cur }}</option>
                            @endforeach
                        </select>
                    </div>
                    <div>
                        <label class="block text-xs font-medium text-muted-foreground mb-1">Payment Method *</label>
                        <select name="method" required class="w-full px-3 py-2 bg-background border border-input rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary">
                            <option value="bank_transfer">Bank Transfer</option>
                            <option value="cheque">Cheque</option>
                            <option value="cash">Cash</option>
                            <option value="mobile_money">Mobile Money</option>
                        </select>
                    </div>
                    <div>
                        <label class="block text-xs font-medium text-muted-foreground mb-1">Payment Date *</label>
                        <input type="date" name="payment_date" value="{{ now()->format('Y-m-d') }}" required class="w-full px-3 py-2 bg-background border border-input rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary">
                    </div>
                </div>
                <div class="flex gap-3 justify-end pt-2">
                    <button type="button" @click="open = false" class="px-4 py-2 border border-border rounded-lg text-sm text-foreground hover:bg-muted/50">Cancel</button>
                    <button type="submit" class="px-6 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90">Create Voucher</button>
                </div>
            </form>
        </div>
    </div>
</div>
