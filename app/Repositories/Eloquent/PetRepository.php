<?php

namespace App\Repositories\Eloquent;

use App\Models\Pet;
use App\Repositories\Contracts\PetRepositoryInterface;
use Illuminate\Database\Eloquent\Collection;

class PetRepository implements PetRepositoryInterface
{
    public function getAll(): Collection
    {
        return Pet::with('customer')
            ->orderBy('pet_id', 'desc')
            ->get();
    }

    public function findById(int $id): ?Pet
    {
        return Pet::with('customer')->find($id);
    }

    public function getByCustomerId(int $customerId): Collection
    {
        return Pet::where('customer_id', $customerId)
            ->orderBy('pet_id', 'desc')
            ->get();
    }

    public function create(array $data): Pet
    {
        return Pet::create($data);
    }

    public function update(int $id, array $data): bool
    {
        $pet = Pet::find($id);
        if (!$pet) {
            return false;
        }
        return $pet->update($data);
    }

    public function delete(int $id): bool
    {
        $pet = Pet::find($id);
        if (!$pet) {
            return false;
        }
        return $pet->delete();
    }
}