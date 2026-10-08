================================================================================
MÔ HÌNH MẠNG / KIẾN TRÚC HỆ THỐNG
================================================================================
Mô hình: Client / Server (Decoupled Architecture - Tách biệt REST API)

- Server: Laravel Web API (petcare-api) - Đảm nhận xử lý Business Logic, DB & JSON API
- Client: Single Page App (Web Admin/Staff) / Mobile App (Customer) - Gọi HTTP RESTful API
- WebSocket Server: Laravel Reverb / Pusher - Phục vụ giao tiếp Real-time (Chat, Báo lịch)

================================================================================
CẤU TRÚC THƯ MỤC CỦA SERVER (petcare-api)
================================================================================
petcare_management_api/
├── app/
│ ├── Console/
│ │ └── Commands/
│ │ ├── AutoCloseShift.php # Tự động chốt ca làm việc
│ │ └── GenerateCodeLogic.php # Tool/Command sinh mã tự động (A001-99-B001)
│ ├── Events/
│ │ └── ChatMessageSent.php # Event bắn tin nhắn real-time
│ ├── Exceptions/
│ │ └── Handler.php # Xử lý & format lỗi API toàn hệ thống (JSON Error)
│ ├── Http/
│ │ ├── Controllers/ # Điều hướng request & trả về response
│ │ │ └── Api/
│ │ │ ├── Admin/ # Controller luồng Admin
│ │ │ ├── Customer/ # Controller luồng Khách hàng
│ │ │ ├── Staff/ # Controller luồng Nhân viên
│ │ │ └── AuthController.php # Đăng nhập, đăng ký, Refresh Token
│ │ ├── Middleware/
│ │ │ ├── CheckRoleAdmin.php # Phân quyền Admin
│ │ │ └── CheckRoleStaff.php # Phân quyền Nhân viên
│ │ ├── Requests/ # Request DTO: Validate dữ liệu đầu vào
│ │ │ ├── Auth/
│ │ │ │ └── LoginRequest.php
│ │ │ ├── Booking/
│ │ │ │ └── CreateBookingRequest.php
│ │ │ └── Customer/
│ │ │ └── UpdateProfileRequest.php
│ │ └── Resources/ # Response DTO: Format dữ liệu trả về API
│ │ ├── Booking/
│ │ │ └── BookingResource.php
│ │ ├── Customer/
│ │ │ └── CustomerResource.php # Ẩn mật khẩu, định dạng lại ngày tháng
│ │ └── Product/
│ │ └── ProductResource.php
│ ├── Listeners/ # Xử lý tác vụ ẩn khi Event kích hoạt
│ │ ├── SendMailOnBooking.php
│ │ └── SendTelegramToStaff.php
│ ├── Models/ # Ánh xạ trực tiếp 33 bảng DB
│ │ ├── Account.php
│ │ ├── Booking.php
│ │ ├── Customer.php
│ │ └── Product.php
│ ├── Repositories/ # Tầng truy vấn database (SQL/Eloquent)
│ │ ├── Contracts/ # Interfaces định nghĩa hàm
│ │ │ └── BookingRepositoryInterface.php
│ │ └── Eloquent/ # Implementation thực thi truy vấn
│ │ └── BookingRepository.php
│ └── Services/ # Tầng xử lý nghiệp vụ chính (Business Logic)
│ ├── BookingService.php # Logic kiểm tra lịch trùng, đặt phòng
│ ├── ChatService.php # Logic tư vấn AI / lưu lịch sử chat
│ ├── PaymentService.php # Tính toán hóa đơn, tích điểm
│ └── TimekeepingService.php # Chấm công, phạt đi muộn
├── bootstrap/ # Khởi động ứng dụng (giữ nguyên)
├── config/ # Cấu hình hệ thống
│ ├── auth.php # Cấu hình JWT / Sanctum
│ ├── broadcasting.php # Cấu hình WebSocket real-time
│ ├── cors.php # Cấu hình cho phép Frontend gọi API
│ ├── database.php # Kết nối MySQL & Redis
│ └── mail.php # Cấu hình SMTP gửi email
├── database/ # [Tối giản] Chỉ giữ thư mục gốc, import SQL thủ công
├── routes/ # Định tuyến API
│ ├── api.php # Khai báo toàn bộ Endpoints (/api/v1/...)
│ ├── channels.php # Channel xác thực WebSocket
│ └── console.php # Khai báo lịch chạy Cronjob
├── .env # Biến môi trường (DB, Mail, JWT Secret)
├── composer.json # Quản lý thư viện PHP
└── artisan # CLI tool của Laravel
