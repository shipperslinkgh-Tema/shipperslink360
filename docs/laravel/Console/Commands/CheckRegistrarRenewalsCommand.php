<?php

namespace App\Console\Commands;

use App\Models\RegistrarRenewal;
use App\Models\AppNotification;
use Illuminate\Console\Command;

class CheckRegistrarRenewalsCommand extends Command
{
    protected $signature   = 'renewals:check';
    protected $description = 'Check registrar renewals and notify for upcoming expirations';

    public function handle(): int
    {
        $notified = 0;

        // Mark expired
        RegistrarRenewal::where('status', 'active')
            ->where('expiry_date', '<', now()->toDateString())
            ->update(['status' => 'expired']);

        // Mark expiring soon (within 30 days)
        $expiringSoon = RegistrarRenewal::where('status', 'active')
            ->whereBetween('expiry_date', [now()->toDateString(), now()->addDays(30)->toDateString()])
            ->get();

        foreach ($expiringSoon as $renewal) {
            $renewal->update(['status' => 'expiring_soon']);
            $daysLeft = now()->diffInDays($renewal->expiry_date);

            AppNotification::create([
                'title'              => "Renewal Expiring: {$renewal->registration_type}",
                'message'            => "{$renewal->registrar_name} expires in {$daysLeft} days.",
                'type'               => 'renewal_expiring',
                'category'           => 'compliance',
                'priority'           => $daysLeft <= 7 ? 'high' : 'medium',
                'reference_type'     => 'registrar_renewal',
                'reference_id'       => $renewal->id,
                'recipient_department' => 'management',
                'action_url'         => '/finance?tab=compliance',
            ]);

            $notified++;
        }

        $this->info("Checked renewals. {$notified} renewal(s) flagged as expiring soon.");
        return Command::SUCCESS;
    }
}
