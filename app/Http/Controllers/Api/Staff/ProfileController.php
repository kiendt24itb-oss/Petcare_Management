<?php

namespace App\Http\Controllers\Api\Staff;

use App\Http\Controllers\Controller;
use App\Http\Requests\Staff\UpdateStaffProfileRequest;
use App\Http\Resources\StaffResource;
use App\Services\StaffService;
use App\Traits\UploadImageTrait;
use Exception;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ProfileController extends Controller
{
    use UploadImageTrait;

    protected StaffService $staffService;

    public function __construct(StaffService $staffService)
    {
        $this->staffService = $staffService;
    }

    /**
     * Nhân viên tự xem thông tin cá nhân của mình
     */
    public function show(Request $request): JsonResponse
    {
        try {
            $accountId = $request->user()->account_id;
            $staff = $this->staffService->getStaffByAccountId($accountId);

            return response()->json([
                'status'  => true,
                'message' => 'Lấy thông tin hồ sơ cá nhân thành công!',
                'data'    => $staff ? new StaffResource($staff) : null,
            ], 200);
        } catch (Exception $e) {
            return response()->json([
                'status'  => false,
                'message' => $e->getMessage(),
            ], 400);
        }
    }

    /**
     * Nhân viên tự điền / cập nhật thông tin cá nhân (TH1 & TH2)
     */
    public function update(UpdateStaffProfileRequest $request): JsonResponse
    {
        try {
            $accountId = $request->user()->account_id;
            $data = $request->validated();

            $staff = $this->staffService->updateSelfProfile($accountId, $data);

            return response()->json([
                'status'  => true,
                'message' => 'Cập nhật hồ sơ cá nhân thành công!',
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
     * Upload Avatar cho Nhân viên
     */
    public function uploadAvatar(Request $request): JsonResponse
    {
        try {
            $avatarUrl = $this->uploadImageFile($request, 'image_file', 'staffs/avatars', 5120);

            return response()->json([
                'status'  => true,
                'message' => 'Tải ảnh đại diện lên thành công!',
                'data'    => $avatarUrl,
            ], 200);
        } catch (Exception $e) {
            return response()->json([
                'status'  => false,
                'message' => $e->getMessage(),
            ], 400);
        }
    }
}