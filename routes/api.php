<?php

use App\Http\Controllers\ShareController;
use Illuminate\Support\Facades\Route;

Route::prefix('api')->group(function (): void {
    Route::middleware(['web', 'auth'])->group(function (): void {
        Route::prefix('share')->group(function (): void {
            Route::post('/', [ShareController::class, 'create']);
            Route::get('/received', [ShareController::class, 'received']);
            Route::get('/sent', [ShareController::class, 'sent']);
            Route::get('/count', [ShareController::class, 'count']);
            Route::post('/{id}/accept', [ShareController::class, 'accept']);
            Route::post('/{id}/reject', [ShareController::class, 'reject']);
            Route::post('/{id}/cancel', [ShareController::class, 'cancel']);
        });
    });
});
