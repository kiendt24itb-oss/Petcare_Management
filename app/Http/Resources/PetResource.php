<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Carbon\Carbon;

class PetResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'petId'      => $this->pet_id,
            'petCode'    => $this->pet_code,
            'customerId' => $this->customer_id,
            'ownerName'  => $this->customer ? $this->customer->full_name : null,
            'petName'    => $this->pet_name,
            'species'    => $this->species,
            'breed'      => $this->breed,
            'age'        => $this->age,
            'weight'     => $this->weight,
            'gender'     => $this->gender,
            'avatar'     => $this->avatar,
            'healthNote' => $this->health_note,
            'createdAt'  => $this->created_at ? Carbon::parse($this->created_at)->format('Y-m-d H:i:s') : null,
        ];
    }
}