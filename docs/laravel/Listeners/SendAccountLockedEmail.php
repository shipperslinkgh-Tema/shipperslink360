<?php

namespace App\Listeners;

use App\Events\AccountLocked;
use App\Mail\AccountLockedMail;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Log;

class SendAccountLockedEmail implements ShouldQueue
{
    use InteractsWithQueue;

    public int $tries = 3;

    public function handle(AccountLocked $event): void
    {
        Mail::to(config('mail.admin_address', 'admin@shipperslink.com'))
            ->send(new AccountLockedMail($event->profile, $event->ipAddress));

        Log::info("[SendAccountLockedEmail] Notified admin of locked account: {$event->profile->email}");
    }
}
