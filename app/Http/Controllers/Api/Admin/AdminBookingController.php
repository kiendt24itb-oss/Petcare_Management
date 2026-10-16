<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Services\BookingService;
use Exception;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminBookingController extends Controller
{
    protected BookingService $bookingService;

    public function __construct(BookingService $bookingService)
    {
        $this->bookingService = $bookingService;
    }

    /**
     * Duyệt / Từ chối đơn vi phạm
     */
    public function approveViolation(Request $request): JsonResponse
    {
        try {
            $request->validate([
                'bookingId'  => 'required|integer',
                'isApproved' => 'required|boolean',
            ]);

            $this->bookingService->approveViolationBooking(
                (int) $request->input('bookingId'),
                (bool) $request->input('isApproved')
            );

            return response()->json([
                'status'  => true,
                'message' => $request->input('isApproved') ? 'Đã duyệt đơn thành công!' : 'Đã từ chối đơn!',
            ], 200);
        } catch (Exception $e) {
            return response()->json(['status' => false, 'message' => $e->getMessage()], 400);
        }
    }

    /**
     * Staff Dời Lịch Hẹn
     */
    public function reschedule(Request $request): JsonResponse
    {
        try {
            $request->validate([
                'bookingId' => 'required|integer',
                'newDate'   => 'required|date_format:Y-m-d',
                'newTime'   => 'required|date_format:H:i',
                'reason'    => 'required|string',
            ]);

            $this->bookingService->rescheduleByStaff(
                (int) $request->input('bookingId'),
                $request->input('newDate'),
                $request->input('newTime'),
                $request->input('reason')
            );

            return response()->json([
                'status'  => true,
                'message' => 'Đã dời lịch hẹn thành công!',
            ], 200);
        } catch (Exception $e) {
            return response()->json(['status' => false, 'message' => $e->getMessage()], 400);
        }
    }
}