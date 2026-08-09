<?php

namespace Database\Seeders;

use App\Models\UtilityProvider;
use Illuminate\Database\Seeder;

class UtilityProviderSeeder extends Seeder
{
    /**
     * Run the database seeds for all 10 nationwide Bangladesh utility companies.
     */
    public function run(): void
    {
        $providers = [
            // ---- Electricity Utilities ----
            [
                'name' => 'DPDC (Dhaka Power Distribution Company)',
                'code' => 'DPDC',
                'type' => 'electricity',
                'default_rate_per_unit_poisha' => 850,
                'description' => 'Supplies power to central and western parts of Dhaka city and surrounding areas.',
            ],
            [
                'name' => 'DESCO (Dhaka Electric Supply Company)',
                'code' => 'DESCO',
                'type' => 'electricity',
                'default_rate_per_unit_poisha' => 850,
                'description' => 'Distributes electricity across major residential and commercial zones in northern and eastern Dhaka.',
            ],
            [
                'name' => 'BREB (Bangladesh Rural Electrification Board)',
                'code' => 'BREB',
                'type' => 'electricity',
                'default_rate_per_unit_poisha' => 750,
                'description' => 'Operates through rural electric cooperatives to supply electricity across rural and semi-urban communities nationwide.',
            ],
            [
                'name' => 'NESCO (Northern Electricity Supply PLC)',
                'code' => 'NESCO',
                'type' => 'electricity',
                'default_rate_per_unit_poisha' => 800,
                'description' => 'Delivers power to consumers in the northern divisions of Rajshahi and Rangpur.',
            ],
            [
                'name' => 'WZPDCL (West Zone Power Distribution Company Limited)',
                'code' => 'WZPDCL',
                'type' => 'electricity',
                'default_rate_per_unit_poisha' => 800,
                'description' => 'Provides electricity to southwestern districts including Khulna and Barishal zones.',
            ],

            // ---- Gas Utilities ----
            [
                'name' => 'Titas Gas Transmission & Distribution',
                'code' => 'TITAS',
                'type' => 'gas',
                'default_rate_per_unit_poisha' => 1050,
                'description' => 'Serves the greater Dhaka and Mymensingh regions, making up the largest natural gas distribution network.',
            ],
            [
                'name' => 'Karnaphuli Gas Distribution Company',
                'code' => 'KARNAPHULI',
                'type' => 'gas',
                'default_rate_per_unit_poisha' => 1050,
                'description' => 'Manages natural gas supply and consumer distribution lines within the Chattogram division.',
            ],
            [
                'name' => 'Jalalabad Gas Transmission & Distribution System',
                'code' => 'JALALABAD',
                'type' => 'gas',
                'default_rate_per_unit_poisha' => 1050,
                'description' => 'Oversees gas connections and distribution for the Sylhet division.',
            ],

            // ---- Water Utilities ----
            [
                'name' => 'DWASA (Dhaka Water Supply and Sewerage Authority)',
                'code' => 'DWASA',
                'type' => 'water',
                'default_rate_per_unit_poisha' => 1550,
                'description' => 'Provides piped water supply, sewage disposal, and drainage services to Dhaka and Narayanganj.',
            ],
            [
                'name' => 'CWASA (Chittagong Water Supply and Sewerage Authority)',
                'code' => 'CWASA',
                'type' => 'water',
                'default_rate_per_unit_poisha' => 1500,
                'description' => 'Administers municipal water supply and sanitation infrastructure across Chattogram metropolitan area.',
            ],
        ];

        foreach ($providers as $provider) {
            UtilityProvider::updateOrCreate(['code' => $provider['code']], $provider);
        }
    }
}
