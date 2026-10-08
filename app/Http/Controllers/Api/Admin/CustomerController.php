<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\CustomerResource;
use App\Services\CustomerService;
use Exception;
use Illuminate\Http\JsonResponse;

class CustomerController extends Controller
{
    protected CustomerService $customerService;

    public function __construct(CustomerService $customerService)
    {
        $this->customerService = $customerService;
    }

    /**
     * Admin xem danh sách toàn bộ khách hàng (Read-only)
     */
    public function index(): JsonResponse
    {
        $customers = $this->customerService->getAllCustomers();

        return response()->json([
            'status'  => true,
            'message' => 'Lấy danh sách khách hàng thành công!',
            'data'    => CustomerResource::collection($customers),
        ], 200);
    }

    /**
     * Admin xem chi tiết khách hàng & danh sách thú cưng của họ (Read-only)
     */
    public function show(int $id): JsonResponse
    {
        try {
            $customer = $this->customerService->getCustomerById($id);

            return response()->json([
                'status'  => true,
                'message' => 'Lấy thông tin chi tiết khách hàng thành công!',
                'data'    => new CustomerResource($customer),
            ], 200);
        } catch (Exception $e) {
            return response()->json([
                'status'  => false,
                'message' => $e->getMessage(),
            ], 404);
        }
    }
}