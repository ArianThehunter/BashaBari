<?php

namespace App\Http\Requests;

class InitiateSslcommerzRequest extends OrganizationFormRequest
{
    public function rules(): array
    {
        return [
            'invoice_id' => ['required', 'integer', $this->orgExistsActive('invoices')],
        ];
    }

    public function messages(): array
    {
        return [
            'invoice_id.exists' => 'The selected invoice could not be found.',
        ];
    }
}
