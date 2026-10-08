<?php

namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use PHPOpenSourceSaver\JWTAuth\Contracts\JWTSubject;

class Account extends Authenticatable implements JWTSubject
{
    use Notifiable;

    protected $table = 'accounts';
    protected $primaryKey = 'account_id'; // Ánh xạ chính xác khóa chính trong DB
    public $timestamps = false; // DB dùng DATETIME DEFAULT CURRENT_TIMESTAMP

    protected $fillable = [
        'username',
        'email',
        'password',
        'role',
        'status',
    ];

    protected $hidden = [
        'password',
    ];

    // Mối quan hệ 1-1 tới bảng customers
    public function customer()
    {
        return $this->hasOne(Customer::class, 'account_id', 'account_id');
    }

    // Mối quan hệ 1-1 tới bảng staffs
    public function staff()
    {
        return $this->hasOne(Staff::class, 'account_id', 'account_id');
    }

    public function getJWTIdentifier()
    {
        return $this->getKey();
    }

    public function getJWTCustomClaims()
    {
        return [
            'role' => $this->role,
        ];
    }
}