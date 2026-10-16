<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\PositionResource;
use App\Models\Position;
use Exception;
use Illuminate\Http\JsonResponse;

class AdminPositionController extends Controller
{
    /**
     * Lấy danh sách chức vụ (Positions) từ Database
     */
    public function index(): JsonResponse
    {
        try {
            $positions = Position::orderBy('position_id', 'asc')->get();

            return response()->json([
                'status'  => true,
                'message' => 'Lấy danh sách chức vụ thành công!',
                'data'    => PositionResource::collection($positions),
            ], 200);
        } catch (Exception $e) {
            return response()->json([
                'status'  => false,
                'message' => $e->getMessage(),
            ], 500);
        }
    }
}