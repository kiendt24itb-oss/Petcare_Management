<?php

namespace App\Repositories\Contracts;

use App\Models\ServiceCategory;
use Illuminate\Database\Eloquent\Collection;

interface ServiceCategoryRepositoryInterface
{
    public function getAll(): Collection;
    public function findById(int $id): ?ServiceCategory;
    public function create(array $data): ServiceCategory;
    public function update(int $id, array $data): bool;
    public function delete(int $id): bool;
}