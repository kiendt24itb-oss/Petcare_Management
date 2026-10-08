<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Carbon\Carbon;

class CustomerResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'customerId'     => $this->customer_id,
            'customerCode'   => $this->customer_code,
            'accountId'      => $this->account_id,
            'fullName'       => $this->full_name,
            'age'            => $this->age,
            'gender'         => $this->gender,
            'email'          => $this->email,
            'phone'          => $this->phone,
            'address'        => $this->address,
            'avatar'         => $this->avatar,
            'violationCount' => $this->violation_count,
            'createdAt'      => $this->created_at ? Carbon::parse($this->created_at)->format('Y-m-d H:i:s') : null,
            'pets'           => PetResource::collection($this->whenLoaded('pets')),
            'account'        => $this->whenLoaded('account', function () {
                return [
                    'accountId' => $this->account->account_id,
                    'username'  => $this->account->username,
                    'status'    => $this->account->status,
                ];
            }),
        ];
    }
}