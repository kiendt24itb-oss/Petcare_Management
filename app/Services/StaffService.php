<?php

namespace App\Services;

use App\Models\Account;
use App\Repositories\Contracts\PositionRepositoryInterface;
use App\Repositories\Contracts\StaffRepositoryInterface;
use App\Services\CodeGeneratorService;
use Exception;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class StaffService
{
    protected StaffRepositoryInterface $staffRepo;
    protected PositionRepositoryInterface $positionRepo;

    public function __construct(
        StaffRepositoryInterface $staffRepo,
        PositionRepositoryInterface $positionRepo
    ) {
        $this->staffRepo = $staffRepo;
        $this->positionRepo = $positionRepo;
    }

    public function getAllStaffs()
    {
        return $this->staffRepo->getAll();
    }

    public function getStaffById(int $id)
    {
        $staff = $this->staffRepo->findById($id);
        if (!$staff) {
            throw new Exception('Không tìm thấy thông tin nhân viên!');
        }
        return $staff;
    }

    public function getStaffByAccountId(int $accountId)
    {
        return $this->staffRepo->findByAccountId($accountId);
    }

    /**
     * TH1: Admin chỉ tạo tài khoản STAFF trước (Cho nhân viên tự điền info sau)
     */
    public function createStaffAccountOnly(array $data)
    {
        return DB::transaction(function () use ($data) {
            return Account::create([
                'username' => $data['username'],
                'email'    => $data['email'],
                'password' => Hash::make($data['password']),
                'role'     => 'STAFF',
                'status'   => 'ACTIVE',
            ]);
        });
    }

    /**
     * TH2: Admin tạo trọn gói cả Account lẫn Profile Nhân viên
     */
    public function createStaffFull(array $data)
    {
        return DB::transaction(function () use ($data) {
            if (!empty($data['positionId'])) {
                $position = $this->positionRepo->findById($data['positionId']);
                if (!$position) {
                    throw new Exception('Chức vụ đã chọn không tồn tại!');
                }
            }

            // 1. Tạo Account
            $account = Account::create([
                'username' => $data['username'],
                'email'    => $data['email'],
                'password' => Hash::make($data['password']),
                'role'     => 'STAFF',
                'status'   => 'ACTIVE',
            ]);

            // 2. Tạo Profile Staff
            $payload = [
                'staff_code'       => CodeGeneratorService::generate('staffs', 'staff_code', 'staff'),
                'account_id'       => $account->account_id,
                'position_id'      => $data['positionId'] ?? null,
                'full_name'        => $data['fullName'],
                'email'            => $data['email'],
                'phone'            => $data['phone'] ?? null,
                'citizen_id'       => $data['citizenId'] ?? null,
                'address'          => $data['address'] ?? null,
                'avatar'           => $data['avatar'] ?? null,
                'salary_per_shift' => $data['salaryPerShift'] ?? 0.00,
                'is_working'       => true,
            ];

            return $this->staffRepo->create($payload);
        });
    }

    /**
     * Nhân viên tự đăng nhập điền/sửa profile cá nhân
     */
    public function updateSelfProfile(int $accountId, array $data)
    {
        return DB::transaction(function () use ($accountId, $data) {
            $staff = $this->staffRepo->findByAccountId($accountId);

            // Nếu nhân viên thuộc TH1 (Mới có Account, chưa có record trong bảng staffs)
            if (!$staff) {
                $payload = [
                    'staff_code'       => CodeGeneratorService::generate('staffs', 'staff_code', 'staff'),
                    'account_id'       => $accountId,
                    'position_id'      => null, // Staff không tự chỉnh được
                    'full_name'        => $data['fullName'],
                    'email'            => $data['email'] ?? null,
                    'phone'            => $data['phone'] ?? null,
                    'citizen_id'       => $data['citizenId'] ?? null,
                    'address'          => $data['address'] ?? null,
                    'avatar'           => $data['avatar'] ?? null,
                    'salary_per_shift' => 0.00, // Staff không tự chỉnh được
                    'is_working'       => true,
                ];

                return $this->staffRepo->create($payload);
            }

            // Nếu đã có record staff thì chỉ cập nhật các thông tin cá nhân
            $updateData = [
                'full_name'  => $data['fullName'] ?? $staff->full_name,
                'email'      => $data['email'] ?? $staff->email,
                'phone'      => $data['phone'] ?? $staff->phone,
                'citizen_id' => $data['citizenId'] ?? $staff->citizen_id,
                'address'    => $data['address'] ?? $staff->address,
                'avatar'     => $data['avatar'] ?? $staff->avatar,
            ];

            $this->staffRepo->update($staff->staff_id, $updateData);
            return $this->staffRepo->findById($staff->staff_id);
        });
    }

    /**
     * Admin cập nhật thông tin Staff (Bao gồm chức vụ & lương ca)
     */
    public function updateStaffByAdmin(int $id, array $data)
    {
        return DB::transaction(function () use ($id, $data) {
            $staff = $this->staffRepo->findById($id);
            if (!$staff) {
                throw new Exception('Nhân viên không tồn tại!');
            }

            if (isset($data['positionId'])) {
                $position = $this->positionRepo->findById($data['positionId']);
                if (!$position) {
                    throw new Exception('Chức vụ đã chọn không tồn tại!');
                }
            }

            $updateData = [
                'position_id'      => $data['positionId'] ?? $staff->position_id,
                'full_name'        => $data['fullName'] ?? $staff->full_name,
                'email'            => $data['email'] ?? $staff->email,
                'phone'            => $data['phone'] ?? $staff->phone,
                'citizen_id'       => $data['citizenId'] ?? $staff->citizen_id,
                'address'          => $data['address'] ?? $staff->address,
                'avatar'           => $data['avatar'] ?? $staff->avatar,
                'salary_per_shift' => $data['salaryPerShift'] ?? $staff->salary_per_shift,
                'is_working'       => isset($data['isWorking']) ? $data['isWorking'] : $staff->is_working,
            ];

            $this->staffRepo->update($id, $updateData);
            return $this->staffRepo->findById($id);
        });
    }
}