<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use App\Models\ClientProfile;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class ClientAuthController extends Controller
{
    /**
     * Client login.
     * POST /api/v1/client/auth/login
     */
    public function login(LoginRequest $request): JsonResponse
    {
        $user = \App\Models\User::where('email', $request->email)->first();

        if (! $user || ! Hash::check($request->password, $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['The provided credentials are incorrect.'],
            ]);
        }

        $clientProfile = ClientProfile::where('user_id', $user->id)->first();

        if (! $clientProfile) {
            throw ValidationException::withMessages([
                'email' => ['This is not a client account.'],
            ]);
        }

        if (! $clientProfile->is_active) {
            throw ValidationException::withMessages([
                'email' => ['Your account has been suspended. Please contact support.'],
            ]);
        }

        $clientProfile->update(['last_login_at' => now()]);

        $token = $user->createToken('client-token')->plainTextToken;

        return response()->json([
            'data' => [
                'token'       => $token,
                'customer_id' => $clientProfile->customer_id,
                'user'        => [
                    'id'           => $user->id,
                    'email'        => $user->email,
                    'contact_name' => $clientProfile->contact_name,
                    'company_name' => $clientProfile->company_name,
                ],
            ],
        ]);
    }

    /**
     * Client logout.
     * POST /api/v1/client/auth/logout
     */
    public function logout(Request $request): JsonResponse
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json([], 204);
    }

    /**
     * Return the authenticated client's profile.
     * GET /api/v1/client/auth/me
     */
    public function me(Request $request): JsonResponse
    {
        $user    = $request->user();
        $profile = ClientProfile::where('user_id', $user->id)->firstOrFail();

        return response()->json([
            'data' => [
                'id'           => $user->id,
                'email'        => $user->email,
                'customer_id'  => $profile->customer_id,
                'company_name' => $profile->company_name,
                'contact_name' => $profile->contact_name,
                'phone'        => $profile->phone,
            ],
        ]);
    }
}
