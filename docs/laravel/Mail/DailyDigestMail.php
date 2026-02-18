<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class DailyDigestMail extends Mailable implements ShouldQueue
{
    use Queueable, SerializesModels;

    public function __construct(
        public readonly string $recipientName,
        public readonly string $department,
        public readonly array  $digestData
    ) {}

    public function envelope(): Envelope
    {
        $date = now()->format('l, F j, Y');
        return new Envelope(
            subject: "Daily Digest — {$date} | SLAC FreightLink 360",
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.daily-digest',
            with: [
                'recipientName' => $this->recipientName,
                'department'    => ucfirst(str_replace('_', ' ', $this->department)),
                'date'          => now()->format('l, F j, Y'),
                'digest'        => $this->digestData,
                // Expected digestData keys (all optional):
                // 'overdueInvoices'   => int
                // 'pendingExpenses'   => int
                // 'newShipments'      => int
                // 'bankAlerts'        => int
                // 'pendingMessages'   => int
                // 'totalReceivables'  => float
                // 'totalPayables'     => float
                // 'currency'          => string (GHS)
            ],
        );
    }

    public function attachments(): array
    {
        return [];
    }
}
