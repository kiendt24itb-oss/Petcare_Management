<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Staff extends Model
{
    protected $table = 'staffs';
    protected $primaryKey = 'staff_id';
    public $timestamps = false; // Dùng created_at & updated_at mặc định của DB SQL

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
    ];

    protected $casts = [
        'salary_per_shift' => 'float',
        'is_working'       => 'boolean',
    ];

    // Mối quan hệ ngược về Account
    public function account()
    {
        return $this->belongsTo(Account::class, 'account_id', 'account_id');
    }

    // Nối quan hệ tới bảng Chức vụ (Positions)
    public function position()
    {
        return $this->belongsTo(Position::class, 'position_id', 'position_id');
    }
}