<?php

namespace App\Mail;

use App\Models\Profile;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class AccountLockedMail extends Mailable implements ShouldQueue
{
    use Queueable, SerializesModels;

    public function __construct(
        public readonly Profile $profile,
        public readonly string  $ipAddress
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: '🔒 Account Locked — SLAC FreightLink 360',
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.account-locked',
            with: [
                'profile'    => $this->profile,
                'fullName'   => $this->profile->full_name,
                'email'      => $this->profile->email,
                'staffId'    => $this->profile->staff_id,
                'lockedAt'   => now()->format('F j, Y \a\t H:i T'),
                'ipAddress'  => $this->ipAddress,
            ],
        );
    }

    public function attachments(): array
    {
        return [];
    }
}
