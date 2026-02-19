<?php

namespace App\Notifications;

use App\Models\FinanceInvoice;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class InvoiceOverdueNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(
        public readonly FinanceInvoice $invoice
    ) {}

    public function via(object $notifiable): array
    {
        return ['mail', 'database'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject("Invoice Overdue: {$this->invoice->invoice_number}")
            ->line("Invoice {$this->invoice->invoice_number} for {$this->invoice->customer} is overdue.")
            ->line("Amount outstanding: GHS " . number_format($this->invoice->total_amount - $this->invoice->paid_amount, 2))
            ->action('View Invoice', url("/finance/invoices/{$this->invoice->id}"))
            ->line('Please follow up with the customer immediately.');
    }

    public function toArray(object $notifiable): array
    {
        return [
            'invoice_id'     => $this->invoice->id,
            'invoice_number' => $this->invoice->invoice_number,
            'customer'       => $this->invoice->customer,
            'outstanding'    => $this->invoice->total_amount - $this->invoice->paid_amount,
        ];
    }
}
