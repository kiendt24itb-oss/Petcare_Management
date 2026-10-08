<?php

namespace App\Services;

use App\Repositories\Contracts\RoomRepositoryInterface;
use App\Services\CodeGeneratorService;
use Exception;
use Illuminate\Support\Facades\DB;

class RoomService
{
    protected RoomRepositoryInterface $roomRepo;

    public function __construct(RoomRepositoryInterface $roomRepo)
    {
        $this->roomRepo = $roomRepo;
    }

    public function getAllRooms()
    {
        return $this->roomRepo->getAll();
    }

    public function createRoom(array $data)
    {
        // Sinh mã room_code tự động (VD: RM-A001)
        if (empty($data['room_code'])) {
            $data['room_code'] = CodeGeneratorService::generate('rooms', 'room_code', 'room');
        }

        return $this->roomRepo->create($data);
    }

    public function changeRoomStatus(int $roomId, string $status)
    {
        $room = $this->roomRepo->findById($roomId);
        if (!$room) {
            throw new Exception('Không tìm thấy thông tin phòng!');
        }

        // Bỏ ASSIGNED vì toàn bộ dịch vụ đã chuyển sang gán tự động
        $validStatuses = ['AVAILABLE', 'OCCUPIED', 'MAINTENANCE'];
        if (!in_array($status, $validStatuses)) {
            throw new Exception('Trạng thái chuyển đổi không hợp lệ!');
        }

        return $this->roomRepo->changeStatus($roomId, $status);
    }

    /**
     * Xử lý điều chuyển phòng khẩn cấp khi phòng bị sự cố (Modal 5)
     */
    public function transferRoom(int $sourceRoomId, int $targetRoomId, string $reason)
    {
        return DB::transaction(function () use ($sourceRoomId, $targetRoomId, $reason) {
            $sourceRoom = $this->roomRepo->findById($sourceRoomId);
            $targetRoom = $this->roomRepo->findById($targetRoomId);

            if (!$sourceRoom || !$targetRoom) {
                throw new Exception('Phòng nguồn hoặc phòng đích không tồn tại!');
            }

            if ($sourceRoom->status !== 'OCCUPIED') {
                throw new Exception('Phòng nguồn phải ở trạng thái Đang sử dụng mới có thể điều chuyển!');
            }

            if ($targetRoom->status !== 'AVAILABLE') {
                throw new Exception('Phòng đích phải ở trạng thái Sẵn sàng!');
            }

            if ($sourceRoom->room_type_id !== $targetRoom->room_type_id) {
                throw new Exception('Phòng đích phải cùng Loại phòng với phòng bị sự cố!');
            }

            // 1. Chuyển phòng nguồn về Bảo trì
            $this->roomRepo->changeStatus($sourceRoomId, 'MAINTENANCE');

            // 2. Chuyển phòng đích sang Đang sử dụng
            $this->roomRepo->changeStatus($targetRoomId, 'OCCUPIED');

            // 3. Cập nhật room_id trong các đơn đặt đang thực hiện
            DB::table('booking_details')
                ->where('room_id', $sourceRoomId)
                ->whereIn('booking_id', function ($query) {
                    $query->select('booking_id')
                        ->from('bookings')
                        ->whereIn('status', ['CHECKED_IN', 'PROCESSING']);
                })
                ->update(['room_id' => $targetRoomId]);

            // 4. Ghi activity log
            DB::table('activity_logs')->insert([
                'account_id'     => auth('api')->id(),
                'activity_type'  => 'ROOM',
                'description'    => "Điều chuyển khẩn cấp từ {$sourceRoom->room_name} sang {$targetRoom->room_name}. Lý do: {$reason}",
                'reference_type' => 'ROOM',
                'reference_id'   => $targetRoomId,
                'created_at'     => now(),
            ]);

            return true;
        });
    }

    /**
     * Xuất dữ liệu Báo cáo trạng thái phòng (Modal 6)
     */
    public function getRoomReportData(): array
    {
        $rooms = $this->roomRepo->getAll();
        $summary = $this->roomRepo->getSummaryStats();

        $details = $rooms->map(function ($r) {
            return [
                'roomId'       => $r->room_id,
                'roomCode'     => $r->room_code,
                'roomName'     => $r->room_name,
                'categoryName' => $r->roomType && $r->roomType->category ? $r->roomType->category->category_name : 'N/A',
                'typeName'     => $r->roomType ? $r->roomType->type_name : 'N/A',
                'capacity'     => $r->capacity,
                'status'       => $r->status,
                'note'         => $r->note,
            ];
        });

        return [
            'generatedAt' => now()->format('H:i:s d/m/Y'),
            'summary'     => $summary,
            'details'     => $details,
        ];
    }

    public function deleteRoom(int $id)
    {
        $room = $this->roomRepo->findById($id);
        if (!$room) {
            throw new Exception('Không tìm thấy phòng cần xóa!');
        }

        if ($room->status === 'OCCUPIED') {
            throw new Exception('Không thể xóa phòng đang có thú cưng sử dụng!');
        }

        return $this->roomRepo->delete($id);
    }
}