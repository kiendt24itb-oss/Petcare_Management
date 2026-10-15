<?php

namespace App\Repositories\Eloquent;

use App\Models\Pet;
use App\Repositories\Contracts\PetRepositoryInterface;
use Illuminate\Database\Eloquent\Collection;

class PetRepository implements PetRepositoryInterface
{
    public function getByCustomerId(int $customerId): Collection
    {
        return Pet::where('customer_id', $customerId)
            ->orderBy('pet_id', 'desc')
            ->get();
    }

    public function findById(int $id): ?Pet
    {
        return Pet::with(['customer'])->find($id);
    }

    public function findByIdAndCustomerId(int $petId, int $customerId): ?Pet
    {
        return Pet::where('pet_id', $petId)
            ->where('customer_id', $customerId)
            ->first();
    }

    public function create(array $data): Pet
    {
        return Pet::create($data);
    }

    public function update(int $petId, int $customerId, array $data): bool
    {
        $pet = $this->findByIdAndCustomerId($petId, $customerId);
        if (!$pet) {
            return false;
        }

        return $pet->update($data);
    }

    public function delete(int $petId, int $customerId): bool
    {
        $pet = $this->findByIdAndCustomerId($petId, $customerId);
        if (!$pet) {
            return false;
        }

        return $pet->delete();
    }
}