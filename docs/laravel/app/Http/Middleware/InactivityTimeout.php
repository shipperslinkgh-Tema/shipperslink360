<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Enforce per-user inactivity timeouts.
 *
 * Staff:  15 minutes (900 seconds)
 * Client: 30 minutes (1800 seconds)
 *
 * Strategy:
 *   - On each authenticated request, compare NOW with the token's last_used_at.
 *   - If gap exceeds the timeout, revoke the token and return 401.
 *   - Sanctum updates last_used_at automatically on every request.
 *
 * Note: Sanctum's PersonalAccessToken.last_used_at is updated by the framework
 * after the request passes token verification. This middleware reads the value
 * set by the PREVIOUS request to detect inactivity.
 */
class InactivityTimeout
{
    private const STAFF_TIMEOUT_SECONDS  = 900;   // 15 minutes
    private const CLIENT_TIMEOUT_SECONDS = 1800;  // 30 minutes

    public function handle(Request $request, Closure $next): Response
    {
        $user  = $request->user();
        $token = $request->user()?->currentAccessToken();

        if (! $user || ! $token) {
            return $next($request);
        }

        $lastUsed = $token->last_used_at;

        if ($lastUsed === null) {
            return $next($request); // First use — no timeout check needed
        }

        $isClient = $user->isClient();
        $timeout  = $isClient ? self::CLIENT_TIMEOUT_SECONDS : self::STAFF_TIMEOUT_SECONDS;

        $idleSeconds = now()->diffInSeconds($lastUsed);

        if ($idleSeconds > $timeout) {
            $token->delete();

            return response()->json([
                'message' => 'Your session has expired due to inactivity. Please log in again.',
                'code'    => 'session_expired',
            ], 401);
        }

        return $next($request);
    }
}
