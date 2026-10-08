<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;

// Controllers Tầng Admin
use App\Http\Controllers\Api\Admin\ServiceCategoryController;
use App\Http\Controllers\Api\Admin\RoomTypeController;
use App\Http\Controllers\Api\Admin\RoomController;
use App\Http\Controllers\Api\Admin\ServiceController;
use App\Http\Controllers\Api\Admin\PositionController as AdminPositionController;
use App\Http\Controllers\Api\Admin\StaffController as AdminStaffController;
use App\Http\Controllers\Api\Admin\CustomerController as AdminCustomerController;

// Controllers Tầng Staff
use App\Http\Controllers\Api\Staff\ProfileController as StaffProfileController;

// Controllers Tầng Customer
use App\Http\Controllers\Api\Customer\ProfileController as CustomerProfileController;
use App\Http\Controllers\Api\Customer\PetController as CustomerPetController;

Route::prefix('v1')->group(function () {

    /*
    |--------------------------------------------------------------------------
    | AUTHENTICATION ROUTES (BỔ SUNG)
    |--------------------------------------------------------------------------
    */
    Route::prefix('auth')->group(function () {
        Route::post('login', [AuthController::class, 'login']);
        Route::post('register', [AuthController::class, 'register']);
        Route::post('refresh', [AuthController::class, 'refresh']);
        
        Route::middleware('auth:api')->group(function () {
            Route::post('logout', [AuthController::class, 'logout']);
            Route::get('me', [AuthController::class, 'me']);
        });
    });

    /*
    |--------------------------------------------------------------------------
    | SHARED / PUBLIC DATA
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

            // ROOMS
            Route::prefix('rooms')->group(function () {
                Route::get('', [RoomController::class, 'index']);
                Route::post('create', [RoomController::class, 'store']);
                Route::post('change-status', [RoomController::class, 'changeStatus']);
                Route::post('transfer', [RoomController::class, 'transfer']);
                Route::get('report', [RoomController::class, 'report']);
                Route::delete('delete', [RoomController::class, 'destroy']);
            });

            // SERVICES
            Route::prefix('services')->group(function () {
                Route::get('', [ServiceController::class, 'index']);
                Route::get('detail', [ServiceController::class, 'show']);
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

            // CUSTOMERS (KHÁCH HÀNG)
            Route::prefix('customers')->group(function () {
                Route::get('', [AdminCustomerController::class, 'index']);
                Route::get('detail', [AdminCustomerController::class, 'show']);
                Route::post('toggle-account-status', [AdminCustomerController::class, 'toggleAccountStatus']);
            });

        });

    /*
    |--------------------------------------------------------------------------
    | STAFF ROUTES
    |--------------------------------------------------------------------------
    */
    Route::middleware(['auth:api', \App\Http\Middleware\CheckRoleStaff::class])
        ->prefix('staff')
        ->group(function () {

            Route::prefix('profile')->group(function () {
                Route::get('', [StaffProfileController::class, 'show']);
                Route::post('update', [StaffProfileController::class, 'update']);
                Route::post('upload-avatar', [StaffProfileController::class, 'uploadAvatar']);
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

            Route::prefix('profile')->group(function () {
                Route::get('', [CustomerProfileController::class, 'show']);
                Route::post('update', [CustomerProfileController::class, 'update']);
                Route::post('upload-avatar', [CustomerProfileController::class, 'uploadAvatar']);
            });

            Route::prefix('pets')->group(function () {
                Route::get('', [CustomerPetController::class, 'index']);
                Route::get('detail', [CustomerPetController::class, 'show']);
                Route::post('create', [CustomerPetController::class, 'store']);
                Route::post('update', [CustomerPetController::class, 'update']);
                Route::post('upload-avatar', [CustomerPetController::class, 'uploadAvatar']);
                Route::delete('delete', [CustomerPetController::class, 'destroy']);
            });

        });

});