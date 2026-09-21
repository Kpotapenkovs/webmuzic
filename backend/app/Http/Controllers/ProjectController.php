<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreProjectRequest;
use App\Http\Requests\UpdateProjectRequest;
use App\Models\Project;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\View\View;

class ProjectController extends Controller
{
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
