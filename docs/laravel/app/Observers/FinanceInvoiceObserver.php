<?php

namespace App\Observers;

use App\Models\FinanceInvoice;
use App\Models\AppNotification;
use App\Mail\InvoiceSentMail;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Request;

class FinanceInvoiceObserver
{
    public function created(FinanceInvoice $invoice): void
    {
        \App\Models\AuditLog::create([
            'user_id'       => Auth::id(),
            'action'        => 'create_invoice',
            'resource_type' => 'invoice',
            'resource_id'   => $invoice->id,
            'details'       => [
                'invoice_number' => $invoice->invoice_number,
                'customer'       => $invoice->customer,
                'total_amount'   => $invoice->total_amount,
                'currency'       => $invoice->currency,
                'status'         => $invoice->status,
            ],
            'ip_address'    => Request::ip(),
        ]);
    }

    public function updated(FinanceInvoice $invoice): void
    {
        $dirty = $invoice->getDirty();

        // Determine action label for audit log
        $action = 'update_invoice';
        if (isset($dirty['status'])) {
            $action = match ($dirty['status']) {
                'sent'           => 'send_invoice',
                'paid'           => 'mark_invoice_paid',
                'cancelled'      => 'cancel_invoice',
                'partially_paid' => 'partial_payment_invoice',
                default          => 'update_invoice',
            };
        }

        \App\Models\AuditLog::create([
            'user_id'       => Auth::id(),
            'action'        => $action,
            'resource_type' => 'invoice',
            'resource_id'   => $invoice->id,
            'details'       => [
                'changes' => $dirty,
                'before'  => array_intersect_key($invoice->getOriginal(), $dirty),
            ],
            'ip_address'    => Request::ip(),
        ]);

        // ── Status-specific side effects ──────────────────────
        if (isset($dirty['status']) && $dirty['status'] === 'sent') {
            // Queue invoice email to customer
            Mail::to($invoice->customer_email ?? '')
                ->queue(new InvoiceSentMail($invoice));
        }
    }

    public function deleted(FinanceInvoice $invoice): void
    {
        \App\Models\AuditLog::create([
            'user_id'       => Auth::id(),
            'action'        => 'delete_invoice',
            'resource_type' => 'invoice',
            'resource_id'   => $invoice->id,
            'details'       => ['invoice_number' => $invoice->invoice_number],
            'ip_address'    => Request::ip(),
        ]);
    }
}
