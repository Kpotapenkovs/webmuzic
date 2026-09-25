<?php

use App\Http\Controllers\LoginController;
use App\Http\Controllers\ProjectController;
use App\Http\Controllers\SessionController;
use App\Http\Controllers\SignupController;
use Illuminate\Support\Facades\Route;

Route::get('/session/csrf-token', [SessionController::class, 'csrfToken'])->name('session.csrf-token');
Route::get('/publications', [ProjectController::class, 'publications'])->name('publications.index');
Route::get('/publications/{project}', [ProjectController::class, 'publication'])->name('publications.show');
Route::get('/publications/{project}/data', [ProjectController::class, 'publicData'])->name('publications.data');
Route::get('/publications/{project}/comments', [ProjectController::class, 'comments'])->name('publications.comments');

Route::middleware('auth')->group(function (): void {
    Route::get('/', [ProjectController::class, 'index'])->name('home');
    Route::get('/projects/{project}', [ProjectController::class, 'show'])->name('projects.show');
    Route::post('/projects', [ProjectController::class, 'store'])->name('projects.store');
    Route::put('/projects/{project}', [ProjectController::class, 'update'])->name('projects.update');
    Route::post('/projects/{project}/publish', [ProjectController::class, 'publish'])->name('projects.publish');
    Route::post('/publications/{project}/comments', [ProjectController::class, 'storeComment'])->name('publications.comments.store');
    Route::get('/session/user', [SessionController::class, 'show'])->name('session.user');
    Route::post('/session/logout', [SessionController::class, 'destroy'])->name('session.logout');
});

Route::middleware('guest')->group(function (): void {
    Route::get('/login', [LoginController::class, 'index'])->name('login.index');
    Route::post('/login', [LoginController::class, 'store'])
        ->middleware('throttle:6,1')
        ->name('login.store');

    Route::get('/signup', [SignupController::class, 'index'])->name('signup.index');
    Route::post('/signup', [SignupController::class, 'store'])->name('signup.store');
});
