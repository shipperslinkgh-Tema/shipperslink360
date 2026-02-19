@extends('layouts.app')
@section('title', 'New Invoice')
@section('content')
<div class="max-w-4xl mx-auto space-y-6" x-data="{
    items: [{ description: '', cost_category: '', quantity: 1, unit_price: 0, currency: 'GHS', tax_rate: 0 }],
    addItem() { this.items.push({ description: '', cost_category: '', quantity: 1, unit_price: 0, currency: 'GHS', tax_rate: 0 }); },
    removeItem(i) { if (this.items.length > 1) this.items.splice(i, 1); },
    subtotal() { return this.items.reduce((s, i) => s + (i.quantity * i.unit_price), 0); },
    taxTotal() { return this.items.reduce((s, i) => s + (i.quantity * i.unit_price * i.tax_rate / 100), 0); },
    total() { return this.subtotal() + this.taxTotal(); }
}">
    <h1 class="text-2xl font-bold text-foreground">New Invoice</h1>
    <form action="{{ route('invoicing.store') }}" method="POST" class="space-y-6">
        @csrf
        <div class="rounded-xl border border-border bg-card p-6 space-y-4">
            <h3 class="font-semibold text-foreground">Invoice Details</h3>
            <div class="grid grid-cols-2 gap-4">
                <div>
                    <label class="block text-xs font-medium text-muted-foreground mb-1">Invoice Type *</label>
                    <select name="invoice_type" required class="w-full px-3 py-2 bg-background border border-input rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary">
                        @foreach(['proforma' => 'Proforma', 'commercial' => 'Commercial', 'credit_note' => 'Credit Note', 'debit_note' => 'Debit Note'] as $val => $label)
                        <option value="{{ $val }}">{{ $label }}</option>
                        @endforeach
                    </select>
                </div>
                <div>
                    <label class="block text-xs font-medium text-muted-foreground mb-1">Customer *</label>
                    <select name="customer_id" required class="w-full px-3 py-2 bg-background border border-input rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary">
                        <option value="">Select customer...</option>
                        @foreach($customers as $c)
                        <option value="{{ $c->id }}">{{ $c->company_name }}</option>
                        @endforeach
                    </select>
                </div>
                <div>
                    <label class="block text-xs font-medium text-muted-foreground mb-1">Service Type *</label>
                    <select name="service_type" required class="w-full px-3 py-2 bg-background border border-input rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary">
                        @foreach(config('shipperlink.service_types') as $val => $label)
                        <option value="{{ $val }}">{{ $label }}</option>
                        @endforeach
                    </select>
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
                    <label class="block text-xs font-medium text-muted-foreground mb-1">Exchange Rate</label>
                    <input type="number" name="exchange_rate" value="1" step="0.0001" min="0" class="w-full px-3 py-2 bg-background border border-input rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary">
                </div>
                <div>
                    <label class="block text-xs font-medium text-muted-foreground mb-1">Job Ref</label>
                    <input type="text" name="job_ref" placeholder="e.g. SHP-2026-0001" class="w-full px-3 py-2 bg-background border border-input rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary">
                </div>
                <div>
                    <label class="block text-xs font-medium text-muted-foreground mb-1">Issue Date *</label>
                    <input type="date" name="issue_date" value="{{ now()->format('Y-m-d') }}" required class="w-full px-3 py-2 bg-background border border-input rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary">
                </div>
                <div>
                    <label class="block text-xs font-medium text-muted-foreground mb-1">Due Date *</label>
                    <input type="date" name="due_date" value="{{ now()->addDays(30)->format('Y-m-d') }}" required class="w-full px-3 py-2 bg-background border border-input rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary">
                </div>
                <div class="col-span-2">
                    <label class="block text-xs font-medium text-muted-foreground mb-1">Notes</label>
                    <textarea name="notes" rows="2" class="w-full px-3 py-2 bg-background border border-input rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"></textarea>
                </div>
            </div>
        </div>

        {{-- Line Items --}}
        <div class="rounded-xl border border-border bg-card p-6 space-y-4">
            <div class="flex items-center justify-between">
                <h3 class="font-semibold text-foreground">Line Items</h3>
                <button type="button" @click="addItem()" class="text-sm text-primary hover:underline">+ Add Line</button>
            </div>
            <template x-for="(item, i) in items" :key="i">
                <div class="grid grid-cols-12 gap-2 items-end">
                    <div class="col-span-4">
                        <label class="block text-xs text-muted-foreground mb-1">Description *</label>
                        <input type="text" :name="'items[' + i + '][description]'" x-model="item.description" required class="w-full px-2 py-2 bg-background border border-input rounded text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary">
                    </div>
                    <div class="col-span-2">
                        <label class="block text-xs text-muted-foreground mb-1">Category</label>
                        <select :name="'items[' + i + '][cost_category]'" x-model="item.cost_category" class="w-full px-2 py-2 bg-background border border-input rounded text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary">
                            <option value="">None</option>
                            <option value="freight_sea">Sea Freight</option>
                            <option value="customs_duty">Customs Duty</option>
                            <option value="gpha_charges">GPHA</option>
                            <option value="agency_fee">Agency Fee</option>
                            <option value="trucking">Trucking</option>
                            <option value="other">Other</option>
                        </select>
                    </div>
                    <div class="col-span-1">
                        <label class="block text-xs text-muted-foreground mb-1">Qty *</label>
                        <input type="number" :name="'items[' + i + '][quantity]'" x-model="item.quantity" step="0.01" min="0.01" required class="w-full px-2 py-2 bg-background border border-input rounded text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary">
                    </div>
                    <div class="col-span-2">
                        <label class="block text-xs text-muted-foreground mb-1">Unit Price *</label>
                        <input type="number" :name="'items[' + i + '][unit_price]'" x-model="item.unit_price" step="0.01" min="0" required class="w-full px-2 py-2 bg-background border border-input rounded text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary">
                    </div>
                    <div class="col-span-1">
                        <label class="block text-xs text-muted-foreground mb-1">Tax %</label>
                        <input type="number" :name="'items[' + i + '][tax_rate]'" x-model="item.tax_rate" step="0.01" min="0" max="100" class="w-full px-2 py-2 bg-background border border-input rounded text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary">
                    </div>
                    <input type="hidden" :name="'items[' + i + '][currency]'" x-model="item.currency">
                    <div class="col-span-1">
                        <p class="text-xs text-muted-foreground mb-1">Total</p>
                        <p class="text-sm font-medium text-foreground py-2" x-text="(item.quantity * item.unit_price * (1 + item.tax_rate/100)).toFixed(2)"></p>
                    </div>
                    <div class="col-span-1">
                        <button type="button" @click="removeItem(i)" class="w-full py-2 text-destructive hover:text-destructive/80 text-sm">✕</button>
                    </div>
                </div>
            </template>
            <div class="border-t border-border pt-4 text-right space-y-1">
                <p class="text-sm text-muted-foreground">Subtotal: <span class="font-semibold text-foreground" x-text="subtotal().toFixed(2)"></span></p>
                <p class="text-sm text-muted-foreground">Tax: <span class="font-semibold text-foreground" x-text="taxTotal().toFixed(2)"></span></p>
                <p class="text-base font-bold text-foreground">Total: <span x-text="total().toFixed(2)"></span></p>
            </div>
        </div>

        <div class="flex gap-3 justify-end">
            <a href="{{ route('invoicing.index') }}" class="px-4 py-2 border border-border rounded-lg text-sm text-foreground hover:bg-muted/50">Cancel</a>
            <button type="submit" class="px-6 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors">Create Invoice</button>
        </div>
    </form>
</div>
@endsection
