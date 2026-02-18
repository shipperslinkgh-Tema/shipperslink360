<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Restrict a route to specific departments.
 *
 * Usage in routes:
 *   ->middleware('department:accounts,management')
 *
 * Super admins and admins always pass through.
 */
class CheckDepartmentAccess
{
    public function handle(Request $request, Closure $next, string ...$allowedDepartments): Response
    {
        $user = $request->user();

        if (! $user) {
            return response()->json(['message' => 'Unauthenticated.'], 401);
        }

        // Super admins and admins bypass department restrictions
        if ($user->isAdmin()) {
            return $next($request);
        }

        $department = $user->getDepartment();

        if (! in_array($department, $allowedDepartments)) {
            return response()->json(['message' => 'This action is unauthorized.'], 403);
        }

        return $next($request);
    }
}
