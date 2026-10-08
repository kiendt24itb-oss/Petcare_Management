<?php

namespace App\Repositories\Contracts;

use App\Models\RoomType;
use Illuminate\Database\Eloquent\Collection;

interface RoomTypeRepositoryInterface
{
    public function getAll(): Collection;
    public function getByCategoryId(int $categoryId): Collection;
    public function findById(int $id): ?RoomType;
    public function create(array $data): RoomType;
    public function update(int $id, array $data): bool;
    public function delete(int $id): bool;
}