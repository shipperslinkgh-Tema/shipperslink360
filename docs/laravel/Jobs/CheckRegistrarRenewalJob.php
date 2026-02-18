<?php

namespace App\Jobs;

use App\Models\AppNotification;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

/**
 * Runs weekly on Monday.
 * Checks company registration renewal dates and notifies management.
 *
 * Expects a `registrar_renewals` table or config array with renewal deadlines.
 * Falls back gracefully if table does not exist.
 */
class CheckRegistrarRenewalJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries = 3;

    // Notify when renewal is within this many days
    private const ALERT_DAYS = [90, 60, 30, 14, 7];

    public function handle(): void
    {
        // Check if registrar_renewals table exists
        if (! \Illuminate\Support\Facades\Schema::hasTable('registrar_renewals')) {
            Log::info('[CheckRegistrarRenewalJob] registrar_renewals table not found. Skipping.');
            return;
        }

        $today    = now()->toDateString();
        $renewals = DB::table('registrar_renewals')
            ->where('is_active', true)
            ->whereNull('renewed_at')
            ->get();

        $alerts = 0;
        foreach ($renewals as $renewal) {
            $daysUntil = now()->diffInDays($renewal->renewal_date, false);

            if (in_array($daysUntil, self::ALERT_DAYS, true)) {
                $priority = $daysUntil <= 14 ? 'high' : 'medium';

                AppNotification::create([
                    'title'                => "Registrar Renewal Due in {$daysUntil} Days",
                    'message'              => "Company registration '{$renewal->description}' is due for renewal on " .
                                             \Carbon\Carbon::parse($renewal->renewal_date)->format('F j, Y') . ".",
                    'type'                 => 'registrar_renewal',
                    'category'             => 'compliance',
                    'priority'             => $priority,
                    'recipient_department' => 'management',
                    'reference_type'       => 'registrar_renewal',
                    'reference_id'         => (string) $renewal->id,
                    'metadata'             => [
                        'renewal_date' => $renewal->renewal_date,
                        'days_until'   => $daysUntil,
                        'description'  => $renewal->description,
                    ],
                ]);
                $alerts++;
            }
        }

        Log::info("[CheckRegistrarRenewalJob] Sent {$alerts} renewal alert(s).");
    }
}
