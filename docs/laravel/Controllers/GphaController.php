<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class GphaController extends Controller
{
    public function index()
    {
        // GPHA port status - would integrate with GPHA API
        $portStats = [
            'tema' => [
                'vessels_at_berth'  => 12,
                'vessels_expected'  => 8,
                'containers_awaiting' => 346,
                'congestion_level'  => 'moderate',
                'gate_status'       => 'open',
            ],
            'takoradi' => [
                'vessels_at_berth'   => 4,
                'vessels_expected'   => 2,
                'containers_awaiting'=> 89,
                'congestion_level'   => 'low',
                'gate_status'        => 'open',
            ],
        ];

        return view('customs.gpha.index', compact('portStats'));
    }
}
