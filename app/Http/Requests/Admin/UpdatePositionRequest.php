<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class UpdatePositionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'positionId'   => 'required|integer|exists:positions,position_id',
            'positionName' => 'sometimes|required|string|max:100',
            'description'  => 'nullable|string',
            'allowance'    => 'sometimes|nullable|numeric|min:0',
        ];
    }

    public function messages(): array
    {
        return [
            'positionId.required'   => 'ID chức vụ không được để trống!',
            'positionId.exists'     => 'Chức vụ không tồn tại!',
            'positionName.required' => 'Tên chức vụ không được để trống!',
            'allowance.min'         => 'Phụ cấp không được nhỏ hơn 0!',
        ];
    }
}