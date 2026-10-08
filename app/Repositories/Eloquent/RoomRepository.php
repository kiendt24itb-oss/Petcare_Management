<?php

namespace App\Repositories\Eloquent;

use App\Models\Room;
use App\Repositories\Contracts\RoomRepositoryInterface;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\DB;

class RoomRepository implements RoomRepositoryInterface
{
    public function getAll(): Collection
    {
        return Room::with(['roomType.category'])->orderBy('room_id', 'desc')->get();
    }

    public function findById(int $id): ?Room
    {
        return Room::with(['roomType.category'])->find($id);
    }

    public function create(array $data): Room
    {
        return Room::create($data);
    }

    public function update(int $id, array $data): bool
    {
        $room = $this->findById($id);
        if (!$room) {
            return false;
        }
        return $room->update($data);
    }

    public function delete(int $id): bool
    {
        $room = $this->findById($id);
        if (!$room) {
            return false;
        }
        return $room->delete();
    }

    public function changeStatus(int $id, string $status): bool
    {
        $room = $this->findById($id);
        if (!$room) {
            return false;
        }
        $room->status = $status;
        return $room->save();
    }

    public function getSummaryStats(): array
    {
        $stats = Room::select('status', DB::raw('count(*) as total'))
            ->groupBy('status')
            ->pluck('total', 'status')
            ->toArray();

        return [
            'AVAILABLE'   => $stats['AVAILABLE'] ?? 0,
            'OCCUPIED'    => $stats['OCCUPIED'] ?? 0,
            'ASSIGNED'    => $stats['ASSIGNED'] ?? 0,
            'MAINTENANCE' => $stats['MAINTENANCE'] ?? 0,
        ];
    }

    /**
     * Lấy phòng trống theo room_type_id không bị trùng lịch booking trong khoảng startTime - endTime
     */
    public function findAvailableRoomForType(int $roomTypeId, string $startTime, string $endTime): ?Room
    {
        return Room::where('room_type_id', $roomTypeId)
            ->where('status', 'AVAILABLE')
            ->whereDoesntHave('bookingDetails', function ($query) use ($startTime, $endTime) {
                $query->whereHas('booking', function ($q) {
                    $q->whereNotIn('status', ['CANCELLED', 'COMPLETED']);
                })
                ->where(function ($q) use ($startTime, $endTime) {
                    $q->whereBetween('start_time', [$startTime, $endTime])
                      ->orWhereBetween('end_time', [$startTime, $endTime])
                      ->orWhere(function ($sub) use ($startTime, $endTime) {
                          $sub->where('start_time', '<=', $startTime)
                              ->where('end_time', '>=', $endTime);
                      });
                });
            })
            ->first();
    }
}