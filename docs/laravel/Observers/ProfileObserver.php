<?php

namespace App\Observers;

use App\Models\Profile;
use App\Models\AppNotification;
use App\Mail\AccountLockedMail;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Request;

class ProfileObserver
{
    /**
     * Record audit log on profile creation (new user).
     */
    public function created(Profile $profile): void
    {
        \App\Models\AuditLog::create([
            'user_id'       => Auth::id(),
            'action'        => 'create_user',
            'resource_type' => 'user',
            'resource_id'   => $profile->id,
            'details'       => [
                'full_name'  => $profile->full_name,
                'email'      => $profile->email,
                'department' => $profile->department,
                'staff_id'   => $profile->staff_id,
            ],
            'ip_address'    => Request::ip(),
        ]);
    }

    /**
     * Detect lock/unlock transitions and dispatch notifications.
     */
    public function updated(Profile $profile): void
    {
        $dirty = $profile->getDirty();

        // ── Audit log any update ──────────────────────────────
        \App\Models\AuditLog::create([
            'user_id'       => Auth::id(),
            'action'        => 'update_user',
            'resource_type' => 'user',
            'resource_id'   => $profile->id,
            'details'       => [
                'changes' => $dirty,
                'before'  => array_intersect_key($profile->getOriginal(), $dirty),
            ],
            'ip_address'    => Request::ip(),
        ]);

        // ── Account locked transition ─────────────────────────
        if (isset($dirty['is_locked']) && $dirty['is_locked'] === true) {
            $this->handleAccountLocked($profile);
        }

        // ── Account unlocked transition ───────────────────────
        if (isset($dirty['is_locked']) && $dirty['is_locked'] === false) {
            \App\Models\AuditLog::create([
                'user_id'       => Auth::id(),
                'action'        => 'unlock_user',
                'resource_type' => 'user',
                'resource_id'   => $profile->id,
                'details'       => ['unlocked_by' => Auth::id()],
                'ip_address'    => Request::ip(),
            ]);
        }
    }

    // ── Private helpers ───────────────────────────────────────────────────────

    private function handleAccountLocked(Profile $profile): void
    {
        $ip = Request::ip();

        // Notify super_admin and admin departments
        foreach (['super_admin', 'admin'] as $dept) {
            AppNotification::create([
                'title'                => "Account Locked: {$profile->full_name}",
                'message'              => "Staff account {$profile->staff_id} ({$profile->email}) has been locked after 5 failed login attempts.",
                'type'                 => 'security',
                'category'             => 'system',
                'priority'             => 'high',
                'recipient_department' => $dept,
                'reference_type'       => 'user',
                'reference_id'         => $profile->id,
                'metadata'             => ['ip_address' => $ip, 'staff_id' => $profile->staff_id],
            ]);
        }

        // Send email alert to admins (uses notification queue)
        Mail::to(config('mail.admin_address', 'admin@shipperslink.com'))
            ->queue(new AccountLockedMail($profile, $ip));
    }
}
