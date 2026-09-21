<!DOCTYPE html>
<html lang="lv">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Projekti | WebMuzic</title>
    @vite(['resources/css/app.css', 'resources/js/app.js'])
</head>
<body class="min-w-80 bg-[#111412] font-sans text-[#e8eee9] antialiased">
    <main class="min-h-svh bg-[radial-gradient(circle_at_82%_8%,#263429_0,transparent_29%),#111412]">
        <header class="flex min-h-20 items-center justify-between border-b border-[#2a312c] bg-[#171b18] px-5 sm:px-8">
            <div>
                <p class="font-mono text-[11px] tracking-[0.15em] text-[#8d9b91]">WEBMUZIC / PROJECTS</p>
                <h1 class="mt-1 font-serif text-[21px] font-semibold leading-tight text-[#edf3ee]">Mani projekti</h1>
            </div>

            <details class="group relative">
                <summary class="flex cursor-pointer list-none items-center gap-2 rounded-[3px] border border-[#3a463e] bg-[#202720] px-3 py-2 font-mono text-xs text-[#dce8df] transition hover:border-[#b8e56d]/70 hover:text-[#c9f58b]">
                    <span class="flex h-5 w-5 items-center justify-center rounded-full bg-[#b8e56d] text-[10px] font-bold text-[#172016]">{{ strtoupper(mb_substr(auth()->user()->username, 0, 1)) }}</span>
                    {{ auth()->user()->username }}
                    <span class="text-[#8d9b91] transition group-open:rotate-180" aria-hidden="true">⌄</span>
                </summary>
                <form method="POST" action="{{ route('session.logout') }}" class="absolute right-0 z-10 mt-2 w-36 rounded-[3px] border border-[#3a463e] bg-[#202720] p-1 shadow-xl shadow-black/30">
                    @csrf
                    <button type="submit" class="w-full rounded-[2px] px-3 py-2 text-left font-mono text-xs text-[#dce8df] transition hover:bg-[#2a312c] hover:text-[#c9f58b]">Iziet</button>
                </form>
            </details>
        </header>

        <section class="mx-auto max-w-7xl px-5 py-12 sm:px-8 sm:py-16" aria-labelledby="projects-heading">
            <div class="flex flex-col justify-between gap-6 border-b border-[#2a312c] pb-7 sm:flex-row sm:items-end">
                <div>
                    <p class="font-mono text-[11px] tracking-[0.14em] text-[#b8e56d]">DARBA VIETA</p>
                    <h2 id="projects-heading" class="mt-3 max-w-xl font-serif text-4xl leading-none tracking-tight text-[#edf3ee] sm:text-5xl">Tavi saglabātie projekti.</h2>
                </div>
                <p class="max-w-xs text-sm leading-6 text-[#98a79b]">Atver projektu studijā, lai turpinātu veidot aranžējumu un eksperimentētu ar skaņu.</p>
            </div>

            <div class="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                @forelse ($projects as $project)
                    <a href="{{ $frontendUrl }}?project={{ $project->id }}" class="group flex min-h-64 flex-col justify-between rounded-[3px] border border-[#3a463e] bg-[#171b18] p-5 transition hover:border-[#b8e56d]/70 hover:bg-[#1c221d] focus:outline-none focus:ring-2 focus:ring-[#b8e56d]">
                        <div class="flex items-start justify-between gap-4">
                            <span class="font-mono text-[11px] tracking-[0.14em] text-[#8d9b91]">PROJECT {{ str_pad((string) $project->id, 3, '0', STR_PAD_LEFT) }}</span>
                            <span class="h-2 w-2 rounded-full bg-[#b8e56d] shadow-[0_0_10px_#b8e56d]"></span>
                        </div>
                        <div>
                            <p class="font-mono text-xs text-[#b8e56d]">{{ $project->data['bpm'] }} BPM · {{ count($project->data['patterns']) }} PATTERNS</p>
                            <h3 class="mt-3 font-serif text-3xl leading-none text-[#edf3ee]">{{ $project->title }}</h3>
                            <div class="mt-6 flex items-center justify-between border-t border-[#2a312c] pt-4 font-mono text-[11px] text-[#8d9b91]">
                                <span>LABOTS {{ $project->updated_at->diffForHumans() }}</span>
                                <span class="text-base text-[#b8e56d] transition-transform group-hover:translate-x-1" aria-hidden="true">→</span>
                            </div>
                        </div>
                    </a>
                @empty
                    <div class="flex min-h-64 flex-col justify-center rounded-[3px] border border-dashed border-[#3a463e] bg-[#171b18]/50 p-6 text-center">
                        <p class="font-serif text-2xl text-[#edf3ee]">Vēl nav saglabātu projektu</p>
                        <p class="mt-2 text-sm text-[#98a79b]">Atver studiju un nospied Save, lai radītu pirmo projektu.</p>
                    </div>
                @endforelse

                <a href="{{ $frontendUrl }}" class="flex min-h-64 flex-col items-center justify-center gap-4 rounded-[3px] border border-dashed border-[#3a463e] bg-[#171b18]/50 p-5 text-center transition hover:border-[#b8e56d]/70 hover:bg-[#1c221d] focus:outline-none focus:ring-2 focus:ring-[#b8e56d]">
                    <span class="flex h-11 w-11 items-center justify-center rounded-full border border-[#3a463e] font-mono text-2xl text-[#b8e56d]">+</span>
                    <span>
                        <span class="block font-serif text-2xl text-[#edf3ee]">Sāc ko jaunu</span>
                        <span class="mt-2 block font-mono text-[11px] tracking-[0.12em] text-[#8d9b91]">ATVĒRT STUDIJU</span>
                    </span>
                </a>
            </div>
        </section>
    </main>
</body>
</html>
