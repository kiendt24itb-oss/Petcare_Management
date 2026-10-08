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
            'email'     => 'nullable|email|max:250',
            'phone'     => 'nullable|string|max:15',
            'citizenId' => 'nullable|string|max:20',
            'address'   => 'nullable|string|max:500',
            'avatar'    => 'nullable|string|max:500',
        ];
    }

    public function messages(): array
    {
        return [
            'fullName.required' => 'Họ và tên không được để trống!',
            'email.email'       => 'Email không đúng định dạng!',
        ];
    }
}