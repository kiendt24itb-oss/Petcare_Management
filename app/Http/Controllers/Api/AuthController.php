<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use App\Http\Requests\Auth\RegisterRequest;
use App\Http\Requests\Auth\UpdateCredentialsRequest;
use App\Http\Requests\Staff\UpdateStaffProfileRequest;
use App\Services\AuthService;
use Exception;

class AuthController extends Controller
{
    protected $authService;

    public function __construct(AuthService $authService)
    {
        $this->authService = $authService;
    }

    /**
     * Đăng ký Khách hàng (UI Public)
     */
    public function register(RegisterRequest $request)
    {
        try {
            $account = $this->authService->registerCustomer($request->validated());
            return $this->successResponse($account, 'Đăng ký tài khoản thành công', 201);
        } catch (Exception $e) {
            return $this->errorResponse($e->getMessage(), 400);
        }
    }

    /**
     * Đăng nhập (Dùng chung 3 Role)
     */
    public function login(LoginRequest $request)
    {
        try {
            $result = $this->authService->login($request->validated());
            return $this->successResponse($result, 'Đăng nhập thành công');
        } catch (Exception $e) {
            $statusCode = $e->getCode() >= 400 && $e->getCode() < 600 ? $e->getCode() : 401;
            return $this->errorResponse($e->getMessage(), $statusCode);
        }
    }

    /**
     * Cập nhật Username & Mật khẩu (Cho cả ADMIN, STAFF, CUSTOMER)
     */
    public function updateCredentials(UpdateCredentialsRequest $request)
    {
        try {
            $accountId = auth('api')->id();
            $account = $this->authService->updateCredentials($accountId, $request->validated());
            return $this->successResponse($account, 'Cập nhật tài khoản thành công');
        } catch (Exception $e) {
            $statusCode = $e->getCode() >= 400 && $e->getCode() < 600 ? $e->getCode() : 400;
            return $this->errorResponse($e->getMessage(), $statusCode);
        }
    }

    /**
     * Staff tự bổ sung / cập nhật hồ sơ cá nhân
     */
    public function updateStaffProfile(UpdateStaffProfileRequest $request)
    {
        try {
            $accountId = auth('api')->id();
            $staff = $this->authService->updateStaffProfile($accountId, $request->validated());
            return $this->successResponse($staff, 'Cập nhật hồ sơ nhân viên thành công');
        } catch (Exception $e) {
            $statusCode = $e->getCode() >= 400 && $e->getCode() < 600 ? $e->getCode() : 400;
            return $this->errorResponse($e->getMessage(), $statusCode);
        }
    }

    /**
     * Lấy thông tin tài khoản hiện tại (Me)
     */
    public function me()
    {
        $account = auth('api')->user();
        if (!$account) {
            return $this->errorResponse('Unauthenticated', 401);
        }

        $infoData = null;
        $displayName = $account->username;

        // Bổ sung load data theo từng Role
        if ($account->role === 'ADMIN') {
            $displayName = 'Administrator';
        } elseif ($account->role === 'STAFF') {
            if ($account->staff) {
                $displayName = $account->staff->full_name ?: $account->username;
                $infoData = array_merge($account->staff->toArray(), [
                    'is_profile_completed' => true
                ]);
            } else {
                $infoData = [
                    'is_profile_completed' => false,
                    'message'              => 'Tài khoản chưa cập nhật hồ sơ nhân viên.'
                ];
            }
        } elseif ($account->role === 'CUSTOMER') {
            if ($account->customer) {
                $displayName = $account->customer->full_name ?: $account->username;
                $infoData = $account->customer;
            }
        }

        return $this->successResponse([
            'account_id'   => $account->account_id,
            'username'     => $account->username,
            'email'        => $account->email,
            'role'         => $account->role,
            'display_name' => $displayName,
            'info'         => $infoData,
        ], 'Lấy thông tin tài khoản thành công');
    }

    /**
     * Đăng xuất
     */
    public function logout()
    {
        $this->authService->logout();
        return $this->successResponse(null, 'Đăng xuất thành công');
    }

    /**
     * Làm mới Token
     */
    public function refresh()
    {
        try {
            $result = $this->authService->refresh();
            return $this->successResponse($result, 'Làm mới token thành công');
        } catch (Exception $e) {
            return $this->errorResponse('Token không hợp lệ hoặc đã hết hạn', 401);
        }
    }
}