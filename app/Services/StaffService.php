<?php

namespace App\Services;

use App\Models\Account;
use App\Models\Position;
use App\Repositories\Contracts\StaffRepositoryInterface;
use App\Services\CodeGeneratorService;
use Exception;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class StaffService
{
    protected StaffRepositoryInterface $staffRepo;

    public function __construct(StaffRepositoryInterface $staffRepo)
    {
        $this->staffRepo = $staffRepo;
    }

    /**
     * Dành cho Admin: Lấy danh sách nhân viên phân trang & lọc
     */
    public function getAllStaffs(array $filters = [], int $perPage = 15)
    {
        return $this->staffRepo->getAllPaginated($filters, $perPage);
    }

    /**
     * Xem chi tiết 1 nhân viên theo staff_id
     */
    public function getStaffById(int $staffId)
    {
        $staff = $this->staffRepo->findById($staffId);
        if (!$staff) {
            throw new Exception('Không tìm thấy thông tin nhân viên!');
        }
        return $staff;
    }

    /**
     * Dành cho Staff: Lấy hồ sơ cá nhân của tài khoản đang đăng nhập
     * Nếu chưa có thông tin trong bảng staffs, tự động khởi tạo khung bản ghi
     */
    public function getMyProfile(int $accountId)
    {
        $staff = $this->staffRepo->findByAccountId($accountId);

        // Trường hợp Admin chỉ cấp tài khoản trống: Tự động khởi tạo bản ghi Staff
        if (!$staff) {
            $account = Account::find($accountId);
            $defaultPosition = Position::first(); // Lấy chức vụ mặc định nếu chưa gán
            $prefix = $defaultPosition ? $defaultPosition->position_code : 'NV';
            $staffCode = CodeGeneratorService::generateWithCustomPrefix('staffs', 'staff_code', $prefix);

            $staff = $this->staffRepo->create([
                'staff_code'       => $staffCode,
                'account_id'       => $accountId,
                'position_id'      => $defaultPosition ? $defaultPosition->position_id : null,
                'email'            => $account ? $account->email : null,
                'full_name'        => 'Chưa cập nhật',
                'salary_per_shift' => 0.00,
                'is_working'       => true,
            ]);

            // Load lại quan hệ account & position
            $staff = $this->staffRepo->findById($staff->staff_id);
        }

        return $staff;
    }

    /**
     * Dành cho Admin: Tạo Nhân viên mới (Tạo Account + Tạo Staff)
     */
    public function createStaff(array $data)
    {
        return DB::transaction(function () use ($data) {
            $position = Position::find($data['positionId']);
            if (!$position) {
                throw new Exception('Chức vụ được chọn không hợp lệ!');
            }

            $account = Account::create([
                'username' => $data['username'],
                'email'    => $data['email'],
                'password' => Hash::make($data['password']),
                'role'     => 'STAFF',
                'status'   => 'ACTIVE',
            ]);

            $prefix = $position->position_code ?? 'NV';
            $staffCode = CodeGeneratorService::generateWithCustomPrefix('staffs', 'staff_code', $prefix);

            $staffData = [
                'staff_code'       => $staffCode,
                'account_id'       => $account->account_id,
                'position_id'      => $position->position_id,
                'salary_per_shift' => $data['salaryPerShift'],
                'full_name'        => $data['fullName'] ?? 'Chưa cập nhật',
                'email'            => $data['email'],
                'phone'            => $data['phone'] ?? null,
                'citizen_id'       => $data['citizenId'] ?? null,
                'address'          => $data['address'] ?? null,
                'avatar'           => $data['avatar'] ?? null,
                'is_working'       => true,
            ];

            return $this->staffRepo->create($staffData);
        });
    }

    /**
     * Dành cho Admin: Cập nhật thông tin Quản lý (Chức vụ, Lương, Hồ sơ NV)
     */
   /**
 * Dành cho Admin: Cập nhật thông tin Quản lý (Chức vụ, Lương, Hồ sơ NV)
 * Tự động đổi staff_code theo prefix chức vụ mới nếu Admin đổi Chức vụ
 */
public function updateStaffByAdmin(int $staffId, array $data)
{
    $staff = $this->staffRepo->findById($staffId);
    if (!$staff) {
        throw new Exception('Không tìm thấy nhân viên!');
    }

    $updateData = [];

    // Lộc logic kiểm tra xem Admin có đổi Chức vụ hay không
    if (isset($data['positionId']) && (int)$data['positionId'] !== (int)$staff->position_id) {
        $newPosition = Position::find($data['positionId']);
        if (!$newPosition) {
            throw new Exception('Chức vụ mới chọn không hợp lệ!');
        }

        // 1. Gán position_id mới
        $updateData['position_id'] = $newPosition->position_id;

        // 2. Tự động sinh mã NV mới theo prefix chức vụ mới (VD: KTV -> KTV-A001)
        $prefix = $newPosition->position_code ?? 'NV';
        $updateData['staff_code'] = CodeGeneratorService::generateWithCustomPrefix('staffs', 'staff_code', $prefix);
    }

    if (isset($data['salaryPerShift'])) $updateData['salary_per_shift'] = $data['salaryPerShift'];
    if (isset($data['isWorking']))      $updateData['is_working']       = $data['isWorking'];
    if (isset($data['fullName']))       $updateData['full_name']        = $data['fullName'];
    if (isset($data['phone']))          $updateData['phone']            = $data['phone'];
    if (isset($data['citizenId']))      $updateData['citizen_id']       = $data['citizenId'];
    if (isset($data['address']))        $updateData['address']          = $data['address'];
    if (isset($data['avatar']))         $updateData['avatar']           = $data['avatar'];

    $this->staffRepo->update($staffId, $updateData);
    return $this->getStaffById($staffId);
}

    /**
     * Dành cho Nhân viên: Tự cập nhật / Bổ sung hồ sơ cá nhân
     */
    public function updateMyProfile(int $accountId, array $data)
    {
        $staff = $this->staffRepo->findByAccountId($accountId);

        $profileData = [
            'full_name'  => $data['fullName'],
            'phone'      => $data['phone'],
            'citizen_id' => $data['citizenId'] ?? ($staff ? $staff->citizen_id : null),
            'address'    => $data['address'] ?? ($staff ? $staff->address : null),
            'avatar'     => $data['avatar'] ?? ($staff ? $staff->avatar : null),
        ];

        // Nếu chưa có record staffs -> Tự động khởi tạo
        if (!$staff) {
            $account = Account::find($accountId);
            $defaultPosition = Position::first();
            $prefix = $defaultPosition ? $defaultPosition->position_code : 'NV';

            $profileData['staff_code']       = CodeGeneratorService::generateWithCustomPrefix('staffs', 'staff_code', $prefix);
            $profileData['account_id']       = $accountId;
            $profileData['position_id']      = $defaultPosition ? $defaultPosition->position_id : null;
            $profileData['email']            = $account ? $account->email : null;
            $profileData['salary_per_shift'] = 0.00;
            $profileData['is_working']       = true;

            return $this->staffRepo->create($profileData);
        }

        $this->staffRepo->updateByAccountId($accountId, $profileData);
        return $this->staffRepo->findByAccountId($accountId);
    }

    /**
 * Xem trước Mã Nhân Viên sẽ được cấp khi chọn Chức vụ trên UI Admin
 */
    public function previewStaffCode(int $positionId): string
    {
        $position = Position::find($positionId);
        $prefix = $position ? $position->position_code : 'NV';

        return CodeGeneratorService::generateWithCustomPrefix('staffs', 'staff_code', $prefix);
    }

    /**
     * Dành cho Admin: Đổi trạng thái làm việc (Ngừng làm / Đi làm lại)
     */
    public function toggleWorkingStatus(int $staffId, ?bool $isWorking = null): array
    {
        $staff = $this->staffRepo->findById($staffId);
        if (!$staff) {
            throw new Exception('Không tìm thấy nhân viên!');
        }

        $newStatus = $isWorking ?? !$staff->is_working;
        $this->staffRepo->updateWorkingStatus($staffId, $newStatus);

        if ($staff->account) {
            $staff->account->update(['status' => $newStatus ? 'ACTIVE' : 'LOCKED']);
        }

        return [
            'staffId'   => $staff->staff_id,
            'isWorking' => $newStatus,
            'message'   => $newStatus ? 'Đã chuyển trạng thái sang ĐANG LÀM VIỆC!' : 'Đã chuyển trạng thái sang TẠM NGỪNG LÀM VIỆC!'
        ];
    }

    /**
     * Dành cho Admin: Thống kê nhân viên
     */
    public function getStaffSummaryStats(): array
    {
        return $this->staffRepo->getSummaryStats();
    }
}