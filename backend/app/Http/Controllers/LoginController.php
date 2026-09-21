<?php

namespace App\Http\Controllers;

use App\Http\Requests\LoginRequest;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\View\View;

class LoginController extends Controller
{
    public function index(): View
    {
        return view('login.login');
    }

    public function store(LoginRequest $request): RedirectResponse
    {
        $validated = $request->validated();

        if (! Auth::attempt([
            'email' => $validated['email'],
            'password' => $validated['password'],
        ])) {
            return back()
                ->withErrors(['email' => 'Norādītais e-pasts vai parole nav pareiza.'])
                ->onlyInput('email', 'return_to');
        }

        $request->session()->regenerate();

        $fallbackUrl = ($validated['return_to'] ?? null) === 'studio'
            ? config('services.frontend.url')
            : route('home', absolute: false);

        return redirect()->intended($fallbackUrl);
    }
}
