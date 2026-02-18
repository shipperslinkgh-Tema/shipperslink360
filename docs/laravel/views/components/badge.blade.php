@props(['status' => '', 'type' => 'generic'])
@php
    $shipment = ['pending'=>'bg-gray-700 text-gray-300','in_transit'=>'bg-blue-500/20 text-blue-400','arrived'=>'bg-purple-500/20 text-purple-400','customs'=>'bg-amber-500/20 text-amber-400','cleared'=>'bg-emerald-500/20 text-emerald-400','delivered'=>'bg-green-500/20 text-green-400'];
    $invoice  = ['draft'=>'bg-gray-700 text-gray-300','sent'=>'bg-blue-500/20 text-blue-400','partially_paid'=>'bg-amber-500/20 text-amber-400','paid'=>'bg-emerald-500/20 text-emerald-400','overdue'=>'bg-red-500/20 text-red-400','disputed'=>'bg-orange-500/20 text-orange-400','cancelled'=>'bg-gray-800 text-gray-500'];
    $role     = ['super_admin'=>'bg-purple-500/20 text-purple-400','admin'=>'bg-blue-500/20 text-blue-400','manager'=>'bg-amber-500/20 text-amber-400','staff'=>'bg-gray-700 text-gray-300'];
    $match    = ['matched'=>'bg-emerald-500/20 text-emerald-400','partial'=>'bg-amber-500/20 text-amber-400','manual'=>'bg-blue-500/20 text-blue-400','unmatched'=>'bg-gray-700 text-gray-300'];
    $maps = ['shipment'=>$shipment,'invoice'=>$invoice,'role'=>$role,'match'=>$match];
    $cls  = $maps[$type][$status] ?? 'bg-gray-700 text-gray-300';
@endphp
<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium {{ $cls }} capitalize">
    {{ str_replace('_', ' ', $status) }}
</span>
