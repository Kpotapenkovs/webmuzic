<!DOCTYPE html>
<html lang="lv">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Mani projekti | WebMuzic</title>
    @vite(['resources/css/app.css', 'resources/css/navbar.css', 'resources/js/app.js'])
    @vite('resources/css/projects.css')

</head>
<body class="min-w-80 bg-[#111412] font-sans text-[#e8eee9] antialiased">
    @include('components.navbar')
    <main class="projects-page">
        <section class="projects-main" aria-labelledby="projects-heading">
            <div class="projects-intro">
                <h2 id="projects-heading">Saglabātie projekti</h2>
            </div>

            <p class="projects-count">{{ $projects->count() }} {{ $projects->count() === 1 ? 'PROJEKTS' : 'PROJEKTI' }}</p>
            <div class="projects-grid">
                @forelse ($projects as $project)
                    @php
                        $patterns = $project->data['patterns'] ?? [];
                        $clips = $project->data['arrangement'] ?? [];
                    @endphp
                    <article class="project-card">
                        <div class="project-top">
                            <span class="project-id">PROJEKTS {{ str_pad((string) $project->id, 3, '0', STR_PAD_LEFT) }}</span>
                            <span class="project-status">{{ $project->published_at ? 'PUBLICĒTS' : 'PRIVĀTS' }}</span>
                        </div>
                        <div>
                            <h3 class="project-title">{{ $project->title }}</h3>
                            <div class="project-facts">
                                <span class="project-fact">{{ $project->data['bpm'] ?? '—' }} BPM</span>
                                <span class="project-fact">{{ count($patterns) }} {{ count($patterns) === 1 ? 'PATTERN' : 'PATTERNS' }}</span>
                                <span class="project-fact">{{ count($clips) }} {{ count($clips) === 1 ? 'KLIPS' : 'KLIPI' }}</span>
                            </div>
                        </div>
                        <div class="project-footer">
                            <span class="project-updated">LABOTS {{ $project->updated_at->diffForHumans() }}</span>
                            <a href="{{ $frontendUrl }}?project={{ $project->id }}" class="open-project">Atvērt projektu <span aria-hidden="true">→</span></a>
                        </div>
                        <div class="project-publish">
                            @if ($project->published_at)
                                <span class="publish-state"><a class="published-link" href="{{ route('publications.show', $project) }}">Skatīt publikāciju</a><br>{{ $project->published_at->format('Y-m-d H:i') }}</span>
                            @else
                                <span class="publish-state">Redzams tikai tev</span>
                            @endif
                            <form method="POST" action="{{ route('projects.publish', $project) }}">
                                @csrf
                                <button class="publish-button" type="submit">{{ $project->published_at ? 'Atjaunot publikāciju' : 'Publicēt projektu' }}</button>
                            </form>
                        </div>
                    </article>
                @empty
                    <div class="empty-projects">
                        <h3>Te vēl ir kluss.</h3>
                        <p>Saglabā savu pirmo projektu studijā, un tas parādīsies šeit kopā ar tā aranžējuma informāciju.</p>
                    </div>
                @endforelse

                <a href="{{ $frontendUrl }}" class="new-project">
                    <span class="new-project-icon" aria-hidden="true">+</span>
                    <span>
                        <span class="new-project-title">Sākt ko jaunu</span>
                        <span class="new-project-caption">ATVĒRT STUDIJU</span>
                    </span>
                </a>
            </div>
        </section>
    </main>
</body>
</html>
