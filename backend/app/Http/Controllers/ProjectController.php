<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreProjectRequest;
use App\Http\Requests\UpdateProjectRequest;
use App\Models\Project;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\View\View;

class ProjectController extends Controller
{
    public function publications(): View
    {
        return view('publications', ['projects' => Project::query()->whereNotNull('published_at')->with('user')->latest('published_at')->get()]);
    }

    public function publication(Project $project): View
    {
        abort_unless($project->published_at, 404);

        return view('publication', ['project' => $project->load(['user', 'comments.user']), 'frontendUrl' => config('services.frontend.url')]);
    }

    public function publicData(Project $project): JsonResponse
    {
        abort_unless($project->published_at, 404);

        return response()->json(['project' => $project->load(['user:id,username'])]);
    }

    public function comments(Project $project): JsonResponse
    {
        abort_unless($project->published_at, 404);

        return response()->json(['comments' => $project->comments()->with('user')->latest()->get()]);
    }

    public function publish(Request $request, Project $project): JsonResponse|RedirectResponse
    {
        $project = $this->userProject($request, $project);
        $project->forceFill(['published_at' => now()])->save();

        if ($request->expectsJson()) {
            return response()->json(['project' => $project]);
        }

        return redirect()->route('home')->with('status', 'Projekts ir publicēts.');
    }

    public function storeComment(Request $request, Project $project): RedirectResponse
    {
        abort_unless($project->published_at, 404);
        $validated = $request->validate(['body' => ['required', 'string', 'max:2000']]);
        $project->comments()->create(['user_id' => $request->user()->id, 'body' => $validated['body']]);

        return redirect()->route('publications.show', $project);
    }

    public function index(Request $request): View
    {
        return view('projects', [
            'projects' => $request->user()->projects()->latest()->get(),
            'frontendUrl' => config('services.frontend.url'),
        ]);
    }

    public function show(Request $request, Project $project): JsonResponse
    {
        return response()->json([
            'project' => $this->userProject($request, $project),
        ]);
    }

    public function store(StoreProjectRequest $request): JsonResponse
    {
        $project = $request->user()->projects()->create(
            $request->safe()->only(['title', 'data']),
        );

        return response()->json(['project' => $project], 201);
    }

    public function update(UpdateProjectRequest $request, Project $project): JsonResponse
    {
        $project = $this->userProject($request, $project);
        $project->update($request->safe()->only(['title', 'data']));

        return response()->json(['project' => $project]);
    }

    private function userProject(Request $request, Project $project): Project
    {
        return $request->user()->projects()->findOrFail($project->getKey());
    }
}
