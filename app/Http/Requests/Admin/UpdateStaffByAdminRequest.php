<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class UpdateStaffByAdminRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $staffId = $this->route('id');

        return [
            'positionId'     => 'sometimes|required|integer|exists:positions,position_id',
            'salaryPerShift' => 'sometimes|required|numeric|min:0',
            'isWorking'      => 'sometimes|required|boolean',
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
            'positionId.exists'     => 'Chức vụ không tồn tại!',
            'salaryPerShift.numeric' => 'Mức lương phải là chữ số!',
            'isWorking.boolean'     => 'Trạng thái làm việc không hợp lệ!',
        ];
    }
}