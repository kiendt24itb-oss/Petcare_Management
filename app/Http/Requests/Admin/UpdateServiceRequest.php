<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class UpdateServiceRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'serviceId'          => 'required|integer|exists:services,service_id',
            'categoryId'         => 'sometimes|required|integer|exists:service_categories,category_id',
            'serviceName'        => 'sometimes|required|string|max:250',
            'requiredRoomTypeId' => 'sometimes|required|integer|exists:room_types,room_type_id',
            'duration'           => 'sometimes|required|integer|min:1',
            'price'              => 'sometimes|required|numeric|min:0',
            'description'        => 'nullable|string',
            'imageUrl'           => 'nullable|string|max:500',
            'status'             => 'nullable|string|in:ACTIVE,INACTIVE,MAINTENANCE',
        ];
    }

    public function messages(): array
    {
        return [
            'serviceId.required'        => 'ID dịch vụ không được để trống!',
            'serviceId.exists'          => 'Dịch vụ không tồn tại!',
            'categoryId.exists'         => 'Loại dịch vụ không tồn tại!',
            'serviceName.required'      => 'Tên gói dịch vụ không được để trống!',
            'requiredRoomTypeId.exists' => 'Loại phòng đã chọn không hợp lệ!',
            'duration.min'               => 'Thời lượng thực hiện phải lớn hơn 0 phút!',
            'price.min'                  => 'Giá dịch vụ không được nhỏ hơn 0!',
        ];
    }
}