<?php

namespace App\Http\Controllers;

use App\Models\Project;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\View\View;

class PublicationController extends Controller
{
    public function index(): View
    {
        $projects = Project::query()
            ->whereNotNull('published_at')
            ->with('user')
            ->withAvg('ratings', 'stars')
            ->withCount('ratings')
            ->latest('published_at')
            ->get();

        return view('publications', ['projects' => $projects]);
    }

    public function show(Project $project): View
    {
        abort_unless($project->published_at, 404);

        return view('publication', [
            'project' => $project->load(['user', 'comments.user']),
            'ratingCount' => $project->ratings()->count(),
            'ratingAverage' => $project->ratings()->avg('stars'),
            'userRating' => auth()->user()?->projectRatings()->where('project_id', $project->id)->value('stars'),
            'frontendUrl' => config('services.frontend.url'),
        ]);
    }

    public function storeRating(Request $request, Project $project): RedirectResponse
    {
        abort_unless($project->published_at, 404);

        $validated = $request->validate([
            'stars' => ['required', 'integer', 'between:1,5'],
        ]);

        $project->ratings()->updateOrCreate(
            ['user_id' => $request->user()->id],
            ['stars' => $validated['stars']],
        );

        return redirect()->route('publications.show', $project);
    }

    public function data(Project $project): JsonResponse
    {
        abort_unless($project->published_at, 404);

        return response()->json([
            'project' => $project->load(['user:id,username']),
        ]);
    }

    public function comments(Project $project): JsonResponse
    {
        abort_unless($project->published_at, 404);

        return response()->json([
            'comments' => $project->comments()->with('user')->latest()->get(),
        ]);
    }

    public function storeComment(Request $request, Project $project): RedirectResponse
    {
        abort_unless($project->published_at, 404);

        $validated = $request->validate([
            'body' => ['required', 'string', 'max:2000'],
        ]);

        $project->comments()->create([
            'user_id' => $request->user()->id,
            'body' => $validated['body'],
        ]);

        return redirect()->route('publications.show', $project);
    }
}
