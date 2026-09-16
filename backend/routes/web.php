<?php

use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return view('welcome');
});

Route::get('/login', [App\Http\Controllers\LoginController::class, 'index'])->name('login.index');

Route::post('/login', [App\Http\Controllers\LoginController::class, 'store'])->name('login.store');