<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Force a password change on first login or when must_change_password = true.
 *
 * Applied to all staff protected routes.
 * The change-password endpoint itself is whitelisted to avoid redirect loops.
 *
 * Frontend contract:
 *   On 403 with code "must_change_password", redirect to /change-password.
 */
class EnsurePasswordChanged
{
    /**
     * Endpoints exempt from this check.
     */
    private const EXEMPT_PATHS = [
        'api/v1/auth/change-password',
        'api/v1/auth/logout',
        'api/v1/auth/me',
    ];

    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if (! $user) {
            return $next($request);
        }

        // Skip exempt routes
        foreach (self::EXEMPT_PATHS as $path) {
            if ($request->is($path)) {
                return $next($request);
            }
        }

        $profile = $user->profile;

        if ($profile && $profile->must_change_password) {
            return response()->json([
                'message' => 'You must change your password before continuing.',
                'code'    => 'must_change_password',
            ], 403);
        }

        return $next($request);
    }
}
