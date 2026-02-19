<?php

namespace App\Traits;

use App\Models\AuditLog;

trait HasAuditLog
{
    /**
     * Log an action to the audit trail.
     */
    public function logAction(string $action, ?array $details = null): void
    {
        AuditLog::create([
            'user_id'       => auth()->id(),
            'action'        => $action,
            'resource_type' => class_basename($this),
            'resource_id'   => $this->getKey(),
            'details'       => $details,
            'ip_address'    => request()->ip(),
        ]);
    }
}
