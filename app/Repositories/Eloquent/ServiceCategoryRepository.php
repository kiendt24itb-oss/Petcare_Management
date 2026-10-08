<?php

namespace App\Repositories\Eloquent;

use App\Models\ServiceCategory;
use App\Repositories\Contracts\ServiceCategoryRepositoryInterface;
use Illuminate\Database\Eloquent\Collection;

class ServiceCategoryRepository implements ServiceCategoryRepositoryInterface
{
    public function getAll(): Collection
    {
        return ServiceCategory::withCount('roomTypes')->get();
    }

    public function findById(int $id): ?ServiceCategory
    {
        return ServiceCategory::find($id);
    }

    public function create(array $data): ServiceCategory
    {
        return ServiceCategory::create($data);
    }

    public function update(int $id, array $data): bool
    {
        $category = $this->findById($id);
        if (!$category) {
            return false;
        }
        return $category->update($data);
    }

    public function delete(int $id): bool
    {
        $category = $this->findById($id);
        if (!$category) {
            return false;
        }
        return $category->delete();
    }
}