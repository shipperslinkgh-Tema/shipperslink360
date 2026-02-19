<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class ClientMessage extends Model
{
    use HasUuids;

    // Only created_at, no updated_at
    const UPDATED_AT = null;

    protected $fillable = [
        'customer_id',
        'sender_id',
        'sender_type',
        'subject',
        'message',
        'is_read',
    ];

    protected function casts(): array
    {
        return [
            'is_read'    => 'boolean',
            'created_at' => 'datetime',
        ];
    }

    // ── Relationships ─────────────────────────────────────────

    public function sender()
    {
        return $this->belongsTo(User::class, 'sender_id');
    }

    // ── Scopes ────────────────────────────────────────────────

    public function scopeForCustomer($query, string $customerId)
    {
        return $query->where('customer_id', $customerId);
    }

    public function scopeUnread($query)
    {
        return $query->where('is_read', false);
    }

    public function scopeFromClient($query)
    {
        return $query->where('sender_type', 'client');
    }

    public function scopeFromStaff($query)
    {
        return $query->where('sender_type', 'staff');
    }
}
