<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Prevent locked accounts from accessing any protected endpoint.
 *
 * Applied to all staff protected routes.
 * Account locking is triggered by 5 consecutive failed login attempts.
 * Only admins can unlock accounts via POST /admin/users/{id}/unlock.
 */
class EnsureAccountNotLocked
{
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if (! $user) {
            return $next($request);
        }

        $profile = $user->profile;

        if ($profile && $profile->is_locked) {
            // Revoke current token so subsequent requests also fail at the token layer
            $request->user()->currentAccessToken()->delete();

            return response()->json([
                'message' => 'Your account has been locked due to too many failed login attempts. Please contact an administrator.',
                'code'    => 'account_locked',
            ], 403);
        }

        return $next($request);
    }
}
