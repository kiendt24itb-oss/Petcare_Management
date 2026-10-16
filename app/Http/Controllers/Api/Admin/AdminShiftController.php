<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\StaffShiftAssignmentResource;
use App\Models\WorkShift;
use App\Services\ShiftAssignmentService;
use Exception;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminShiftController extends Controller
{
    protected ShiftAssignmentService $shiftService;

    public function __construct(ShiftAssignmentService $shiftService)
    {
        $this->shiftService = $shiftService;
    }

    /**
     * API Lấy danh mục các Ca làm việc
     */
    public function getShifts(): JsonResponse
    {
        $shifts = WorkShift::where('is_active', true)->get();
        return response()->json([
            'status' => true,
            'data'   => $shifts
        ]);
    }

    /**
     * API Lấy danh sách lịch phân ca trong khoảng thời gian
     */
    public function getAssignments(Request $request): JsonResponse
    {
        try {
            $startDate  = $request->query('start_date', date('Y-m-01'));
            $endDate    = $request->query('end_date', date('Y-m-t'));
            $positionId = $request->query('position_id');

            $assignments = $this->shiftService->getScheduleGrid($startDate, $endDate, $positionId);

            return response()->json([
                'status'  => true,
                'message' => 'Lấy danh sách phân ca thành công!',
                'data'    => StaffShiftAssignmentResource::collection($assignments)
            ]);
        } catch (Exception $e) {
            return response()->json(['status' => false, 'message' => $e->getMessage()], 500);
        }
    }

    /**
     * API Phân ca làm việc cho nhân viên
     */
    public function assignShift(Request $request): JsonResponse
    {
        $request->validate([
            'staff_id' => 'required|exists:staffs,staff_id',
            'shift_id' => 'required|exists:work_shifts,shift_id',
            'pattern'  => 'required|in:single,all,weekdays,weekends,custom',
        ]);

        try {
            $this->shiftService->bulkAssignShift($request->all());

            return response()->json([
                'status'  => true,
                'message' => '🎉 Phân ca làm việc thành công!'
            ]);
        } catch (Exception $e) {
            return response()->json(['status' => false, 'message' => $e->getMessage()], 400);
        }
    }
}