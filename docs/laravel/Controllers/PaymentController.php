<?php

namespace App\Http\Controllers;

use App\Models\AuditLog;
use App\Models\FinanceInvoice;
use App\Models\Payment;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class PaymentController extends Controller
{
    public function __construct()
    {
        $this->middleware(['auth', 'must.change.password', 'ensure.active']);
        $this->middleware('department:accounts,finance,management,super_admin');
    }

    public function index(Request $request)
    {
        $query = Payment::with('invoice')
            ->when($request->search, fn($q, $s) => $q->where(function ($q) use ($s) {
                $q->where('payment_ref', 'like', "%{$s}%")
                  ->orWhere('payer_name', 'like', "%{$s}%")
                  ->orWhereHas('invoice', fn($q) => $q->where('invoice_number', 'like', "%{$s}%"));
            }))
            ->when($request->method, fn($q, $m) => $q->where('payment_method', $m))
            ->when($request->status, fn($q, $s) => $q->where('status', $s))
            ->when($request->date_from, fn($q, $d) => $q->whereDate('payment_date', '>=', $d))
            ->when($request->date_to,   fn($q, $d) => $q->whereDate('payment_date', '<=', $d))
            ->latest('payment_date')
            ->paginate(25);

        $stats = [
            'total_collected' => Payment::where('status', 'completed')->sum('amount'),
            'this_month'      => Payment::where('status', 'completed')
                                    ->whereMonth('payment_date', now()->month)
                                    ->sum('amount'),
            'pending'         => Payment::where('status', 'pending')->count(),
            'total_count'     => Payment::count(),
        ];

        return view('payments.index', compact('query', 'stats'));
    }

    public function show(Payment $payment)
    {
        $payment->load('invoice.customer');
        return view('payments.show', compact('payment'));
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'invoice_id'     => 'nullable|uuid|exists:finance_invoices,id',
            'payer_name'     => 'required|string|max:200',
            'amount'         => 'required|numeric|min:0.01',
            'currency'       => 'required|string|max:10',
            'exchange_rate'  => 'required|numeric|min:0',
            'payment_method' => 'required|in:bank_transfer,cash,cheque,mobile_money,card',
            'payment_date'   => 'required|date',
            'reference'      => 'nullable|string|max:100',
            'notes'          => 'nullable|string|max:500',
        ]);

        $year  = date('Y');
        $month = date('m');
        $count = Payment::whereYear('created_at', $year)->whereMonth('created_at', $month)->count() + 1;

        $data['payment_ref']   = sprintf('PAY-%s%s-%04d', $year, $month, $count);
        $data['ghs_equivalent'] = $data['amount'] * $data['exchange_rate'];
        $data['status']        = 'completed';
        $data['received_by']   = auth()->user()->profile->full_name ?? 'System';

        $payment = Payment::create($data);

        // Update invoice paid amount & status
        if ($data['invoice_id']) {
            $invoice = FinanceInvoice::find($data['invoice_id']);
            if ($invoice) {
                $newPaid = $invoice->paid_amount + $data['ghs_equivalent'];
                $invoice->paid_amount = $newPaid;
                $invoice->status = $newPaid >= $invoice->total_amount ? 'paid' : 'partial';
                if ($invoice->status === 'paid') {
                    $invoice->paid_date = now()->toDateString();
                }
                $invoice->save();
            }
        }

        AuditLog::record('payment_recorded', 'payment', $payment->id, [
            'ref'    => $payment->payment_ref,
            'amount' => $payment->amount,
        ]);

        return redirect()->route('payments.show', $payment)
            ->with('success', "Payment {$payment->payment_ref} recorded successfully.");
    }

    public function destroy(Payment $payment)
    {
        // Reverse invoice payment if linked
        if ($payment->invoice_id && $payment->status === 'completed') {
            $invoice = FinanceInvoice::find($payment->invoice_id);
            if ($invoice) {
                $invoice->paid_amount = max(0, $invoice->paid_amount - $payment->ghs_equivalent);
                $invoice->status = $invoice->paid_amount <= 0 ? 'sent' : 'partial';
                $invoice->save();
            }
        }

        AuditLog::record('payment_deleted', 'payment', $payment->id, ['ref' => $payment->payment_ref]);
        $payment->delete();

        return redirect()->route('payments.index')
            ->with('success', 'Payment record deleted.');
    }
}
