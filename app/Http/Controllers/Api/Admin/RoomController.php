<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\ChangeRoomStatusRequest;
use App\Http\Requests\Admin\CreateRoomRequest;
use App\Http\Requests\Admin\TransferRoomRequest;
use App\Http\Resources\RoomResource;
use App\Services\RoomService;
use Exception;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class RoomController extends Controller
{
    protected RoomService $roomService;

    public function __construct(RoomService $roomService)
    {
        $this->roomService = $roomService;
    }

    /**
     * Lấy danh sách tất cả phòng + Trạng thái
     */
    public function index(): JsonResponse
    {
        $rooms = $this->roomService->getAllRooms();

        return response()->json([
            'status'  => true,
            'message' => 'Lấy danh sách phòng thành công!',
            'data'    => RoomResource::collection($rooms),
        ], 200);
    }

    /**
     * Thêm phòng mới (Modal 3)
     */
    public function store(CreateRoomRequest $request): JsonResponse
    {
        try {
            $data = [
                'room_name'    => $request->input('roomName'),
                'room_type_id' => $request->input('roomTypeId'),
                'room_code'    => $request->input('roomCode'),
                'capacity'     => $request->input('capacity', 1),
                'note'         => $request->input('note'),
                'status'       => 'AVAILABLE',
            ];

            $room = $this->roomService->createRoom($data);

            return response()->json([
                'status'  => true,
                'message' => 'Tạo phòng mới thành công!',
                'data'    => new RoomResource($room),
            ], 201);
        } catch (Exception $e) {
            return response()->json([
                'status'  => false,
                'message' => $e->getMessage(),
            ], 400);
        }
    }

    /**
     * Đổi trạng thái phòng (Modal 4)
     */
    public function changeStatus(ChangeRoomStatusRequest $request): JsonResponse
    {
        try {
            $roomId = $request->input('roomId');
            $status = $request->input('status');

            $this->roomService->changeRoomStatus($roomId, $status);

            return response()->json([
                'status'  => true,
                'message' => 'Đã cập nhật trạng thái phòng thành công!',
            ], 200);
        } catch (Exception $e) {
            return response()->json([
                'status'  => false,
                'message' => $e->getMessage(),
            ], 400);
        }
    }

    /**
     * Điều chuyển phòng khẩn cấp (Modal 5)
     */
    public function transfer(TransferRoomRequest $request): JsonResponse
    {
        try {
            $sourceId = $request->input('sourceRoomId');
            $targetId = $request->input('targetRoomId');
            $reason   = $request->input('reason');

            $this->roomService->transferRoom($sourceId, $targetId, $reason);

            return response()->json([
                'status'  => true,
                'message' => 'Đã thực hiện điều chuyển khẩn cấp thành công!',
            ], 200);
        } catch (Exception $e) {
            return response()->json([
                'status'  => false,
                'message' => $e->getMessage(),
            ], 400);
        }
    }

    /**
     * Báo cáo phòng (Modal 6)
     */
    public function report(): JsonResponse
    {
        try {
            $reportData = $this->roomService->getRoomReportData();

            return response()->json([
                'status'  => true,
                'message' => 'Lấy dữ liệu báo cáo phòng thành công!',
                'data'    => $reportData,
            ], 200);
        } catch (Exception $e) {
            return response()->json([
                'status'  => false,
                'message' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Xóa phòng
     */
    public function destroy(Request $request): JsonResponse
    {
        try {
            $id = $request->query('id');
            if (!$id) {
                return response()->json([
                    'status'  => false,
                    'message' => 'Vui lòng cung cấp ID phòng cần xóa!',
                ], 400);
            }

            $this->roomService->deleteRoom((int)$id);

            return response()->json([
                'status'  => true,
                'message' => 'Đã xóa phòng thành công!',
            ], 200);
        } catch (Exception $e) {
            return response()->json([
                'status'  => false,
                'message' => $e->getMessage(),
            ], 400);
        }
    }
}