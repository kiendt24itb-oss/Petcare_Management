<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Hash;

class HashPassword extends Command
{
    /**
     * Tên lệnh gọi trong Terminal
     */
    protected $signature = 'make:hash {password?}';

    /**
     * Mô tả câu lệnh
     */
    protected $description = 'Hash mật khẩu chuẩn Bcrypt cho Admin/Staff/Customer';

    /**
     * Thực thi câu lệnh
     */
    public function handle(): void
    {
        $password = $this->argument('password');

        // Nếu không truyền mật khẩu vào lệnh, CLI sẽ hỏi nhập trực tiếp
        if (!$password) {
            $password = $this->secret('Nhập mật khẩu bạn muốn Hash');
        }

        if (empty($password)) {
            $this->error('Mật khẩu không được để trống!');
            return;
        }

        // Thực hiện Hash bằng Hash::make (Bcrypt)
        $hashedPassword = Hash::make($password);

        $this->info("--------------------------------------------------");
        $this->info("Mật khẩu gốc: {$password}");
        $this->warn("Chuỗi Hash:   {$hashedPassword}");
        $this->info("--------------------------------------------------");
        $this->comment("👉 Copy chuỗi Hash màu vàng ở trên dán trực tiếp vào cột 'password' trong DB nhé!");
    }
}