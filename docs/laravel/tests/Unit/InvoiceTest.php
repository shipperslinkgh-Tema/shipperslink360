<?php

namespace Tests\Unit;

use App\Models\FinanceInvoice;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class InvoiceTest extends TestCase
{
    use RefreshDatabase;

    /** @test */
    public function invoice_is_marked_overdue_when_past_due_date(): void
    {
        $invoice = FinanceInvoice::factory()->create([
            'status'   => 'sent',
            'due_date' => now()->subDays(5)->toDateString(),
        ]);

        $this->assertTrue($invoice->isOverdue());
    }

    /** @test */
    public function paid_invoice_is_not_overdue(): void
    {
        $invoice = FinanceInvoice::factory()->create([
            'status'   => 'paid',
            'due_date' => now()->subDays(5)->toDateString(),
        ]);

        $this->assertFalse($invoice->isOverdue());
    }

    /** @test */
    public function recording_full_payment_marks_invoice_paid(): void
    {
        $invoice = FinanceInvoice::factory()->create([
            'status'       => 'sent',
            'total_amount' => 5000,
            'paid_amount'  => 0,
        ]);

        $invoice->recordPayment(5000, now()->toDateString(), 'bank_transfer');

        $this->assertEquals('paid', $invoice->fresh()->status);
    }
}
