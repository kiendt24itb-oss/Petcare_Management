<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class CreateRoomTypeRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'categoryId'  => 'required|integer|exists:service_categories,category_id',
            'typeName'    => 'required|string|max:100',
            'description' => 'nullable|string',
        ];
    }

    public function messages(): array
    {
        return [
            'categoryId.required' => 'Vui lòng chọn loại hình dịch vụ!',
            'categoryId.exists'   => 'Loại hình dịch vụ không tồn tại!',
            'typeName.required'   => 'Tên loại phòng không được để trống!',
            'typeName.max'        => 'Tên loại phòng không vượt quá 100 ký tự!',
        ];
    }
}