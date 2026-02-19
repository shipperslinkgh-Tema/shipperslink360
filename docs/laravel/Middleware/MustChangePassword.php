<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class MustChangePassword
{
    public function handle(Request $request, Closure $next)
    {
        $user = $request->user();

        if ($user && $user->profile?->must_change_password) {
            if (!$request->routeIs('password.change', 'password.update', 'logout')) {
                return redirect()->route('password.change')
                    ->with('warning', 'You must change your password before continuing.');
            }
        }

        return $next($request);
    }
}
