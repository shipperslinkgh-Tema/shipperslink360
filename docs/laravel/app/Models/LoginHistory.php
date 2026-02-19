<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class LoginHistory extends Model
{
    use HasUuids;

    public $timestamps = false;

    protected $fillable = [
        'user_id',
        'ip_address',
        'user_agent',
        'success',
        'login_at',
    ];

    protected function casts(): array
    {
        return [
            'success'  => 'boolean',
            'login_at' => 'datetime',
        ];
    }

    // ── Relationships ─────────────────────────────────────────

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
