<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;

// Controllers Tầng Admin
use App\Http\Controllers\Api\Admin\ServiceCategoryController;
use App\Http\Controllers\Api\Admin\RoomTypeController;
use App\Http\Controllers\Api\Admin\RoomController;
use App\Http\Controllers\Api\Admin\ServiceController;
use App\Http\Controllers\Api\Admin\AdminCustomerController;

// Controllers Tầng Customer
use App\Http\Controllers\Api\Customer\CustomerProfileController;

Route::prefix('v1')->group(function () {

    /*
    |--------------------------------------------------------------------------
    | AUTHENTICATION ROUTES (Giữ nguyên)
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
    | SHARED / PUBLIC DATA (Giữ nguyên)
    |--------------------------------------------------------------------------
    */
    Route::get('service-categories', [ServiceCategoryController::class, 'index']);
    Route::get('room-types', [RoomTypeController::class, 'index']);
    Route::get('rooms', [RoomController::class, 'index']);
    Route::get('services', [ServiceController::class, 'index']);
    Route::get('positions', [AdminPositionController::class, 'index']);

    /*
    |--------------------------------------------------------------------------
    | ADMIN MANAGEMENT ROUTES
    |--------------------------------------------------------------------------
    */
    Route::middleware(['auth:api', \App\Http\Middleware\CheckRoleAdmin::class])
        ->prefix('admin')
        ->group(function () {

            // SERVICE CATEGORIES (DANH MỤC DỊCH VỤ)
            Route::prefix('service-categories')->group(function () {
                Route::get('', [ServiceCategoryController::class, 'index']);
                Route::post('create', [ServiceCategoryController::class, 'store']);
                Route::delete('delete', [ServiceCategoryController::class, 'destroy']);
            });

            // ROOM TYPES (LOẠI PHÒNG)
            Route::prefix('room-types')->group(function () {
                Route::get('', [RoomTypeController::class, 'index']);
                Route::post('create', [RoomTypeController::class, 'store']);
                Route::delete('delete', [RoomTypeController::class, 'destroy']);
            });

            // ROOMS (PHÒNG)
            Route::prefix('rooms')->group(function () {
                Route::get('', [RoomController::class, 'index']);
                Route::post('create', [RoomController::class, 'store']);
                Route::post('change-status', [RoomController::class, 'changeStatus']);
                Route::post('transfer', [RoomController::class, 'transfer']);
                Route::get('report', [RoomController::class, 'report']);
                Route::delete('delete', [RoomController::class, 'destroy']);
            });

            // SERVICES (DỊCH VỤ)
            Route::prefix('services')->group(function () {
                Route::get('', [ServiceController::class, 'index']);
                Route::get('detail/{id}', [ServiceController::class, 'show']);
                Route::post('upload-image', [ServiceController::class, 'uploadImage']);
                Route::post('create', [ServiceController::class, 'store']);
                Route::post('update', [ServiceController::class, 'update']);
                Route::delete('delete', [ServiceController::class, 'destroy']);
            });

            // POSITIONS (CHỨC VỤ)
            Route::prefix('positions')->group(function () {
                Route::get('', [AdminPositionController::class, 'index']);
                Route::get('detail', [AdminPositionController::class, 'show']);
                Route::post('create', [AdminPositionController::class, 'store']);
                Route::post('update', [AdminPositionController::class, 'update']);
                Route::delete('delete', [AdminPositionController::class, 'destroy']);
            });

            // STAFFS (NHÂN VIÊN)
            Route::prefix('staffs')->group(function () {
                Route::get('', [AdminStaffController::class, 'index']);
                Route::get('detail', [AdminStaffController::class, 'show']);
                Route::post('create', [AdminStaffController::class, 'store']);
                Route::post('update', [AdminStaffController::class, 'update']);
            });

            // CUSTOMERS (KHÁCH HÀNG - DÀNH CHO ADMIN)
            Route::prefix('customers')->group(function () {
                Route::get('', [AdminCustomerController::class, 'index']);
                Route::get('summary', [AdminCustomerController::class, 'summaryStats']);
                Route::get('{id}', [AdminCustomerController::class, 'show']);
                Route::get('{id}/pets', [AdminCustomerController::class, 'getCustomerPets']);
                
                // Đăng ký route khóa / mở khóa tài khoản
                Route::post('toggle-account-status', [AdminCustomerController::class, 'toggleAccountStatus']);
                Route::post('change-status', [AdminCustomerController::class, 'toggleAccountStatus']);
            });

        });

    /*
    |--------------------------------------------------------------------------
    | CUSTOMER ROUTES
    |--------------------------------------------------------------------------
    */
    Route::middleware(['auth:api'])
        ->prefix('customer')
        ->group(function () {

            // QUẢN LÝ THÔNG TIN CÁ NHÂN (CUSTOMER PROFILE)
            Route::prefix('profile')->group(function () {
                Route::get('', [CustomerProfileController::class, 'getProfile']);
                Route::post('update', [CustomerProfileController::class, 'updateProfile']);
                Route::post('upload-avatar', [CustomerProfileController::class, 'uploadAvatar']);
            });

            // QUẢN LÝ THÚ CƯNG (PET MANAGEMENT)
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