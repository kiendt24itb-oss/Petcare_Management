<?php

namespace App\Services;

use App\Repositories\StaffShiftAssignmentRepository;
use Exception;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class ShiftAssignmentService
{
    protected StaffShiftAssignmentRepository $assignmentRepo;

    public function __construct(StaffShiftAssignmentRepository $assignmentRepo)
    {
        $this->assignmentRepo = $assignmentRepo;
    }

    /**
     * Lấy lịch phân ca hiển thị bảng Lịch Làm Việc (Weekly / Monthly Calendar)
     */
    public function getScheduleGrid(string $startDate, string $endDate, ?int $positionId = null)
    {
        return $this->assignmentRepo->getAssignmentsBetweenDates($startDate, $endDate, $positionId);
    }

    /**
     * Phân ca hàng loạt theo Pattern (Tất cả ngày trong tháng, T2-T6, Cuối tuần hoặc Custom)
     */
    public function bulkAssignShift(array $data)
    {
        $staffId = $data['staff_id'];
        $shiftId = $data['shift_id'];
        $pattern = $data['pattern'] ?? 'single'; // 'single', 'all', 'weekdays', 'weekends', 'custom'
        $month   = $data['month'] ?? date('m');
        $year    = $data['year'] ?? date('Y');

        DB::beginTransaction();
        try {
            if ($pattern === 'single') {
                $this->assignmentRepo->assignShift($staffId, $shiftId, $data['work_date']);
            } else {
                $startDate = Carbon::createFromDate($year, $month, 1)->startOfMonth();
                $endDate   = $startDate->copy()->endOfMonth();

                $customDays = $data['custom_days'] ?? []; // ['T2', 'T3', 'T4'...]

                for ($date = $startDate; $date->lte($endDate); $date->addDay()) {
                    $dayOfWeek = $date->dayOfWeek; // 0: Chủ Nhật, 1: T2, 2: T3...
                    $shouldAssign = false;

                    switch ($pattern) {
                        case 'all':
                            $shouldAssign = true;
                            break;
                        case 'weekdays': // T2 -> T6
                            if ($dayOfWeek >= 1 && $dayOfWeek <= 5) $shouldAssign = true;
                            break;
                        case 'weekends': // T7 & CN
                            if ($dayOfWeek === 0 || $dayOfWeek === 6) $shouldAssign = true;
                            break;
                        case 'custom':
                            $dayMap = [1 => 'T2', 2 => 'T3', 3 => 'T4', 4 => 'T5', 5 => 'T6', 6 => 'T7', 0 => 'CN'];
                            if (in_array($dayMap[$dayOfWeek], $customDays)) $shouldAssign = true;
                            break;
                    }

                    if ($shouldAssign) {
                        $this->assignmentRepo->assignShift($staffId, $shiftId, $date->format('Y-m-d'));
                    }
                }
            }

            DB::commit();
            return true;
        } catch (Exception $e) {
            DB::rollBack();
            throw new Exception("Lỗi phân ca làm việc: " . $e->getMessage());
        }
    }
}