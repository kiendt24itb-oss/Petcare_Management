<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\CreateRoomTypeRequest;
use App\Http\Resources\RoomTypeResource;
use App\Services\RoomTypeService;
use Exception;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class RoomTypeController extends Controller
{
    protected RoomTypeService $roomTypeService;

    public function __construct(RoomTypeService $roomTypeService)
    {
        $this->roomTypeService = $roomTypeService;
    }

    /**
     * Lấy danh sách toàn bộ loại phòng
     */
    public function index(): JsonResponse
    {
        $roomTypes = $this->roomTypeService->getAllRoomTypes();

        return response()->json([
            'status'  => true,
            'message' => 'Lấy danh sách loại phòng thành công!',
            'data'    => RoomTypeResource::collection($roomTypes),
        ], 200);
    }

    /**
     * Thêm mới loại phòng (Modal 2)
     */
    public function store(CreateRoomTypeRequest $request): JsonResponse
    {
        try {
            $data = [
                'category_id' => $request->input('categoryId'),
                'type_name'   => $request->input('typeName'),
                'description' => $request->input('description'),
            ];

            $roomType = $this->roomTypeService->createRoomType($data);

            return response()->json([
                'status'  => true,
                'message' => 'Tạo loại phòng mới thành công!',
                'data'    => new RoomTypeResource($roomType),
            ], 201);
        } catch (Exception $e) {
            return response()->json([
                'status'  => false,
                'message' => $e->getMessage(),
            ], 400);
        }
    }

    /**
     * Xóa loại phòng
     */
    public function destroy(Request $request): JsonResponse
    {
        try {
            $id = $request->query('id');
            if (!$id) {
                return response()->json([
                    'status'  => false,
                    'message' => 'Vui lòng cung cấp ID loại phòng cần xóa!',
                ], 400);
            }

            $this->roomTypeService->deleteRoomType((int)$id);

            return response()->json([
                'status'  => true,
                'message' => 'Đã xóa loại phòng thành công!',
            ], 200);
        } catch (Exception $e) {
            return response()->json([
                'status'  => false,
                'message' => $e->getMessage(),
            ], 400);
        }
    }
}