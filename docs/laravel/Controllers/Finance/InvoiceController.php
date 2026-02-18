<?php

namespace App\Http\Controllers\Finance;

use App\Http\Controllers\Controller;
use App\Http\Requests\Finance\StoreInvoiceRequest;
use App\Http\Requests\Finance\UpdateInvoiceRequest;
use App\Http\Requests\Finance\RecordPaymentRequest;
use App\Models\AuditLog;
use App\Models\FinanceInvoice;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class InvoiceController extends Controller
{
    /**
     * List finance invoices with filters.
     * GET /api/v1/finance/invoices
     */
    public function index(Request $request): JsonResponse
    {
        $query = FinanceInvoice::query()
            ->when($request->search, fn ($q) => $q->where(function ($q) use ($request) {
                $q->where('invoice_number', 'like', "%{$request->search}%")
                  ->orWhere('customer', 'like', "%{$request->search}%");
            }))
            ->when($request->status, fn ($q) => $q->where('status', $request->status))
            ->when($request->customer_id, fn ($q) => $q->where('customer_id', $request->customer_id))
            ->when($request->from_date, fn ($q) => $q->whereDate('issue_date', '>=', $request->from_date))
            ->when($request->to_date, fn ($q) => $q->whereDate('issue_date', '<=', $request->to_date))
            ->orderByDesc('created_at');

        $invoices = $query->paginate($request->per_page ?? 20);

        return response()->json([
            'data' => $invoices->items(),
            'meta' => [
                'current_page' => $invoices->currentPage(),
                'last_page'    => $invoices->lastPage(),
                'per_page'     => $invoices->perPage(),
                'total'        => $invoices->total(),
            ],
        ]);
    }

    /**
     * Create a finance invoice.
     * POST /api/v1/finance/invoices
     */
    public function store(StoreInvoiceRequest $request): JsonResponse
    {
        $data = $request->validated();

        // Auto-generate invoice number: INV-YYYY-NNNNNN
        $data['invoice_number'] = $this->generateInvoiceNumber();

        // Compute GHS equivalent
        $data['ghs_equivalent'] = $data['total_amount'] * ($data['exchange_rate'] ?? 1);

        $data['created_by'] = auth()->id();
        $data['status']     = 'draft';

        $invoice = FinanceInvoice::create($data);

        AuditLog::log(
            userId: auth()->id(),
            action: 'create_invoice',
            resourceType: 'invoice',
            resourceId: $invoice->id,
            details: ['invoice_number' => $invoice->invoice_number, 'total_amount' => $invoice->total_amount],
            ipAddress: request()->ip()
        );

        return response()->json(['data' => $invoice], 201);
    }

    /**
     * Show a single invoice.
     * GET /api/v1/finance/invoices/{id}
     */
    public function show(string $id): JsonResponse
    {
        $invoice = FinanceInvoice::findOrFail($id);

        return response()->json(['data' => $invoice]);
    }

    /**
     * Update an invoice.
     * PUT /api/v1/finance/invoices/{id}
     */
    public function update(UpdateInvoiceRequest $request, string $id): JsonResponse
    {
        $invoice = FinanceInvoice::findOrFail($id);

        abort_if(in_array($invoice->status, ['paid', 'cancelled']), 422, 'Cannot edit a paid or cancelled invoice.');

        $data = $request->validated();

        if (isset($data['total_amount'])) {
            $data['ghs_equivalent'] = $data['total_amount'] * ($data['exchange_rate'] ?? $invoice->exchange_rate);
        }

        $invoice->update($data);

        AuditLog::log(
            userId: auth()->id(),
            action: 'update_invoice',
            resourceType: 'invoice',
            resourceId: $invoice->id,
            details: $data,
            ipAddress: request()->ip()
        );

        return response()->json(['data' => $invoice->fresh()]);
    }

    /**
     * Record a payment against an invoice.
     * POST /api/v1/finance/invoices/{id}/pay
     */
    public function recordPayment(RecordPaymentRequest $request, string $id): JsonResponse
    {
        $invoice = FinanceInvoice::findOrFail($id);

        abort_if($invoice->status === 'paid', 422, 'Invoice is already fully paid.');
        abort_if($invoice->status === 'cancelled', 422, 'Cannot pay a cancelled invoice.');

        $invoice->recordPayment(
            amount: $request->amount,
            date: $request->paid_date,
            method: $request->payment_method
        );

        AuditLog::log(
            userId: auth()->id(),
            action: 'pay_invoice',
            resourceType: 'invoice',
            resourceId: $invoice->id,
            details: ['amount' => $request->amount, 'method' => $request->payment_method],
            ipAddress: request()->ip()
        );

        return response()->json(['data' => $invoice->fresh()]);
    }

    /**
     * Cancel an invoice.
     * POST /api/v1/finance/invoices/{id}/cancel
     */
    public function cancel(string $id): JsonResponse
    {
        $invoice = FinanceInvoice::findOrFail($id);

        abort_if($invoice->status === 'paid', 422, 'Cannot cancel a paid invoice.');

        $invoice->update(['status' => 'cancelled']);

        AuditLog::log(
            userId: auth()->id(),
            action: 'cancel_invoice',
            resourceType: 'invoice',
            resourceId: $invoice->id,
            details: [],
            ipAddress: request()->ip()
        );

        return response()->json(['data' => $invoice->fresh()]);
    }

    /**
     * Delete a draft invoice.
     * DELETE /api/v1/finance/invoices/{id}
     */
    public function destroy(string $id): JsonResponse
    {
        $invoice = FinanceInvoice::findOrFail($id);

        abort_if($invoice->status !== 'draft', 422, 'Only draft invoices can be deleted.');

        AuditLog::log(
            userId: auth()->id(),
            action: 'delete_invoice',
            resourceType: 'invoice',
            resourceId: $invoice->id,
            details: ['invoice_number' => $invoice->invoice_number],
            ipAddress: request()->ip()
        );

        $invoice->delete();

        return response()->json([], 204);
    }

    // ── Private helpers ───────────────────────────────────────────

    private function generateInvoiceNumber(): string
    {
        $year    = now()->year;
        $lastNum = FinanceInvoice::whereYear('created_at', $year)->count();

        return sprintf('INV-%d-%06d', $year, $lastNum + 1);
    }
}
