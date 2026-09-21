<?php

namespace Tests\Feature;

use App\Models\Project;
use App\Models\User;
use Illuminate\Foundation\Testing\LazilyRefreshDatabase;
use Tests\TestCase;

class ProjectTest extends TestCase
{
    use LazilyRefreshDatabase;

    public function test_authenticated_user_can_save_a_project_as_json(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)->postJson(route('projects.store'), $this->projectPayload());

        $response
            ->assertCreated()
            ->assertJsonPath('project.title', 'Mana dziesma')
            ->assertJsonPath('project.data.bpm', 160);

        $this->assertDatabaseHas('projects', [
            'user_id' => $user->id,
            'title' => 'Mana dziesma',
        ]);
    }

    public function test_home_only_lists_projects_belonging_to_authenticated_user(): void
    {
        $user = User::factory()->create();
        Project::factory()->for($user)->create(['title' => 'Mans projekts']);
        Project::factory()->create(['title' => 'Cita lietotāja projekts']);

        $this->actingAs($user)
            ->get(route('home'))
            ->assertSee('Mans projekts')
            ->assertDontSee('Cita lietotāja projekts');
    }

    public function test_project_owner_can_update_saved_workspace_data(): void
    {
        $user = User::factory()->create();
        $project = Project::factory()->for($user)->create();
        $payload = $this->projectPayload();
        $payload['title'] = 'Pārsaukts projekts';
        $payload['data']['bpm'] = 128;

        $this->actingAs($user)
            ->putJson(route('projects.update', $project), $payload)
            ->assertOk()
            ->assertJsonPath('project.title', 'Pārsaukts projekts')
            ->assertJsonPath('project.data.bpm', 128);

        $this->assertSame(128, $project->refresh()->data['bpm']);
    }

    public function test_user_cannot_access_or_update_another_users_project(): void
    {
        $user = User::factory()->create();
        $anotherUsersProject = Project::factory()->create(['title' => 'Privāts projekts']);

        $this->actingAs($user)
            ->getJson(route('projects.show', $anotherUsersProject))
            ->assertNotFound();

        $this->actingAs($user)
            ->putJson(route('projects.update', $anotherUsersProject), $this->projectPayload())
            ->assertNotFound();

        $this->assertSame('Privāts projekts', $anotherUsersProject->refresh()->title);
    }

    public function test_project_requires_complete_workspace_data(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user)
            ->postJson(route('projects.store'), [])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['title', 'data']);
    }

    /**
     * @return array{title: string, data: array{bpm: int, patterns: array<int, array{id: string, name: string, notes: array<int, mixed>}>, selectedPatternId: string, arrangement: array<int, mixed>}}
     */
    private function projectPayload(): array
    {
        return [
            'title' => 'Mana dziesma',
            'data' => [
                'bpm' => 160,
                'patterns' => [
                    [
                        'id' => 'pattern-1',
                        'name' => 'Pattern 1',
                        'notes' => [],
                    ],
                ],
                'selectedPatternId' => 'pattern-1',
                'arrangement' => [],
            ],
        ];
    }
}
