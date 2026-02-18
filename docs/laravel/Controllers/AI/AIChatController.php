<?php

namespace App\Http\Controllers\AI;

use App\Http\Controllers\Controller;
use App\Http\Requests\AI\AIChatRequest;
use App\Models\AiInteraction;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Symfony\Component\HttpFoundation\StreamedResponse;

class AIChatController extends Controller
{
    /**
     * Department-aware AI chat with streaming response.
     * POST /api/v1/ai/chat  (SSE: text/event-stream)
     *
     * Rate limit: 10 requests/minute per user (configured in RouteServiceProvider).
     */
    public function chat(AIChatRequest $request): StreamedResponse
    {
        $user       = $request->user();
        $department = $user->getDepartment() ?? 'default';
        $prompt     = $request->prompt;
        $module     = $request->module ?? 'general';

        $systemPrompt = $this->buildSystemPrompt($department);

        return response()->stream(function () use ($user, $department, $module, $prompt, $systemPrompt) {
            $fullResponse = '';

            $response = Http::withHeaders([
                'Authorization' => 'Bearer ' . config('services.openai.key'),
                'Content-Type'  => 'application/json',
            ])->withOptions(['stream' => true])
              ->post(config('services.openai.url', 'https://api.openai.com') . '/v1/chat/completions', [
                  'model'    => config('services.ai.model', 'google/gemini-2.5-flash'),
                  'stream'   => true,
                  'messages' => [
                      ['role' => 'system', 'content' => $systemPrompt],
                      ['role' => 'user', 'content' => $prompt],
                  ],
              ]);

            $body = $response->getBody();

            while (! $body->eof()) {
                $line = $body->read(512);

                foreach (explode("\n", $line) as $part) {
                    $part = trim($part);

                    if (str_starts_with($part, 'data: ') && $part !== 'data: [DONE]') {
                        $json  = json_decode(substr($part, 6), true);
                        $delta = $json['choices'][0]['delta']['content'] ?? '';

                        if ($delta !== '') {
                            $fullResponse .= $delta;
                            echo "data: " . json_encode(['content' => $delta]) . "\n\n";
                            ob_flush();
                            flush();
                        }
                    }
                }
            }

            // Persist the interaction
            AiInteraction::create([
                'user_id'    => $user->id,
                'department' => $department,
                'module'     => $module,
                'prompt'     => $prompt,
                'response'   => $fullResponse,
                'model'      => config('services.ai.model', 'google/gemini-2.5-flash'),
            ]);

            echo "data: [DONE]\n\n";
            ob_flush();
            flush();
        }, 200, [
            'Content-Type'      => 'text/event-stream',
            'Cache-Control'     => 'no-cache',
            'X-Accel-Buffering' => 'no',
        ]);
    }

    // ── Private helpers ───────────────────────────────────────────

    private function buildSystemPrompt(string $department): string
    {
        $base = "You are SLAC FreightLink 360 AI Assistant — an expert logistics and freight management system for SLAC Ghana.\n\n";

        $prompts = [
            'operations'       => $base . "Focus on: shipment tracking, container status, ETAs, vessel schedules, port congestion, and customs clearance timelines. Provide concise, actionable shipping intelligence.",
            'documentation'    => $base . "Focus on: document requirements for customs clearance, HS code classification, bill of lading, certificates of origin, import permits, and ICUMS/GPHA compliance.",
            'accounts'         => $base . "Focus on: outstanding invoices, payment status, cash flow summaries, overdue accounts, expense approvals, job costing, and GHS/USD currency calculations.",
            'management'       => $base . "Focus on: executive KPIs, shipment volumes, revenue trends, department performance, risk indicators, and high-level business summaries.",
            'warehouse'        => $base . "Focus on: cargo storage, container unstuffing, space management, inventory tracking, and warehouse operations.",
            'customer_service' => $base . "Focus on: client communications, shipment status updates, issue resolution, client portal guidance, and relationship management.",
            'marketing'        => $base . "Focus on: client acquisition, freight market trends, service offerings, and competitor analysis.",
            'default'          => $base . "You are a general assistant for SLAC FreightLink 360. Answer questions about freight, logistics, and company operations.",
        ];

        return $prompts[$department] ?? $prompts['default'];
    }
}
