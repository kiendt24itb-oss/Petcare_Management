<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Position extends Model
{
    use HasFactory;

    protected $table = 'positions';
    protected $primaryKey = 'position_id';

    public $timestamps = false; // DB tự quản lý created_at và updated_at

    protected $fillable = [
        'position_code',
        'position_name',
        'description',
        'allowance',
        'created_at',
        'updated_at',
    ];

    protected $casts = [
        'allowance' => 'decimal:2',
    ];

    /**
     * Mối quan hệ 1-N: 1 Chức vụ có nhiều Nhân viên
     */
    public function staffs(): HasMany
    {
        return $this->hasMany(Staff::class, 'position_id', 'position_id');
    }
}