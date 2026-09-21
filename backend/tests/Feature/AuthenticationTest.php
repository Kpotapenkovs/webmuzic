<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\LazilyRefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class AuthenticationTest extends TestCase
{
    use LazilyRefreshDatabase;

    public function test_guest_can_view_login_and_registration_forms(): void
    {
        $this->get(route('login.index'))->assertSee('Pieslēgties');
        $this->get(route('signup.index'))->assertSee('Reģistrēties');
    }

    public function test_guest_is_redirected_to_login_when_visiting_home(): void
    {
        $this->get(route('home'))->assertRedirect(route('login.index'));
    }

    public function test_authenticated_user_can_view_home(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user)
            ->get(route('home'))
            ->assertSee('Projekti');
    }

    public function test_valid_registration_creates_and_authenticates_user(): void
    {
        $response = $this->post(route('signup.store'), [
            'username' => 'janis',
            'email' => 'janis@example.test',
            'password' => 'password',
            'password_confirmation' => 'password',
        ]);

        $response->assertRedirect(route('home'));
        $this->assertDatabaseHas('users', [
            'username' => 'janis',
            'email' => 'janis@example.test',
        ]);
        $this->assertAuthenticated();
    }

    public function test_registration_rejects_duplicate_email(): void
    {
        User::factory()->create(['email' => 'janis@example.test']);

        $response = $this->from(route('signup.index'))->post(route('signup.store'), [
            'username' => 'citsjanis',
            'email' => 'janis@example.test',
            'password' => 'password',
            'password_confirmation' => 'password',
        ]);

        $response->assertRedirect(route('signup.index'));
        $response->assertSessionHasErrors(['email']);
    }

    public function test_user_can_log_in_with_valid_credentials(): void
    {
        $user = User::factory()->create([
            'email' => 'janis@example.test',
            'password' => Hash::make('secret-password'),
        ]);

        $response = $this->post(route('login.store'), [
            'email' => $user->email,
            'password' => 'secret-password',
        ]);

        $response->assertRedirect(route('home'));
        $this->assertAuthenticatedAs($user);
    }

    public function test_login_rejects_invalid_credentials(): void
    {
        User::factory()->create(['email' => 'janis@example.test']);

        $response = $this->from(route('login.index'))->post(route('login.store'), [
            'email' => 'janis@example.test',
            'password' => 'incorrect-password',
        ]);

        $response->assertRedirect(route('login.index'));
        $response->assertSessionHasErrors(['email']);
        $this->assertGuest();
    }

    public function test_login_can_redirect_user_back_to_the_studio(): void
    {
        $user = User::factory()->create([
            'email' => 'janis@example.test',
            'password' => Hash::make('secret-password'),
        ]);

        $this->post(route('login.store'), [
            'email' => $user->email,
            'password' => 'secret-password',
            'return_to' => 'studio',
        ])->assertRedirect(config('services.frontend.url'));
    }

    public function test_authenticated_user_can_get_their_session_profile(): void
    {
        $user = User::factory()->create(['username' => 'janis']);

        $this->actingAs($user)
            ->getJson(route('session.user'))
            ->assertExactJson([
                'user' => [
                    'username' => 'janis',
                ],
            ]);
    }

    public function test_guest_session_profile_request_returns_unauthorized(): void
    {
        $this->getJson(route('session.user'))->assertUnauthorized();
    }

    public function test_authenticated_user_can_log_out_of_their_session(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user)
            ->postJson(route('session.logout'))
            ->assertNoContent();

        $this->assertGuest();
    }
}
