<?php

namespace Tests\Feature;

use App\Models\Customer;
use App\Models\Shipment;
use App\Models\User;
use App\Models\Profile;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ShipmentTest extends TestCase
{
    use RefreshDatabase;

    private User $admin;

    protected function setUp(): void
    {
        parent::setUp();

        $this->admin = User::factory()->create();
        Profile::factory()->create([
            'user_id'    => $this->admin->id,
            'department' => 'operations',
            'role'       => 'admin',
            'is_active'  => true,
            'is_locked'  => false,
            'must_change_password' => false,
        ]);
        $this->actingAs($this->admin);
    }

    /** @test */
    public function shipments_index_is_accessible(): void
    {
        $response = $this->get(route('shipments.index'));
        $response->assertStatus(200);
    }

    /** @test */
    public function can_create_a_shipment(): void
    {
        $customer = Customer::factory()->create();

        $response = $this->post(route('shipments.store'), [
            'customer_id'       => $customer->id,
            'type'              => 'sea',
            'bl_number'         => 'BL-TEST-001',
            'origin_country'    => 'China',
            'origin_port'       => 'Shanghai',
            'destination_port'  => 'Tema',
            'cargo_description' => 'Test cargo',
            'status'            => 'booked',
        ]);

        $this->assertDatabaseHas('shipments', ['bl_number' => 'BL-TEST-001']);
    }

    /** @test */
    public function can_update_shipment_status(): void
    {
        $customer = Customer::factory()->create();
        $shipment = Shipment::factory()->create(['customer_id' => $customer->id, 'status' => 'booked']);

        $response = $this->patch(route('shipments.update-status', $shipment), [
            'status' => 'in_transit',
        ]);

        $response->assertRedirect();
        $this->assertDatabaseHas('shipments', ['id' => $shipment->id, 'status' => 'in_transit']);
    }
}
