<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Profile;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules;

class AdminUserController extends Controller
{
    public function __construct()
    {
        $this->middleware(['auth', 'role:super_admin,admin']);
    }

    public function index()
    {
        $users = User::with('profile')->paginate(20);
        return view('admin.users.index', compact('users'));
    }

    public function create()
    {
        $departments = config('shipperlink.departments');
        $roles       = config('shipperlink.roles');
        return view('admin.users.create', compact('departments', 'roles'));
    }

    public function store(Request $request)
    {
        $request->validate([
            'full_name'  => 'required|string|max:100',
            'email'      => 'required|email|unique:users,email',
            'username'   => 'required|string|unique:profiles,username',
            'staff_id'   => 'required|string|unique:profiles,staff_id',
            'department' => 'required|string',
            'role'       => 'required|string',
            'phone'      => 'nullable|string|max:20',
        ]);

        $user = User::create([
            'name'     => $request->full_name,
            'email'    => $request->email,
            'password' => Hash::make($request->staff_id), // default password = staff ID
        ]);

        Profile::create([
            'user_id'              => $user->id,
            'full_name'            => $request->full_name,
            'staff_id'             => $request->staff_id,
            'username'             => $request->username,
            'email'                => $request->email,
            'phone'                => $request->phone,
            'department'           => $request->department,
            'role'                 => $request->role,
            'must_change_password' => true,
        ]);

        return redirect()->route('admin.users.index')->with('success', "User {$request->full_name} created. Default password: {$request->staff_id}");
    }

    public function edit(User $user)
    {
        $user->load('profile');
        $departments = config('shipperlink.departments');
        $roles       = config('shipperlink.roles');
        return view('admin.users.edit', compact('user', 'departments', 'roles'));
    }

    public function update(Request $request, User $user)
    {
        $request->validate([
            'full_name'  => 'required|string|max:100',
            'department' => 'required|string',
            'role'       => 'required|string',
            'phone'      => 'nullable|string|max:20',
        ]);

        $user->update(['name' => $request->full_name]);
        $user->profile?->update($request->only(['full_name', 'department', 'role', 'phone']));

        return redirect()->route('admin.users.index')->with('success', 'User updated.');
    }

    public function toggleLock(User $user)
    {
        $profile = $user->profile;
        $locked  = !$profile->is_locked;
        $profile->update(['is_locked' => $locked, 'locked_at' => $locked ? now() : null]);
        return back()->with('success', $locked ? 'User locked.' : 'User unlocked.');
    }

    public function resetPassword(User $user)
    {
        $staffId = $user->profile->staff_id;
        $user->update(['password' => Hash::make($staffId)]);
        $user->profile?->update(['must_change_password' => true]);
        return back()->with('success', "Password reset to staff ID: {$staffId}");
    }

    public function destroy(User $user)
    {
        $user->profile?->delete();
        $user->delete();
        return redirect()->route('admin.users.index')->with('success', 'User removed.');
    }
}
