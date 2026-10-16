<?php

use Illuminate\Support\Facades\Route;

// Auth Controller
use App\Http\Controllers\Api\AuthController;

// Controllers Tầng Admin
use App\Http\Controllers\Api\Admin\ServiceCategoryController;
use App\Http\Controllers\Api\Admin\RoomTypeController;
use App\Http\Controllers\Api\Admin\RoomController;
use App\Http\Controllers\Api\Admin\ServiceController;
use App\Http\Controllers\Api\Admin\AdminPositionController;
use App\Http\Controllers\Api\Admin\AdminStaffController;
use App\Http\Controllers\Api\Admin\AdminCustomerController;
use App\Http\Controllers\Api\Admin\AdminShiftController; // 🟢 BỔ SUNG CONTROLLER SHIFT

// Controllers Tầng Staff
use App\Http\Controllers\Api\Staff\StaffProfileController;

// Controllers Tầng Customer
use App\Http\Controllers\Api\Customer\CustomerProfileController;

/*
|--------------------------------------------------------------------------
| API Routes - Pet Care Management System
|--------------------------------------------------------------------------
*/

Route::prefix('v1')->group(function () {

    /*
    |--------------------------------------------------------------------------
    | 1. AUTHENTICATION ROUTES (Xác thực & Phân quyền)
    |--------------------------------------------------------------------------
    */
    Route::prefix('auth')->group(function () {
        Route::post('login', [AuthController::class, 'login']);
        Route::post('register', [AuthController::class, 'register']);
        Route::post('refresh', [AuthController::class, 'refresh']);
        
        Route::middleware('auth:api')->group(function () {
            Route::post('logout', [AuthController::class, 'logout']);
            Route::get('me', [AuthController::class, 'me']);
            Route::post('update-credentials', [AuthController::class, 'updateCredentials']);
            Route::post('update-staff-profile', [AuthController::class, 'updateStaffProfile']);
        });
    });

    /*
    |--------------------------------------------------------------------------
    | 2. PUBLIC / SHARED DATA ROUTES (Dữ liệu dùng chung)
    |--------------------------------------------------------------------------
    */
    Route::get('service-categories', [ServiceCategoryController::class, 'index']);
    Route::get('room-types', [RoomTypeController::class, 'index']);
    Route::get('rooms', [RoomController::class, 'index']);
    Route::get('services', [ServiceController::class, 'index']);
    
    // PUBLIC / SHARED POSITIONS (Lấy danh sách Chức vụ từ DB cho Dropdowns)
    Route::get('positions', [AdminPositionController::class, 'index']);

    /*
    |--------------------------------------------------------------------------
    | 3. ADMIN MANAGEMENT ROUTES (Khu vực Quản trị viên)
    |--------------------------------------------------------------------------
    */
    Route::middleware(['auth:api', \App\Http\Middleware\CheckRoleAdmin::class])
        ->prefix('admin')
        ->group(function () {

            // SERVICE CATEGORIES (Danh mục dịch vụ)
            Route::prefix('service-categories')->group(function () {
                Route::get('', [ServiceCategoryController::class, 'index']);
                Route::post('create', [ServiceCategoryController::class, 'store']);
                Route::delete('delete', [ServiceCategoryController::class, 'destroy']);
            });

            // ROOM TYPES (Loại phòng)
            Route::prefix('room-types')->group(function () {
                Route::get('', [RoomTypeController::class, 'index']);
                Route::post('create', [RoomTypeController::class, 'store']);
                Route::delete('delete', [RoomTypeController::class, 'destroy']);
            });

            // ROOMS (Phòng thực tế)
            Route::prefix('rooms')->group(function () {
                Route::get('', [RoomController::class, 'index']);
                Route::post('create', [RoomController::class, 'store']);
                Route::post('change-status', [RoomController::class, 'changeStatus']);
                Route::post('transfer', [RoomController::class, 'transfer']);
                Route::get('report', [RoomController::class, 'report']);
                Route::delete('delete', [RoomController::class, 'destroy']);
            });

            // SERVICES (Dịch vụ)
            Route::prefix('services')->group(function () {
                Route::get('', [ServiceController::class, 'index']);
                Route::get('detail/{id}', [ServiceController::class, 'show']);
                Route::post('upload-image', [ServiceController::class, 'uploadImage']);
                Route::post('create', [ServiceController::class, 'store']);
                Route::post('update', [ServiceController::class, 'update']);
                Route::delete('delete', [ServiceController::class, 'destroy']);
            });

            // POSITIONS (Quản lý Chức vụ trong Admin)
            Route::prefix('positions')->group(function () {
                Route::get('', [AdminPositionController::class, 'index']);
            });

            // STAFFS (Quản lý Nhân viên)
            Route::prefix('staffs')->group(function () {
                Route::get('preview-code', [AdminStaffController::class, 'previewCode']);
                Route::get('', [AdminStaffController::class, 'index']);
                Route::get('summary', [AdminStaffController::class, 'summaryStats']);
                Route::get('detail', [AdminStaffController::class, 'show']);
                Route::post('create', [AdminStaffController::class, 'store']);
                Route::post('update', [AdminStaffController::class, 'update']);
                Route::post('toggle-status', [AdminStaffController::class, 'toggleWorkingStatus']);
            });

            // WORK SHIFTS & ASSIGNMENTS (🟢 BỔ SUNG QUẢN LÝ PHÂN CA LÀM VIỆC)
            Route::prefix('shifts')->group(function () {
                Route::get('', [AdminShiftController::class, 'getShifts']);                // Lấy danh mục ca làm việc (Ca sáng, chiều, tối)
                Route::get('assignments', [AdminShiftController::class, 'getAssignments']); // Lấy ma trận/danh sách lịch phân ca
                Route::post('assign', [AdminShiftController::class, 'assignShift']);       // Phân ca làm việc cho nhân viên
            });

            // CUSTOMERS (Quản lý Khách hàng)
            Route::prefix('customers')->group(function () {
                Route::get('', [AdminCustomerController::class, 'index']);
                Route::get('summary', [AdminCustomerController::class, 'summaryStats']);
                Route::get('{id}', [AdminCustomerController::class, 'show']);
                Route::get('{id}/pets', [AdminCustomerController::class, 'getCustomerPets']);
                Route::post('toggle-account-status', [AdminCustomerController::class, 'toggleAccountStatus']);
                Route::post('change-status', [AdminCustomerController::class, 'toggleAccountStatus']);
            });

        });

    /*
    |--------------------------------------------------------------------------
    | 4. STAFF ROUTES (Khu vực Nhân viên)
    |--------------------------------------------------------------------------
    */
    Route::middleware(['auth:api'])
        ->prefix('staff')
        ->group(function () {

            // HỒ SƠ CÁ NHÂN NHÂN VIÊN
            Route::prefix('profile')->group(function () {
                Route::get('', [StaffProfileController::class, 'getProfile']);
                Route::post('update', [StaffProfileController::class, 'updateProfile']);
                Route::post('upload-avatar', [StaffProfileController::class, 'uploadAvatar']);
            });

        });

    /*
    |--------------------------------------------------------------------------
    | 5. CUSTOMER ROUTES (Khu vực Khách hàng)
    |--------------------------------------------------------------------------
    */
    Route::middleware(['auth:api'])
        ->prefix('customer')
        ->group(function () {

            // THÔNG TIN CÁ NHÂN KHÁCH HÀNG
            Route::prefix('profile')->group(function () {
                Route::get('', [CustomerProfileController::class, 'getProfile']);
                Route::post('update', [CustomerProfileController::class, 'updateProfile']);
                Route::post('upload-avatar', [CustomerProfileController::class, 'uploadAvatar']);
            });

            // QUẢN LÝ THÚ CƯNG
            Route::prefix('pets')->group(function () {
                Route::get('', [CustomerProfileController::class, 'getMyPets']);
                Route::post('create', [CustomerProfileController::class, 'addPet']);
                Route::get('{id}', [CustomerProfileController::class, 'getPetDetail']);
                Route::post('{id}/update', [CustomerProfileController::class, 'updatePet']);
                Route::delete('{id}', [CustomerProfileController::class, 'deletePet']);
                Route::post('upload-avatar', [CustomerProfileController::class, 'uploadPetAvatar']);
            });

        });

});