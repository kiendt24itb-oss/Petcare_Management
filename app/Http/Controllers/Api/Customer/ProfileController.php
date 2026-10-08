<?php

namespace App\Http\Controllers\Api\Customer;

use App\Http\Controllers\Controller;
use App\Http\Requests\Customer\UpdateCustomerProfileRequest;
use App\Http\Resources\CustomerResource;
use App\Services\CustomerService;
use App\Traits\UploadImageTrait;
use Exception;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ProfileController extends Controller
{
    use UploadImageTrait;

    protected CustomerService $customerService;

    public function __construct(CustomerService $customerService)
    {
        $this->customerService = $customerService;
    }

    public function show(Request $request): JsonResponse
    {
        try {
            $accountId = $request->user()->account_id;
            $customer = $this->customerService->getCustomerByAccountId($accountId);

            return response()->json([
                'status'  => true,
                'message' => 'Lấy thông tin cá nhân thành công!',
                'data'    => $customer ? new CustomerResource($customer) : null,
            ], 200);
        } catch (Exception $e) {
            return response()->json([
                'status'  => false,
                'message' => $e->getMessage(),
            ], 400);
        }
    }

    public function update(UpdateCustomerProfileRequest $request): JsonResponse
    {
        try {
            $accountId = $request->user()->account_id;
            $data = $request->validated();

            $customer = $this->customerService->updateSelfProfile($accountId, $data);

            return response()->json([
                'status'  => true,
                'message' => 'Cập nhật thông tin cá nhân thành công!',
                'data'    => new CustomerResource($customer),
            ], 200);
        } catch (Exception $e) {
            return response()->json([
                'status'  => false,
                'message' => $e->getMessage(),
            ], 400);
        }
    }

    public function uploadAvatar(Request $request): JsonResponse
    {
        try {
            $avatarUrl = $this->uploadImageFile($request, 'image_file', 'customers/avatars', 5120);

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