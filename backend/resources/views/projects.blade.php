<!DOCTYPE html>
<html lang="lv">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Mani projekti | WebMuzic</title>
    @vite(['resources/css/app.css', 'resources/js/app.js'])
    <style>
        .projects-page { min-height: 100svh; background: radial-gradient(circle at 82% 5%, #263429 0, transparent 29%), #111412; }
        .projects-header { min-height: 76px; display: flex; align-items: center; justify-content: space-between; gap: 20px; padding: 14px max(24px, calc((100vw - 1120px) / 2)); border-bottom: 1px solid #2a312c; background: #171b18; }
        .projects-main { width: min(100% - 48px, 1120px); margin: 0 auto; padding: 58px 0 80px; }
        .projects-intro { display: flex; align-items: end; justify-content: space-between; gap: 30px; padding-bottom: 28px; border-bottom: 1px solid #2a312c; }
        .projects-intro h2 { margin: 12px 0 0; color: #edf3ee; font: 400 clamp(36px, 5vw, 54px)/1 Georgia, serif; letter-spacing: -1.5px; }
        .projects-intro p { max-width: 355px; margin: 0; color: #98a79b; font-size: 14px; line-height: 1.7; }
        .projects-intro a, .published-link { color: #b8e56d; text-decoration: none; }
        .projects-intro a:hover, .published-link:hover { text-decoration: underline; }
        .projects-count { margin: 26px 0 12px; color: #87948a; font: 11px ui-monospace, monospace; letter-spacing: .08em; }
        .projects-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(min(100%, 310px), 1fr)); gap: 16px; align-items: stretch; }
        .project-card { min-width: 0; display: flex; flex-direction: column; padding: 20px; border: 1px solid #354238; border-radius: 7px; background: linear-gradient(145deg, #1a211c, #141915 78%); transition: border-color .18s, transform .18s, background .18s; }
        .project-card:hover { transform: translateY(-2px); border-color: #819e56; background: linear-gradient(145deg, #202a21, #151b16 78%); }
        .project-top, .project-footer, .project-publish { display: flex; align-items: center; justify-content: space-between; gap: 12px; }
        .project-id, .project-updated { color: #849187; font: 10px ui-monospace, monospace; letter-spacing: .08em; }
        .project-status { display: inline-flex; align-items: center; gap: 6px; color: #aeb9b0; font: 10px ui-monospace, monospace; }
        .project-status::before { width: 6px; height: 6px; border-radius: 50%; background: #b8e56d; content: ""; }
        .project-title { margin: 22px 0 7px; overflow-wrap: anywhere; color: #edf3ee; font: 400 28px/1.12 Georgia, serif; }
        .project-facts { display: flex; flex-wrap: wrap; gap: 7px; margin: 13px 0 22px; }
        .project-fact { padding: 6px 8px; border: 1px solid #344137; border-radius: 3px; color: #b8e56d; font: 10px ui-monospace, monospace; }
        .project-footer { margin-top: auto; padding-top: 14px; border-top: 1px solid #2a312c; }
        .open-project { display: inline-flex; align-items: center; gap: 7px; padding: 9px 11px; border: 1px solid #b8e56d; border-radius: 4px; color: #172016; background: #b8e56d; font-size: 12px; font-weight: 650; text-decoration: none; transition: background .15s; }
        .open-project:hover { background: #c9f58b; }
        .project-publish { min-height: 47px; margin-top: 13px; padding-top: 12px; border-top: 1px solid #2a312c; }
        .publish-state { color: #89968c; font-size: 11px; line-height: 1.5; }
        .publish-button { flex: 0 0 auto; padding: 7px 9px; border: 1px solid #465344; border-radius: 4px; color: #c8d1c9; background: transparent; cursor: pointer; font: 10px ui-monospace, monospace; transition: border-color .15s, color .15s, background .15s; }
        .publish-button:hover { border-color: #b8e56d; color: #172016; background: #b8e56d; }
        .new-project, .empty-projects { min-height: 220px; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 24px; border: 1px dashed #3a463e; border-radius: 7px; background: #171b1880; text-align: center; }
        .new-project { gap: 13px; color: inherit; text-decoration: none; transition: border-color .18s, background .18s; }
        .new-project:hover { border-color: #b8e56d; background: #1c221d; }
        .new-project-icon { width: 42px; height: 42px; display: grid; place-items: center; border: 1px solid #465344; border-radius: 50%; color: #b8e56d; font: 24px ui-monospace, monospace; }
        .new-project-title { color: #edf3ee; font: 24px Georgia, serif; }
        .new-project-caption { display: block; margin-top: 6px; color: #87948a; font: 10px ui-monospace, monospace; letter-spacing: .1em; }
        .empty-projects { align-items: flex-start; text-align: left; }
        .empty-projects h3 { margin: 0; color: #edf3ee; font: 26px Georgia, serif; }
        .empty-projects p { max-width: 310px; margin: 10px 0 0; color: #98a79b; font-size: 13px; line-height: 1.6; }
        .account-menu { position: relative; }
        .account-menu summary { display: flex; align-items: center; gap: 9px; padding: 7px 10px; border: 1px solid #3a463e; border-radius: 4px; color: #dce8df; background: #202720; cursor: pointer; font: 12px ui-monospace, monospace; list-style: none; }
        .account-menu summary::-webkit-details-marker { display: none; }
        .account-avatar { width: 22px; height: 22px; display: grid; place-items: center; border-radius: 50%; color: #172016; background: #b8e56d; font-size: 10px; font-weight: 700; }
        .logout-form { position: absolute; top: calc(100% + 7px); right: 0; z-index: 2; min-width: 130px; padding: 4px; border: 1px solid #3a463e; border-radius: 4px; background: #202720; }
        .logout-button { width: 100%; padding: 8px; border: 0; border-radius: 3px; color: #dce8df; background: transparent; cursor: pointer; text-align: left; font: 11px ui-monospace, monospace; }
        .logout-button:hover { color: #c9f58b; background: #2a312c; }
        @media (max-width: 650px) { .projects-header { min-height: 68px; padding: 12px 18px; } .projects-main { width: calc(100% - 36px); padding: 38px 0 56px; } .projects-intro { align-items: flex-start; flex-direction: column; gap: 16px; } .projects-intro p { max-width: 480px; } .projects-grid { grid-template-columns: 1fr; } }
    </style>
</head>
<body class="min-w-80 bg-[#111412] font-sans text-[#e8eee9] antialiased">
    <main class="projects-page">
        <header class="projects-header">
            <div>
                <p class="font-mono text-[10px] tracking-[0.15em] text-[#8d9b91]">WEBMUZIC / DARBA VIETA</p>
                <h1 class="mt-1 font-serif text-xl font-semibold leading-tight text-[#edf3ee]">Mani projekti</h1>
            </div>
            <details class="account-menu">
                <summary>
                    <span class="account-avatar">{{ strtoupper(mb_substr(auth()->user()->username, 0, 1)) }}</span>
                    {{ auth()->user()->username }}
                    <span class="text-[#8d9b91]" aria-hidden="true">⌄</span>
                </summary>
                <form method="POST" action="{{ route('session.logout') }}" class="logout-form">
                    @csrf
                    <button type="submit" class="logout-button">Iziet no konta</button>
                </form>
            </details>
        </header>

        <section class="projects-main" aria-labelledby="projects-heading">
            <div class="projects-intro">
                <div>
                    <h2 id="projects-heading">Saglabātie projekti</h2>
                </div>
                <p>Atver projektu studijā, lai turpinātu veidot aranžējumu un eksperimentētu ar skaņu. <a href="{{ route('publications.index') }}">Apskatīt publikācijas →</a></p>
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
