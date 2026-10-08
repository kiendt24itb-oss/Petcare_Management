<?php

namespace App\Repositories\Contracts;

interface AccountRepositoryInterface
{
    public function createAccount(array $data);
    public function findByUsername(string $username);
}