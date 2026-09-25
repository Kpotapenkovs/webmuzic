<!DOCTYPE html>
<html lang="lv">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>{{ $project->title }} | WebMuzic</title>
    <style>
        :root { color-scheme: dark; font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; background: #0d100e; color: #edf3ee; }
        * { box-sizing: border-box; }
        body { min-width: 320px; min-height: 100vh; margin: 0; background: radial-gradient(ellipse at 78% 0%, #27352a 0, transparent 38%), #0d100e; }
        a { color: inherit; }
        .page { width: min(100% - 40px, 1040px); margin: 0 auto; padding: 36px 0 72px; }
        .back { display: inline-flex; align-items: center; gap: 9px; color: #b8e56d; font-size: 13px; text-decoration: none; }
        .back:hover { color: #d2f99b; }
        .project-card { margin-top: 26px; padding: clamp(24px, 5vw, 52px); border: 1px solid #354238; border-radius: 10px; background: linear-gradient(140deg, #1a211c, #141915 70%); box-shadow: 0 24px 70px #0005; }
        .eyebrow { color: #b8e56d; font: 11px ui-monospace, SFMono-Regular, Consolas, monospace; letter-spacing: .16em; text-transform: uppercase; }
        h1 { margin: 13px 0 0; font: 500 clamp(36px, 7vw, 64px)/1.02 Georgia, "Times New Roman", serif; letter-spacing: -.035em; overflow-wrap: anywhere; }
        .meta { display: flex; flex-wrap: wrap; gap: 8px 18px; margin-top: 19px; color: #a3b0a6; font-size: 13px; line-height: 1.6; }
        .meta strong { color: #e2eae3; font-weight: 600; }
        .project-facts { display: flex; flex-wrap: wrap; gap: 10px; margin-top: 27px; }
        .fact { padding: 10px 13px; border: 1px solid #354238; border-radius: 5px; color: #c8d2ca; background: #111713; font: 11px ui-monospace, SFMono-Regular, Consolas, monospace; }
        .open-project { display: inline-flex; align-items: center; gap: 10px; margin-top: 28px; padding: 12px 16px; border: 1px solid #b8e56d; border-radius: 5px; color: #172016; background: #b8e56d; font-size: 13px; font-weight: 650; text-decoration: none; transition: background .15s, transform .15s; }
        .open-project:hover { transform: translateY(-1px); background: #c9f58b; }
        .comments { width: min(100%, 720px); margin: 46px auto 0; }
        .comments-heading { display: flex; align-items: baseline; justify-content: space-between; gap: 16px; padding-bottom: 14px; border-bottom: 1px solid #2c352e; }
        h2 { margin: 0; font: 500 29px/1.2 Georgia, "Times New Roman", serif; }
        .comment-count { color: #87958a; font: 11px ui-monospace, SFMono-Regular, Consolas, monospace; }
        .comment-list { display: grid; gap: 12px; margin-top: 17px; }
        .comment { padding: 16px 18px; border: 1px solid #2b352d; border-radius: 6px; background: #151a16; }
        .comment-head { display: flex; flex-wrap: wrap; justify-content: space-between; gap: 6px 14px; }
        .comment-author { color: #c9f58b; font-size: 13px; font-weight: 650; }
        .comment-date { color: #7e8a80; font-size: 11px; }
        .comment-body { margin: 10px 0 0; color: #d6ded7; font-size: 14px; line-height: 1.65; white-space: pre-wrap; overflow-wrap: anywhere; }
        .empty-comments { margin: 17px 0; padding: 18px; border: 1px dashed #354238; border-radius: 6px; color: #94a197; font-size: 13px; }
        .comment-form { display: grid; justify-items: start; gap: 12px; margin-top: 22px; }
        textarea { display: block; width: 100%; min-height: 118px; resize: vertical; padding: 13px 14px; border: 1px solid #39463c; border-radius: 6px; outline: none; color: #edf3ee; background: #141a15; font: inherit; font-size: 14px; line-height: 1.5; }
        textarea::placeholder { color: #78867b; }
        textarea:focus { border-color: #9bc95d; box-shadow: 0 0 0 3px #b8e56d22; }
        .submit { padding: 11px 16px; border: 0; border-radius: 5px; color: #172016; background: #b8e56d; cursor: pointer; font: 650 13px ui-sans-serif, system-ui, sans-serif; }
        .submit:hover { background: #c9f58b; }
        .login-prompt { margin-top: 20px; color: #9ba99e; font-size: 13px; }
        .login-prompt a { color: #c9f58b; }
        .error { color: #ffb4a9; font-size: 12px; }
        @media (max-width: 540px) { .page { width: min(100% - 24px, 1040px); padding-top: 22px; } .project-card { margin-top: 19px; border-radius: 7px; } .comments { margin-top: 34px; } .comments-heading { align-items: center; } }
    </style>
</head>
<body>
    <main class="page">
        <a class="back" href="{{ route('publications.index') }}"><span aria-hidden="true">←</span> Visas publikācijas</a>

        <article class="project-card">
            <div class="eyebrow">WebMuzic · publicēts projekts</div>
            <h1>{{ $project->title }}</h1>
            <div class="meta">
                <span>Autors <strong>{{ $project->user->username }}</strong></span>
                <span>Publicēts {{ $project->published_at->format('Y-m-d H:i') }}</span>
                <span>Atjaunots {{ $project->updated_at->format('Y-m-d H:i') }}</span>
            </div>
            <div class="project-facts">
                <span class="fact">{{ $project->data['bpm'] ?? '—' }} BPM</span>
                <span class="fact">{{ count($project->data['patterns'] ?? []) }} patterns</span>
                <span class="fact">{{ count($project->data['arrangement'] ?? []) }} aranžējuma klipi</span>
            </div>
            <a class="open-project" href="{{ $frontendUrl }}?project={{ $project->id }}&readonly=1">Atvērt projektu <span aria-hidden="true">↗</span></a>
        </article>

        <section class="comments" aria-labelledby="comments-title">
            <div class="comments-heading">
                <h2 id="comments-title">Komentāri</h2>
                <span class="comment-count">{{ $project->comments->count() }} komentāri</span>
            </div>
            @if ($project->comments->isEmpty())
                <p class="empty-comments">Vēl nav komentāru. Esi pirmais, kurš padalās ar atsauksmi.</p>
            @else
                <div class="comment-list">
                    @foreach ($project->comments as $comment)
                        <article class="comment">
                            <div class="comment-head">
                                <span class="comment-author">{{ $comment->user->username }}</span>
                                <time class="comment-date" datetime="{{ $comment->created_at->toIso8601String() }}">{{ $comment->created_at->format('Y-m-d H:i') }}</time>
                            </div>
                            <p class="comment-body">{{ $comment->body }}</p>
                        </article>
                    @endforeach
                </div>
            @endif

            @auth
                <form class="comment-form" method="POST" action="{{ route('publications.comments.store', $project) }}">
                    @csrf
                    <label class="eyebrow" for="comment-body">Pievieno komentāru</label>
                    <textarea id="comment-body" required maxlength="2000" name="body" placeholder="Ko domā par šo projektu?">{{ old('body') }}</textarea>
                    @error('body') <span class="error">{{ $message }}</span> @enderror
                    <button class="submit" type="submit">Publicēt komentāru</button>
                </form>
            @else
                <p class="login-prompt"><a href="{{ route('login.index') }}">Pieslēdzies</a>, lai pievienotu komentāru.</p>
            @endauth
        </section>
    </main>
</body>
</html>
