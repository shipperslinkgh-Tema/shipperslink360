<?php

namespace App\Providers;

use App\Events\AccountLocked;
use App\Events\ShipmentStatusChanged;
use App\Listeners\SendAccountLockedEmail;
use App\Listeners\SendShipmentStatusEmail;
use Illuminate\Auth\Events\Registered;
use Illuminate\Auth\Listeners\SendEmailVerificationNotification;
use Illuminate\Foundation\Support\Providers\EventServiceProvider as ServiceProvider;

class EventServiceProvider extends ServiceProvider
{
    /**
     * The event to listener mappings for the application.
     */
    protected $listen = [
        // Built-in Laravel events
        Registered::class => [
            SendEmailVerificationNotification::class,
        ],

        // Account security events
        AccountLocked::class => [
            SendAccountLockedEmail::class,
        ],

        // Shipment status events
        ShipmentStatusChanged::class => [
            SendShipmentStatusEmail::class,
        ],

        // NOTE: NotificationCreated, BankSynced, BankAlertCreated are
        // ShouldBroadcast events — they broadcast via Pusher automatically.
        // No listeners required unless you need additional side effects.
    ];

    /**
     * Register any events for your application.
     */
    public function boot(): void
    {
        //
    }

    /**
     * Determine if events and listeners should be automatically discovered.
     */
    public function shouldDiscoverEvents(): bool
    {
        return false;
    }
}
