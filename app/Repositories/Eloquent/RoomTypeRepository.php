<?php

namespace App\Repositories\Eloquent;

use App\Models\RoomType;
use App\Repositories\Contracts\RoomTypeRepositoryInterface;
use Illuminate\Database\Eloquent\Collection;

class RoomTypeRepository implements RoomTypeRepositoryInterface
{
    public function getAll(): Collection
    {
        return RoomType::with('category')->get();
    }

    public function getByCategoryId(int $categoryId): Collection
    {
        return RoomType::where('category_id', $categoryId)->with('category')->get();
    }

    public function findById(int $id): ?RoomType
    {
        return RoomType::with('category')->find($id);
    }

    public function create(array $data): RoomType
    {
        return RoomType::create($data);
    }

    public function update(int $id, array $data): bool
    {
        $roomType = $this->findById($id);
        if (!$roomType) {
            return false;
        }
        return $roomType->update($data);
    }

    public function delete(int $id): bool
    {
        $roomType = $this->findById($id);
        if (!$roomType) {
            return false;
        }
        return $roomType->delete();
    }
}