<?php

namespace App\Services;

use App\Repositories\Contracts\CustomerRepositoryInterface;
use App\Services\CodeGeneratorService;
use Exception;
use Illuminate\Support\Facades\DB;

class CustomerService
{
    protected CustomerRepositoryInterface $customerRepo;

    public function __construct(CustomerRepositoryInterface $customerRepo)
    {
        $this->customerRepo = $customerRepo;
    }

    public function getAllCustomers()
    {
        return $this->customerRepo->getAll();
    }

    public function getCustomerById(int $id)
    {
        $customer = $this->customerRepo->findById($id);
        if (!$customer) {
            throw new Exception('Không tìm thấy thông tin khách hàng!');
        }
        return $customer;
    }

    public function getCustomerByAccountId(int $accountId)
    {
        return $this->customerRepo->findByAccountId($accountId);
    }

    /**
     * Khách hàng tự cập nhật thông tin cá nhân (Hoặc tạo mới profile nếu mới đăng ký TK)
     */
    public function updateSelfProfile(int $accountId, array $data)
    {
        return DB::transaction(function () use ($accountId, $data) {
            $customer = $this->customerRepo->findByAccountId($accountId);

            if (!$customer) {
                $payload = [
                    'customer_code'   => CodeGeneratorService::generate('customers', 'customer_code', 'customer'),
                    'account_id'      => $accountId,
                    'full_name'       => $data['fullName'],
                    'age'             => $data['age'] ?? null,
                    'gender'          => $data['gender'] ?? null,
                    'email'           => $data['email'] ?? null,
                    'phone'           => $data['phone'] ?? null,
                    'address'         => $data['address'] ?? null,
                    'avatar'          => $data['avatar'] ?? null,
                    'violation_count' => 0,
                ];

                return $this->customerRepo->create($payload);
            }

            $updateData = [
                'full_name' => $data['fullName'] ?? $customer->full_name,
                'age'       => $data['age'] ?? $customer->age,
                'gender'    => $data['gender'] ?? $customer->gender,
                'email'     => $data['email'] ?? $customer->email,
                'phone'     => $data['phone'] ?? $customer->phone,
                'address'   => $data['address'] ?? $customer->address,
                'avatar'    => $data['avatar'] ?? $customer->avatar,
            ];

            $this->customerRepo->update($customer->customer_id, $updateData);
            return $this->customerRepo->findById($customer->customer_id);
        });
    }
}