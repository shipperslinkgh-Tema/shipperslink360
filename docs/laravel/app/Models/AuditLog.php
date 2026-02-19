<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class AuditLog extends Model
{
    use HasUuids;

    public $timestamps = false;

    protected $fillable = [
        'user_id',
        'action',
        'resource_type',
        'resource_id',
        'details',
        'ip_address',
    ];

    protected function casts(): array
    {
        return [
            'details'    => 'array',
            'created_at' => 'datetime',
        ];
    }

    // ── Relationships ─────────────────────────────────────────

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    // ── Factory helper ────────────────────────────────────────

    /**
     * Create an audit log entry conveniently.
     *
     * @param int|null $userId
     * @param string   $action
     * @param string   $resourceType
     * @param string   $resourceId
     * @param array    $details
     * @param string|null $ipAddress
     */
    public static function record(
        ?int $userId,
        string $action,
        string $resourceType,
        string $resourceId,
        array $details = [],
        ?string $ipAddress = null
    ): self {
        return static::create([
            'user_id'       => $userId,
            'action'        => $action,
            'resource_type' => $resourceType,
            'resource_id'   => $resourceId,
            'details'       => $details,
            'ip_address'    => $ipAddress ?? request()->ip(),
        ]);
    }
}
