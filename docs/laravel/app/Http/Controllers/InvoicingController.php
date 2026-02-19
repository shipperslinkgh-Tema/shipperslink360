<?php

namespace App\Http\Controllers;

use App\Models\Invoice;
use App\Models\InvoiceItem;
use App\Models\Customer;
use App\Models\Shipment;
use App\Http\Requests\StoreInvoiceRequest;
use Illuminate\Http\Request;

class InvoicingController extends Controller
{
    public function index(Request $request)
    {
        $query = Invoice::with('customer');

        if ($search = $request->get('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('invoice_number', 'like', "%{$search}%")
                  ->orWhere('job_ref', 'like', "%{$search}%")
                  ->orWhereHas('customer', fn($c) => $c->where('company_name', 'like', "%{$search}%"));
            });
        }

        if ($status = $request->get('status')) $query->where('status', $status);
        if ($type = $request->get('type')) $query->where('invoice_type', $type);

        $invoices = $query->latest()->paginate(25);

        $stats = [
            'total_outstanding' => Invoice::outstanding()->sum('total_amount'),
            'overdue_count'     => Invoice::overdue()->count(),
            'paid_mtd'          => Invoice::paid()->whereMonth('paid_date', now()->month)->sum('ghs_equivalent'),
        ];

        return view('invoicing.index', compact('invoices', 'stats'));
    }

    public function create()
    {
        $customers = Customer::active()->orderBy('company_name')->get();
        $shipments = Shipment::active()->with('customer')->get();
        return view('invoicing.create', compact('customers', 'shipments'));
    }

    public function store(StoreInvoiceRequest $request)
    {
        $data = $request->validated();
        $data['created_by'] = auth()->user()->profile->full_name;
        $items = $data['items'] ?? [];
        unset($data['items']);

        $invoice = Invoice::create($data);

        foreach ($items as $i => $item) {
            $item['invoice_id']   = $invoice->id;
            $item['sort_order']   = $i;
            $item['tax_amount']   = ($item['unit_price'] * $item['quantity']) * ($item['tax_rate'] / 100);
            $item['total_amount'] = ($item['unit_price'] * $item['quantity']) + $item['tax_amount'];
            InvoiceItem::create($item);
        }

        // Recalculate totals
        $invoice->subtotal    = $invoice->items->sum(fn($i) => $i->unit_price * $i->quantity);
        $invoice->tax_amount  = $invoice->items->sum('tax_amount');
        $invoice->total_amount= $invoice->subtotal + $invoice->tax_amount;
        $invoice->ghs_equivalent = $invoice->total_amount * $invoice->exchange_rate;
        $invoice->save();

        return redirect()->route('invoicing.show', $invoice)->with('success', "Invoice {$invoice->invoice_number} created.");
    }

    public function show(Invoice $invoice)
    {
        $invoice->load(['customer', 'items', 'shipment']);
        return view('invoicing.show', compact('invoice'));
    }

    public function edit(Invoice $invoice)
    {
        $customers = Customer::active()->orderBy('company_name')->get();
        $shipments = Shipment::active()->with('customer')->get();
        return view('invoicing.edit', compact('invoice', 'customers', 'shipments'));
    }

    public function send(Invoice $invoice)
    {
        $invoice->update(['status' => 'sent']);
        return back()->with('success', 'Invoice marked as sent.');
    }
}
