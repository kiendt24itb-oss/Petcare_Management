<?php

namespace App\Repositories\Contracts;

use App\Models\Service;
use Illuminate\Database\Eloquent\Collection;

interface ServiceRepositoryInterface
{
    public function getAll(): Collection;
    public function findById(int $id): ?Service;
    public function create(array $data): Service;
    public function update(int $id, array $data): bool;
    public function delete(int $id): bool;
}