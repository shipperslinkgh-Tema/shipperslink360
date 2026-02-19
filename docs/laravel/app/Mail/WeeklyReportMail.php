<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class WeeklyReportMail extends Mailable implements ShouldQueue
{
    use Queueable, SerializesModels;

    public function __construct(
        public readonly string $recipientName,
        public readonly array  $reportData
    ) {}

    public function envelope(): Envelope
    {
        $week = now()->startOfWeek()->format('M j') . ' – ' . now()->endOfWeek()->format('M j, Y');
        return new Envelope(
            subject: "Weekly Finance Report — {$week} | SLAC FreightLink 360",
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.weekly-report',
            with: [
                'recipientName' => $this->recipientName,
                'weekLabel'     => now()->startOfWeek()->format('M j') . ' – ' . now()->endOfWeek()->format('M j, Y'),
                'report'        => $this->reportData,
                // Expected reportData keys:
                // 'totalRevenue'        => float (GHS)
                // 'totalExpenses'       => float (GHS)
                // 'netProfit'           => float (GHS)
                // 'invoicesIssued'      => int
                // 'invoicesPaid'        => int
                // 'invoicesOverdue'     => int
                // 'expensesApproved'    => int
                // 'expensesPending'     => int
                // 'bankReconciled'      => bool
                // 'topExpenseCategory' => string
            ],
        );
    }

    public function attachments(): array
    {
        return [];
    }
}
