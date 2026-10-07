<?php

namespace Tests\Feature;

use App\Models\Project;
use App\Models\User;
use Illuminate\Foundation\Testing\LazilyRefreshDatabase;
use Tests\TestCase;

class PublicationRatingTest extends TestCase
{
    use LazilyRefreshDatabase;

    public function test_publication_page_shows_average_and_selected_rating(): void
    {
        $project = Project::factory()->create(['published_at' => now()]);
        $rater = User::factory()->create();
        $project->ratings()->create(['user_id' => $rater->id, 'stars' => 5]);
        $project->ratings()->create(['user_id' => User::factory()->create()->id, 'stars' => 3]);

        $this->actingAs($rater)
            ->get(route('publications.show', $project))
            ->assertOk()
            ->assertSee('4.0 / 5')
            ->assertSee('2 vērt.')
            ->assertSee('type="radio"', false)
            ->assertSee('Saglabāt vērtējumu')
            ->assertSee('checked', false);
    }

    public function test_publications_list_scales_average_stars_to_five(): void
    {
        $project = Project::factory()->create(['published_at' => now()]);
        $project->ratings()->create(['user_id' => User::factory()->create()->id, 'stars' => 5]);
        $project->ratings()->create(['user_id' => User::factory()->create()->id, 'stars' => 3]);

        $this->get(route('publications.index'))
            ->assertOk()
            ->assertSee('4.0 / 5')
            ->assertSee('--rating-fill: 80%', false);
    }
}