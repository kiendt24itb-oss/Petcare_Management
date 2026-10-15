<?php

namespace App\Repositories\Contracts;

use App\Models\Pet;
use Illuminate\Database\Eloquent\Collection;

interface PetRepositoryInterface
{
    /**
     * Lấy danh sách thú cưng của một khách hàng cụ thể
     */
    public function getByCustomerId(int $customerId): Collection;

    /**
     * Tìm chi tiết 1 thú cưng theo ID
     */
    public function findById(int $id): ?Pet;

    /**
     * Tìm 1 thú cưng và đảm bảo nó thuộc về đúng customerId (Bảo mật cho Customer)
     */
    public function findByIdAndCustomerId(int $petId, int $customerId): ?Pet;

    /**
     * Thêm thú cưng mới (cho Customer)
     */
    public function create(array $data): Pet;

    /**
     * Cập nhật thông tin thú cưng (cho Customer)
     */
    public function update(int $petId, int $customerId, array $data): bool;

    /**
     * Xóa thú cưng (cho Customer)
     */
    public function delete(int $petId, int $customerId): bool;
}