<?php

namespace App\Http\Controllers\Api\Customer;

use App\Http\Controllers\Controller;
use App\Http\Requests\Customer\CreatePetRequest;
use App\Http\Requests\Customer\UpdatePetRequest;
use App\Http\Resources\PetResource;
use App\Services\PetService;
use App\Traits\UploadImageTrait;
use Exception;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PetController extends Controller
{
    use UploadImageTrait;

    protected PetService $petService;

    public function __construct(PetService $petService)
    {
        $this->petService = $petService;
    }

    /**
     * Lấy danh sách thú cưng của chính khách hàng đang đăng nhập
     */
    public function index(Request $request): JsonResponse
    {
        try {
            $accountId = $request->user()->account_id;
            $pets = $this->petService->getPetsByAccountId($accountId);

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

    public function show(int $id): JsonResponse
    {
        try {
            $pet = $this->petService->getPetById($id);

            return response()->json([
                'status'  => true,
                'message' => 'Lấy thông tin thú cưng thành công!',
                'data'    => new PetResource($pet),
            ], 200);
        } catch (Exception $e) {
            return response()->json([
                'status'  => false,
                'message' => $e->getMessage(),
            ], 404);
        }
    }

    public function store(CreatePetRequest $request): JsonResponse
    {
        try {
            $accountId = $request->user()->account_id;
            $data = $request->validated();

            $pet = $this->petService->createPet($accountId, $data);

            return response()->json([
                'status'  => true,
                'message' => 'Thêm mới thú cưng thành công!',
                'data'    => new PetResource($pet),
            ], 201);
        } catch (Exception $e) {
            return response()->json([
                'status'  => false,
                'message' => $e->getMessage(),
            ], 400);
        }
    }

    public function update(UpdatePetRequest $request): JsonResponse
    {
        try {
            $accountId = $request->user()->account_id;
            $petId = $request->input('petId');
            $data = $request->validated();

            $pet = $this->petService->updatePet($accountId, $petId, $data);

            return response()->json([
                'status'  => true,
                'message' => 'Cập nhật thông tin thú cưng thành công!',
                'data'    => new PetResource($pet),
            ], 200);
        } catch (Exception $e) {
            return response()->json([
                'status'  => false,
                'message' => $e->getMessage(),
            ], 400);
        }
    }

    public function destroy(Request $request): JsonResponse
    {
        try {
            $accountId = $request->user()->account_id;
            $petId = $request->query('id');

            if (!$petId) {
                return response()->json([
                    'status'  => false,
                    'message' => 'Vui lòng cung cấp ID thú cưng cần xóa!',
                ], 400);
            }

            $this->petService->deletePet($accountId, (int)$petId);

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

    public function uploadAvatar(Request $request): JsonResponse
    {
        try {
            $avatarUrl = $this->uploadImageFile($request, 'image_file', 'pets', 5120);

            return response()->json([
                'status'  => true,
                'message' => 'Tải ảnh thú cưng thành công!',
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