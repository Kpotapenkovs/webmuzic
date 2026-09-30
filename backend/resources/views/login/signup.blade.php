<!DOCTYPE html>
<html lang="lv">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="theme-color" content="#111412">
    <title>Reģistrēties | WebMuzic</title>
    @vite('resources/css/signup.css')

</head>
<body>
    <main class="auth-shell">
        <aside class="brand-panel">
            <a class="brand" href="{{ url('/') }}">WEB<span>MUZIC</span></a>
            <div class="brand-copy"><span class="kicker">START MAKING MUSIC</span><h1>Idejas sākas ar vienu noti.</h1><p>Izveido kontu un sāc būvēt savu nākamo ritmu WebMuzic tiešsaistes studijā.</p></div>
            <div class="soundmark" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i></div>
        </aside>
        <section class="form-panel"><div class="form-content">
            <span class="kicker">WEBMUZIC / JAUNS KONTS</span><h2>Izveidot kontu</h2><p class="intro">Reģistrējies un saglabā savus muzikālos projektus.</p>
            <form method="POST" action="{{ route('signup.store') }}">
                @csrf
                <div class="field"><label for="username">Lietotājvārds</label><input id="username" type="text" name="username" value="{{ old('username') }}" placeholder="Tavs vārds studijā" autocomplete="username" required autofocus aria-describedby="username-error">@error('username')<p class="error" id="username-error">{{ $message }}</p>@enderror</div>
                <div class="field"><label for="email">E-pasts</label><input id="email" type="email" name="email" value="{{ old('email') }}" placeholder="vards@epasts.lv" autocomplete="email" required aria-describedby="email-error">@error('email')<p class="error" id="email-error">{{ $message }}</p>@enderror</div>
                <div class="field"><label for="password">Parole</label><input id="password" type="password" name="password" placeholder="Izveido paroli" autocomplete="new-password" required aria-describedby="password-error">@error('password')<p class="error" id="password-error">{{ $message }}</p>@enderror</div>
                <div class="field"><label for="password_confirmation">Apstipriniet paroli</label><input id="password_confirmation" type="password" name="password_confirmation" placeholder="Ievadi paroli vēlreiz" autocomplete="new-password" required></div>
                <button class="submit" type="submit">Izveidot kontu</button>
            </form>
            <p class="form-footer">Jau ir konts? <a href="{{ route('login.index') }}">Pieslēgties</a></p>
            <a class="back" href="{{ url('/') }}">← Atpakaļ uz studiju</a>
        </div></section>
    </main>
</body>
</html>
