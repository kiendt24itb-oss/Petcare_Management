<?php

namespace App\Services;

use App\Repositories\Contracts\CustomerRepositoryInterface;
use App\Repositories\Contracts\PetRepositoryInterface;
use App\Services\CodeGeneratorService;
use Exception;

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

    /**
     * Lấy danh sách thú cưng của Customer đang đăng nhập
     */
    public function getMyPets(int $accountId)
    {
        $customer = $this->customerRepo->findByAccountId($accountId);
        if (!$customer) {
            throw new Exception('Không tìm thấy thông tin khách hàng!');
        }

        return $this->petRepo->getByCustomerId($customer->customer_id);
    }

    /**
     * Dành cho Admin xem danh sách thú cưng của 1 khách hàng
     */
    public function getPetsByCustomerId(int $customerId)
    {
        return $this->petRepo->getByCustomerId($customerId);
    }

    /**
     * Lấy chi tiết 1 thú cưng thuộc sở hữu của Customer đang đăng nhập
     */
    public function getMyPetDetail(int $petId, int $accountId)
    {
        $customer = $this->customerRepo->findByAccountId($accountId);
        if (!$customer) {
            throw new Exception('Không tìm thấy thông tin khách hàng!');
        }

        $pet = $this->petRepo->findByIdAndCustomerId($petId, $customer->customer_id);
        if (!$pet) {
            throw new Exception('Không tìm thấy thú cưng hoặc bạn không có quyền truy cập!');
        }

        return $pet;
    }

    /**
     * Dành cho Customer: Thêm thú cưng mới
     */
    public function createPet(int $accountId, array $data)
    {
        $customer = $this->customerRepo->findByAccountId($accountId);
        if (!$customer) {
            throw new Exception('Không tìm thấy tài khoản khách hàng!');
        }

        if (empty($data['pet_code'])) {
            $data['pet_code'] = CodeGeneratorService::generate('pets', 'pet_code', 'pet');
        }

        $data['customer_id'] = $customer->customer_id;

        return $this->petRepo->create($data);
    }

    /**
     * Dành cho Customer: Cập nhật thú cưng
     */
    public function updatePet(int $petId, int $accountId, array $data)
    {
        $customer = $this->customerRepo->findByAccountId($accountId);
        if (!$customer) {
            throw new Exception('Không tìm thấy tài khoản khách hàng!');
        }

        unset($data['pet_code'], $data['customer_id']);

        $updated = $this->petRepo->update($petId, $customer->customer_id, $data);
        if (!$updated) {
            throw new Exception('Cập nhật thất bại hoặc thú cưng không thuộc sở hữu của bạn!');
        }

        return true;
    }

    /**
     * Dành cho Customer: Xóa thú cưng
     */
    public function deletePet(int $petId, int $accountId)
    {
        $customer = $this->customerRepo->findByAccountId($accountId);
        if (!$customer) {
            throw new Exception('Không tìm thấy tài khoản khách hàng!');
        }

        $deleted = $this->petRepo->delete($petId, $customer->customer_id);
        if (!$deleted) {
            throw new Exception('Xóa thất bại hoặc thú cưng không thuộc sở hữu của bạn!');
        }

        return true;
    }
}