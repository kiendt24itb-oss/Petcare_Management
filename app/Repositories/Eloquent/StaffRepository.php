<?php

namespace App\Repositories\Eloquent;

use App\Models\Staff;
use App\Repositories\Contracts\StaffRepositoryInterface;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;

class StaffRepository implements StaffRepositoryInterface
{
    public function getAllPaginated(array $filters = [], int $perPage = 15): LengthAwarePaginator
    {
        $query = Staff::with(['account', 'position'])->orderBy('staff_id', 'desc');

        // Lọc theo từ khóa (tên, email, sđt, cccd, mã nhân viên)
        if (!empty($filters['search'])) {
            $search = $filters['search'];
            $query->where(function ($q) use ($search) {
                $q->where('full_name', 'LIKE', "%{$search}%")
                  ->orWhere('email', 'LIKE', "%{$search}%")
                  ->orWhere('phone', 'LIKE', "%{$search}%")
                  ->orWhere('citizen_id', 'LIKE', "%{$search}%")
                  ->orWhere('staff_code', 'LIKE', "%{$search}%");
            });
        }

        // Lọc theo chức vụ
        if (!empty($filters['position_id'])) {
            $query->where('position_id', $filters['position_id']);
        }

        // Lọc theo trạng thái làm việc (is_working)
        if (isset($filters['is_working']) && $filters['is_working'] !== '') {
            $query->where('is_working', filter_var($filters['is_working'], FILTER_VALIDATE_BOOLEAN));
        }

        return $query->paginate($perPage);
    }

    public function findById(int $id): ?Staff
    {
        return Staff::with(['account', 'position'])->find($id);
    }

    public function findByAccountId(int $accountId): ?Staff
    {
        return Staff::with(['account', 'position'])->where('account_id', $accountId)->first();
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

    public function updateByAccountId(int $accountId, array $data): bool
    {
        $staff = $this->findByAccountId($accountId);
        if (!$staff) {
            return false;
        }

        return $staff->update($data);
    }

    public function updateWorkingStatus(int $id, bool $isWorking): bool
    {
        $staff = Staff::find($id);
        if (!$staff) {
            return false;
        }

        return $staff->update(['is_working' => $isWorking]);
    }

    public function getSummaryStats(): array
    {
        return [
            'total_staffs' => Staff::count(),
            'active_staffs' => Staff::where('is_working', true)->count(),
            'inactive_staffs' => Staff::where('is_working', false)->count(),
            'total_positions' => DB::table('positions')->count(),
        ];
    }
}