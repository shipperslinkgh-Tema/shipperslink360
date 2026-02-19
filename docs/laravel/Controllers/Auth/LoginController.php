<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use App\Models\LoginHistory;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Str;

class LoginController extends Controller
{
    public function showLoginForm()
    {
        return view('auth.login');
    }

    public function login(LoginRequest $request)
    {
        $key = Str::lower($request->email) . '|' . $request->ip();

        if (RateLimiter::tooManyAttempts($key, 5)) {
            $seconds = RateLimiter::availableIn($key);
            return back()->withErrors([
                'email' => "Too many login attempts. Try again in {$seconds} seconds.",
            ]);
        }

        if (!Auth::attempt($request->only('email', 'password'), $request->boolean('remember'))) {
            RateLimiter::hit($key, 300);

            // Track failed login
            if ($user = \App\Models\User::where('email', $request->email)->first()) {
                $user->profile?->incrementFailedAttempts();
                LoginHistory::create([
                    'user_id'        => $user->id,
                    'ip_address'     => $request->ip(),
                    'user_agent'     => $request->userAgent(),
                    'success'        => false,
                    'failure_reason' => 'Invalid credentials',
                    'login_at'       => now(),
                ]);
            }

            return back()->withErrors(['email' => 'These credentials do not match our records.']);
        }

        $user = Auth::user();
        $profile = $user->profile;

        // Check account locked
        if ($profile?->is_locked) {
            Auth::logout();
            return back()->withErrors(['email' => 'Your account has been locked. Contact your administrator.']);
        }

        // Check account active
        if (!$profile?->is_active) {
            Auth::logout();
            return back()->withErrors(['email' => 'Your account is inactive. Contact your administrator.']);
        }

        RateLimiter::clear($key);
        $profile?->resetFailedAttempts();

        LoginHistory::create([
            'user_id'    => $user->id,
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
            'success'    => true,
            'login_at'   => now(),
        ]);

        $request->session()->regenerate();

        // Force password change
        if ($profile?->must_change_password) {
            return redirect()->route('password.change');
        }

        return redirect()->intended(route('dashboard'));
    }

    public function logout(Request $request)
    {
        Auth::logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();
        return redirect()->route('login');
    }
}
