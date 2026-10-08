<?php

namespace App\Repositories\Contracts;

use App\Models\Staff;
use Illuminate\Database\Eloquent\Collection;

interface StaffRepositoryInterface
{
    public function getAll(): Collection;
    public function findById(int $id): ?Staff;
    public function findByAccountId(int $accountId): ?Staff;
    public function create(array $data): Staff;
    public function update(int $id, array $data): bool;
    public function delete(int $id): bool;
}