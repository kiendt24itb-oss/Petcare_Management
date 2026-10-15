<?php

namespace App\Repositories\Contracts;

use App\Models\Customer;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection;

interface CustomerRepositoryInterface
{
    /**
     * Lấy danh sách khách hàng có phân trang & tìm kiếm (cho Admin)
     */
    public function getAllPaginated(array $filters = [], int $perPage = 15): LengthAwarePaginator;

    /**
     * Tìm khách hàng theo customer_id (kèm thông tin tài khoản & danh sách thú cưng)
     */
    public function findById(int $id): ?Customer;

    /**
     * Tìm khách hàng theo account_id (dùng khi Customer đăng nhập)
     */
    public function findByAccountId(int $accountId): ?Customer;

    /**
     * Tạo thông tin khách hàng mới
     */
    public function create(array $data): Customer;

    /**
     * Cập nhật thông tin cá nhân khách hàng (cho Customer sửa profile)
     */
    public function updateByAccountId(int $accountId, array $data): bool;

    /**
     * Thống kê tổng quan về khách hàng (cho Dashboard Admin)
     */
    public function getSummaryStats(): array;
}