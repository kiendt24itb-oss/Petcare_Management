<?php

namespace App\Services;

use App\Repositories\Contracts\CustomerRepositoryInterface;
use App\Services\CodeGeneratorService;
use Exception;

class CustomerService
{
    protected CustomerRepositoryInterface $customerRepo;

    public function __construct(CustomerRepositoryInterface $customerRepo)
    {
        $this->customerRepo = $customerRepo;
    }

    /**
     * Dành cho Admin: Lấy danh sách khách hàng phân trang & tìm kiếm
     */
    public function getAllCustomers(array $filters = [], int $perPage = 15)
    {
        return $this->customerRepo->getAllPaginated($filters, $perPage);
    }

    /**
     * Dành cho Admin / Customer: Xem chi tiết 1 khách hàng theo customer_id
     */
    public function getCustomerById(int $customerId)
    {
        $customer = $this->customerRepo->findById($customerId);
        if (!$customer) {
            throw new Exception('Không tìm thấy thông tin khách hàng!');
        }
        return $customer;
    }

    /**
     * Dành cho Customer: Lấy thông tin cá nhân của tài khoản đang đăng nhập
     */
    public function getMyProfile(int $accountId)
    {
        $customer = $this->customerRepo->findByAccountId($accountId);
        if (!$customer) {
            throw new Exception('Hồ sơ khách hàng chưa được khởi tạo!');
        }
        return $customer;
    }

    /**
     * Khởi tạo thông tin Customer khi đăng ký tài khoản thành công
     */
    public function createCustomerProfile(int $accountId, array $data)
    {
        if (empty($data['customer_code'])) {
            $data['customer_code'] = CodeGeneratorService::generate('customers', 'customer_code', 'customer');
        }
        $data['account_id'] = $accountId;

        return $this->customerRepo->create($data);
    }

    /**
     * Dành cho Customer: Cập nhật thông tin cá nhân
     */
    public function updateMyProfile(int $accountId, array $data)
    {
        $customer = $this->customerRepo->findByAccountId($accountId);
        if (!$customer) {
            throw new Exception('Không tìm thấy tài khoản khách hàng để cập nhật!');
        }

        // Loại bỏ các trường không cho phép Customer tự sửa
        unset($data['customer_code'], $data['account_id'], $data['violation_count']);

        return $this->customerRepo->updateByAccountId($accountId, $data);
    }

    /**
     * Dành cho Admin: Lấy thống kê tổng quan
     */
    public function getCustomerSummaryStats(): array
    {
        return $this->customerRepo->getSummaryStats();
    }

    /**
     * 🔐 Dành cho Admin: Đổi trạng thái tài khoản Khách hàng (Khóa / Mở khóa)
     * Theo logic: 
     * - Mở khóa (UNLOCKED / ACTIVE): Nếu vi phạm >= 5 thì hạ về 3 (Xét duyệt thủ công).
     * - Khóa (LOCKED): Nếu vi phạm < 5 thì đẩy lên 5 (Bị khóa).
     */
    public function changeAccountStatus(int $customerId, ?string $status = null): array
    {
        $customer = $this->customerRepo->findById($customerId);
        if (!$customer || !$customer->account) {
            throw new Exception('Không tìm thấy thông tin khách hàng hoặc tài khoản liên kết!');
        }

        $account = $customer->account;

        // Nếu không truyền status thì tự động đảo trạng thái hiện tại
        if (empty($status)) {
            $newStatus = ($account->status === 'LOCKED' || $customer->violation_count >= 5) ? 'ACTIVE' : 'LOCKED';
        } else {
            $newStatus = strtoupper($status);
        }

        if ($newStatus === 'ACTIVE') {
            // Trường hợp MỞ KHÓA: Nếu đang >= 5 vi phạm thì hạ xuống 3
            if ($customer->violation_count >= 5) {
                $customer->update(['violation_count' => 3]);
            }
            $account->update(['status' => 'ACTIVE']);
            $message = "Đã mở khóa tài khoản thành công! Số lần vi phạm hiện tại là 3.";
        } else {
            // Trường hợp KHÓA: Nếu vi phạm < 5 thì tăng lên 5 để đồng bộ trạng thái khóa
            if ($customer->violation_count < 5) {
                $customer->update(['violation_count' => 5]);
            }
            $account->update(['status' => 'LOCKED']);
            $message = "Đã khóa tài khoản thành công!";
        }

        return [
            'customerId'     => $customer->customer_id,
            'accountStatus'  => $account->status,
            'violationCount' => $customer->violation_count,
            'message'        => $message
        ];
    }
}