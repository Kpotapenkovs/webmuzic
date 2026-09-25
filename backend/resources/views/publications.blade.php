<!DOCTYPE html>
<html lang="lv">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Publikācijas | WebMuzic</title>
    <style>
        :root { color-scheme: dark; font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; background: #0d100e; color: #edf3ee; }
        * { box-sizing: border-box; }
        body { min-width: 320px; min-height: 100vh; margin: 0; background: radial-gradient(ellipse at 82% -5%, #29392c 0, transparent 38%), #0d100e; }
        a { color: inherit; }
        .page { width: min(100% - 40px, 1120px); margin: 0 auto; padding: 36px 0 76px; }
        .topline { display: flex; align-items: center; justify-content: space-between; gap: 16px; }
        .back { display: inline-flex; align-items: center; gap: 9px; color: #b8e56d; font-size: 13px; text-decoration: none; }
        .back:hover { color: #d2f99b; }
        .brand { color: #829087; font: 10px ui-monospace, SFMono-Regular, Consolas, monospace; letter-spacing: .16em; }
        .intro { display: flex; align-items: end; justify-content: space-between; gap: 28px; margin: 60px 0 30px; padding-bottom: 27px; border-bottom: 1px solid #2c352e; }
        .eyebrow { color: #b8e56d; font: 11px ui-monospace, SFMono-Regular, Consolas, monospace; letter-spacing: .16em; text-transform: uppercase; }
        h1 { margin: 12px 0 0; font: 500 clamp(38px, 7vw, 66px)/1 Georgia, "Times New Roman", serif; letter-spacing: -.035em; }
        .intro-copy { max-width: 340px; margin: 0 0 3px; color: #9ba99e; font-size: 14px; line-height: 1.7; }
        .feed-heading { display: flex; align-items: baseline; justify-content: space-between; margin: 0 0 14px; color: #91a095; font: 11px ui-monospace, SFMono-Regular, Consolas, monospace; letter-spacing: .08em; text-transform: uppercase; }
        .grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 15px; }
        .project { position: relative; display: flex; min-height: 245px; flex-direction: column; padding: 22px; overflow: hidden; border: 1px solid #354238; border-radius: 8px; background: linear-gradient(145deg, #1a211c, #141915 74%); text-decoration: none; transition: border-color .18s, transform .18s, background .18s; }
        .project::after { position: absolute; right: -45px; bottom: -90px; width: 180px; height: 180px; border: 1px solid #b8e56d14; border-radius: 50%; content: ""; pointer-events: none; }
        .project:hover { transform: translateY(-2px); border-color: #90b657; background: linear-gradient(145deg, #202a21, #151b16 74%); }
        .project-top { display: flex; align-items: center; justify-content: space-between; gap: 12px; }
        .published-tag { padding: 6px 8px; border: 1px solid #536641; border-radius: 4px; color: #c9f58b; font: 9px ui-monospace, SFMono-Regular, Consolas, monospace; letter-spacing: .08em; text-transform: uppercase; }
        .project-date { color: #859187; font: 10px ui-monospace, SFMono-Regular, Consolas, monospace; }
        h2 { margin: 25px 0 7px; font: 500 clamp(25px, 3vw, 34px)/1.1 Georgia, "Times New Roman", serif; overflow-wrap: anywhere; }
        .author { margin: 0; color: #9ca99f; font-size: 13px; }
        .facts { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 20px; }
        .fact { padding: 7px 9px; border: 1px solid #2e3931; border-radius: 4px; color: #c5d0c7; background: #111713; font: 10px ui-monospace, SFMono-Regular, Consolas, monospace; }
        .project-bottom { display: flex; align-items: center; justify-content: space-between; gap: 14px; margin-top: auto; padding-top: 21px; color: #b8e56d; font-size: 12px; }
        .arrow { font-size: 18px; transition: transform .18s; }
        .project:hover .arrow { transform: translate(3px, -3px); }
        .empty { display: grid; min-height: 260px; place-content: center; padding: 30px; border: 1px dashed #39453c; border-radius: 8px; text-align: center; }
        .empty-mark { color: #b8e56d; font: 30px Georgia, serif; }
        .empty h2 { margin: 13px 0 7px; font-size: 25px; }
        .empty p { max-width: 390px; margin: 0; color: #9ba99e; font-size: 13px; line-height: 1.6; }
        @media (max-width: 700px) { .page { width: min(100% - 24px, 1120px); padding-top: 22px; } .intro { display: block; margin-top: 46px; } .intro-copy { margin-top: 16px; } .grid { grid-template-columns: 1fr; } .project { min-height: 220px; } }
    </style>
</head>
<body>
    <main class="page">
        <div class="topline">
            @auth
                <a class="back" href="{{ route('home') }}"><span aria-hidden="true">←</span> Mani projekti</a>
            @else
                <a class="back" href="{{ route('login.index') }}"><span aria-hidden="true">←</span> Pieslēgties</a>
            @endauth
            <span class="brand">WEBMUZIC / COMMUNITY</span>
        </div>

        <header class="intro">
            <div><div class="eyebrow">Kopienas izlase</div><h1>Publikācijas</h1></div>
            <p class="intro-copy">Iepazīsti citu autoru projektus, atver tos studijā un pievieno savu komentāru.</p>
        </header>

        <div class="feed-heading"><span>Publiski projekti</span><span>{{ $projects->count() }} {{ $projects->count() === 1 ? 'projekts' : 'projekti' }}</span></div>
        @if ($projects->isEmpty())
            <section class="empty">
                <div class="empty-mark" aria-hidden="true">♪</div>
                <h2>Vēl nav publikāciju</h2>
                <p>Kad autori publicēs savus projektus, tie parādīsies šeit. Pēc tam varēsi tos noklausīties un komentēt.</p>
            </section>
        @else
            <div class="grid">
                @foreach ($projects as $project)
                    <a class="project" href="{{ route('publications.show', $project) }}">
                        <div class="project-top"><span class="published-tag">Publicēts</span><time class="project-date" datetime="{{ $project->published_at->toIso8601String() }}">{{ $project->published_at->format('Y-m-d · H:i') }}</time></div>
                        <h2>{{ $project->title }}</h2>
                        <p class="author">Autors {{ $project->user->username }}</p>
                        <div class="facts"><span class="fact">{{ $project->data['bpm'] ?? '—' }} BPM</span><span class="fact">{{ count($project->data['patterns'] ?? []) }} patterns</span><span class="fact">{{ count($project->data['arrangement'] ?? []) }} klipi</span></div>
                        <div class="project-bottom"><span>Atvērt publikāciju</span><span class="arrow" aria-hidden="true">↗</span></div>
                    </a>
                @endforeach
            </div>
        @endif
    </main>
</body>
</html>
