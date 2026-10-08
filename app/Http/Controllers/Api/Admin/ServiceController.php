<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\CreateServiceRequest;
use App\Http\Requests\Admin\UpdateServiceRequest;
use App\Http\Resources\ServiceResource;
use App\Services\ServiceManagementService;
use App\Traits\UploadImageTrait; // Import Trait dùng chung
use Exception;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ServiceController extends Controller
{
    use UploadImageTrait; // Sử dụng Trait Upload Image

    protected ServiceManagementService $serviceManagement;

    public function __construct(ServiceManagementService $serviceManagement)
    {
        $this->serviceManagement = $serviceManagement;
    }

    /**
     * Lấy danh sách tất cả gói dịch vụ
     */
    public function index(): JsonResponse
    {
        $services = $this->serviceManagement->getAllServices();

        return response()->json([
            'status'  => true,
            'message' => 'Lấy danh sách dịch vụ thành công!',
            'data'    => ServiceResource::collection($services),
        ], 200);
    }

    /**
     * Lấy thông tin chi tiết 1 gói dịch vụ
     */
    public function show(int $id): JsonResponse
    {
        try {
            $service = $this->serviceManagement->getServiceById($id);

            return response()->json([
                'status'  => true,
                'message' => 'Lấy thông tin dịch vụ thành công!',
                'data'    => new ServiceResource($service),
            ], 200);
        } catch (Exception $e) {
            return response()->json([
                'status'  => false,
                'message' => $e->getMessage(),
            ], 404);
        }
    }

    /**
     * Thêm gói dịch vụ mới
     */
    public function store(CreateServiceRequest $request): JsonResponse
    {
        try {
            $data = $request->validated();
            $service = $this->serviceManagement->createService($data);

            return response()->json([
                'status'  => true,
                'message' => 'Tạo dịch vụ mới thành công!',
                'data'    => new ServiceResource($service),
            ], 201);
        } catch (Exception $e) {
            return response()->json([
                'status'  => false,
                'message' => $e->getMessage(),
            ], 400);
        }
    }

    /**
     * Cập nhật gói dịch vụ
     */
    public function update(UpdateServiceRequest $request): JsonResponse
    {
        try {
            $serviceId = $request->input('serviceId');
            $data = $request->validated();

            $this->serviceManagement->updateService($serviceId, $data);

            return response()->json([
                'status'  => true,
                'message' => 'Cập nhật dịch vụ thành công!',
            ], 200);
        } catch (Exception $e) {
            return response()->json([
                'status'  => false,
                'message' => $e->getMessage(),
            ], 400);
        }
    }

    /**
     * Xóa gói dịch vụ
     */
    public function destroy(Request $request): JsonResponse
    {
        try {
            $id = $request->query('id');
            if (!$id) {
                return response()->json([
                    'status'  => false,
                    'message' => 'Vui lòng cung cấp ID dịch vụ cần xóa!',
                ], 400);
            }

            $this->serviceManagement->deleteService((int)$id);

            return response()->json([
                'status'  => true,
                'message' => 'Đã xóa dịch vụ thành công!',
            ], 200);
        } catch (Exception $e) {
            return response()->json([
                'status'  => false,
                'message' => $e->getMessage(),
            ], 400);
        }
    }

    /**
     * API Upload ảnh đại diện dịch vụ (Tái sử dụng Trait)
     */
    public function uploadImage(Request $request): JsonResponse
    {
        try {
            // Upload vào folder 'services' với giới hạn 10MB
            $imageUrl = $this->uploadImageFile($request, 'image_file', 'services', 10240);

            return response()->json([
                'status'  => true,
                'message' => 'Tải ảnh lên thành công!',
                'data'    => $imageUrl,
            ], 200);
        } catch (Exception $e) {
            return response()->json([
                'status'  => false,
                'message' => $e->getMessage(),
            ], 400);
        }
    }
}