<?php

namespace App\Services;

use App\Repositories\Contracts\ServiceCategoryRepositoryInterface;
use App\Services\CodeGeneratorService;
use Exception;

class ServiceCategoryService
{
    protected ServiceCategoryRepositoryInterface $categoryRepo;

    public function __construct(ServiceCategoryRepositoryInterface $categoryRepo)
    {
        $this->categoryRepo = $categoryRepo;
    }

    public function getAllCategories()
    {
        return $this->categoryRepo->getAll();
    }

    public function createCategory(array $data)
    {
        // Tự động sinh mã categoryCode (VD: CAT-A001) dùng CodeGeneratorService
        $data['category_code'] = CodeGeneratorService::generate('service_categories', 'category_code', 'health');
        
        return $this->categoryRepo->create($data);
    }

    public function deleteCategory(int $id)
    {
        $category = $this->categoryRepo->findById($id);
        if (!$category) {
            throw new Exception('Không tìm thấy loại dịch vụ!');
        }

        if ($category->roomTypes()->count() > 0 || $category->services()->count() > 0) {
            throw new Exception('Không thể xóa loại dịch vụ đã có loại phòng hoặc dịch vụ liên kết!');
        }

        return $this->categoryRepo->delete($id);
    }
}