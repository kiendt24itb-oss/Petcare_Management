<?php

namespace App\Http\Controllers\Api\Customer;

use App\Http\Controllers\Controller;
use App\Http\Requests\Customer\CreatePetRequest;
use App\Http\Requests\Customer\UpdateCustomerProfileRequest;
use App\Http\Requests\Customer\UpdatePetRequest;
use App\Http\Resources\CustomerResource;
use App\Http\Resources\PetResource;
use App\Services\CustomerService;
use App\Services\PetService;
use Exception;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CustomerProfileController extends Controller
{
    protected CustomerService $customerService;
    protected PetService $petService;

    public function __construct(CustomerService $customerService, PetService $petService)
    {
        $this->customerService = $customerService;
        $this->petService = $petService;
    }

    // =========================================================================
    // KHU VỰC THÔNG TIN CÁ NHÂN (CUSTOMER PROFILE)
    // =========================================================================

    /**
     * Lấy thông tin cá nhân của khách hàng đang đăng nhập
     */
    public function getProfile(): JsonResponse
    {
        try {
            $accountId = auth('api')->id();
            $customer = $this->customerService->getMyProfile($accountId);

            return response()->json([
                'status'  => true,
                'message' => 'Lấy thông tin cá nhân thành công!',
                'data'    => new CustomerResource($customer),
            ], 200);
        } catch (Exception $e) {
            return response()->json([
                'status'  => false,
                'message' => $e->getMessage(),
            ], 400);
        }
    }

    /**
     * Cập nhật thông tin cá nhân
     */
    public function updateProfile(UpdateCustomerProfileRequest $request): JsonResponse
    {
        try {
            $accountId = auth('api')->id();
            $data = [
                'full_name' => $request->input('fullName'),
                'age'       => $request->input('age'),
                'gender'    => $request->input('gender'),
                'email'     => $request->input('email'),
                'phone'     => $request->input('phone'),
                'address'   => $request->input('address'),
                'avatar'    => $request->input('avatar'),
            ];

            $this->customerService->updateMyProfile($accountId, array_filter($data, fn($value) => !is_null($value)));

            return response()->json([
                'status'  => true,
                'message' => 'Cập nhật thông tin cá nhân thành công!',
            ], 200);
        } catch (Exception $e) {
            return response()->json([
                'status'  => false,
                'message' => $e->getMessage(),
            ], 400);
        }
    }

    /**
     * Upload ảnh đại diện cho Customer
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
                $path = $request->file('avatar_file')->store('avatars/customers', 'public');

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

    // =========================================================================
    // KHU VỰC QUẢN LÝ THÚ CƯNG (PET MANAGEMENT)
    // =========================================================================

    /**
     * Lấy danh sách thú cưng của khách hàng đang đăng nhập
     */
    public function getMyPets(): JsonResponse
    {
        try {
            $accountId = auth('api')->id();
            $pets = $this->petService->getMyPets($accountId);

            return response()->json([
                'status'  => true,
                'message' => 'Lấy danh sách thú cưng thành công!',
                'data'    => PetResource::collection($pets),
            ], 200);
        } catch (Exception $e) {
            return response()->json([
                'status'  => false,
                'message' => $e->getMessage(),
            ], 400);
        }
    }

    /**
     * Xem chi tiết 1 thú cưng
     */
    public function getPetDetail(int $petId): JsonResponse
    {
        try {
            $accountId = auth('api')->id();
            $pet = $this->petService->getMyPetDetail($petId, $accountId);

            return response()->json([
                'status'  => true,
                'message' => 'Lấy thông tin thú cưng thành công!',
                'data'    => new PetResource($pet),
            ], 200);
        } catch (Exception $e) {
            return response()->json([
                'status'  => false,
                'message' => $e->getMessage(),
            ], 400);
        }
    }

    /**
     * Thêm thú cưng mới
     */
    public function addPet(CreatePetRequest $request): JsonResponse
    {
        try {
            $accountId = auth('api')->id();
            $data = [
                'pet_name'    => $request->input('petName'),
                'species'     => $request->input('species'),
                'breed'       => $request->input('breed'),
                'age'         => $request->input('age'),
                'weight'      => $request->input('weight'),
                'gender'      => $request->input('gender'),
                'avatar'      => $request->input('avatar'),
                'health_note' => $request->input('healthNote'),
            ];

            $pet = $this->petService->createPet($accountId, $data);

            return response()->json([
                'status'  => true,
                'message' => 'Thêm thú cưng mới thành công!',
                'data'    => new PetResource($pet),
            ], 201);
        } catch (Exception $e) {
            return response()->json([
                'status'  => false,
                'message' => $e->getMessage(),
            ], 400);
        }
    }

    /**
     * Cập nhật thông tin thú cưng
     */
    public function updatePet(UpdatePetRequest $request, int $petId): JsonResponse
    {
        try {
            $accountId = auth('api')->id();
            $data = [
                'pet_name'    => $request->input('petName'),
                'species'     => $request->input('species'),
                'breed'       => $request->input('breed'),
                'age'         => $request->input('age'),
                'weight'      => $request->input('weight'),
                'gender'      => $request->input('gender'),
                'avatar'      => $request->input('avatar'),
                'health_note' => $request->input('healthNote'),
            ];

            $this->petService->updatePet($petId, $accountId, array_filter($data, fn($value) => !is_null($value)));

            return response()->json([
                'status'  => true,
                'message' => 'Cập nhật thông tin thú cưng thành công!',
            ], 200);
        } catch (Exception $e) {
            return response()->json([
                'status'  => false,
                'message' => $e->getMessage(),
            ], 400);
        }
    }

    /**
     * Xóa thú cưng
     */
    public function deletePet(int $petId): JsonResponse
    {
        try {
            $accountId = auth('api')->id();
            $this->petService->deletePet($petId, $accountId);

            return response()->json([
                'status'  => true,
                'message' => 'Đã xóa thú cưng thành công!',
            ], 200);
        } catch (Exception $e) {
            return response()->json([
                'status'  => false,
                'message' => $e->getMessage(),
            ], 400);
        }
    }

    /**
     * Upload ảnh cho thú cưng
     */
    public function uploadPetAvatar(Request $request): JsonResponse
    {
        try {
            $request->validate([
                'avatar_file' => 'required|image|mimes:jpeg,png,jpg,gif,webp|max:2048',
            ], [
                'avatar_file.required' => 'Vui lòng chọn tệp hình ảnh cho thú cưng!',
                'avatar_file.image'    => 'Tệp tải lên phải là hình ảnh!',
                'avatar_file.mimes'    => 'Ảnh phải có định dạng: jpeg, png, jpg, gif, webp!',
                'avatar_file.max'      => 'Dung lượng ảnh tối đa là 2MB!',
            ]);

            if ($request->hasFile('avatar_file')) {
                $path = $request->file('avatar_file')->store('avatars/pets', 'public');

                return response()->json([
                    'status'  => true,
                    'message' => 'Upload ảnh thú cưng thành công!',
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