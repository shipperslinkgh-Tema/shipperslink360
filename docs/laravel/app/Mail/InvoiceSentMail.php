<?php

namespace App\Mail;

use App\Models\FinanceInvoice;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class InvoiceSentMail extends Mailable implements ShouldQueue
{
    use Queueable, SerializesModels;

    public function __construct(
        public readonly FinanceInvoice $invoice
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: "Invoice {$this->invoice->invoice_number} from SLAC FreightLink 360",
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.invoice-sent',
            with: [
                'invoice'        => $this->invoice,
                'invoiceNumber'  => $this->invoice->invoice_number,
                'customer'       => $this->invoice->customer,
                'totalAmount'    => $this->invoice->total_amount,
                'currency'       => $this->invoice->currency,
                'dueDate'        => $this->invoice->due_date,
                'serviceType'    => $this->invoice->service_type,
            ],
        );
    }

    public function attachments(): array
    {
        return [];
    }
}
