<?php

namespace App\Http\Controllers\Api\Customer;

use App\Http\Controllers\Controller;
use App\Http\Requests\Customer\CreateBookingRequest;
use App\Http\Resources\BookingResource;
use App\Services\BookingService;
use Exception;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CustomerBookingController extends Controller
{
    protected BookingService $bookingService;

    public function __construct(BookingService $bookingService)
    {
        $this->bookingService = $bookingService;
    }

    /**
     * Lấy danh sách Nhân viên phù hợp ca trực & dịch vụ
     */
    public function getAvailableStaffs(Request $request): JsonResponse
    {
        try {
            $serviceId = (int) $request->query('serviceId');
            $date      = $request->query('date');
            $time      = $request->query('time');

            if (!$serviceId || !$date || !$time) {
                return response()->json(['status' => false, 'message' => 'Thiếu tham số tra cứu!'], 400);
            }

            $staffs = $this->bookingService->getAvailableStaffs($serviceId, $date, $time);

            return response()->json([
                'status' => true,
                'data'   => $staffs
            ], 200);
        } catch (Exception $e) {
            return response()->json(['status' => false, 'message' => $e->getMessage()], 400);
        }
    }

    /**
     * Tạo Đặt Lịch
     */
    public function store(CreateBookingRequest $request): JsonResponse
    {
        try {
            $accountId = auth('api')->id();
            $booking = $this->bookingService->createCustomerBooking($accountId, $request->validated());

            return response()->json([
                'status'  => true,
                'message' => '🎉 Đặt lịch hẹn thành công!',
                'data'    => new BookingResource($booking)
            ], 201);
        } catch (Exception $e) {
            return response()->json(['status' => false, 'message' => $e->getMessage()], 400);
        }
    }

    /**
     * Khách hàng Hủy Đơn
     */
    public function cancel(int $id): JsonResponse
    {
        try {
            $accountId = auth('api')->id();
            $result = $this->bookingService->cancelByCustomer($id, $accountId);

            $msg = $result['isLateCancel'] 
                ? "Đã hủy đơn! Bạn hủy sát giờ (< 1h) nên bị tính 1 lần vi phạm (Tổng: {$result['violationCount']} lần)."
                : "Đã hủy đơn đặt lịch thành công!";

            return response()->json([
                'status'  => true,
                'message' => $msg,
                'data'    => $result
            ], 200);
        } catch (Exception $e) {
            return response()->json(['status' => false, 'message' => $e->getMessage()], 400);
        }
    }
}