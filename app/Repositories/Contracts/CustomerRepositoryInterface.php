<?php

namespace App\Repositories\Contracts;

use App\Models\Customer;
use Illuminate\Database\Eloquent\Collection;

interface CustomerRepositoryInterface
{
    public function getAll(): Collection;
    public function findById(int $id): ?Customer;
    public function findByAccountId(int $accountId): ?Customer;
    public function create(array $data): Customer;
    public function update(int $id, array $data): bool;
    public function delete(int $id): bool;
}