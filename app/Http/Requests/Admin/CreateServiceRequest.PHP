<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class CreateServiceRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'categoryId'         => 'required|integer|exists:service_categories,category_id',
            'serviceName'        => 'required|string|max:250',
            'requiredRoomTypeId' => 'required|integer|exists:room_types,room_type_id',
            'duration'           => 'required|integer|min:1',
            'price'              => 'required|numeric|min:0',
            'description'        => 'nullable|string',
            'imageUrl'           => 'nullable|string|max:500',
            'status'             => 'nullable|string|in:ACTIVE,INACTIVE,MAINTENANCE',
        ];
    }

    public function messages(): array
    {
        return [
            'categoryId.required'         => 'Vui lòng chọn loại dịch vụ!',
            'categoryId.exists'           => 'Loại dịch vụ không tồn tại!',
            'serviceName.required'        => 'Tên gói dịch vụ không được để trống!',
            'requiredRoomTypeId.required' => 'Vui lòng chọn loại phòng áp dụng!',
            'requiredRoomTypeId.exists'   => 'Loại phòng đã chọn không hợp lệ!',
            'duration.required'            => 'Vui lòng nhập thời lượng thực hiện!',
            'duration.min'                 => 'Thời lượng thực hiện phải lớn hơn 0 phút!',
            'price.required'               => 'Vui lòng nhập giá dịch vụ!',
            'price.min'                    => 'Giá dịch vụ không được nhỏ hơn 0!',
        ];
    }
}