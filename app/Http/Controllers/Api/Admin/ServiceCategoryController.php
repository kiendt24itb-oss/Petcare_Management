<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\CreateServiceCategoryRequest;
use App\Http\Resources\ServiceCategoryResource;
use App\Services\ServiceCategoryService;
use Exception;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ServiceCategoryController extends Controller
{
    protected ServiceCategoryService $categoryService;

    public function __construct(ServiceCategoryService $categoryService)
    {
        $this->categoryService = $categoryService;
    }

    /**
     * Lấy danh sách loại dịch vụ
     */
    public function index(): JsonResponse
    {
        $categories = $this->categoryService->getAllCategories();
        
        return response()->json([
            'status'  => true,
            'message' => 'Lấy danh sách loại dịch vụ thành công!',
            'data'    => ServiceCategoryResource::collection($categories),
        ], 200);
    }

    /**
     * Thêm mới loại dịch vụ (Modal 1)
     */
    public function store(CreateServiceCategoryRequest $request): JsonResponse
    {
        try {
            $data = [
                'category_name' => $request->input('categoryName'),
                'description'   => $request->input('description'),
            ];

            $category = $this->categoryService->createCategory($data);

            return response()->json([
                'status'  => true,
                'message' => 'Tạo loại dịch vụ thành công!',
                'data'    => new ServiceCategoryResource($category),
            ], 201);
        } catch (Exception $e) {
            return response()->json([
                'status'  => false,
                'message' => $e->getMessage(),
            ], 400);
        }
    }

    /**
     * Xóa loại dịch vụ
     */
    public function destroy(Request $request): JsonResponse
    {
        try {
            $id = $request->query('id');
            if (!$id) {
                return response()->json([
                    'status'  => false,
                    'message' => 'Vui lòng cung cấp ID loại dịch vụ cần xóa!',
                ], 400);
            }

            $this->categoryService->deleteCategory((int)$id);

            return response()->json([
                'status'  => true,
                'message' => 'Đã xóa loại dịch vụ thành công!',
            ], 200);
        } catch (Exception $e) {
            return response()->json([
                'status'  => false,
                'message' => $e->getMessage(),
            ], 400);
        }
    }
}