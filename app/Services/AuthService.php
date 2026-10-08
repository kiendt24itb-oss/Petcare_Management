<?php

namespace App\Services;

use App\Repositories\Contracts\AccountRepositoryInterface;
use App\Services\CodeGeneratorService;
use App\Models\Customer;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Exception;

class AuthService
{
    protected $accountRepo;

    public function __construct(AccountRepositoryInterface $accountRepo)
    {
        $this->accountRepo = $accountRepo;
    }

    public function login(array $credentials)
    {
        if (!$token = auth('api')->attempt($credentials)) {
            throw new Exception('Tài khoản hoặc mật khẩu không chính xác');
        }

        $account = auth('api')->user();

        // Kiểm tra tài khoản có bị khóa không
        if ($account->status === 'LOCKED') {
            auth('api')->logout();
            throw new Exception('Tài khoản của bạn đã bị khóa');
        }

        return $this->respondWithToken($token, $account);
    }

    public function registerCustomer(array $data)
    {
        return DB::transaction(function () use ($data) {
            // 1. Tạo Tài khoản mặc định role CUSTOMER
            $account = $this->accountRepo->createAccount([
                'username' => $data['username'],
                'email'    => $data['email'],
                'password' => Hash::make($data['password']),
                'role'     => 'CUSTOMER',
                'status'   => 'ACTIVE',
            ]);

            // 2. Sinh mã Khách hàng tự động dạng KH-A001 từ Service B2
            $customerCode = CodeGeneratorService::generate('customers', 'customer_code', 'customer');

            // 3. Tạo thông tin hồ sơ Customer tương ứng
            Customer::create([
                'customer_code' => $customerCode,
                'account_id'    => $account->account_id,
                'full_name'     => $data['full_name'] ?? $account->username, // Nếu trống thì lấy tạm username
                'email'         => $data['email'],
                'phone'         => $data['phone'] ?? null,
            ]);

            return $account;
        });
    }

    public function logout()
    {
        auth('api')->logout();
    }

    public function refresh()
    {
        $token = auth('api')->refresh();
        return $this->respondWithToken($token, auth('api')->user());
    }

    protected function respondWithToken($token, $account)
    {
        // Xử lý lấy Tên chào mừng
        $displayName = $account->username; // Mặc định lấy username chào mừng tạm thời

        if ($account->role === 'CUSTOMER' && $account->customer) {
            $displayName = $account->customer->full_name ?: $account->username;
        } elseif (in_array($account->role, ['ADMIN', 'STAFF']) && $account->staff) {
            $displayName = $account->staff->full_name ?: $account->username;
        }

        return [
            'access_token' => $token,
            'token_type'   => 'bearer',
            'expires_in'   => auth('api')->factory()->getTTL() * 60,
            'user'         => [
                'account_id'   => $account->account_id,
                'username'     => $account->username,
                'email'        => $account->email,
                'role'         => $account->role,
                'display_name' => $displayName, // Dùng hiển thị lời chào mừng
            ],
        ];
    }
}