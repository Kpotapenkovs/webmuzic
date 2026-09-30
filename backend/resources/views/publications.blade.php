<!DOCTYPE html>
<html lang="lv">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Publikācijas | WebMuzic</title>
    @vite('resources/css/publications.css')

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
