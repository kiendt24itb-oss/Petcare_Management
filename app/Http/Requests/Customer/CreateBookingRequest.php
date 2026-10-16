<?php

namespace App\Http\Requests\Customer;

use Illuminate\Foundation\Http\FormRequest;

class CreateBookingRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'serviceId'   => 'required|integer|exists:services,service_id',
            'bookingDate' => 'required|date_format:Y-m-d|after_or_equal:today',
            'bookingTime' => 'required|date_format:H:i',
            'staffId'     => 'nullable|integer|exists:staffs,staff_id',
            'petIds'      => 'required|array|min:1',
            'petIds.*'    => 'required|integer|exists:pets,pet_id',
            'note'        => 'nullable|string|max:1000',
        ];
    }

    public function messages(): array
    {
        return [
            'serviceId.required'   => 'Vui lòng chọn dịch vụ!',
            'serviceId.exists'     => 'Dịch vụ được chọn không tồn tại!',
            'bookingDate.required' => 'Vui lòng chọn ngày hẹn!',
            'bookingDate.after_or_equal' => 'Ngày hẹn không được ở quá khứ!',
            'bookingTime.required' => 'Vui lòng chọn giờ hẹn!',
            'petIds.required'      => 'Vui lòng chọn ít nhất 1 thú cưng!',
            'petIds.min'           => 'Phải chọn ít nhất 1 thú cưng!',
            'petIds.*.exists'      => 'Thú cưng chọn không hợp lệ!',
        ];
    }
}