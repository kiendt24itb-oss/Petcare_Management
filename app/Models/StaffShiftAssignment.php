<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class StaffShiftAssignment extends Model
{
    use HasFactory;

    protected $table = 'staff_shift_assignments';
    protected $primaryKey = 'assignment_id';

    protected $fillable = [
        'staff_id',
        'shift_id',
        'work_date',
    ];

    protected $casts = [
        'work_date' => 'date:Y-m-d',
    ];

    public function staff(): BelongsTo
    {
        return $this->belongsTo(Staff::class, 'staff_id', 'staff_id');
    }

    public function shift(): BelongsTo
    {
        return $this->belongsTo(WorkShift::class, 'shift_id', 'shift_id');
    }
}