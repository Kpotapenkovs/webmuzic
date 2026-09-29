<!DOCTYPE html>
<html lang="lv">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="theme-color" content="#111412">
    <title>Pieslēgties | WebMuzic</title>
    <style>
        :root{color-scheme:dark;font-family:Inter,ui-sans-serif,system-ui,-apple-system,"Segoe UI",sans-serif;background:#111412;color:#edf3ee;font-synthesis:none;text-rendering:optimizeLegibility;-webkit-font-smoothing:antialiased}*{box-sizing:border-box}body{margin:0;min-width:320px;min-height:100svh;display:grid;place-items:center;padding:28px;background:radial-gradient(ellipse at 18% 16%,#263429 0,transparent 36%),radial-gradient(ellipse at 88% 90%,#202c23 0,transparent 34%),#111412}.auth-shell{width:min(100%,1000px);min-height:600px;display:grid;grid-template-columns:1fr 1fr;overflow:hidden;border:1px solid #303a32;border-radius:8px;background:#171c18;box-shadow:0 30px 90px #0008}.brand-panel{position:relative;display:flex;flex-direction:column;justify-content:space-between;padding:42px;background:linear-gradient(145deg,#1a211b,#111512 76%)}.brand{font:700 16px ui-monospace,monospace;letter-spacing:.14em}.brand span{color:#b8e56d}.kicker{color:#b8e56d;font:11px ui-monospace,monospace;letter-spacing:.16em}.brand-copy h1{max-width:390px;margin:17px 0;color:#edf3ee;font:400 clamp(40px,5vw,62px)/.98 Georgia,serif;letter-spacing:-2px}.brand-copy p{max-width:330px;color:#9aa89d;font-size:14px;line-height:1.7}.soundmark{display:flex;align-items:center;gap:6px;height:46px}.soundmark i{width:4px;border-radius:4px;background:#b8e56d}.soundmark i:nth-child(1),.soundmark i:nth-child(8){height:14px}.soundmark i:nth-child(2),.soundmark i:nth-child(7){height:24px}.soundmark i:nth-child(3),.soundmark i:nth-child(6){height:36px}.soundmark i:nth-child(4),.soundmark i:nth-child(5){height:20px}.form-panel{display:flex;align-items:center;padding:52px clamp(28px,6vw,72px)}.form-content{width:100%;max-width:370px;margin:auto}.form-content .kicker{color:#8f9d92}.form-content h2{margin:12px 0 8px;font:500 34px Georgia,serif}.intro{margin:0 0 30px;color:#98a69b;font-size:14px;line-height:1.6}.field{margin:0 0 18px}.field label{display:block;margin-bottom:8px;color:#d7e0d8;font-size:12px;font-weight:600}.field input{width:100%;height:46px;padding:0 13px;border:1px solid #39443b;border-radius:4px;outline:none;background:#111512;color:#edf3ee;font-size:14px;transition:border-color .16s,box-shadow .16s}.field input:focus{border-color:#b8e56d;box-shadow:0 0 0 3px #b8e56d22}.field input::placeholder{color:#657269}.error{margin:7px 0 0;color:#ff9d91;font-size:12px}.submit{width:100%;height:47px;margin-top:6px;border:0;border-radius:4px;background:#b8e56d;color:#172016;font-weight:750;cursor:pointer;transition:background .16s,transform .16s}.submit:hover{transform:translateY(-1px);background:#c9f58b}.form-footer{margin:24px 0 0;color:#98a69b;text-align:center;font-size:13px}.form-footer a{color:#c9f58b;font-weight:650;text-decoration:none}.form-footer a:hover{text-decoration:underline}.back{display:inline-flex;margin-top:25px;color:#839187;text-decoration:none;font:11px ui-monospace,monospace}.back:hover{color:#c9f58b}@media(max-width:680px){body{padding:14px}.auth-shell{grid-template-columns:1fr;min-height:0}.brand-panel{min-height:205px;padding:25px 28px}.brand-copy h1{margin:18px 0 6px;font-size:38px}.brand-copy p,.soundmark{display:none}.form-panel{padding:32px 28px 38px}.form-content h2{font-size:30px}}
    </style>
</head>
<body>
    <main class="auth-shell">
        <aside class="brand-panel">
            <a class="brand" href="{{ config('services.frontend.url') }}" style="color:inherit;text-decoration:none">WEB<span>MUZIC</span></a>
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
