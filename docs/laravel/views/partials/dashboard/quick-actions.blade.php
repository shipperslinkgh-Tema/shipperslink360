{{-- Dashboard Quick Actions Partial --}}
<div class="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
    <div class="px-6 py-4 border-b border-gray-800">
        <h3 class="text-sm font-semibold text-white">Quick Actions</h3>
    </div>
    <div class="p-4 grid grid-cols-2 gap-3">
        @php
            $dept = Auth::user()?->getDepartment();
            $actions = [
                ['label' => 'New Shipment',    'route' => 'shipments.create',     'icon' => 'M12 4v16m8-8H4',      'dept' => ['operations','documentation','super_admin','management']],
                ['label' => 'New Invoice',     'route' => 'invoicing.create',     'icon' => 'M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z', 'dept' => ['accounts','management','super_admin']],
                ['label' => 'Log Expense',     'route' => 'finance.expenses.create','icon' => 'M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z', 'dept' => ['accounts','management','super_admin']],
                ['label' => 'New Customer',    'route' => 'customers.create',     'icon' => 'M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z', 'dept' => ['management','super_admin','customer_service','marketing']],
                ['label' => 'ICUMS Filing',    'route' => 'icums.create',         'icon' => 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z', 'dept' => ['documentation','operations','super_admin','management']],
                ['label' => 'Notifications',   'route' => 'notifications.index',  'icon' => 'M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9', 'dept' => null],
            ];
        @endphp
        @foreach($actions as $action)
            @if($action['dept'] === null || in_array($dept, $action['dept']))
                <a href="{{ route($action['route']) }}"
                   class="flex flex-col items-center justify-center gap-2 p-4 bg-gray-800 hover:bg-gray-750 border border-gray-700 rounded-xl transition-colors text-center group">
                    <svg class="w-6 h-6 text-blue-400 group-hover:text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="{{ $action['icon'] }}"/>
                    </svg>
                    <span class="text-xs text-gray-300 font-medium leading-tight">{{ $action['label'] }}</span>
                </a>
            @endif
        @endforeach
    </div>
</div>
