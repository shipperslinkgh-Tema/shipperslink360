<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class AiInteraction extends Model
{
    use HasUuids;

    // Only created_at
    const UPDATED_AT = null;

    protected $fillable = [
        'user_id',
        'department',
        'module',
        'prompt',
        'response',
        'model',
        'tokens_used',
    ];

    protected function casts(): array
    {
        return [
            'tokens_used' => 'integer',
            'created_at'  => 'datetime',
        ];
    }

    // ── Relationships ─────────────────────────────────────────

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
