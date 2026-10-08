<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class CheckRoleAdmin
{
    public function handle(Request $request, Closure $next)
    {
        $user = auth('api')->user();
        if (!$user || $user->role !== 'ADMIN') {
            return response()->json([
                'success' => false,
                'message' => 'Bạn không có quyền truy cập (Admin required)',
            ], 403);
        }

        return $next($request);
    }
}