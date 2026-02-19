<?php

namespace App\Traits;

trait HasDepartmentAccess
{
    /**
     * Check if the user's department is in the allowed list.
     */
    public function hasDepartmentAccess(array $departments): bool
    {
        $dept = $this->getDepartment();
        return in_array($dept, array_merge($departments, ['management', 'super_admin']));
    }
}
