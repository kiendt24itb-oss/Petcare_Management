<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Position extends Model
{
    protected $table = 'positions';
    protected $primaryKey = 'position_id';
    public $timestamps = true;
    const CREATED_AT = 'created_at';
    const UPDATED_AT = 'updated_at';

    protected $fillable = [
        'position_code',
        'position_name',
        'description',
        'allowance',
    ];

    protected $casts = [
        'allowance' => 'float',
    ];

    public function staffs(): HasMany
    {
        return $this->hasMany(Staff::class, 'position_id', 'position_id');
    }
}