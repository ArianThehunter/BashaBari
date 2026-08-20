<?php

namespace App\Http\Requests;

class StorePaymentRequest extends OrganizationFormRequest
{
    public function rules(): array
    {
        return [
            'tenant_id' => ['required', 'integer', $this->orgExistsActive('tenants')],
            'invoice_id' => ['nullable', 'integer', $this->orgExistsActive('invoices')],
            'unit_id' => ['nullable', 'integer', $this->orgExistsActive('units')],
            'payment_method' => ['required', 'string', 'in:sslcommerz,bkash,nagad,rocket,bank_transfer,cash,cheque'],
            'amount_bdt' => ['required', 'numeric', 'min:1', 'max:100000000'],
            'payment_date' => ['required', 'date', 'before_or_equal:today'],
            'reference_number' => ['nullable', 'string', 'max:100'],
            'notes' => ['nullable', 'string', 'max:2000'],
        ];
    }

    public function messages(): array
    {
        return [
            'tenant_id.exists' => 'The selected tenant could not be found.',
            'invoice_id.exists' => 'The selected invoice could not be found.',
            'unit_id.exists' => 'The selected unit could not be found.',
            'payment_date.before_or_equal' => 'A payment cannot be dated in the future.',
        ];
    }
}
