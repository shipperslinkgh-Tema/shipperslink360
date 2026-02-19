<?php

namespace App\Console\Commands;

use App\Models\FinanceInvoice;
use App\Models\AppNotification;
use Illuminate\Console\Command;

class CheckOverdueInvoicesCommand extends Command
{
    protected $signature   = 'invoices:check-overdue';
    protected $description = 'Mark overdue invoices and generate notifications';

    public function handle(): int
    {
        $count = 0;

        FinanceInvoice::where('status', 'sent')
            ->where('due_date', '<', now()->toDateString())
            ->chunkById(100, function ($invoices) use (&$count) {
                foreach ($invoices as $invoice) {
                    $invoice->update(['status' => 'overdue']);

                    AppNotification::create([
                        'title'              => "Invoice Overdue: {$invoice->invoice_number}",
                        'message'            => "{$invoice->customer} — GHS " . number_format($invoice->total_amount - $invoice->paid_amount, 2) . ' overdue.',
                        'type'               => 'invoice_overdue',
                        'category'           => 'finance',
                        'priority'           => 'high',
                        'reference_type'     => 'finance_invoice',
                        'reference_id'       => $invoice->id,
                        'recipient_department' => 'accounts',
                        'action_url'         => "/finance/invoices/{$invoice->id}",
                    ]);

                    $count++;
                }
            });

        $this->info("Marked {$count} invoice(s) as overdue.");
        return Command::SUCCESS;
    }
}
