<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class CreateRoomRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'roomName'   => 'required|string|max:100|unique:rooms,room_name',
            'roomTypeId' => 'required|integer|exists:room_types,room_type_id',
            'roomCode'   => 'nullable|string|max:20',
            'capacity'   => 'nullable|integer|min:1',
            'note'       => 'nullable|string',
        ];
    }

    public function messages(): array
    {
        return [
            'roomName.required'   => 'Tên phòng không được để trống!',
            'roomName.unique'     => 'Tên phòng này đã tồn tại!',
            'roomTypeId.required' => 'Vui lòng chọn loại phòng!',
            'roomTypeId.exists'   => 'Loại phòng đã chọn không hợp lệ!',
        ];
    }
}