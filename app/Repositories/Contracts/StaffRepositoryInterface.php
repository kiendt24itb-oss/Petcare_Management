<?php

namespace App\Repositories\Contracts;

use App\Models\Staff;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

interface StaffRepositoryInterface
{
    /**
     * Lấy danh sách nhân viên có phân trang & lọc (cho Admin)
     */
    public function getAllPaginated(array $filters = [], int $perPage = 15): LengthAwarePaginator;

    /**
     * Tìm nhân viên theo staff_id (kèm account & position)
     */
    public function findById(int $id): ?Staff;

    /**
     * Tìm nhân viên theo account_id (dùng khi Staff đăng nhập)
     */
    public function findByAccountId(int $accountId): ?Staff;

    /**
     * Tạo thông tin nhân viên mới
     */
    public function create(array $data): Staff;

    /**
     * Cập nhật thông tin nhân viên theo staff_id (dùng cho Admin)
     */
    public function update(int $id, array $data): bool;

    /**
     * Cập nhật thông tin cá nhân theo account_id (dùng cho Nhân viên tự sửa profile)
     */
    public function updateByAccountId(int $accountId, array $data): bool;

    /**
     * Đổi trạng thái làm việc (is_working) của nhân viên
     */
    public function updateWorkingStatus(int $id, bool $isWorking): bool;

    /**
     * Thống kê tổng quan về nhân viên (cho Dashboard Admin)
     */
    public function getSummaryStats(): array;
}