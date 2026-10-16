<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreStaffRequest;
use App\Http\Requests\Admin\UpdateStaffByAdminRequest;
use App\Http\Resources\StaffResource;
use App\Services\StaffService;
use Exception;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminStaffController extends Controller
{
    protected StaffService $staffService;

    public function __construct(StaffService $staffService)
    {
        $this->staffService = $staffService;
    }

    /**
     * Lấy danh sách nhân viên có phân trang & lọc (Search, Position, IsWorking)
     */
    public function index(Request $request): JsonResponse
    {
        try {
            $filters = [
                'search'      => $request->query('search'),
                'position_id' => $request->query('position_id'),
                'is_working'  => $request->query('is_working'),
            ];
            $perPage = (int) $request->query('per_page', 15);

            $staffs = $this->staffService->getAllStaffs($filters, $perPage);

            return response()->json([
                'status'  => true,
                'message' => 'Lấy danh sách nhân viên thành công!',
                'data'    => StaffResource::collection($staffs)->response()->getData(true),
            ], 200);
        } catch (Exception $e) {
            return response()->json([
                'status'  => false,
                'message' => $e->getMessage(),
            ], 400);
        }
    }

    /**
     * Xem chi tiết 1 nhân viên
     */
    public function show(Request $request): JsonResponse
    {
        try {
            $staffId = (int) $request->query('id');
            if (!$staffId) {
                throw new Exception('Thiếu id nhân viên!');
            }

            $staff = $this->staffService->getStaffById($staffId);

            return response()->json([
                'status'  => true,
                'message' => 'Lấy thông tin nhân viên thành công!',
                'data'    => new StaffResource($staff),
            ], 200);
        } catch (Exception $e) {
            return response()->json([
                'status'  => false,
                'message' => $e->getMessage(),
            ], 400);
        }
    }

    /**
     * Thêm mới nhân viên (Tự sinh staff_code theo Mã chức vụ, VD: BS-A001)
     */
    public function store(StoreStaffRequest $request): JsonResponse
    {
        try {
            $data = [
                'username'       => $request->input('username'),
                'email'          => $request->input('email'),
                'password'       => $request->input('password'),
                'positionId'     => $request->input('positionId'),
                'salaryPerShift' => $request->input('salaryPerShift'),
                'fullName'       => $request->input('fullName'),
                'phone'          => $request->input('phone'),
                'citizenId'      => $request->input('citizenId'),
                'address'        => $request->input('address'),
                'avatar'         => $request->input('avatar'),
            ];

            $staff = $this->staffService->createStaff($data);

            return response()->json([
                'status'  => true,
                'message' => 'Tạo tài khoản và thông tin nhân viên thành công!',
                'data'    => new StaffResource($staff),
            ], 201);
        } catch (Exception $e) {
            return response()->json([
                'status'  => false,
                'message' => $e->getMessage(),
            ], 400);
        }
    }

    /**
     * Cập nhật thông tin quản lý (Chức vụ, Lương, Trạng thái làm việc...)
     */
    public function update(UpdateStaffByAdminRequest $request): JsonResponse
    {
        try {
            $staffId = (int) $request->query('id');
            if (!$staffId) {
                throw new Exception('Thiếu id nhân viên cần cập nhật!');
            }

            $data = [
                'positionId'     => $request->input('positionId'),
                'salaryPerShift' => $request->input('salaryPerShift'),
                'isWorking'      => $request->input('isWorking'),
                'fullName'       => $request->input('fullName'),
                'phone'          => $request->input('phone'),
                'citizenId'      => $request->input('citizenId'),
                'address'        => $request->input('address'),
                'avatar'         => $request->input('avatar'),
            ];

            $updatedStaff = $this->staffService->updateStaffByAdmin($staffId, array_filter($data, fn($val) => !is_null($val)));

            return response()->json([
                'status'  => true,
                'message' => 'Cập nhật thông tin nhân viên thành công!',
                'data'    => new StaffResource($updatedStaff),
            ], 200);
        } catch (Exception $e) {
            return response()->json([
                'status'  => false,
                'message' => $e->getMessage(),
            ], 400);
        }
    }

    /**
     * Đổi trạng thái làm việc (is_working & account status)
     */
    public function toggleWorkingStatus(Request $request): JsonResponse
    {
        try {
            $staffId = (int) $request->input('id');
            if (!$staffId) {
                throw new Exception('Thiếu id nhân viên!');
            }

            $result = $this->staffService->toggleWorkingStatus($staffId, $request->input('isWorking'));

            return response()->json([
                'status'  => true,
                'message' => $result['message'],
                'data'    => $result,
            ], 200);
        } catch (Exception $e) {
            return response()->json([
                'status'  => false,
                'message' => $e->getMessage(),
            ], 400);
        }
    }

    /**
     * Thống kê tổng quan nhân viên (Cho Dashboard Admin)
     */
    public function summaryStats(): JsonResponse
    {
        try {
            $stats = $this->staffService->getStaffSummaryStats();

            return response()->json([
                'status'  => true,
                'message' => 'Lấy thống kê nhân viên thành công!',
                'data'    => $stats,
            ], 200);
        } catch (Exception $e) {
            return response()->json([
                'status'  => false,
                'message' => $e->getMessage(),
            ], 400);
        }
    }

    /**
 * API Xem trước mã NV theo position_id
 */
public function previewCode(Request $request): JsonResponse
{
    try {
        $positionId = (int) $request->query('position_id');
        if (!$positionId) {
            return response()->json(['status' => false, 'message' => 'Chưa chọn chức vụ!'], 400);
        }

        $code = $this->staffService->previewStaffCode($positionId);

        return response()->json([
            'status' => true,
            'data'   => $code
        ], 200);
    } catch (Exception $e) {
        return response()->json(['status' => false, 'message' => $e->getMessage()], 400);
    }
}
}