@extends('layouts.app')

@section('title', 'Edit Declaration: ' . $declaration->declaration_ref)

@section('content')
<div class="max-w-3xl mx-auto space-y-6">

    <div class="flex items-center gap-4">
        <a href="{{ route('icums.show', $declaration) }}" class="btn-ghost">← Back</a>
        <div>
            <h1 class="text-2xl font-bold text-white">Edit Declaration</h1>
            <p class="text-sm text-gray-400">{{ $declaration->declaration_ref }}</p>
        </div>
    </div>

    <form method="POST" action="{{ route('icums.update', $declaration) }}" class="space-y-6">
        @csrf @method('PUT')

        <div class="card p-6 space-y-5">
            <h2 class="text-base font-semibold text-white border-b border-white/10 pb-3">Declaration Details</h2>

            <div class="grid grid-cols-2 gap-4">
                <div>
                    <label class="label">Declaration Type <span class="text-red-400">*</span></label>
                    <select name="declaration_type" class="input w-full" required>
                        @foreach(['import','export','transit','re-export'] as $type)
                            <option value="{{ $type }}" @selected(old('declaration_type', $declaration->declaration_type) === $type)>
                                {{ ucfirst($type) }}
                            </option>
                        @endforeach
                    </select>
                </div>
                <div>
                    <label class="label">Status</label>
                    <select name="status" class="input w-full">
                        @foreach(['pending','filed','assessed','duty_paid','cleared','held','rejected'] as $s)
                            <option value="{{ $s }}" @selected(old('status', $declaration->status) === $s)>
                                {{ ucwords(str_replace('_', ' ', $s)) }}
                            </option>
                        @endforeach
                    </select>
                </div>
            </div>

            <div class="grid grid-cols-2 gap-4">
                <div>
                    <label class="label">Regime Code</label>
                    <input type="text" name="regime_code" value="{{ old('regime_code', $declaration->regime_code) }}" class="input w-full" placeholder="e.g. IM4">
                </div>
                <div>
                    <label class="label">Customs Reference</label>
                    <input type="text" name="customs_reference" value="{{ old('customs_reference', $declaration->customs_reference) }}" class="input w-full">
                </div>
            </div>

            <div class="grid grid-cols-2 gap-4">
                <div>
                    <label class="label">Filing Date</label>
                    <input type="date" name="filing_date" value="{{ old('filing_date', $declaration->filing_date) }}" class="input w-full">
                </div>
                <div>
                    <label class="label">Assessment Date</label>
                    <input type="date" name="assessment_date" value="{{ old('assessment_date', $declaration->assessment_date) }}" class="input w-full">
                </div>
            </div>
        </div>

        <div class="card p-6 space-y-5">
            <h2 class="text-base font-semibold text-white border-b border-white/10 pb-3">Duty & Taxes</h2>

            <div class="grid grid-cols-3 gap-4">
                <div>
                    <label class="label">CIF Value (USD)</label>
                    <input type="number" step="0.01" name="cif_value" value="{{ old('cif_value', $declaration->cif_value) }}" class="input w-full">
                </div>
                <div>
                    <label class="label">Total Duty (GHS)</label>
                    <input type="number" step="0.01" name="total_duty" value="{{ old('total_duty', $declaration->total_duty) }}" class="input w-full">
                </div>
                <div>
                    <label class="label">Total Levy (GHS)</label>
                    <input type="number" step="0.01" name="total_levy" value="{{ old('total_levy', $declaration->total_levy) }}" class="input w-full">
                </div>
            </div>

            <div class="grid grid-cols-2 gap-4">
                <div>
                    <label class="label">Duty Paid Date</label>
                    <input type="date" name="duty_paid_date" value="{{ old('duty_paid_date', $declaration->duty_paid_date) }}" class="input w-full">
                </div>
                <div>
                    <label class="label">Clearance Date</label>
                    <input type="date" name="clearance_date" value="{{ old('clearance_date', $declaration->clearance_date) }}" class="input w-full">
                </div>
            </div>
        </div>

        <div class="card p-6 space-y-4">
            <h2 class="text-base font-semibold text-white border-b border-white/10 pb-3">Notes</h2>
            <textarea name="notes" rows="4" class="input w-full resize-none" placeholder="Additional notes…">{{ old('notes', $declaration->notes) }}</textarea>
        </div>

        <div class="flex items-center justify-end gap-3">
            <a href="{{ route('icums.show', $declaration) }}" class="btn-ghost">Cancel</a>
            <button type="submit" class="btn-primary">Save Changes</button>
        </div>
    </form>
</div>
@endsection
