<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class AppNotification extends Model
{
    use HasUuids;

    protected $table = 'app_notifications';

    protected $fillable = [
        'recipient_id',
        'recipient_department',
        'sender_id',
        'title',
        'message',
        'type',
        'category',
        'priority',
        'is_read',
        'is_resolved',
        'reference_type',
        'reference_id',
        'action_url',
        'metadata',
        'read_at',
        'resolved_at',
    ];

    protected function casts(): array
    {
        return [
            'is_read'     => 'boolean',
            'is_resolved' => 'boolean',
            'metadata'    => 'array',
            'read_at'     => 'datetime',
            'resolved_at' => 'datetime',
        ];
    }

    // ── Relationships ─────────────────────────────────────────

    public function recipient()
    {
        return $this->belongsTo(User::class, 'recipient_id');
    }

    public function sender()
    {
        return $this->belongsTo(User::class, 'sender_id');
    }

    // ── Scopes ────────────────────────────────────────────────

    public function scopeForUser($query, int $userId, ?string $department = null)
    {
        return $query->where(function ($q) use ($userId, $department) {
            $q->where('recipient_id', $userId)
              ->orWhereNull('recipient_id');

            if ($department) {
                $q->orWhere('recipient_department', $department);
            }
        });
    }

    public function scopeUnread($query)
    {
        return $query->where('is_read', false);
    }

    public function scopeUnresolved($query)
    {
        return $query->where('is_resolved', false);
    }

    public function scopeByPriority($query, string $priority)
    {
        return $query->where('priority', $priority);
    }

    // ── Helpers ───────────────────────────────────────────────

    public function markAsRead(): void
    {
        $this->update(['is_read' => true, 'read_at' => now()]);
    }

    public function markAsResolved(): void
    {
        $this->update(['is_resolved' => true, 'resolved_at' => now()]);
    }

    /**
     * Dispatch a notification to a specific user or department.
     */
    public static function dispatch(array $data): self
    {
        return static::create($data);
    }
}
