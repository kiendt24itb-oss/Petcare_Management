<?php

namespace App\Repositories\Eloquent;

use App\Models\Customer;
use App\Repositories\Contracts\CustomerRepositoryInterface;
use Illuminate\Database\Eloquent\Collection;

class CustomerRepository implements CustomerRepositoryInterface
{
    public function getAll(): Collection
    {
        return Customer::with(['account', 'pets'])
            ->orderBy('customer_id', 'desc')
            ->get();
    }

    public function findById(int $id): ?Customer
    {
        return Customer::with(['account', 'pets', 'bookings'])->find($id);
    }

    public function findByAccountId(int $accountId): ?Customer
    {
        return Customer::with(['pets'])->where('account_id', $accountId)->first();
    }

    public function create(array $data): Customer
    {
        return Customer::create($data);
    }

    public function update(int $id, array $data): bool
    {
        $customer = Customer::find($id);
        if (!$customer) {
            return false;
        }
        return $customer->update($data);
    }

    public function delete(int $id): bool
    {
        $customer = Customer::find($id);
        if (!$customer) {
            return false;
        }
        return $customer->delete();
    }
}