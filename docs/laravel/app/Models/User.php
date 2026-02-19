<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    protected $fillable = [
        'name',
        'email',
        'password',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password'          => 'hashed',
        ];
    }

    // ── Relationships ─────────────────────────────────────────

    public function profile()
    {
        return $this->hasOne(Profile::class);
    }

    public function roles()
    {
        return $this->hasMany(UserRole::class);
    }

    public function loginHistory()
    {
        return $this->hasMany(LoginHistory::class);
    }

    public function clientProfile()
    {
        return $this->hasOne(ClientProfile::class);
    }

    public function aiInteractions()
    {
        return $this->hasMany(AiInteraction::class);
    }

    // ── Helpers ───────────────────────────────────────────────

    public function hasRole(string $role): bool
    {
        return $this->roles()->where('role', $role)->exists();
    }

    public function isAdmin(): bool
    {
        return $this->roles()->whereIn('role', ['super_admin', 'admin'])->exists();
    }

    public function isSuperAdmin(): bool
    {
        return $this->hasRole('super_admin');
    }

    public function isClient(): bool
    {
        return $this->clientProfile()->where('is_active', true)->exists();
    }

    public function getRole(): ?string
    {
        return $this->roles()->value('role');
    }

    public function getDepartment(): ?string
    {
        return $this->profile?->department;
    }
}
