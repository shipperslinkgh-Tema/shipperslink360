<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class Profile extends Model
{
    use HasUuids;

    protected $fillable = [
        'user_id',
        'full_name',
        'staff_id',
        'username',
        'email',
        'phone',
        'department',
        'avatar_url',
        'is_active',
        'is_locked',
        'failed_login_attempts',
        'locked_at',
        'last_login_at',
        'must_change_password',
    ];

    protected function casts(): array
    {
        return [
            'is_active'               => 'boolean',
            'is_locked'               => 'boolean',
            'must_change_password'    => 'boolean',
            'locked_at'               => 'datetime',
            'last_login_at'           => 'datetime',
            'failed_login_attempts'   => 'integer',
        ];
    }

    // ── Relationships ─────────────────────────────────────────

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    // ── Helpers ───────────────────────────────────────────────

    /**
     * Increment failed login attempts and auto-lock at >= 5.
     */
    public function incrementFailedLogin(): void
    {
        $this->increment('failed_login_attempts');
        if ($this->failed_login_attempts >= 5) {
            $this->update(['is_locked' => true, 'locked_at' => now()]);
        }
    }

    /**
     * Reset failed login counter and record last login.
     */
    public function resetFailedLogin(): void
    {
        $this->update([
            'failed_login_attempts' => 0,
            'is_locked'             => false,
            'locked_at'             => null,
            'last_login_at'         => now(),
        ]);
    }
}
