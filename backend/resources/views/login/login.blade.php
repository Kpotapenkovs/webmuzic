<!DOCTYPE html>
<html lang="lv">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="theme-color" content="#111412">
    <title>Pieslēgties | WebMuzic</title>
    @vite('resources/css/login.css')

</head>
<body>
    <main class="auth-shell">
        <aside class="brand-panel">
            <a class="brand" href="{{ config('services.frontend.url') }}">WEB<span>MUZIC</span></a>
            <div class="brand-copy"><span class="kicker">YOUR IDEAS, IN RHYTHM</span><h1>Atgriezies savā studijā.</h1><p>Pieslēdzies un turpini veidot skaņas, ritmus un dziesmas savā WebMuzic studijā.</p></div>
            <div class="soundmark" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i></div>
        </aside>
        <section class="form-panel"><div class="form-content">
            <span class="kicker">WEBMUZIC / KONTĀ</span><h2>Pieslēgties</h2><p class="intro">Ievadi konta datus, lai atvērtu savu studiju.</p>
            <form method="POST" action="{{ route('login.store') }}">
                @csrf
                <input type="hidden" name="return_to" value="{{ old('return_to', request('return_to')) }}">
                <div class="field"><label for="email">E-pasts</label><input id="email" type="email" name="email" value="{{ old('email') }}" placeholder="vards@epasts.lv" autocomplete="email" required autofocus aria-describedby="email-error">@error('email')<p class="error" id="email-error">{{ $message }}</p>@enderror</div>
                <div class="field"><label for="password">Parole</label><input id="password" type="password" name="password" placeholder="Tava parole" autocomplete="current-password" required aria-describedby="password-error">@error('password')<p class="error" id="password-error">{{ $message }}</p>@enderror</div>
                <button class="submit" type="submit">Pieslēgties</button>
            </form>
            <p class="form-footer">Vēl nav konta? <a href="{{ route('signup.index') }}">Izveidot kontu</a></p>
            <a class="back" href="{{ config('services.frontend.url') }}">← Atpakaļ uz studiju</a>
        </div></section>
    </main>
</body>
</html>
