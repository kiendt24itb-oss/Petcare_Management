<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Pet extends Model
{
    use HasFactory;

    protected $table = 'pets';
    protected $primaryKey = 'pet_id';
    public $timestamps = false;

    protected $fillable = [
        'pet_code',
        'customer_id',
        'pet_name',
        'species',
        'breed',
        'age',
        'weight',
        'gender',
        'avatar',
        'health_note',
    ];

    protected $casts = [
        'age' => 'integer',
        'weight' => 'float',
    ];

    public function customer(): BelongsTo
    {
        return $this->belongsTo(Customer::class, 'customer_id', 'customer_id');
    }
}