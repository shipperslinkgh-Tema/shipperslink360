<?php

namespace App\Events;

use App\Models\Profile;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class AccountLocked
{
    use Dispatchable, SerializesModels;

    public function __construct(
        public readonly Profile $profile,
        public readonly string  $ipAddress
    ) {}
}
