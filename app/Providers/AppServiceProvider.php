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

// Customer Repository
use App\Repositories\Contracts\CustomerRepositoryInterface;
use App\Repositories\Eloquent\CustomerRepository;

// Pet Repository
use App\Repositories\Contracts\PetRepositoryInterface;
use App\Repositories\Eloquent\PetRepository;

// Staff Repository
use App\Repositories\Contracts\StaffRepositoryInterface;
use App\Repositories\Eloquent\StaffRepository;

// Position Repository (🟢 BỔ SUNG)
use App\Repositories\Contracts\PositionRepositoryInterface;
use App\Repositories\Eloquent\PositionRepository;

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

        // Bind Customer Repository
        $this->app->bind(
            CustomerRepositoryInterface::class,
            CustomerRepository::class
        );

        // Bind Pet Repository
        $this->app->bind(
            PetRepositoryInterface::class,
            PetRepository::class
        );

        // Bind Staff Repository
        $this->app->bind(
            StaffRepositoryInterface::class,
            StaffRepository::class
        );

        // Bind Position Repository (🟢 BỔ SUNG)
        $this->app->bind(
            PositionRepositoryInterface::class,
            PositionRepository::class
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