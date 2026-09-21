<!DOCTYPE html>
<html lang="lv">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Reģistrēties</title>
</head>
<body>
    <h1>Reģistrēties</h1>

    <form method="POST" action="{{ route('signup.store') }}">
        @csrf

        <div>
            <label for="username">Lietotājvārds</label>
            <input id="username" type="text" name="username" value="{{ old('username') }}" autocomplete="username" required autofocus>
            @error('username')
                <p>{{ $message }}</p>
            @enderror
        </div>

        <div>
            <label for="email">E-pasts</label>
            <input id="email" type="email" name="email" value="{{ old('email') }}" autocomplete="email" required>
            @error('email')
                <p>{{ $message }}</p>
            @enderror
        </div>

        <div>
            <label for="password">Parole</label>
            <input id="password" type="password" name="password" autocomplete="new-password" required>
            @error('password')
                <p>{{ $message }}</p>
            @enderror
        </div>

        <div>
            <label for="password_confirmation">Apstipriniet paroli</label>
            <input id="password_confirmation" type="password" name="password_confirmation" autocomplete="new-password" required>
        </div>

        <button type="submit">Reģistrēties</button>
    </form>

    <p>Jau ir konts? <a href="{{ route('login.index') }}">Pieslēgties</a></p>
</body>
</html>
