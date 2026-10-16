<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class StaffShiftAssignmentResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'assignmentId' => $this->assignment_id,
            'staffId'      => $this->staff_id,
            'staffCode'    => $this->staff->staff_code ?? null,
            'staffName'    => $this->staff->full_name ?? null,
            'positionName' => $this->staff->position->position_name ?? null,
            'shiftId'      => $this->shift_id,
            'shiftName'    => $this->shift->shift_name ?? null,
            'startTime'    => $this->shift->start_time ?? null,
            'endTime'      => $this->shift->end_time ?? null,
            'workDate'     => $this->work_date ? $this->work_date->format('Y-m-d') : null,
        ];
    }
}