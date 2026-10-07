<nav class="site-navbar" aria-label="Galvenā navigācija">
    <a class="site-logo" href="{{ auth()->check() ? route('home') : route('publications.index') }}" aria-label="WebMuzic sākumlapa">
        <span>WEBMUZIC</span>
    </a>

    <div class="site-nav-links">
        <a class="site-nav-link site-nav-create" href="{{ config('services.frontend.url') }}">Mūzikas izveide <span aria-hidden="true">↗</span></a>
        @auth
            <a class="site-nav-link {{ request()->routeIs('home') ? 'is-active' : '' }}" href="{{ route('home') }}" @if (request()->routeIs('home')) aria-current="page" @endif>Mani projekti</a>
        @endauth
        <a class="site-nav-link {{ request()->routeIs('publications.*') ? 'is-active' : '' }}" href="{{ route('publications.index') }}" @if (request()->routeIs('publications.*')) aria-current="page" @endif>Publikācijas</a>
        @auth
            <form method="POST" action="{{ route('session.logout') }}" class="site-nav-logout-form">
                @csrf
                <button class="site-nav-link site-nav-logout" type="submit">Iziet</button>
            </form>
        @endauth
    </div>
</nav>
