<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Concerns\ScopesToOrganization;

abstract class Controller
{
    use ScopesToOrganization;
}
