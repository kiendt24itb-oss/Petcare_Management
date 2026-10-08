<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class UpdateStaffRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'staffId'        => 'required|integer|exists:staffs,staff_id',
            'fullName'       => 'sometimes|required|string|max:250',
            'email'          => 'nullable|email|max:250',
            'phone'          => 'nullable|string|max:15',
            'citizenId'      => 'nullable|string|max:20',
            'address'        => 'nullable|string|max:500',
            'avatar'         => 'nullable|string|max:500',
            'positionId'     => 'nullable|integer|exists:positions,position_id',
            'salaryPerShift' => 'sometimes|numeric|min:0',
            'isWorking'      => 'sometimes|boolean',
        ];
    }

    public function messages(): array
    {
        return [
            'staffId.required'  => 'ID nhân viên không được để trống!',
            'staffId.exists'    => 'Nhân viên không tồn tại!',
            'fullName.required' => 'Họ và tên không được để trống!',
            'positionId.exists' => 'Chức vụ không tồn tại!',
            'salaryPerShift.min' => 'Mức lương ca không được nhỏ hơn 0!',
        ];
    }
}