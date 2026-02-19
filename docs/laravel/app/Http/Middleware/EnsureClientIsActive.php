<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Verify that the authenticated client's profile is still active.
 *
 * Applied to all /client/* protected routes.
 * If is_active = false → 403 "account suspended".
 */
class EnsureClientIsActive
{
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if (! $user) {
            return response()->json(['message' => 'Unauthenticated.'], 401);
        }

        $clientProfile = \App\Models\ClientProfile::where('user_id', $user->id)->first();

        if (! $clientProfile) {
            return response()->json(['message' => 'This is not a client account.'], 403);
        }

        if (! $clientProfile->is_active) {
            return response()->json([
                'message' => 'Your account has been suspended. Please contact support.',
            ], 403);
        }

        // Attach resolved customer_id to the request so controllers don't repeat the query
        $request->merge(['_resolved_customer_id' => $clientProfile->customer_id]);

        return $next($request);
    }
}
