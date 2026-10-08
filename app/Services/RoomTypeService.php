<?php

namespace App\Services;

use App\Repositories\Contracts\RoomTypeRepositoryInterface;
use App\Services\CodeGeneratorService;
use Exception;

class RoomTypeService
{
    protected RoomTypeRepositoryInterface $roomTypeRepo;

    public function __construct(RoomTypeRepositoryInterface $roomTypeRepo)
    {
        $this->roomTypeRepo = $roomTypeRepo;
    }

    public function getAllRoomTypes()
    {
        return $this->roomTypeRepo->getAll();
    }

    public function getRoomTypesByCategory(int $categoryId)
    {
        return $this->roomTypeRepo->getByCategoryId($categoryId);
    }

    public function createRoomType(array $data)
    {
        // Sinh mã type_code chuẩn (VD: RT-A001)
        $data['type_code'] = CodeGeneratorService::generate('room_types', 'type_code', 'room');

        return $this->roomTypeRepo->create($data);
    }

    public function deleteRoomType(int $id)
    {
        $roomType = $this->roomTypeRepo->findById($id);
        if (!$roomType) {
            throw new Exception('Không tìm thấy loại phòng!');
        }

        if ($roomType->rooms()->count() > 0) {
            throw new Exception('Không thể xóa loại phòng đã có các phòng thực tế liên kết!');
        }

        return $this->roomTypeRepo->delete($id);
    }
}