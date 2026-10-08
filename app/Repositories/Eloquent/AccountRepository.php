<?php

namespace App\Repositories\Eloquent;

use App\Models\Account;
use App\Repositories\Contracts\AccountRepositoryInterface;

class AccountRepository implements AccountRepositoryInterface
{
    public function createAccount(array $data)
    {
        return Account::create($data);
    }

    public function findByUsername(string $username)
    {
        return Account::where('username', $username)->first();
    }
}