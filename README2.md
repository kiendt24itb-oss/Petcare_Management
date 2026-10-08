+-------------------------------------------------------------------------------+
| BƯỚC 1: CẤU HÌNH DÙNG CHUNG (System Foundation) |
+-------------------------------------------------------------------------------+

- Thiết lập file `.env` (MySQL Host, DB Name, JWT Secret Key).
- Cấu hình `config/cors.php` (cho phép Client Cross-Origin gọi API).
- Dựng Base Controller & Base Service chuẩn hóa format Response JSON:
  { "success": true/false, "message": "...", "data": [...] }
- Xử lý lỗi toàn cục tại `app/Exceptions/Handler.php` để luôn trả về JSON khi có exception.

                       │
                       ▼

+-------------------------------------------------------------------------------+
| BƯỚC 2: TOOL/LOGIC SINH MÃ TỰ ĐỘNG (Code Generation Logic) |
+-------------------------------------------------------------------------------+

- Xây dựng `CodeGeneratorService.php`.
- Định nghĩa thuật toán sinh các loại mã dùng chung toàn hệ thống
  (Ví dụ: Mã hóa đơn `INV-2026-001`, Mã booking `BK-A001-99`, Mã khách hàng).

                       │
                       ▼

+-------------------------------------------------------------------------------+
| BƯỚC 3: TÍNH NĂNG 1 - ĐĂNG KÝ / ĐĂNG NHẬP (Auth Module) |
+-------------------------------------------------------------------------------+
Viết trọn gói từ DB đến Endpoint:

1.  Model: `Account.php` (Map tới bảng `accounts`).
2.  Request: `LoginRequest.php`, `RegisterRequest.php` (Validate input).
3.  Repository/Service: `AccountRepository.php`, `AuthService.php` (Xử lý mật khẩu, sinh JWT Token).
4.  Controller & Route: `AuthController.php`, `routes/api.php` (`POST /api/v1/auth/login`).
5.  Middleware: Dựng `CheckRoleAdmin`, `CheckRoleStaff` để chặn Token theo quyền.

                     │
                     ▼

+-------------------------------------------------------------------------------+
| BƯỚC 4: TÍNH NĂNG 2 - QUẢN LÝ HỒ SƠ & KHÁCH HÀNG (Customer Module) |
+-------------------------------------------------------------------------------+

1.  Model: `Customer.php`.
2.  Request: `UpdateProfileRequest.php`.
3.  Repository/Service: `CustomerRepository.php`, `CustomerService.php`.
4.  Resource: `CustomerResource.php` (Ẩn `account_id`, định dạng lại ngày sinh).
5.  Controller & Route: `CustomerController.php` (`GET /profile`, `PUT /profile`).

                     │
                     ▼

+-------------------------------------------------------------------------------+
| BƯỚC 5: TÍNH NĂNG 3 - ĐẶT LỊCH CHĂM SÓC (Booking Module) |
+-------------------------------------------------------------------------------+

1.  Model: `Booking.php`.
2.  Request: `CreateBookingRequest.php`.
3.  Repository/Service: `BookingRepository.php`, `BookingService.php`
    (Gọi `CodeGeneratorService` ở Bước 2 để tự động gán mã Booking).
4.  Resource: `BookingResource.php`.
5.  Controller & Route: `BookingController.php` (`POST /bookings`).
6.  Listeners (Bổ trợ): Kích hoạt `SendMailOnBooking.php` gửi email xác nhận.

                     │
                     ▼

+-------------------------------------------------------------------------------+
| BƯỚC 6: CÁC TÍNH NĂNG TIẾP THEO & TÁC VỤ CHẠY ẨN |
+-------------------------------------------------------------------------------+

- Phát triển tiếp các tính năng: Sản phẩm (Product), Thanh toán (Payment), Chấm công (Timekeeping).
- Tác vụ Cronjob ngầm: Cấu hình `routes/console.php` gọi `AutoCloseShift.php` chốt ca lúc 23:00 mỗi ngày.
- Tác vụ Real-time: Khai báo `routes/channels.php` và bắn `ChatMessageSent.php` qua WebSocket khi chat.
