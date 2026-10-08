<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\CreateStaffRequest;
use App\Http\Requests\Admin\UpdateStaffRequest;
use App\Http\Resources\StaffResource;
use App\Services\StaffService;
use App\Traits\UploadImageTrait;
use Exception;
use Illuminate\Http\JsonResponse;

class StaffController extends Controller
{
    use UploadImageTrait;

    protected StaffService $staffService;

    public function __construct(StaffService $staffService)
    {
        $this->staffService = $staffService;
    }

    public function index(): JsonResponse
    {
        $staffs = $this->staffService->getAllStaffs();

        return response()->json([
            'status'  => true,
            'message' => 'Lấy danh sách nhân viên thành công!',
            'data'    => StaffResource::collection($staffs),
        ], 200);
    }

    public function show(int $id): JsonResponse
    {
        try {
            $staff = $this->staffService->getStaffById($id);

            return response()->json([
                'status'  => true,
                'message' => 'Lấy thông tin nhân viên thành công!',
                'data'    => new StaffResource($staff),
            ], 200);
        } catch (Exception $e) {
            return response()->json([
                'status'  => false,
                'message' => $e->getMessage(),
            ], 404);
        }
    }

    /**
     * Tạo nhân viên (Hỗ trợ TH1: Cấp TK trống & TH2: Tạo trọn gói Account + Staff)
     */
    public function store(CreateStaffRequest $request): JsonResponse
    {
        try {
            $data = $request->validated();

            if ($request->has('fullName')) {
                // TH2: Tạo trọn gói
                $staff = $this->staffService->createStaffFull($data);
                return response()->json([
                    'status'  => true,
                    'message' => 'Tạo nhân viên trọn gói thành công!',
                    'data'    => new StaffResource($staff),
                ], 201);
            }

            // TH1: Cấp tài khoản trước
            $account = $this->staffService->createStaffAccountOnly($data);
            return response()->json([
                'status'  => true,
                'message' => 'Cấp tài khoản nhân viên thành công. Nhân viên sẽ tự đăng nhập cập nhật thông tin!',
                'data'    => $account,
            ], 201);
        } catch (Exception $e) {
            return response()->json([
                'status'  => false,
                'message' => $e->getMessage(),
            ], 400);
        }
    }

    /**
     * Admin cập nhật nhân viên (Cho phép sửa cả Chức vụ & Lương ca)
     */
    public function update(UpdateStaffRequest $request): JsonResponse
    {
        try {
            $staffId = $request->input('staffId');
            $data = $request->validated();

            $updatedStaff = $this->staffService->updateStaffByAdmin($staffId, $data);

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
}