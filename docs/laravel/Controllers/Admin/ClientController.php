<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\CreateClientRequest;
use App\Http\Requests\Admin\UpdateClientRequest;
use App\Models\AuditLog;
use App\Models\ClientProfile;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class ClientController extends Controller
{
    /**
     * List all client accounts.
     * GET /api/v1/admin/clients
     */
    public function index(Request $request): JsonResponse
    {
        $query = ClientProfile::query()
            ->when($request->search, fn ($q) => $q->where(function ($q) use ($request) {
                $q->where('company_name', 'like', "%{$request->search}%")
                  ->orWhere('email', 'like', "%{$request->search}%")
                  ->orWhere('customer_id', 'like', "%{$request->search}%");
            }))
            ->when(isset($request->is_active), fn ($q) => $q->where('is_active', $request->boolean('is_active')));

        $clients = $query->paginate($request->per_page ?? 20);

        return response()->json([
            'data' => $clients->items(),
            'meta' => [
                'current_page' => $clients->currentPage(),
                'last_page'    => $clients->lastPage(),
                'per_page'     => $clients->perPage(),
                'total'        => $clients->total(),
            ],
        ]);
    }

    /**
     * Create a new client account (also creates the auth user).
     * POST /api/v1/admin/clients
     */
    public function store(CreateClientRequest $request): JsonResponse
    {
        $clientProfile = DB::transaction(function () use ($request) {
            $user = User::create([
                'name'     => $request->contact_name,
                'email'    => $request->email,
                'password' => Hash::make(Str::random(16)),
            ]);

            $clientProfile = ClientProfile::create([
                'user_id'      => $user->id,
                'customer_id'  => $request->customer_id,
                'company_name' => $request->company_name,
                'contact_name' => $request->contact_name,
                'email'        => $request->email,
                'phone'        => $request->phone,
                'is_active'    => true,
            ]);

            AuditLog::log(
                userId: auth()->id(),
                action: 'create_client',
                resourceType: 'client_profile',
                resourceId: $clientProfile->id,
                details: ['customer_id' => $request->customer_id, 'company_name' => $request->company_name],
                ipAddress: request()->ip()
            );

            return $clientProfile;
        });

        return response()->json(['data' => $clientProfile], 201);
    }

    /**
     * Show a single client profile.
     * GET /api/v1/admin/clients/{id}
     */
    public function show(string $id): JsonResponse
    {
        $client = ClientProfile::findOrFail($id);

        return response()->json(['data' => $client]);
    }

    /**
     * Update a client profile.
     * PUT /api/v1/admin/clients/{id}
     */
    public function update(UpdateClientRequest $request, string $id): JsonResponse
    {
        $client = ClientProfile::findOrFail($id);

        $client->update($request->only(['company_name', 'contact_name', 'phone']));

        AuditLog::log(
            userId: auth()->id(),
            action: 'update_client',
            resourceType: 'client_profile',
            resourceId: $client->id,
            details: $request->validated(),
            ipAddress: request()->ip()
        );

        return response()->json(['data' => $client->fresh()]);
    }

    /**
     * Deactivate (suspend) a client account.
     * POST /api/v1/admin/clients/{id}/deactivate
     */
    public function deactivate(string $id): JsonResponse
    {
        $client = ClientProfile::findOrFail($id);
        $client->update(['is_active' => false]);

        AuditLog::log(
            userId: auth()->id(),
            action: 'deactivate_client',
            resourceType: 'client_profile',
            resourceId: $client->id,
            details: [],
            ipAddress: request()->ip()
        );

        return response()->json(['data' => ['message' => 'Client account deactivated.']]);
    }

    /**
     * Reactivate a client account.
     * POST /api/v1/admin/clients/{id}/activate
     */
    public function activate(string $id): JsonResponse
    {
        $client = ClientProfile::findOrFail($id);
        $client->update(['is_active' => true]);

        AuditLog::log(
            userId: auth()->id(),
            action: 'activate_client',
            resourceType: 'client_profile',
            resourceId: $client->id,
            details: [],
            ipAddress: request()->ip()
        );

        return response()->json(['data' => ['message' => 'Client account activated.']]);
    }
}
