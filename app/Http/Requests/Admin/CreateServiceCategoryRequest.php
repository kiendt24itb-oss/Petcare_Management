<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class CreateServiceCategoryRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'categoryName' => 'required|string|max:100|unique:service_categories,category_name',
            'description'  => 'nullable|string',
        ];
    }

    public function messages(): array
    {
        return [
            'categoryName.required' => 'Tên loại dịch vụ không được để trống!',
            'categoryName.max'      => 'Tên loại dịch vụ không được vượt quá 100 ký tự!',
            'categoryName.unique'   => 'Tên loại dịch vụ này đã tồn tại!',
        ];
    }
}