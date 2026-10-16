<?php

namespace App\Http\Controllers\Api\Staff;

use App\Http\Controllers\Controller;
use App\Http\Requests\Staff\UpdateStaffProfileRequest;
use App\Http\Resources\StaffResource;
use App\Services\StaffService;
use Exception;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class StaffProfileController extends Controller
{
    protected StaffService $staffService;

    public function __construct(StaffService $staffService)
    {
        $this->staffService = $staffService;
    }

    /**
     * Lấy hồ sơ thông tin cá nhân nhân viên đang đăng nhập
     */
    public function getProfile(): JsonResponse
    {
        try {
            $accountId = auth('api')->id();
            $staff = $this->staffService->getMyProfile($accountId);

            return response()->json([
                'status'  => true,
                'message' => 'Lấy hồ sơ cá nhân thành công!',
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
     * Nhân viên tự cập nhật thông tin cá nhân
     */
    public function updateProfile(UpdateStaffProfileRequest $request): JsonResponse
    {
        try {
            $accountId = auth('api')->id();
            $data = [
                'fullName'  => $request->input('fullName'),
                'phone'     => $request->input('phone'),
                'citizenId' => $request->input('citizenId'),
                'address'   => $request->input('address'),
                'avatar'    => $request->input('avatar'),
            ];

            $updatedStaff = $this->staffService->updateMyProfile($accountId, array_filter($data, fn($val) => !is_null($val)));

            return response()->json([
                'status'  => true,
                'message' => 'Cập nhật hồ sơ cá nhân thành công!',
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
     * Upload ảnh đại diện Nhân viên
     */
    public function uploadAvatar(Request $request): JsonResponse
    {
        try {
            $request->validate([
                'avatar_file' => 'required|image|mimes:jpeg,png,jpg,gif,webp|max:2048',
            ], [
                'avatar_file.required' => 'Vui lòng chọn tệp hình ảnh!',
                'avatar_file.image'    => 'Tệp tải lên phải là hình ảnh!',
                'avatar_file.mimes'    => 'Ảnh phải có định dạng: jpeg, png, jpg, gif, webp!',
                'avatar_file.max'      => 'Dung lượng ảnh tối đa là 2MB!',
            ]);

            if ($request->hasFile('avatar_file')) {
                $path = $request->file('avatar_file')->store('avatars/staffs', 'public');

                return response()->json([
                    'status'  => true,
                    'message' => 'Upload ảnh đại diện thành công!',
                    'data'    => 'storage/' . $path,
                ], 200);
            }

            return response()->json([
                'status'  => false,
                'message' => 'Không tìm thấy tệp ảnh!',
            ], 400);
        } catch (Exception $e) {
            return response()->json([
                'status'  => false,
                'message' => $e->getMessage(),
            ], 500);
        }
    }
}