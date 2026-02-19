<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\Profile;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AuthTest extends TestCase
{
    use RefreshDatabase;

    /** @test */
    public function login_page_renders(): void
    {
        $response = $this->get(route('login'));
        $response->assertStatus(200);
        $response->assertViewIs('auth.login');
    }

    /** @test */
    public function valid_credentials_redirect_to_dashboard(): void
    {
        $user = User::factory()->create(['email' => 'test@slac.com', 'password' => bcrypt('password123')]);
        Profile::factory()->create(['user_id' => $user->id, 'is_active' => true, 'is_locked' => false]);

        $response = $this->post(route('login'), [
            'email'    => 'test@slac.com',
            'password' => 'password123',
        ]);

        $response->assertRedirect(route('dashboard'));
    }

    /** @test */
    public function invalid_credentials_return_error(): void
    {
        $response = $this->post(route('login'), [
            'email'    => 'nobody@slac.com',
            'password' => 'wrongpass',
        ]);

        $response->assertSessionHasErrors('email');
    }

    /** @test */
    public function locked_account_cannot_login(): void
    {
        $user = User::factory()->create(['email' => 'locked@slac.com', 'password' => bcrypt('password123')]);
        Profile::factory()->create(['user_id' => $user->id, 'is_active' => true, 'is_locked' => true]);

        $response = $this->post(route('login'), [
            'email'    => 'locked@slac.com',
            'password' => 'password123',
        ]);

        $response->assertSessionHasErrors('email');
        $this->assertGuest();
    }

    /** @test */
    public function logout_redirects_to_login(): void
    {
        $user = User::factory()->create();
        $this->actingAs($user);

        $response = $this->post(route('logout'));
        $response->assertRedirect(route('login'));
        $this->assertGuest();
    }
}
