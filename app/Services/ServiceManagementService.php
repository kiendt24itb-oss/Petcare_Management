<?php

namespace App\Services;

use App\Repositories\Contracts\RoomRepositoryInterface;
use App\Repositories\Contracts\ServiceCategoryRepositoryInterface;
use App\Repositories\Contracts\ServiceRepositoryInterface;
use App\Services\CodeGeneratorService;
use Exception;
use Illuminate\Support\Facades\DB;

class ServiceManagementService
{
    protected ServiceRepositoryInterface $serviceRepo;
    protected ServiceCategoryRepositoryInterface $categoryRepo;
    protected RoomRepositoryInterface $roomRepo;

    public function __construct(
        ServiceRepositoryInterface $serviceRepo,
        ServiceCategoryRepositoryInterface $categoryRepo,
        RoomRepositoryInterface $roomRepo
    ) {
        $this->serviceRepo = $serviceRepo;
        $this->categoryRepo = $categoryRepo;
        $this->roomRepo = $roomRepo;
    }

    public function getAllServices()
    {
        return $this->serviceRepo->getAll();
    }

    public function getServiceById(int $id)
    {
        $service = $this->serviceRepo->findById($id);
        if (!$service) {
            throw new Exception('Không tìm thấy gói dịch vụ!');
        }
        return $service;
    }

    /**
     * Tạo dịch vụ mới (Tất cả dịch vụ đều tự động gán phòng dựa trên Loại phòng)
     */
    public function createService(array $data)
    {
        return DB::transaction(function () use ($data) {
            $categoryId         = $data['categoryId'];
            $requiredRoomTypeId = $data['requiredRoomTypeId'];

            $category = $this->categoryRepo->findById($categoryId);
            if (!$category) {
                throw new Exception('Loại dịch vụ không tồn tại!');
            }

            $payload = [
                'category_id'           => $categoryId,
                'service_code'          => CodeGeneratorService::generate('services', 'service_code', 'service'),
                'required_room_type_id' => $requiredRoomTypeId,
                'service_name'          => $data['serviceName'],
                'description'           => $data['description'] ?? null,
                'duration'              => $data['duration'],
                'price'                 => $data['price'],
                'image_url'             => $data['imageUrl'] ?? null,
                'status'                => $data['status'] ?? 'ACTIVE',
            ];

            return $this->serviceRepo->create($payload);
        });
    }

    /**
     * Cập nhật gói dịch vụ
     */
    public function updateService(int $id, array $data)
    {
        return DB::transaction(function () use ($id, $data) {
            $service = $this->serviceRepo->findById($id);
            if (!$service) {
                throw new Exception('Dịch vụ không tồn tại!');
            }

            $categoryId         = $data['categoryId'] ?? $service->category_id;
            $requiredRoomTypeId = $data['requiredRoomTypeId'] ?? $service->required_room_type_id;

            $category = $this->categoryRepo->findById($categoryId);
            if (!$category) {
                throw new Exception('Loại dịch vụ không tồn tại!');
            }

            $updateData = [
                'category_id'           => $categoryId,
                'required_room_type_id' => $requiredRoomTypeId,
                'service_name'          => $data['serviceName'] ?? $service->service_name,
                'description'           => $data['description'] ?? $service->description,
                'duration'              => $data['duration'] ?? $service->duration,
                'price'                 => $data['price'] ?? $service->price,
                'image_url'             => $data['imageUrl'] ?? $service->image_url,
                'status'                => $data['status'] ?? $service->status,
            ];

            return $this->serviceRepo->update($id, $updateData);
        });
    }

    /**
     * Xóa dịch vụ
     */
    public function deleteService(int $id)
    {
        return DB::transaction(function () use ($id) {
            $service = $this->serviceRepo->findById($id);
            if (!$service) {
                throw new Exception('Không tìm thấy dịch vụ cần xóa!');
            }

            return $this->serviceRepo->delete($id);
        });
    }
}