<?php

namespace Database\Factories;

use App\Models\Project;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Project>
 */
class ProjectFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'title' => fake()->words(3, true),
            'data' => [
                'bpm' => 160,
                'patterns' => [
                    ['id' => 'pattern-1', 'name' => 'Pattern 1', 'notes' => []],
                ],
                'selectedPatternId' => 'pattern-1',
                'arrangement' => [],
            ],
        ];
    }
}
