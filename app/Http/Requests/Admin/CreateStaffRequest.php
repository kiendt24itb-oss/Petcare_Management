<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class CreateStaffRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        // TH2: Tạo trọn gói Account + Staff Profile
        if ($this->has('fullName')) {
            return [
                'username'       => 'required|string|max:100|unique:accounts,username',
                'password'       => 'required|string|min:6',
                'fullName'       => 'required|string|max:250',
                'email'          => 'required|email|max:250',
                'phone'          => 'nullable|string|max:15',
                'citizenId'      => 'nullable|string|max:20',
                'address'        => 'nullable|string|max:500',
                'avatar'         => 'nullable|string|max:500',
                'positionId'     => 'nullable|integer|exists:positions,position_id',
                'salaryPerShift' => 'nullable|numeric|min:0',
            ];
        }

        // TH1: Chỉ cấp tài khoản Nhân viên
        return [
            'username' => 'required|string|max:100|unique:accounts,username',
            'email'    => 'required|email|max:255|unique:accounts,email',
            'password' => 'required|string|min:6',
        ];
    }

    public function messages(): array
    {
        return [
            'username.required' => 'Tên đăng nhập không được để trống!',
            'username.unique'   => 'Tên đăng nhập đã tồn tại!',
            'email.required'    => 'Email không được để trống!',
            'email.unique'      => 'Email đã được sử dụng!',
            'password.required' => 'Mật khẩu không được để trống!',
            'password.min'      => 'Mật khẩu phải từ 6 ký tự trở lên!',
            'fullName.required' => 'Họ và tên nhân viên không được để trống!',
            'positionId.exists' => 'Chức vụ đã chọn không hợp lệ!',
            'salaryPerShift.min' => 'Mức lương ca không được nhỏ hơn 0!',
        ];
    }
}