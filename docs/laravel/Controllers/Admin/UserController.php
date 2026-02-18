<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\CreateUserRequest;
use App\Http\Requests\Admin\UpdateUserRequest;
use App\Models\AuditLog;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class UserController extends Controller
{
    /**
     * List all staff users.
     * GET /api/v1/admin/users
     */
    public function index(Request $request): JsonResponse
    {
        $query = User::with('profile', 'roles')
            ->whereDoesntHave('clientProfile')
            ->when($request->search, fn ($q) => $q->where('email', 'like', "%{$request->search}%"))
            ->when($request->department, fn ($q) => $q->whereHas(
                'profile', fn ($p) => $p->where('department', $request->department)
            ));

        $users = $query->paginate($request->per_page ?? 20);

        return response()->json([
            'data' => $users->map(fn ($u) => $this->formatUser($u)),
            'meta' => [
                'current_page' => $users->currentPage(),
                'last_page'    => $users->lastPage(),
                'per_page'     => $users->perPage(),
                'total'        => $users->total(),
            ],
        ]);
    }

    /**
     * Create a new staff user.
     * POST /api/v1/admin/users
     */
    public function store(CreateUserRequest $request): JsonResponse
    {
        $user = DB::transaction(function () use ($request) {
            $tempPassword = Str::random(12);

            $user = User::create([
                'name'     => $request->full_name,
                'email'    => $request->email,
                'password' => Hash::make($tempPassword),
            ]);

            $user->profile()->create([
                'full_name'           => $request->full_name,
                'email'               => $request->email,
                'username'            => $request->username,
                'staff_id'            => $request->staff_id,
                'department'          => $request->department,
                'phone'               => $request->phone,
                'must_change_password' => true,
                'is_active'           => true,
                'is_locked'           => false,
                'failed_login_attempts' => 0,
            ]);

            $user->roles()->create(['role' => $request->role]);

            AuditLog::log(
                userId: auth()->id(),
                action: 'create_user',
                resourceType: 'user',
                resourceId: $user->id,
                details: ['email' => $user->email, 'department' => $request->department],
                ipAddress: request()->ip()
            );

            return $user;
        });

        return response()->json(['data' => $this->formatUser($user->load('profile', 'roles'))], 201);
    }

    /**
     * Show a single staff user.
     * GET /api/v1/admin/users/{id}
     */
    public function show(string $id): JsonResponse
    {
        $user = User::with('profile', 'roles')->findOrFail($id);

        return response()->json(['data' => $this->formatUser($user)]);
    }

    /**
     * Update a staff user.
     * PUT /api/v1/admin/users/{id}
     */
    public function update(UpdateUserRequest $request, string $id): JsonResponse
    {
        $user = User::with('profile', 'roles')->findOrFail($id);

        DB::transaction(function () use ($request, $user) {
            $user->profile()->update($request->only([
                'full_name', 'phone', 'department', 'avatar_url',
            ]));

            if ($request->role) {
                $user->roles()->delete();
                $user->roles()->create(['role' => $request->role]);
            }

            AuditLog::log(
                userId: auth()->id(),
                action: 'update_user',
                resourceType: 'user',
                resourceId: $user->id,
                details: $request->validated(),
                ipAddress: request()->ip()
            );
        });

        return response()->json(['data' => $this->formatUser($user->fresh(['profile', 'roles']))]);
    }

    /**
     * Lock a user account.
     * POST /api/v1/admin/users/{id}/lock
     */
    public function lock(string $id): JsonResponse
    {
        $user = User::findOrFail($id);

        $user->profile()->update(['is_locked' => true, 'locked_at' => now()]);

        AuditLog::log(
            userId: auth()->id(),
            action: 'lock_user',
            resourceType: 'user',
            resourceId: $user->id,
            details: [],
            ipAddress: request()->ip()
        );

        return response()->json(['data' => ['message' => 'Account locked.']]);
    }

    /**
     * Unlock a user account.
     * POST /api/v1/admin/users/{id}/unlock
     */
    public function unlock(string $id): JsonResponse
    {
        $user = User::findOrFail($id);

        $user->profile()->update([
            'is_locked'             => false,
            'locked_at'             => null,
            'failed_login_attempts' => 0,
        ]);

        AuditLog::log(
            userId: auth()->id(),
            action: 'unlock_user',
            resourceType: 'user',
            resourceId: $user->id,
            details: [],
            ipAddress: request()->ip()
        );

        return response()->json(['data' => ['message' => 'Account unlocked.']]);
    }

    /**
     * Delete a staff user.
     * DELETE /api/v1/admin/users/{id}
     */
    public function destroy(string $id): JsonResponse
    {
        $user = User::findOrFail($id);

        AuditLog::log(
            userId: auth()->id(),
            action: 'delete_user',
            resourceType: 'user',
            resourceId: $user->id,
            details: ['email' => $user->email],
            ipAddress: request()->ip()
        );

        $user->delete();

        return response()->json([], 204);
    }

    // ── Private helpers ───────────────────────────────────────────

    private function formatUser(User $user): array
    {
        $profile = $user->profile;
        return [
            'id'                    => $user->id,
            'email'                 => $user->email,
            'full_name'             => $profile?->full_name,
            'username'              => $profile?->username,
            'staff_id'              => $profile?->staff_id,
            'department'            => $profile?->department,
            'phone'                 => $profile?->phone,
            'avatar_url'            => $profile?->avatar_url,
            'role'                  => $user->getRole(),
            'is_active'             => (bool) $profile?->is_active,
            'is_locked'             => (bool) $profile?->is_locked,
            'must_change_password'  => (bool) $profile?->must_change_password,
            'last_login_at'         => $profile?->last_login_at,
            'failed_login_attempts' => $profile?->failed_login_attempts ?? 0,
            'created_at'            => $user->created_at,
        ];
    }
}
