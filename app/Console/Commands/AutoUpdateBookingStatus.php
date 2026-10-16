<?php

namespace App\Console\Commands;

use App\Models\Booking;
use App\Models\Room;
use Carbon\Carbon;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

class AutoUpdateBookingStatus extends Command
{
    protected $signature = 'booking:auto-update-status';
    protected $description = 'Tự động quét và cập nhật trạng thái đơn đặt lịch theo gian thực';

    public function handle()
    {
        $now = Carbon::now();
        DB::beginTransaction();
        try {
            // 1. PENDING -> PROCESSING (Đang chờ -> Đang làm)
            $startBookings = Booking::where('status', 'PENDING')
                ->where('estimated_start_time', '<=', $now)
                ->get();

            foreach ($startBookings as $booking) {
                $booking->update([
                    'status'            => 'PROCESSING',
                    'actual_start_time' => $now,
                ]);

                $roomIds = $booking->bookingDetails()->pluck('room_id')->filter()->unique();
                if ($roomIds->isNotEmpty()) {
                    Room::whereIn('room_id', $roomIds)->update(['status' => 'OCCUPIED']);
                }

                DB::table('booking_logs')->insert([
                    'booking_id' => $booking->booking_id,
                    'content'    => "Hệ thống tự động chuyển trạng thái từ [Đang chờ] sang [Đang làm].",
                    'created_at' => $now,
                ]);
            }

            // 2. PROCESSING -> COMPLETED (Đang làm -> Đã hoàn thành)
            $completedBookings = Booking::where('status', 'PROCESSING')
                ->where('estimated_end_time', '<=', $now)
                ->get();

            foreach ($completedBookings as $booking) {
                $booking->update([
                    'status'          => 'COMPLETED',
                    'actual_end_time' => $now,
                ]);

                $roomIds = $booking->bookingDetails()->pluck('room_id')->filter()->unique();
                if ($roomIds->isNotEmpty()) {
                    Room::whereIn('room_id', $roomIds)->update(['status' => 'AVAILABLE']);
                }

                DB::table('booking_logs')->insert([
                    'booking_id' => $booking->booking_id,
                    'content'    => "Hệ thống tự động chuyển trạng thái từ [Đang làm] sang [Đã hoàn thành].",
                    'created_at' => $now,
                ]);
            }

            DB::commit();
        } catch (\Exception $e) {
            DB::rollBack();
        }

        return Command::SUCCESS;
    }
}