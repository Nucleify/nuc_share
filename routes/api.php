<?php

use App\Http\Controllers\ShareController;
use Illuminate\Support\Facades\Route;

Route::prefix('api')->group(function (): void {
    Route::middleware(['web', 'auth'])->group(function (): void {
        Route::post('/share', [ShareController::class, 'share'])
            ->name('share.share');
    });
});
