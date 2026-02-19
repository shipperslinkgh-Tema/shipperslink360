<?php

namespace App\Observers;

use App\Models\ClientProfile;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Request;

class ClientProfileObserver
{
    public function created(ClientProfile $clientProfile): void
    {
        \App\Models\AuditLog::create([
            'user_id'       => Auth::id(),
            'action'        => 'create_client',
            'resource_type' => 'client_profile',
            'resource_id'   => $clientProfile->id,
            'details'       => [
                'company_name' => $clientProfile->company_name,
                'contact_name' => $clientProfile->contact_name,
                'email'        => $clientProfile->email,
                'customer_id'  => $clientProfile->customer_id,
            ],
            'ip_address'    => Request::ip(),
        ]);
    }

    public function updated(ClientProfile $clientProfile): void
    {
        $dirty = $clientProfile->getDirty();

        $action = 'update_client';
        if (isset($dirty['is_active']) && $dirty['is_active'] === false) {
            $action = 'deactivate_client';
        }

        \App\Models\AuditLog::create([
            'user_id'       => Auth::id(),
            'action'        => $action,
            'resource_type' => 'client_profile',
            'resource_id'   => $clientProfile->id,
            'details'       => [
                'changes' => $dirty,
                'before'  => array_intersect_key($clientProfile->getOriginal(), $dirty),
            ],
            'ip_address'    => Request::ip(),
        ]);
    }
}
