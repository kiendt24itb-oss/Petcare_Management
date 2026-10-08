<?php

namespace App\Repositories\Eloquent;

use App\Models\Position;
use App\Repositories\Contracts\PositionRepositoryInterface;
use Illuminate\Database\Eloquent\Collection;

class PositionRepository implements PositionRepositoryInterface
{
    public function getAll(): Collection
    {
        return Position::orderBy('position_id', 'desc')->get();
    }

    public function findById(int $id): ?Position
    {
        return Position::find($id);
    }

    public function create(array $data): Position
    {
        return Position::create($data);
    }

    public function update(int $id, array $data): bool
    {
        $position = Position::find($id);
        if (!$position) {
            return false;
        }
        return $position->update($data);
    }

    public function delete(int $id): bool
    {
        $position = Position::find($id);
        if (!$position) {
            return false;
        }
        return $position->delete();
    }
}