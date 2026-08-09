<?php

namespace Database\Seeders;

use App\Models\BuildingStaff;
use App\Models\Organization;
use App\Models\Property;
use App\Models\StaffDutyLog;
use App\Models\VendorVisitLog;
use Illuminate\Database\Seeder;

class BuildingStaffSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $organization = Organization::first();
        if (!$organization) return;

        $property = Property::where('organization_id', $organization->id)->first();
        if (!$property) return;

        // Use Case 1 & 2: Dedicated Caretaker & Dedicated Guard co-existing
        $caretaker = BuildingStaff::create([
            'organization_id' => $organization->id,
            'property_id' => $property->id,
            'name' => 'Motiur Rahman',
            'phone' => '01711223344',
            'nid_number' => '19852691234567890',
            'is_caretaker' => true,
            'is_security_guard' => false,
            'is_agency_contracted' => false,
            'is_owner_manager' => false,
            'staff_role' => 'caretaker',
            'employment_type' => 'direct_employed',
            'shift_type' => 'day_shift',
            'shift_hours' => '07:00 AM - 07:00 PM',
            'monthly_salary' => 1500000, // ৳15,000
            'status' => 'active',
            'joining_date' => '2024-01-01',
            'notes' => 'Head caretaker for Dhanmondi Residence',
        ]);

        $guard = BuildingStaff::create([
            'organization_id' => $organization->id,
            'property_id' => $property->id,
            'name' => 'Jahangir Alam',
            'phone' => '01811334455',
            'nid_number' => '19902691234567891',
            'is_caretaker' => false,
            'is_security_guard' => true,
            'is_agency_contracted' => false,
            'is_owner_manager' => false,
            'staff_role' => 'security_guard',
            'employment_type' => 'direct_employed',
            'shift_type' => 'night_shift',
            'shift_hours' => '07:00 PM - 07:00 AM',
            'monthly_salary' => 1400000, // ৳14,000
            'status' => 'active',
            'joining_date' => '2024-03-01',
            'notes' => 'Night shift security guard',
        ]);

        // Use Case 1: Dual-Duty Guard & Caretaker
        $dualStaff = BuildingStaff::create([
            'organization_id' => $organization->id,
            'property_id' => $property->id,
            'name' => 'Abdul Karim',
            'phone' => '01911445566',
            'nid_number' => '19882691234567892',
            'is_caretaker' => true,
            'is_security_guard' => true,
            'is_agency_contracted' => false,
            'is_owner_manager' => false,
            'staff_role' => 'guard_caretaker_dual',
            'employment_type' => 'direct_employed',
            'shift_type' => '24h_duty',
            'shift_hours' => '24-Hour Duty & Gate Management',
            'monthly_salary' => 1800000, // ৳18,000
            'status' => 'active',
            'joining_date' => '2023-06-15',
            'notes' => 'Performs both security gate duty and caretaker building maintenance.',
        ]);

        // Use Case 3: Agency Contracted Security (Monthly Rotation)
        $agencyGuard = BuildingStaff::create([
            'organization_id' => $organization->id,
            'property_id' => $property->id,
            'name' => 'Elite Security Rotation Guard',
            'phone' => '01700998877',
            'is_caretaker' => false,
            'is_security_guard' => true,
            'is_agency_contracted' => true,
            'is_owner_manager' => false,
            'staff_role' => 'security_guard',
            'employment_type' => 'agency_contracted',
            'agency_name' => 'Elite Security Bangladesh Ltd.',
            'shift_type' => 'rotation',
            'shift_hours' => 'Monthly Rotation Shift',
            'monthly_salary' => 2500000, // ৳25,000 agency fee
            'status' => 'active',
            'joining_date' => '2024-02-01',
            'notes' => 'Contracted security agency operating on monthly guard rotation.',
        ]);

        // Seed sample duty log entries
        StaffDutyLog::create([
            'building_staff_id' => $dualStaff->id,
            'action_type' => 'role_change',
            'previous_role' => 'security_guard',
            'new_role' => 'guard_caretaker_dual',
            'notes' => 'Transitioned to Dual-Duty Guard & Caretaker when previous caretaker resigned.',
        ]);

        // Seed sample vendor/technician visit log
        VendorVisitLog::create([
            'organization_id' => $organization->id,
            'property_id' => $property->id,
            'recorded_by_staff_id' => $caretaker->id,
            'technician_name' => 'Kalam Hossain',
            'technician_phone' => '01755667788',
            'company_name' => 'Dhaka Electric & Plumbing Repair',
            'service_category' => 'plumbing',
            'entry_time' => now()->subHours(3),
            'exit_time' => now()->subHour(),
            'purpose_of_visit' => 'Repaired main water line leak on 3rd floor.',
            'amount_paid' => 150000, // ৳1,500
            'payment_method' => 'cash',
            'receipt_reference' => 'RCT-202608-PLUMB',
            'status' => 'completed',
        ]);
    }
}
