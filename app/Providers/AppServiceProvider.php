<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;

// Account Repository
use App\Repositories\Contracts\AccountRepositoryInterface;
use App\Repositories\Eloquent\AccountRepository;

// Service Category Repository (Tầng 1)
use App\Repositories\Contracts\ServiceCategoryRepositoryInterface;
use App\Repositories\Eloquent\ServiceCategoryRepository;

// Room Type Repository (Tầng 2)
use App\Repositories\Contracts\RoomTypeRepositoryInterface;
use App\Repositories\Eloquent\RoomTypeRepository;

// Room Repository (Tầng 3)
use App\Repositories\Contracts\RoomRepositoryInterface;
use App\Repositories\Eloquent\RoomRepository;

// Service Repository
use App\Repositories\Contracts\ServiceRepositoryInterface;
use App\Repositories\Eloquent\ServiceRepository;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        // Bind Account Repository
        $this->app->bind(
            AccountRepositoryInterface::class,
            AccountRepository::class
        );

        // Bind Service Category Repository (Tầng 1)
        $this->app->bind(
            ServiceCategoryRepositoryInterface::class,
            ServiceCategoryRepository::class
        );

        // Bind Room Type Repository (Tầng 2)
        $this->app->bind(
            RoomTypeRepositoryInterface::class,
            RoomTypeRepository::class
        );

        // Bind Room Repository (Tầng 3)
        $this->app->bind(
            RoomRepositoryInterface::class,
            RoomRepository::class
        );

        // Bind Service Repository
        $this->app->bind(
            ServiceRepositoryInterface::class,
            ServiceRepository::class
        );
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        date_default_timezone_set('Asia/Ho_Chi_Minh');
    }
}