<?php

namespace App\Repositories\Contracts;

use App\Models\Room;
use Illuminate\Database\Eloquent\Collection;

interface RoomRepositoryInterface
{
    public function getAll(): Collection;
    public function findById(int $id): ?Room;
    public function create(array $data): Room;
    public function update(int $id, array $data): bool;
    public function delete(int $id): bool;
    public function changeStatus(int $id, string $status): bool;
    public function getSummaryStats(): array;

    /**
     * Tìm 1 phòng trống đầu tiên theo Loại phòng và khoảng thời gian đặt
     */
    public function findAvailableRoomForType(int $roomTypeId, string $startTime, string $endTime): ?Room;
}