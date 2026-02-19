<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class ChatMessage extends Model
{
    use HasUuids;

    protected $fillable = [
        'channel',
        'sender_id',
        'sender_name',
        'sender_department',
        'message',
        'message_type',
        'file_url',
        'file_name',
        'is_edited',
        'edited_at',
    ];

    protected function casts(): array
    {
        return [
            'is_edited' => 'boolean',
            'edited_at' => 'datetime',
        ];
    }

    // ── Scopes ────────────────────────────────────────────────

    public function scopeChannel($query, string $channel)
    {
        return $query->where('channel', $channel);
    }

    public function scopeRecent($query, int $limit = 50)
    {
        return $query->latest()->limit($limit);
    }

    // ── Helpers ───────────────────────────────────────────────

    public function editMessage(string $newContent): void
    {
        $this->update([
            'message'   => $newContent,
            'is_edited' => true,
            'edited_at' => now(),
        ]);
    }

    public static function allowedChannels(): array
    {
        return ['general', 'operations', 'finance', 'management', 'customer_service', 'warehouse'];
    }
}
