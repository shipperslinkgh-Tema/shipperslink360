<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use App\Http\Requests\Auth\ChangePasswordRequest;
use App\Models\LoginHistory;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    /**
     * Staff login.
     * POST /api/v1/auth/login
     */
    public function login(LoginRequest $request): JsonResponse
    {
        $user = \App\Models\User::where('email', $request->email)->first();

        if (! $user || ! Hash::check($request->password, $user->password)) {
            if ($user) {
                \DB::table('profiles')
                    ->where('user_id', $user->id)
                    ->increment('failed_login_attempts');

                $attempts = \DB::table('profiles')
                    ->where('user_id', $user->id)
                    ->value('failed_login_attempts');

                if ($attempts >= 5) {
                    \DB::table('profiles')
                        ->where('user_id', $user->id)
                        ->update(['is_locked' => true, 'locked_at' => now()]);
                }

                LoginHistory::create([
                    'user_id'    => $user->id,
                    'success'    => false,
                    'ip_address' => $request->ip(),
                    'user_agent' => $request->userAgent(),
                ]);
            }

            throw ValidationException::withMessages([
                'email' => ['The provided credentials are incorrect.'],
            ]);
        }

        $profile = $user->profile;

        if ($profile?->is_locked) {
            throw ValidationException::withMessages([
                'email' => ['This account has been locked. Please contact an administrator.'],
            ]);
        }

        if (! $profile?->is_active) {
            throw ValidationException::withMessages([
                'email' => ['This account is inactive.'],
            ]);
        }

        // Reset failed attempts & update last login
        \DB::table('profiles')
            ->where('user_id', $user->id)
            ->update([
                'failed_login_attempts' => 0,
                'last_login_at'         => now(),
            ]);

        LoginHistory::create([
            'user_id'    => $user->id,
            'success'    => true,
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
        ]);

        $token = $user->createToken('staff-token')->plainTextToken;

        return response()->json([
            'data' => [
                'token'               => $token,
                'must_change_password' => (bool) $profile?->must_change_password,
                'user'                => [
                    'id'         => $user->id,
                    'email'      => $user->email,
                    'full_name'  => $profile?->full_name,
                    'department' => $profile?->department,
                    'role'       => $user->getRole(),
                ],
            ],
        ]);
    }

    /**
     * Staff logout — revoke current token.
     * POST /api/v1/auth/logout
     */
    public function logout(Request $request): JsonResponse
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json([], 204);
    }

    /**
     * Change own password.
     * POST /api/v1/auth/change-password
     */
    public function changePassword(ChangePasswordRequest $request): JsonResponse
    {
        $user = $request->user();

        if (! Hash::check($request->current_password, $user->password)) {
            throw ValidationException::withMessages([
                'current_password' => ['The current password is incorrect.'],
            ]);
        }

        $user->update(['password' => Hash::make($request->new_password)]);

        \DB::table('profiles')
            ->where('user_id', $user->id)
            ->update(['must_change_password' => false]);

        return response()->json(['data' => ['message' => 'Password changed successfully.']]);
    }

    /**
     * Return the authenticated user's profile.
     * GET /api/v1/auth/me
     */
    public function me(Request $request): JsonResponse
    {
        $user    = $request->user()->load('profile', 'roles');
        $profile = $user->profile;

        return response()->json([
            'data' => [
                'id'         => $user->id,
                'email'      => $user->email,
                'full_name'  => $profile?->full_name,
                'username'   => $profile?->username,
                'staff_id'   => $profile?->staff_id,
                'department' => $profile?->department,
                'phone'      => $profile?->phone,
                'avatar_url' => $profile?->avatar_url,
                'role'       => $user->getRole(),
                'is_locked'  => (bool) $profile?->is_locked,
                'must_change_password' => (bool) $profile?->must_change_password,
            ],
        ]);
    }
}
