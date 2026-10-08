<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class CheckRoleStaff
{
    public function handle(Request $request, Closure $next)
    {
        $user = auth('api')->user();
        if (!$user || !in_array($user->role, ['ADMIN', 'STAFF'])) {
            return response()->json([
                'success' => false,
                'message' => 'Bạn không có quyền truy cập (Staff/Admin required)',
            ], 403);
        }

        return $next($request);
    }
}