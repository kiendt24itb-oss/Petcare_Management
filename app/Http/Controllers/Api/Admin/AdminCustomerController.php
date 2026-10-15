<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\CustomerResource;
use App\Http\Resources\PetResource;
use App\Services\CustomerService;
use App\Services\PetService;
use Exception;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminCustomerController extends Controller
{
    protected CustomerService $customerService;
    protected PetService $petService;

    public function __construct(CustomerService $customerService, PetService $petService)
    {
        $this->customerService = $customerService;
        $this->petService = $petService;
    }

    public function index(Request $request): JsonResponse
    {
        try {
            $filters = [
                'search' => $request->query('search'),
            ];
            $perPage = (int) $request->query('perPage', 100);

            $customers = $this->customerService->getAllCustomers($filters, $perPage);

            return response()->json([
                'status'  => true,
                'message' => 'Lấy danh sách khách hàng thành công!',
                'data'    => CustomerResource::collection($customers),
                'meta'    => [
                    'currentPage' => $customers->currentPage(),
                    'lastPage'    => $customers->lastPage(),
                    'total'       => $customers->total(),
                    'perPage'     => $customers->perPage(),
                ],
            ], 200);
        } catch (Exception $e) {
            return response()->json([
                'status'  => false,
                'message' => $e->getMessage(),
            ], 500);
        }
    }

    public function show(int $id): JsonResponse
    {
        try {
            $customer = $this->customerService->getCustomerById($id);

            return response()->json([
                'status'  => true,
                'message' => 'Lấy chi tiết thông tin khách hàng thành công!',
                'data'    => new CustomerResource($customer),
            ], 200);
        } catch (Exception $e) {
            return response()->json([
                'status'  => false,
                'message' => $e->getMessage(),
            ], 404);
        }
    }

    public function getCustomerPets(int $id): JsonResponse
    {
        try {
            $pets = $this->petService->getPetsByCustomerId($id);

            return response()->json([
                'status'  => true,
                'message' => 'Lấy danh sách thú cưng của khách hàng thành công!',
                'data'    => PetResource::collection($pets),
            ], 200);
        } catch (Exception $e) {
            return response()->json([
                'status'  => false,
                'message' => $e->getMessage(),
            ], 400);
        }
    }

    public function summaryStats(): JsonResponse
    {
        try {
            $stats = $this->customerService->getCustomerSummaryStats();

            return response()->json([
                'status'  => true,
                'message' => 'Lấy thống kê khách hàng thành công!',
                'data'    => $stats,
            ], 200);
        } catch (Exception $e) {
            return response()->json([
                'status'  => false,
                'message' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * 🔒 Thay đổi trạng thái tài khoản Khách hàng (Khóa / Mở khóa)
     */
    public function toggleAccountStatus(Request $request): JsonResponse
    {
        try {
            $request->validate([
                'customerId' => 'required|integer',
                'status'     => 'nullable|string|in:ACTIVE,LOCKED',
            ]);

            $customerId = (int) $request->input('customerId');
            $status = $request->input('status');

            $result = $this->customerService->changeAccountStatus($customerId, $status);

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
}