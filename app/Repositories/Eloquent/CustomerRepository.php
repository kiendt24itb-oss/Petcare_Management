<?php

namespace App\Repositories\Eloquent;

use App\Models\Customer;
use App\Repositories\Contracts\CustomerRepositoryInterface;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;

class CustomerRepository implements CustomerRepositoryInterface
{
    public function getAllPaginated(array $filters = [], int $perPage = 15): LengthAwarePaginator
    {
        $query = Customer::with(['account', 'pets'])->orderBy('customer_id', 'desc');

        // Tìm kiếm theo tên, email, sđt hoặc mã khách hàng
        if (!empty($filters['search'])) {
            $search = $filters['search'];
            $query->where(function ($q) use ($search) {
                $q->where('full_name', 'LIKE', "%{$search}%")
                  ->orWhere('email', 'LIKE', "%{$search}%")
                  ->orWhere('phone', 'LIKE', "%{$search}%")
                  ->orWhere('customer_code', 'LIKE', "%{$search}%");
            });
        }

        return $query->paginate($perPage);
    }

    public function findById(int $id): ?Customer
    {
        return Customer::with(['account', 'pets'])->find($id);
    }

    public function findByAccountId(int $accountId): ?Customer
    {
        return Customer::with(['account', 'pets'])->where('account_id', $accountId)->first();
    }

    public function create(array $data): Customer
    {
        return Customer::create($data);
    }

    public function updateByAccountId(int $accountId, array $data): bool
    {
        $customer = $this->findByAccountId($accountId);
        if (!$customer) {
            return false;
        }

        return $customer->update($data);
    }

    public function getSummaryStats(): array
    {
        return [
            'total_customers' => Customer::count(),
            'total_pets' => DB::table('pets')->count(),
            'violations_count' => Customer::where('violation_count', '>', 0)->count(),
        ];
    }
}