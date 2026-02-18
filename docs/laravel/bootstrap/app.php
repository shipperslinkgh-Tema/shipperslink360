<?php

use App\Http\Middleware\CheckDepartmentAccess;
use App\Http\Middleware\CheckRole;
use App\Http\Middleware\EnsureAccountNotLocked;
use App\Http\Middleware\EnsureClientIsActive;
use App\Http\Middleware\EnsureIsAdmin;
use App\Http\Middleware\EnsurePasswordChanged;
use App\Http\Middleware\InactivityTimeout;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        api: __DIR__ . '/../routes/api.php',
        channels: __DIR__ . '/../routes/channels.php',
        commands: __DIR__ . '/../routes/console.php',
        health: '/up',
        apiPrefix: 'api/v1',
    )
    ->withMiddleware(function (Middleware $middleware) {
        // ── Global API middleware ─────────────────────────────
        $middleware->statefulApi();

        // ── Named middleware aliases ──────────────────────────
        $middleware->alias([
            'role'            => CheckRole::class,
            'department'      => CheckDepartmentAccess::class,
            'not_locked'      => EnsureAccountNotLocked::class,
            'client_active'   => EnsureClientIsActive::class,
            'admin'           => EnsureIsAdmin::class,
            'must_change_pwd' => EnsurePasswordChanged::class,
            'inactivity'      => InactivityTimeout::class,
        ]);

        // ── Middleware groups ─────────────────────────────────
        $middleware->appendToGroup('api', [
            \Illuminate\Routing\Middleware\ThrottleRequests::class . ':api',
            \Illuminate\Routing\Middleware\SubstituteBindings::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions) {
        // Return JSON for all API authentication exceptions
        $exceptions->render(function (\Illuminate\Auth\AuthenticationException $e, $request) {
            if ($request->expectsJson() || $request->is('api/*')) {
                return response()->json(['message' => 'Unauthenticated.'], 401);
            }
        });

        $exceptions->render(function (\Illuminate\Auth\Access\AuthorizationException $e, $request) {
            if ($request->expectsJson() || $request->is('api/*')) {
                return response()->json(['message' => 'This action is unauthorized.'], 403);
            }
        });

        $exceptions->render(function (\Illuminate\Validation\ValidationException $e, $request) {
            if ($request->expectsJson() || $request->is('api/*')) {
                return response()->json([
                    'message' => 'Validation failed.',
                    'errors'  => $e->errors(),
                ], 422);
            }
        });

        $exceptions->render(function (\Illuminate\Database\Eloquent\ModelNotFoundException $e, $request) {
            if ($request->expectsJson() || $request->is('api/*')) {
                return response()->json(['message' => 'Resource not found.'], 404);
            }
        });

        $exceptions->render(function (\Symfony\Component\HttpKernel\Exception\TooManyRequestsHttpException $e, $request) {
            if ($request->expectsJson() || $request->is('api/*')) {
                return response()->json(['message' => 'Too many requests. Please slow down.'], 429);
            }
        });
    })->create();
