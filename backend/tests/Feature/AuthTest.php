<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AuthTest extends TestCase
{
    use RefreshDatabase;

    public function test_new_users_can_register(): void
    {
        $response = $this->postJson('/api/register', [
            'name' => 'Test Landlord',
            'email' => 'landlord@example.com',
            'phone' => '01711000000',
            'password' => 'password123',
            'password_confirmation' => 'password123',
        ]);

        $response->assertStatus(201)
            ->assertJsonStructure(['message', 'user' => ['id', 'name', 'email']]);

        $this->assertAuthenticated();
        $this->assertDatabaseHas('users', [
            'email' => 'landlord@example.com',
            'phone' => '01711000000',
            'platform_role' => 'user',
        ]);
    }

    public function test_registration_requires_valid_data(): void
    {
        $response = $this->postJson('/api/register', [
            'name' => '',
            'email' => 'invalid-email',
            'password' => 'short',
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['name', 'email', 'password']);
    }

    public function test_users_can_authenticate_using_the_login_screen(): void
    {
        $user = User::factory()->create([
            'email' => 'user@example.com',
            'password' => bcrypt('password123'),
            'is_active' => true,
        ]);

        $response = $this->postJson('/api/login', [
            'email' => 'user@example.com',
            'password' => 'password123',
        ]);

        $response->assertStatus(200)
            ->assertJsonStructure(['message', 'user']);

        $this->assertAuthenticated();
    }

    public function test_users_can_not_authenticate_with_invalid_password(): void
    {
        $user = User::factory()->create([
            'email' => 'user@example.com',
            'password' => bcrypt('password123'),
        ]);

        $response = $this->postJson('/api/login', [
            'email' => 'user@example.com',
            'password' => 'wrong-password',
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['email']);

        $this->assertGuest();
    }

    public function test_deactivated_users_cannot_login(): void
    {
        $user = User::factory()->create([
            'email' => 'deactivated@example.com',
            'password' => bcrypt('password123'),
            'is_active' => false,
        ]);

        $response = $this->postJson('/api/login', [
            'email' => 'deactivated@example.com',
            'password' => 'password123',
        ]);

        $response->assertStatus(422);
        $this->assertGuest();
    }

    public function test_authenticated_user_can_fetch_profile(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)->getJson('/api/v1/user');

        $response->assertStatus(200)
            ->assertJsonPath('data.email', $user->email);
    }

    public function test_unauthenticated_user_cannot_access_profile(): void
    {
        $response = $this->getJson('/api/v1/user');

        $response->assertStatus(401);
    }

    public function test_users_can_logout(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)->postJson('/api/logout');

        $response->assertStatus(204);
    }
}
