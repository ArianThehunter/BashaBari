<?php

namespace Database\Seeders;

use App\Models\Permission;
use App\Models\Role;
use Illuminate\Database\Seeder;

class RoleAndPermissionSeeder extends Seeder
{
    /**
     * Seed system roles and permissions.
     */
    public function run(): void
    {
        // System Permissions
        $permissions = [
            // Properties
            ['name' => 'properties.view', 'group_name' => 'properties', 'description' => 'View properties and units'],
            ['name' => 'properties.create', 'group_name' => 'properties', 'description' => 'Create new properties and units'],
            ['name' => 'properties.update', 'group_name' => 'properties', 'description' => 'Edit property and unit details'],
            ['name' => 'properties.delete', 'group_name' => 'properties', 'description' => 'Delete properties and units'],

            // Tenants
            ['name' => 'tenants.view', 'group_name' => 'tenants', 'description' => 'View tenant profiles'],
            ['name' => 'tenants.create', 'group_name' => 'tenants', 'description' => 'Add new tenants'],
            ['name' => 'tenants.update', 'group_name' => 'tenants', 'description' => 'Update tenant information'],
            ['name' => 'tenants.delete', 'group_name' => 'tenants', 'description' => 'Archive or delete tenant records'],

            // Financials (Rent & Invoices)
            ['name' => 'finances.view', 'group_name' => 'finances', 'description' => 'View financial records and invoices'],
            ['name' => 'finances.invoices.generate', 'group_name' => 'finances', 'description' => 'Generate rent and utility invoices'],
            ['name' => 'finances.payments.record', 'group_name' => 'finances', 'description' => 'Record rent payments and generate receipts'],
            ['name' => 'finances.reports.view', 'group_name' => 'finances', 'description' => 'View detailed financial & revenue reports'],

            // Expenses & Vendors
            ['name' => 'expenses.view', 'group_name' => 'expenses', 'description' => 'View property expenses'],
            ['name' => 'expenses.create', 'group_name' => 'expenses', 'description' => 'Record property expenses'],
            ['name' => 'expenses.approve', 'group_name' => 'expenses', 'description' => 'Approve property expenses'],

            // Maintenance
            ['name' => 'maintenance.view', 'group_name' => 'maintenance', 'description' => 'View maintenance requests'],
            ['name' => 'maintenance.manage', 'group_name' => 'maintenance', 'description' => 'Create, assign, and update maintenance requests'],

            // Organization & Team
            ['name' => 'organization.settings', 'group_name' => 'organization', 'description' => 'Manage organization settings'],
            ['name' => 'organization.members.manage', 'group_name' => 'organization', 'description' => 'Invite, assign roles, or remove team members'],
        ];

        foreach ($permissions as $perm) {
            Permission::firstOrCreate(['name' => $perm['name']], $perm);
        }

        // System Roles
        $ownerRole = Role::firstOrCreate(
            ['slug' => 'owner', 'organization_id' => null],
            ['name' => 'Owner', 'is_system' => true]
        );

        $caretakerRole = Role::firstOrCreate(
            ['slug' => 'caretaker', 'organization_id' => null],
            ['name' => 'Caretaker', 'is_system' => true]
        );

        $accountantRole = Role::firstOrCreate(
            ['slug' => 'accountant', 'organization_id' => null],
            ['name' => 'Accountant', 'is_system' => true]
        );

        $tenantRole = Role::firstOrCreate(
            ['slug' => 'tenant', 'organization_id' => null],
            ['name' => 'Tenant', 'is_system' => true]
        );

        // Sync Owner Permissions (All)
        $allPermissionIds = Permission::pluck('id')->toArray();
        $ownerRole->permissions()->sync($allPermissionIds);

        // Caretaker Permissions
        $caretakerPerms = Permission::whereIn('name', [
            'properties.view',
            'tenants.view',
            'tenants.create',
            'tenants.update',
            'finances.payments.record',
            'expenses.view',
            'expenses.create',
            'maintenance.view',
            'maintenance.manage',
        ])->pluck('id')->toArray();
        $caretakerRole->permissions()->sync($caretakerPerms);

        // Accountant Permissions
        $accountantPerms = Permission::whereIn('name', [
            'properties.view',
            'tenants.view',
            'finances.view',
            'finances.invoices.generate',
            'finances.payments.record',
            'finances.reports.view',
            'expenses.view',
            'expenses.create',
            'expenses.approve',
        ])->pluck('id')->toArray();
        $accountantRole->permissions()->sync($accountantPerms);

        // Tenant Permissions
        $tenantPerms = Permission::whereIn('name', [
            'maintenance.view',
        ])->pluck('id')->toArray();
        $tenantRole->permissions()->sync($tenantPerms);
    }
}
