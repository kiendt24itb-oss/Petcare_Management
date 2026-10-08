<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\CreatePositionRequest;
use App\Http\Requests\Admin\UpdatePositionRequest;
use App\Http\Resources\PositionResource;
use App\Services\PositionService;
use Exception;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PositionController extends Controller
{
    protected PositionService $positionService;

    public function __construct(PositionService $positionService)
    {
        $this->positionService = $positionService;
    }

    public function index(): JsonResponse
    {
        $positions = $this->positionService->getAllPositions();

        return response()->json([
            'status'  => true,
            'message' => 'Lấy danh sách chức vụ thành công!',
            'data'    => PositionResource::collection($positions),
        ], 200);
    }

    public function show(int $id): JsonResponse
    {
        try {
            $position = $this->positionService->getPositionById($id);

            return response()->json([
                'status'  => true,
                'message' => 'Lấy thông tin chức vụ thành công!',
                'data'    => new PositionResource($position),
            ], 200);
        } catch (Exception $e) {
            return response()->json([
                'status'  => false,
                'message' => $e->getMessage(),
            ], 404);
        }
    }

    public function store(CreatePositionRequest $request): JsonResponse
    {
        try {
            $data = $request->validated();
            $position = $this->positionService->createPosition($data);

            return response()->json([
                'status'  => true,
                'message' => 'Tạo chức vụ mới thành công!',
                'data'    => new PositionResource($position),
            ], 201);
        } catch (Exception $e) {
            return response()->json([
                'status'  => false,
                'message' => $e->getMessage(),
            ], 400);
        }
    }

    public function update(UpdatePositionRequest $request): JsonResponse
    {
        try {
            $positionId = $request->input('positionId');
            $data = $request->validated();

            $this->positionService->updatePosition($positionId, $data);

            return response()->json([
                'status'  => true,
                'message' => 'Cập nhật chức vụ thành công!',
            ], 200);
        } catch (Exception $e) {
            return response()->json([
                'status'  => false,
                'message' => $e->getMessage(),
            ], 400);
        }
    }

    public function destroy(Request $request): JsonResponse
    {
        try {
            $id = $request->query('id');
            if (!$id) {
                return response()->json([
                    'status'  => false,
                    'message' => 'Vui lòng cung cấp ID chức vụ cần xóa!',
                ], 400);
            }

            $this->positionService->deletePosition((int)$id);

            return response()->json([
                'status'  => true,
                'message' => 'Đã xóa chức vụ thành công!',
            ], 200);
        } catch (Exception $e) {
            return response()->json([
                'status'  => false,
                'message' => $e->getMessage(),
            ], 400);
        }
    }
}