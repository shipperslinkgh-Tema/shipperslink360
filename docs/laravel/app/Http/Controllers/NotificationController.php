<?php

namespace App\Http\Controllers;

use App\Models\AppNotification;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class NotificationController extends Controller
{
    /**
     * List notifications for the authenticated user.
     * Includes notifications targeted to their user_id OR their department.
     * GET /api/v1/notifications
     */
    public function index(Request $request): JsonResponse
    {
        $user       = $request->user();
        $department = $user->getDepartment();

        $query = AppNotification::where(function ($q) use ($user, $department) {
            $q->where('recipient_id', $user->id)
              ->orWhere('recipient_department', $department);
        })
        ->when(isset($request->is_read), fn ($q) => $q->where('is_read', $request->boolean('is_read')))
        ->when($request->priority, fn ($q) => $q->where('priority', $request->priority))
        ->orderByDesc('created_at');

        $notifications = $query->paginate($request->per_page ?? 30);

        return response()->json([
            'data' => $notifications->items(),
            'meta' => [
                'current_page' => $notifications->currentPage(),
                'last_page'    => $notifications->lastPage(),
                'per_page'     => $notifications->perPage(),
                'total'        => $notifications->total(),
                'unread_count' => AppNotification::where(function ($q) use ($user, $department) {
                    $q->where('recipient_id', $user->id)
                      ->orWhere('recipient_department', $department);
                })->where('is_read', false)->count(),
            ],
        ]);
    }

    /**
     * Mark a notification as read.
     * POST /api/v1/notifications/{id}/read
     */
    public function markRead(Request $request, string $id): JsonResponse
    {
        $user         = $request->user();
        $notification = AppNotification::findOrFail($id);

        $notification->update([
            'is_read' => true,
            'read_at' => now(),
        ]);

        return response()->json(['data' => $notification->fresh()]);
    }

    /**
     * Mark all unread notifications as read for this user.
     * POST /api/v1/notifications/mark-all-read
     */
    public function markAllRead(Request $request): JsonResponse
    {
        $user       = $request->user();
        $department = $user->getDepartment();

        AppNotification::where(function ($q) use ($user, $department) {
            $q->where('recipient_id', $user->id)
              ->orWhere('recipient_department', $department);
        })
        ->where('is_read', false)
        ->update(['is_read' => true, 'read_at' => now()]);

        return response()->json(['data' => ['message' => 'All notifications marked as read.']]);
    }

    /**
     * Mark a notification as resolved.
     * POST /api/v1/notifications/{id}/resolve
     */
    public function resolve(Request $request, string $id): JsonResponse
    {
        $notification = AppNotification::findOrFail($id);

        $notification->update([
            'is_resolved' => true,
            'resolved_at' => now(),
        ]);

        return response()->json(['data' => $notification->fresh()]);
    }
}
