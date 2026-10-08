<?php

namespace App\Services;

use App\Repositories\Contracts\CustomerRepositoryInterface;
use App\Repositories\Contracts\PetRepositoryInterface;
use App\Services\CodeGeneratorService;
use Exception;
use Illuminate\Support\Facades\DB;

class PetService
{
    protected PetRepositoryInterface $petRepo;
    protected CustomerRepositoryInterface $customerRepo;

    public function __construct(
        PetRepositoryInterface $petRepo,
        CustomerRepositoryInterface $customerRepo
    ) {
        $this->petRepo = $petRepo;
        $this->customerRepo = $customerRepo;
    }

    public function getPetsByAccountId(int $accountId)
    {
        $customer = $this->customerRepo->findByAccountId($accountId);
        if (!$customer) {
            return collect();
        }
        return $this->petRepo->getByCustomerId($customer->customer_id);
    }

    public function getPetById(int $id)
    {
        $pet = $this->petRepo->findById($id);
        if (!$pet) {
            throw new Exception('Không tìm thấy thông tin thú cưng!');
        }
        return $pet;
    }

    /**
     * Khách hàng thêm mới thú cưng
     */
    public function createPet(int $accountId, array $data)
    {
        return DB::transaction(function () use ($accountId, $data) {
            $customer = $this->customerRepo->findByAccountId($accountId);
            if (!$customer) {
                throw new Exception('Chưa tìm thấy thông tin hồ sơ khách hàng. Vui lòng cập nhật hồ sơ trước!');
            }

            $payload = [
                'pet_code'    => CodeGeneratorService::generate('pets', 'pet_code', 'pet'),
                'customer_id' => $customer->customer_id,
                'pet_name'    => $data['petName'],
                'species'     => $data['species'] ?? null,
                'breed'       => $data['breed'] ?? null,
                'age'         => $data['age'] ?? null,
                'weight'      => $data['weight'] ?? null,
                'gender'      => $data['gender'] ?? null,
                'avatar'      => $data['avatar'] ?? null,
                'health_note' => $data['healthNote'] ?? null,
            ];

            return $this->petRepo->create($payload);
        });
    }

    /**
     * Khách hàng cập nhật thông tin thú cưng của mình
     */
    public function updatePet(int $accountId, int $petId, array $data)
    {
        return DB::transaction(function () use ($accountId, $petId, $data) {
            $customer = $this->customerRepo->findByAccountId($accountId);
            $pet = $this->petRepo->findById($petId);

            if (!$pet) {
                throw new Exception('Thú cưng không tồn tại!');
            }

            // Kiểm tra chính chủ
            if ($pet->customer_id !== $customer->customer_id) {
                throw new Exception('Bạn không có quyền chỉnh sửa thú cưng này!');
            }

            $updateData = [
                'pet_name'    => $data['petName'] ?? $pet->pet_name,
                'species'     => $data['species'] ?? $pet->species,
                'breed'       => $data['breed'] ?? $pet->breed,
                'age'         => $data['age'] ?? $pet->age,
                'weight'      => $data['weight'] ?? $pet->weight,
                'gender'      => $data['gender'] ?? $pet->gender,
                'avatar'      => $data['avatar'] ?? $pet->avatar,
                'health_note' => $data['healthNote'] ?? $pet->health_note,
            ];

            $this->petRepo->update($petId, $updateData);
            return $this->petRepo->findById($petId);
        });
    }

    /**
     * Khách hàng xóa thú cưng của mình
     */
    public function deletePet(int $accountId, int $petId)
    {
        return DB::transaction(function () use ($accountId, $petId) {
            $customer = $this->customerRepo->findByAccountId($accountId);
            $pet = $this->petRepo->findById($petId);

            if (!$pet) {
                throw new Exception('Thú cưng cần xóa không tồn tại!');
            }

            if ($pet->customer_id !== $customer->customer_id) {
                throw new Exception('Bạn không có quyền xóa thú cưng này!');
            }

            return $this->petRepo->delete($petId);
        });
    }
}