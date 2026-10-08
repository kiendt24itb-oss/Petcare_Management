<?php

namespace App\Repositories\Eloquent;

use App\Models\Staff;
use App\Repositories\Contracts\StaffRepositoryInterface;
use Illuminate\Database\Eloquent\Collection;

class StaffRepository implements StaffRepositoryInterface
{
    public function getAll(): Collection
    {
        return Staff::with(['account', 'position'])
            ->orderBy('staff_id', 'desc')
            ->get();
    }

    public function findById(int $id): ?Staff
    {
        return Staff::with(['account', 'position'])->find($id);
    }

    public function findByAccountId(int $accountId): ?Staff
    {
        return Staff::with(['position'])->where('account_id', $accountId)->first();
    }

    public function create(array $data): Staff
    {
        return Staff::create($data);
    }

    public function update(int $id, array $data): bool
    {
        $staff = Staff::find($id);
        if (!$staff) {
            return false;
        }
        return $staff->update($data);
    }

    public function delete(int $id): bool
    {
        $staff = Staff::find($id);
        if (!$staff) {
            return false;
        }
        return $staff->delete();
    }
}