<?php

namespace App\Http\Controllers;

use App\Models\Invoice;
use App\Models\InvoiceItem;
use App\Models\Expense;
use App\Models\Payment;
use App\Models\TaxFiling;
use App\Models\RegistrarRenewal;
use App\Models\JobCosting;
use App\Models\Customer;
use App\Http\Requests\StoreExpenseRequest;
use App\Http\Requests\StorePaymentRequest;
use Illuminate\Http\Request;

class FinanceController extends Controller
{
    public function index()
    {
        $metrics = [
            'mtd_revenue'       => Invoice::paid()->whereMonth('paid_date', now()->month)->sum('ghs_equivalent'),
            'mtd_costs'         => Expense::where('status', 'paid')->whereMonth('paid_date', now()->month)->sum('ghs_equivalent'),
            'pending_invoices'  => Invoice::where('status', 'sent')->count(),
            'overdue_invoices'  => Invoice::overdue()->count(),
            'pending_payables'  => Payment::outgoing()->where('status', 'pending')->count(),
            'cash_position'     => Payment::incoming()->completed()->whereMonth('payment_date', now()->month)->sum('ghs_equivalent')
                                   - Payment::outgoing()->completed()->whereMonth('payment_date', now()->month)->sum('ghs_equivalent'),
            'tax_alerts'        => TaxFiling::overdue()->count() + TaxFiling::dueSoon(30)->count(),
            'renewal_alerts'    => RegistrarRenewal::expiringSoon(30)->count() + RegistrarRenewal::expired()->count(),
        ];

        $invoices        = Invoice::with('customer')->latest()->get();
        $expenses        = Expense::latest()->paginate(20);
        $taxFilings      = TaxFiling::orderBy('due_date')->get();
        $renewals        = RegistrarRenewal::orderBy('expiry_date')->get();
        $jobCostings     = JobCosting::with(['customer', 'shipment'])->latest()->paginate(20);

        return view('finance.index', compact('metrics', 'invoices', 'expenses', 'taxFilings', 'renewals', 'jobCostings'));
    }

    public function storeExpense(StoreExpenseRequest $request)
    {
        $data = $request->validated();
        $data['ghs_equivalent'] = $data['amount'] * ($data['exchange_rate'] ?? 1);
        Expense::create($data);
        return back()->with('success', 'Expense recorded.');
    }

    public function approveExpense(Expense $expense)
    {
        $expense->update(['status' => 'approved', 'approved_by' => auth()->user()->profile->full_name]);
        return back()->with('success', 'Expense approved.');
    }

    public function storePayment(StorePaymentRequest $request)
    {
        $data = $request->validated();
        $count = Payment::whereYear('created_at', now()->year)->count() + 1;
        $data['payment_ref'] = 'PAY-' . now()->year . '-' . str_pad($count, 4, '0', STR_PAD_LEFT);
        $data['ghs_equivalent'] = $data['amount'] * ($data['exchange_rate'] ?? 1);
        $data['created_by'] = auth()->user()->profile->full_name;

        $payment = Payment::create($data);

        if ($payment->invoice_id) {
            $invoice = Invoice::find($payment->invoice_id);
            $invoice->increment('paid_amount', $payment->amount);
            $invoice->status = $invoice->paid_amount >= $invoice->total_amount ? 'paid' : 'partially_paid';
            $invoice->save();
        }

        return back()->with('success', 'Payment recorded.');
    }
}
