<?php

namespace App\Repositories\Contracts;

use App\Models\Pet;
use Illuminate\Database\Eloquent\Collection;

interface PetRepositoryInterface
{
    public function getAll(): Collection;
    public function findById(int $id): ?Pet;
    public function getByCustomerId(int $customerId): Collection;
    public function create(array $data): Pet;
    public function update(int $id, array $data): bool;
    public function delete(int $id): bool;
}