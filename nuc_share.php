<?php

namespace Modules\nuc_share;

use Illuminate\Support\ServiceProvider;

class nuc_share extends ServiceProvider
{
    public function boot(): void
    {
        $this->loadRoutesFrom(__DIR__ . '/routes/api.php');
    }
}
