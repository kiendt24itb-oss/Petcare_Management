<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class StoreStaffRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            // Thông tin tài khoản
            'username'       => 'required|string|max:100|unique:accounts,username',
            'email'          => 'required|email|max:255|unique:accounts,email',
            'password'       => 'required|string|min:6|max:255',
            
            // Lương & Chức vụ (Admin bắt buộc gán)
            'positionId'     => 'required|integer|exists:positions,position_id',
            'salaryPerShift' => 'required|numeric|min:0',

            // Thông tin cá nhân (Nullable cho Trường hợp 2 - NV tự bổ sung sau)
            'fullName'       => 'nullable|string|max:250',
            'phone'          => 'nullable|string|max:15',
            'citizenId'      => 'nullable|string|max:20',
            'address'        => 'nullable|string|max:500',
            'avatar'         => 'nullable|string|max:500',
        ];
    }

    public function messages(): array
    {
        return [
            'username.required'       => 'Tên đăng nhập không được để trống!',
            'username.unique'         => 'Tên đăng nhập đã tồn tại!',
            'email.required'          => 'Email không được để trống!',
            'email.email'             => 'Định dạng email không hợp lệ!',
            'email.unique'            => 'Email đã tồn tại trên hệ thống!',
            'password.required'       => 'Mật khẩu không được để trống!',
            'password.min'            => 'Mật khẩu phải chứa ít nhất 6 ký tự!',
            'positionId.required'     => 'Chức vụ không được để trống!',
            'positionId.exists'       => 'Chức vụ không tồn tại!',
            'salaryPerShift.required' => 'Mức lương theo ca không được để trống!',
            'salaryPerShift.numeric'  => 'Mức lương phải là chữ số!',
        ];
    }
}