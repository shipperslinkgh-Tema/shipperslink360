<?php

namespace App\Observers;

use App\Models\UserRole;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Request;

class UserRoleObserver
{
    public function created(UserRole $userRole): void
    {
        \App\Models\AuditLog::create([
            'user_id'       => Auth::id(),
            'action'        => 'assign_role',
            'resource_type' => 'user_role',
            'resource_id'   => $userRole->id,
            'details'       => [
                'target_user_id' => $userRole->user_id,
                'role'           => $userRole->role,
            ],
            'ip_address'    => Request::ip(),
        ]);
    }

    public function deleted(UserRole $userRole): void
    {
        \App\Models\AuditLog::create([
            'user_id'       => Auth::id(),
            'action'        => 'revoke_role',
            'resource_type' => 'user_role',
            'resource_id'   => $userRole->id,
            'details'       => [
                'target_user_id' => $userRole->user_id,
                'role'           => $userRole->role,
            ],
            'ip_address'    => Request::ip(),
        ]);
    }
}
