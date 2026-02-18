<aside class="fixed inset-y-0 left-0 z-30 w-64 bg-gray-900 border-r border-gray-800 flex flex-col transform transition-transform duration-300 lg:translate-x-0"
       :class="sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'">

    {{-- Brand --}}
    <div class="flex items-center gap-3 px-5 py-5 border-b border-gray-800">
        <div class="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-sm shadow shadow-blue-600/40">S</div>
        <div>
            <p class="text-sm font-semibold text-white leading-tight">SLAC FreightLink</p>
            <p class="text-xs text-gray-500">360 Management System</p>
        </div>
    </div>

    {{-- User info --}}
    <div class="flex items-center gap-3 px-5 py-4 border-b border-gray-800">
        <div class="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xs font-semibold flex-shrink-0">
            {{ strtoupper(substr(Auth::user()?->profile?->full_name ?? 'U', 0, 1)) }}
        </div>
        <div class="min-w-0">
            <p class="text-sm font-medium text-white truncate">{{ Auth::user()?->profile?->full_name }}</p>
            <p class="text-xs text-gray-400 capitalize">{{ str_replace('_', ' ', Auth::user()?->getRole() ?? '') }}</p>
        </div>
    </div>

    {{-- Navigation --}}
    <nav class="flex-1 overflow-y-auto px-3 py-4 space-y-0.5">
        @php
            $dept = Auth::user()?->getDepartment();
            $role = Auth::user()?->getRole();
            $isAdmin = Auth::user()?->isAdmin();

            $nav = [
                ['route' => 'dashboard', 'icon' => 'grid', 'label' => 'Dashboard', 'always' => true],
                ['route' => 'shipments.index', 'icon' => 'anchor', 'label' => 'Shipments', 'always' => true],
                ['route' => 'finance.index', 'icon' => 'currency', 'label' => 'Finance', 'depts' => ['accounts', 'management', 'super_admin', 'admin']],
                ['route' => 'banking.index', 'icon' => 'bank', 'label' => 'Banking', 'depts' => ['accounts', 'management', 'super_admin', 'admin']],
                ['route' => 'customers.index', 'icon' => 'users', 'label' => 'Customers', 'always' => true],
                ['route' => 'notifications.index', 'icon' => 'bell', 'label' => 'Notifications', 'always' => true],
                ['route' => 'reports.index', 'icon' => 'chart', 'label' => 'Reports', 'depts' => ['accounts', 'management', 'super_admin', 'admin']],
                ['route' => 'ai.chat', 'icon' => 'sparkles', 'label' => 'AI Assistant', 'always' => true],
            ];
            $adminNav = [
                ['route' => 'admin.users.index', 'label' => 'Staff Users'],
                ['route' => 'admin.clients.index', 'label' => 'Client Accounts'],
                ['route' => 'admin.audit-logs', 'label' => 'Audit Logs'],
            ];
        @endphp

        @foreach($nav as $item)
            @php
                $show = ($item['always'] ?? false) || (isset($item['depts']) && in_array($dept, $item['depts']));
            @endphp
            @if($show)
                <a href="{{ route($item['route']) }}"
                   class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150
                          {{ request()->routeIs($item['route'] . '*') ? 'bg-blue-600/20 text-blue-400' : 'text-gray-400 hover:text-white hover:bg-gray-800' }}">
                    <x-icon name="{{ $item['icon'] }}" class="w-4 h-4 flex-shrink-0" />
                    {{ $item['label'] }}
                </a>
            @endif
        @endforeach

        @if($isAdmin)
            <div class="pt-4 pb-1 px-3">
                <p class="text-xs font-semibold text-gray-600 uppercase tracking-wider">Administration</p>
            </div>
            @foreach($adminNav as $item)
                <a href="{{ route($item['route']) }}"
                   class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150
                          {{ request()->routeIs($item['route'] . '*') ? 'bg-blue-600/20 text-blue-400' : 'text-gray-400 hover:text-white hover:bg-gray-800' }}">
                    {{ $item['label'] }}
                </a>
            @endforeach
        @endif
    </nav>

    {{-- Settings & logout --}}
    <div class="border-t border-gray-800 p-3 space-y-0.5">
        <a href="{{ route('settings.index') }}"
           class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-400 hover:text-white hover:bg-gray-800 transition-colors">
            ⚙ Settings
        </a>
        <form method="POST" action="{{ route('logout') }}">
            @csrf
            <button type="submit" class="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-colors">
                ⇠ Sign Out
            </button>
        </form>
    </div>
</aside>
