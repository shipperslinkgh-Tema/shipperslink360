<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Laravel\Sanctum\HasApiTokens;

/**
 * Client portal user model.
 * Uses a separate guard ('client') from staff users.
 * Resolved via the client_profiles table which links to users.
 *
 * For authentication, use User model with 'client' guard,
 * and verify client_profiles.is_active = true.
 */
class ClientProfile extends Model
{
    use HasUuids;

    protected $fillable = [
        'user_id',
        'customer_id',
        'company_name',
        'contact_name',
        'email',
        'phone',
        'is_active',
        'last_login_at',
    ];

    protected function casts(): array
    {
        return [
            'is_active'     => 'boolean',
            'last_login_at' => 'datetime',
        ];
    }

    // ── Relationships ─────────────────────────────────────────

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function shipments()
    {
        return $this->hasMany(ClientShipment::class, 'customer_id', 'customer_id');
    }

    public function invoices()
    {
        return $this->hasMany(ClientInvoice::class, 'customer_id', 'customer_id');
    }

    public function documents()
    {
        return $this->hasMany(ClientDocument::class, 'customer_id', 'customer_id');
    }

    public function messages()
    {
        return $this->hasMany(ClientMessage::class, 'customer_id', 'customer_id');
    }
}
