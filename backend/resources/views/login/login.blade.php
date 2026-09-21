<!DOCTYPE html>
<html lang="lv">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Pieslēgties</title>
</head>
<body>
    <h1>Pieslēgties</h1>

    <form method="POST" action="{{ route('login.store') }}">
        @csrf
        <input type="hidden" name="return_to" value="{{ old('return_to', request('return_to')) }}">

        <div>
            <label for="email">E-pasts</label>
            <input id="email" type="email" name="email" value="{{ old('email') }}" autocomplete="email" required autofocus>
            @error('email')
                <p>{{ $message }}</p>
            @enderror
        </div>

        <div>
            <label for="password">Parole</label>
            <input id="password" type="password" name="password" autocomplete="current-password" required>
            @error('password')
                <p>{{ $message }}</p>
            @enderror
        </div>

        <button type="submit">Pieslēgties</button>
    </form>

    <p>Vēl nav konta? <a href="{{ route('signup.index') }}">Reģistrēties</a></p>
</body>
</html>
