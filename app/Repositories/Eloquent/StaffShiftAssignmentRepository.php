<?php

namespace App\Repositories;

use App\Models\StaffShiftAssignment;
use Illuminate\Support\Collection;

class StaffShiftAssignmentRepository
{
    /**
     * Lấy danh sách phân ca trong khoảng ngày (dùng xem Lịch làm theo tuần/tháng)
     */
    public function getAssignmentsBetweenDates(string $startDate, string $endDate, ?int $positionId = null): Collection
    {
        $query = StaffShiftAssignment::with(['staff.position', 'shift'])
            ->whereBetween('work_date', [$startDate, $endDate]);

        if ($positionId) {
            $query->whereHas('staff', function ($q) use ($positionId) {
                $q->where('position_id', $positionId);
            });
        }

        return $query->orderBy('work_date', 'asc')->get();
    }

    /**
     * Phân ca mới / Cập nhật ca làm cho Nhân viên
     */
    public function assignShift(int $staffId, int $shiftId, string $workDate): StaffShiftAssignment
    {
        return StaffShiftAssignment::updateOrCreate(
            [
                'staff_id'  => $staffId,
                'work_date' => $workDate,
            ],
            [
                'shift_id'  => $shiftId,
            ]
        );
    }

    /**
     * Xóa phân ca làm
     */
    public function removeAssignment(int $staffId, string $workDate): bool
    {
        return StaffShiftAssignment::where('staff_id', $staffId)
            ->where('work_date', $workDate)
            ->delete();
    }
}