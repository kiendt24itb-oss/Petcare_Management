<?php

namespace App\Http\Requests\Staff;

use Illuminate\Foundation\Http\FormRequest;

class UpdateStaffProfileRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'fullName'  => 'required|string|max:250',
            'phone'     => 'required|string|max:15',
            'citizenId' => 'nullable|string|max:20',
            'address'   => 'nullable|string|max:500',
            'avatar'    => 'nullable|string|max:500',
        ];
    }

    public function messages(): array
    {
        return [
            'fullName.required' => 'Họ và tên không được để trống!',
            'phone.required'    => 'Số điện thoại không được để trống!',
        ];
    }
}