<?php

namespace App\Services;

use App\Models\Booking;
use App\Models\Customer;
use App\Models\Staff;
use App\Services\CodeGeneratorService;
use Carbon\Carbon;
use Exception;
use Illuminate\Support\Facades\DB;

class BookingService
{
    /**
     * Lọc danh sách Nhân viên khả dụng theo Dịch vụ + Ngày + Giờ + Ca làm việc
     */
    public function getAvailableStaffs(int $serviceId, string $date, string $time)
    {
        $service = DB::table('services')
            ->join('service_categories', 'services.category_id', '=', 'service_categories.category_id')
            ->where('services.service_id', $serviceId)
            ->select('services.*', 'service_categories.category_code')
            ->first();

        if (!$service) {
            throw new Exception("Dịch vụ không tồn tại!");
        }

        // Map Category Code -> Prefix Mã Chức Vụ (HEALTH: BS, SPA: KTV, HOTEL: CS)
        $positionPrefix = match ($service->category_code) {
            'HEALTH' => 'BS',
            'SPA'    => 'KTV',
            'HOTEL'  => 'CS',
            default  => 'NV',
        };

        $bookingDateTime = Carbon::parse("{$date} {$time}");
        $bookingTimeStr = $bookingDateTime->format('H:i:s');

        return Staff::whereHas('position', function ($q) use ($positionPrefix) {
                $q->where('position_code', 'LIKE', "{$positionPrefix}%");
            })
            ->where('is_working', true)
            ->whereHas('shiftAssignments', function ($q) use ($date, $bookingTimeStr) {
                $q->where('work_date', $date)
                  ->whereHas('shift', function ($s) use ($bookingTimeStr) {
                      $s->where('start_time', '<=', $bookingTimeStr)
                        ->where('end_time', '>=', $bookingTimeStr)
                        ->where('is_active', true);
                  });
            })
            ->whereDoesntHave('bookingDetails.booking', function ($q) use ($bookingDateTime) {
                $q->whereIn('status', ['PENDING', 'PENDING_APPROVAL', 'PROCESSING'])
                  ->where('estimated_start_time', '<=', $bookingDateTime)
                  ->where('estimated_end_time', '>', $bookingDateTime);
            })
            ->get(['staff_id', 'staff_code', 'full_name']);
    }

    /**
     * Dành cho Khách hàng: Tạo đơn Đặt lịch mới (Tự động kiểm tra luồng vi phạm)
     */
    public function createCustomerBooking(int $accountId, array $data)
    {
        $customer = Customer::where('account_id', $accountId)->first();
        if (!$customer) {
            throw new Exception("Chưa khởi tạo thông tin khách hàng!");
        }

        if ($customer->violation_count >= 5) {
            throw new Exception("Tài khoản của bạn đã bị KHÓA do vi phạm quá 5 lần. Vui lòng liên hệ Admin!");
        }

        return DB::transaction(function () use ($customer, $data) {
            $service = DB::table('services')->where('service_id', $data['serviceId'])->first();
            if (!$service || $service->status !== 'ACTIVE') {
                throw new Exception("Dịch vụ được chọn hiện không khả dụng!");
            }

            // Kiểm tra thú cưng thuộc sở hữu khách hàng
            $validPets = DB::table('pets')
                ->where('customer_id', $customer->customer_id)
                ->whereIn('pet_id', $data['petIds'])
                ->pluck('pet_id')
                ->toArray();

            if (count($validPets) !== count($data['petIds'])) {
                throw new Exception("Một số thú cưng không hợp lệ hoặc không thuộc về bạn!");
            }

            $startTime = Carbon::parse("{$data['bookingDate']} {$data['bookingTime']}");
            $endTime = $startTime->copy()->addMinutes($service->duration);

            // Kiểm tra trạng thái đơn dựa trên Violation Count
            $status = 'PENDING';
            if ($customer->violation_count >= 3) {
                $status = 'PENDING_APPROVAL'; // Vi phạm >= 3 lần bắt buộc Admin duyệt tay
            }

            // Tự động gán phòng trống nếu dịch vụ yêu cầu
            $assignedRoomId = null;
            if (!empty($service->required_room_type_id)) {
                $room = DB::table('rooms')
                    ->where('room_type_id', $service->required_room_type_id)
                    ->where('status', '!=', 'MAINTENANCE')
                    ->whereNotIn('room_id', function ($q) use ($startTime, $endTime) {
                        $q->select('room_id')
                          ->from('booking_details')
                          ->join('bookings', 'booking_details.booking_id', '=', 'bookings.booking_id')
                          ->whereIn('bookings.status', ['PENDING', 'PENDING_APPROVAL', 'PROCESSING'])
                          ->whereNotNull('booking_details.room_id')
                          ->where('bookings.estimated_start_time', '<', $endTime->toDateTimeString())
                          ->where('bookings.estimated_end_time', '>', $startTime->toDateTimeString());
                    })
                    ->first();

                if (!$room) {
                    throw new Exception("Khung giờ này đã hết phòng phù hợp cho dịch vụ!");
                }
                $assignedRoomId = $room->room_id;
            }

            $bookingCode = CodeGeneratorService::generate('bookings', 'booking_code', 'booking');
            $totalPrice = $service->price * count($validPets);

            $booking = Booking::create([
                'booking_code'         => $bookingCode,
                'customer_id'          => $customer->customer_id,
                'total_price'          => $totalPrice,
                'estimated_start_time' => $startTime->toDateTimeString(),
                'estimated_end_time'   => $endTime->toDateTimeString(),
                'status'               => $status,
                'note'                 => $data['note'] ?? null,
            ]);

            foreach ($validPets as $petId) {
                DB::table('booking_details')->insert([
                    'booking_id'      => $booking->booking_id,
                    'pet_id'          => $petId,
                    'service_id'      => $service->service_id,
                    'staff_id'        => $data['staffId'] ?? null,
                    'room_id'         => $assignedRoomId,
                    'unit_price'      => $service->price,
                    'assignment_type' => !empty($data['staffId']) ? 'CUSTOMER' : 'SYSTEM',
                    'assigned_at'     => now(),
                ]);
            }

            $logContent = ($status === 'PENDING_APPROVAL')
                ? "Khách hàng tạo đơn. Đơn chuyển sang [Chờ duyệt tay] do có {$customer->violation_count} lần vi phạm."
                : "Khách hàng tạo đơn đặt lịch thành công.";

            DB::table('booking_logs')->insert([
                'booking_id' => $booking->booking_id,
                'content'    => $logContent,
                'created_at' => now(),
            ]);

            return $booking;
        });
    }

    /**
     * Khách hàng Hủy Đơn (Xử lý quy tắc sát giờ < 1 tiếng)
     */
    public function cancelByCustomer(int $bookingId, int $accountId)
    {
        $customer = Customer::where('account_id', $accountId)->first();
        $booking = Booking::where('booking_id', $bookingId)
            ->where('customer_id', $customer->customer_id)
            ->first();

        if (!$booking || in_array($booking->status, ['CANCELLED', 'COMPLETED'])) {
            throw new Exception("Đơn đặt không tồn tại hoặc đã bị hủy/hoàn thành!");
        }

        return DB::transaction(function () use ($booking, $customer) {
            $now = Carbon::now();
            $startTime = Carbon::parse($booking->estimated_start_time);

            // Kiểm tra nếu hủy trước ca < 1 tiếng (60 phút)
            $isLateCancel = $now->diffInMinutes($startTime, false) < 60;

            $booking->update(['status' => 'CANCELLED']);

            if ($isLateCancel) {
                $customer->increment('violation_count');
                $logMsg = "Khách hàng hủy sát giờ (< 1h). Tăng 1 lần vi phạm (Tổng: {$customer->violation_count} lần).";
            } else {
                $logMsg = "Khách hàng chủ động hủy đơn đúng hạn.";
            }

            DB::table('booking_logs')->insert([
                'booking_id' => $booking->booking_id,
                'content'    => $logMsg,
                'created_at' => now(),
            ]);

            return [
                'isLateCancel'   => $isLateCancel,
                'violationCount' => $customer->violation_count,
            ];
        });
    }

    /**
     * Admin Duyệt / Từ Chối Đơn Vi Phạm (3 hoặc 4 lần)
     */
    public function approveViolationBooking(int $bookingId, bool $isApproved)
    {
        $booking = Booking::with('customer.account')->findOrFail($bookingId);
        $customer = $booking->customer;

        return DB::transaction(function () use ($booking, $customer, $isApproved) {
            if ($isApproved) {
                // Admin Duyệt -> Hạ mức vi phạm
                $newViolation = ($customer->violation_count >= 4) ? 2 : 1;
                $customer->update(['violation_count' => $newViolation]);
                $booking->update(['status' => 'PENDING']);

                $logMsg = "Admin đã DUYỆT đơn. Mức vi phạm hạ về {$newViolation}.";
            } else {
                // Admin Từ chối -> Tăng vi phạm
                $newViolation = $customer->violation_count + 1;
                $customer->update(['violation_count' => $newViolation]);
                $booking->update(['status' => 'CANCELLED']);

                if ($newViolation >= 5) {
                    $customer->account->update(['status' => 'LOCKED']);
                    $logMsg = "Admin TỪ CHỐI đơn. Vi phạm tăng lên {$newViolation} lần -> TỰ ĐỘNG KHÓA TÀI KHOẢN!";
                } else {
                    $logMsg = "Admin TỪ CHỐI đơn. Vi phạm tăng lên {$newViolation} lần.";
                }
            }

            DB::table('booking_logs')->insert([
                'booking_id' => $booking->booking_id,
                'content'    => $logMsg,
                'created_at' => now(),
            ]);

            return true;
        });
    }

    /**
     * Nhân viên Dời Lịch Hẹn sang thời gian mới
     */
    public function rescheduleByStaff(int $bookingId, string $newDate, string $newTime, string $reason)
    {
        $booking = Booking::findOrFail($bookingId);
        $detail = DB::table('booking_details')
            ->join('services', 'booking_details.service_id', '=', 'services.service_id')
            ->where('booking_id', $bookingId)
            ->first();

        $duration = $detail->duration ?? 45;
        $newStart = Carbon::parse("{$newDate} {$newTime}");
        $newEnd = $newStart->copy()->addMinutes($duration);

        return DB::transaction(function () use ($booking, $newStart, $newEnd, $reason) {
            $booking->update([
                'estimated_start_time' => $newStart->toDateTimeString(),
                'estimated_end_time'   => $newEnd->toDateTimeString(),
            ]);

            DB::table('booking_logs')->insert([
                'booking_id' => $booking->booking_id,
                'content'    => "Nhân viên dời lịch hẹn sang: {$newStart->format('H:i d/m/Y')}. Lý do: {$reason}",
                'created_at' => now(),
            ]);

            return true;
        });
    }

    /**
     * Nhân viên Bắt đầu sớm / Hoàn thành sớm
     */
    public function updateProgressByStaff(int $bookingId, string $action)
    {
        $booking = Booking::findOrFail($bookingId);

        return DB::transaction(function () use ($booking, $action) {
            if ($action === 'START') {
                $booking->update([
                    'status'            => 'PROCESSING',
                    'actual_start_time' => now(),
                ]);
                $logMsg = "Nhân viên bấm BẮT ĐẦU DỊCH VỤ sớm.";
            } else {
                $booking->update([
                    'status'          => 'COMPLETED',
                    'actual_end_time' => now(),
                ]);
                $logMsg = "Nhân viên bấm HOÀN THÀNH DỊCH VỤ sớm.";
            }

            DB::table('booking_logs')->insert([
                'booking_id' => $booking->booking_id,
                'content'    => $logMsg,
                'created_at' => now(),
            ]);

            return true;
        });
    }
}