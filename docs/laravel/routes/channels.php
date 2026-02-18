<?php

use Illuminate\Support\Facades\Broadcast;

/*
|--------------------------------------------------------------------------
| Broadcast Channels
|--------------------------------------------------------------------------
|
| Here you may register all the event broadcasting channels that your
| application supports. The given channel authorization callbacks are
| used to check if an authenticated user can listen to the channel.
|
*/

// ── Private user channel ──────────────────────────────────────────────────────
// Any authenticated user may listen to their own user channel.
Broadcast::channel('user.{userId}', function ($user, $userId) {
    return (string) $user->id === (string) $userId;
});

// ── Private department channel ────────────────────────────────────────────────
// Staff users can listen to their own department's channel only.
Broadcast::channel('dept.{department}', function ($user, $department) {
    $profile = $user->profile;
    if (! $profile) return false;

    // Admins and super_admins can listen to any department channel
    if ($user->isAdmin()) return true;

    return $profile->department === $department;
});

// ── Private client channel ────────────────────────────────────────────────────
// A client user may only listen to their own customer's channel.
Broadcast::channel('client.{customerId}', function ($user, $customerId) {
    $clientProfile = $user->clientProfile;
    if (! $clientProfile || ! $clientProfile->is_active) return false;

    return $clientProfile->customer_id === $customerId;
});

// ── Private banking channel ───────────────────────────────────────────────────
// Only accounts and management staff may listen to banking events.
Broadcast::channel('banking', function ($user) {
    $profile = $user->profile;
    if (! $profile) return false;

    return in_array($profile->department, ['accounts', 'management', 'super_admin'])
        || $user->isAdmin();
});
