<!DOCTYPE html>
<html lang="lv">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>{{ $project->title }} | WebMuzic</title>
    @vite(['resources/css/navbar.css', 'resources/css/publication.css'])

</head>
<body>
    @include('components.navbar')
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

        <section class="ratings" aria-labelledby="rating-title">
            <div class="ratings-heading">
                <h2 id="rating-title">Vērtējums</h2>
                <div class="rating-summary" aria-label="Vidējais vērtējums: {{ $ratingAverage !== null ? number_format($ratingAverage, 1) : '—' }} no 5, {{ $ratingCount }} vērtējumi">
                    <span class="rating-summary-stars" aria-hidden="true" style="--rating-fill: {{ $ratingAverage !== null ? $ratingAverage * 20 : 0 }}%">★★★★★</span>
                    <span>{{ $ratingAverage !== null ? number_format($ratingAverage, 1) : '—' }} / 5</span>
                    <span class="rating-voter-total">{{ $ratingCount }} vērt.</span>
                </div>
            </div>
            @auth
                <form class="rating-form" method="POST" action="{{ route('publications.rating.store', $project) }}">
                    @csrf
                    @method('PUT')
                    <fieldset class="star-picker">
                        <div class="rating-choice-row">
                            <div class="stars" role="radiogroup" aria-label="Vērtējums no 1 līdz 5 zvaigznēm">
                            @for ($stars = 5; $stars >= 1; $stars--)
                                <input id="rating-{{ $stars }}" type="radio" name="stars" value="{{ $stars }}" @checked((int) old('stars', $userRating) === $stars) required>
                                <label for="rating-{{ $stars }}" aria-label="{{ $stars }} no 5 zvaigznēm">★</label>
                            @endfor
                            </div>
                        </div>
                    </fieldset>
                    <button class="rating-submit" type="submit">Saglabāt vērtējumu</button>
                    @error('stars') <span class="error">{{ $message }}</span> @enderror
                </form>
            @else
                <p class="login-prompt"><a href="{{ route('login.index') }}">Pieslēdzies</a>, lai novērtētu projektu.</p>
            @endauth
        </section>

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
