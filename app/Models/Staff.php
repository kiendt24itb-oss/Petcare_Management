<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Staff extends Model
{
    use HasFactory;

    protected $table = 'staffs';
    protected $primaryKey = 'staff_id';

    public $timestamps = false; // DB tự quản lý created_at và updated_at

    protected $fillable = [
        'staff_code',
        'account_id',
        'position_id',
        'full_name',
        'email',
        'phone',
        'citizen_id',
        'address',
        'avatar',
        'salary_per_shift',
        'is_working',
        'created_at',
        'updated_at',
    ];

    protected $casts = [
        'salary_per_shift' => 'decimal:2',
        'is_working' => 'boolean',
    ];

    /**
     * Mối quan hệ N-1: Staff thuộc về 1 Account (có thể null ở TH chưa gán account)
     */
    public function account(): BelongsTo
    {
        return $this->belongsTo(Account::class, 'account_id', 'account_id');
    }

    /**
     * Mối quan hệ N-1: Staff thuộc về 1 Position (Chức vụ)
     */
    public function position(): BelongsTo
    {
        return $this->belongsTo(Position::class, 'position_id', 'position_id');
    }

    /**
     * Mối quan hệ 1-N: Phân ca làm việc của nhân viên
     */
    public function shiftAssignments(): HasMany
    {
        return $this->hasMany(StaffShiftAssignment::class, 'staff_id', 'staff_id');
    }

    /**
     * Mối quan hệ 1-N: Lịch sử chấm công
     */
    public function timekeepings(): HasMany
    {
        return $this->hasMany(Timekeeping::class, 'staff_id', 'staff_id');
    }

    /**
     * Mối quan hệ 1-N: Bảng lương hàng tháng
     */
    public function salaries(): HasMany
    {
        return $this->hasMany(Salary::class, 'staff_id', 'staff_id');
    }
}