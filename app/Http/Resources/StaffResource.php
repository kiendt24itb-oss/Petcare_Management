<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Carbon\Carbon;

class StaffResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'staffId'        => $this->staff_id,
            'staffCode'      => $this->staff_code,
            'accountId'      => $this->account_id,
            'positionId'     => $this->position_id,
            'positionName'   => $this->position ? $this->position->position_name : null,
            'fullName'       => $this->full_name,
            'email'          => $this->email,
            'phone'          => $this->phone,
            'citizenId'      => $this->citizen_id,
            'address'        => $this->address,
            'avatar'         => $this->avatar,
            'salaryPerShift' => (float) $this->salary_per_shift,
            'isWorking'      => (bool) $this->is_working,
            'createdAt'      => $this->created_at ? Carbon::parse($this->created_at)->format('Y-m-d H:i:s') : null,
            'updatedAt'      => $this->updated_at ? Carbon::parse($this->updated_at)->format('Y-m-d H:i:s') : null,
            'position'       => new PositionResource($this->whenLoaded('position')),
            'account'        => $this->whenLoaded('account', function () {
                return [
                    'accountId' => $this->account->account_id,
                    'username'  => $this->account->username,
                    'email'     => $this->account->email,
                    'status'    => $this->account->status,
                ];
            }),
        ];
    }
}