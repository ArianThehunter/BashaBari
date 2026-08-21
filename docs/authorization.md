# Bariwala Hub — Authorization Model

## Overview

Authorization is enforced at **4 layers**, from outermost to innermost:

1. **Authentication middleware** (`auth:sanctum`) — Is the user logged in?
2. **Organization resolution** (`organization`) — Which organization is active?
   Resolves from the `X-Organization-Id` header, falling back to the caller's
   single active membership. **Fails closed**: if no organization resolves, or
   the caller is not an active member of the one requested, the request is
   rejected with `403` before reaching a controller.
3. **Permission middleware** (`org.permission:<name>`) — Does the caller's role
   grant this action? Declared per route in `routes/api.php`, resolved against
   the roles and permissions seeded by `RoleAndPermissionSeeder`. Owners hold
   every permission implicitly; a member with no role holds none.
4. **Global Eloquent scope** (`BelongsToOrganization`) — Every query on an
   org-scoped model is filtered by `organization_id`. Inside a tenant-scoped
   request, a missing organization context **throws** rather than running the
   query unscoped.

Because layer 4 guarantees a record belongs to the active organization,
record-level ownership needs no separate policy class; route-level permissions
carry the rest of the matrix below. Laravel Policies are therefore not used.

`property_access` on a membership (a list of property ids) is available for
restricting a caretaker to specific properties via
`OrganizationMember::accessiblePropertyIds()`. **This is not yet applied to
queries** — a caretaker currently sees every property in their organization.

The frontend hides UI elements for unauthorized actions (for UX), but this is
**never** the security boundary. All authorization is enforced server-side.

## Roles

### Platform Level

| Role | Scope | Purpose |
|------|-------|---------|
| **Platform Admin** | Entire platform | Manages organizations, users, subscriptions, metrics |
| **User** | Default | Normal authenticated user (must have org membership for access) |

### Organization Level

| Role | Scope | Purpose |
|------|-------|---------|
| **Owner** | Full organization | All permissions within the organization |
| **Caretaker** | Assigned properties | Operational access, configurable permissions |
| **Accountant** | Financial data | Financial records, no private tenant PII |
| **Tenant** | Own data only | View own lease, invoices, payments, maintenance |

## Permission Matrix

### Property Management

| Action | Owner | Caretaker | Accountant | Tenant |
|--------|-------|-----------|------------|--------|
| Create property | ✅ | ❌ | ❌ | ❌ |
| View property | ✅ | ✅ (assigned) | ✅ (name only) | ❌ |
| Update property | ✅ | ❌ | ❌ | ❌ |
| Delete property | ✅ | ❌ | ❌ | ❌ |
| Manage buildings/floors/units | ✅ | ❌ | ❌ | ❌ |
| View units | ✅ | ✅ (assigned) | ✅ (financial view) | ✅ (own unit) |

### Tenant Management

| Action | Owner | Caretaker | Accountant | Tenant |
|--------|-------|-----------|------------|--------|
| Add tenant | ✅ | ✅ (assigned properties) | ❌ | ❌ |
| View tenant profile | ✅ | ✅ (assigned) | 🔶 (financial fields only) | ✅ (own) |
| View tenant documents | ✅ | ✅ (assigned) | ❌ | ✅ (own) |
| Update tenant | ✅ | ✅ (assigned) | ❌ | 🔶 (own profile only) |
| View tenant NID | ✅ | ❌ | ❌ | ✅ (own) |

### Financial Operations

| Action | Owner | Caretaker | Accountant | Tenant |
|--------|-------|-----------|------------|--------|
| View invoices | ✅ | ✅ (assigned) | ✅ | ✅ (own) |
| Generate invoices | ✅ | ❌ | ✅ | ❌ |
| Record payment | ✅ | ✅ (assigned) | ✅ | ❌ |
| View payments | ✅ | ✅ (assigned) | ✅ | ✅ (own) |
| Generate receipt | ✅ | ✅ (assigned) | ✅ | ❌ |
| View receipts | ✅ | ✅ (assigned) | ✅ | ✅ (own) |
| View/create expenses | ✅ | ✅ (assigned) | ✅ | ❌ |
| View financial reports | ✅ | ❌ | ✅ | ❌ |
| Manage vendors | ✅ | ✅ (assigned) | ✅ | ❌ |

### Maintenance

| Action | Owner | Caretaker | Accountant | Tenant |
|--------|-------|-----------|------------|--------|
| Create request | ✅ | ✅ | ❌ | ✅ (own unit) |
| View requests | ✅ | ✅ (assigned) | ❌ | ✅ (own) |
| Update status | ✅ | ✅ (assigned) | ❌ | ❌ |
| Assign vendor/staff | ✅ | ✅ (assigned) | ❌ | ❌ |

### Organization & Staff

| Action | Owner | Caretaker | Accountant | Tenant |
|--------|-------|-----------|------------|--------|
| Manage organization settings | ✅ | ❌ | ❌ | ❌ |
| Manage roles/permissions | ✅ | ❌ | ❌ | ❌ |
| Manage staff | ✅ | ❌ | ❌ | ❌ |
| View staff salary | ✅ | ❌ | 🔶 (if authorized) | ❌ |

**Legend:** ✅ Full access | 🔶 Partial/conditional | ❌ No access

## Implementation

### Database Schema

```sql
-- Roles are per-organization (allows customization)
CREATE TABLE roles (
    id BIGSERIAL PRIMARY KEY,
    organization_id BIGINT REFERENCES organizations(id),
    name VARCHAR(50) NOT NULL,        -- 'owner', 'caretaker', 'accountant', 'tenant'
    slug VARCHAR(50) NOT NULL,
    is_system BOOLEAN DEFAULT FALSE,  -- system roles cannot be deleted
    created_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ,
    UNIQUE(organization_id, slug)
);

-- Granular permissions
CREATE TABLE permissions (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,  -- 'properties.create', 'payments.record'
    group_name VARCHAR(50),              -- 'properties', 'payments', etc.
    description TEXT
);

-- Role-permission mapping
CREATE TABLE role_permissions (
    id BIGSERIAL PRIMARY KEY,
    role_id BIGINT REFERENCES roles(id) ON DELETE CASCADE,
    permission_id BIGINT REFERENCES permissions(id) ON DELETE CASCADE,
    UNIQUE(role_id, permission_id)
);

-- User membership in organization
CREATE TABLE organization_members (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
    organization_id BIGINT REFERENCES organizations(id) ON DELETE CASCADE,
    role_id BIGINT REFERENCES roles(id),
    property_access JSONB DEFAULT NULL,  -- NULL = all properties, [1,2,3] = specific
    status VARCHAR(20) DEFAULT 'active', -- 'active', 'inactive'
    created_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ,
    UNIQUE(user_id, organization_id)
);
```

### Laravel Policy Example

```php
class PropertyPolicy
{
    public function viewAny(User $user): bool
    {
        // All org members can list properties (filtered by their access)
        return $user->hasOrganizationMembership();
    }

    public function view(User $user, Property $property): bool
    {
        // Must belong to same org AND have property access
        return $user->belongsToOrganization($property->organization_id)
            && $user->hasPropertyAccess($property->id);
    }

    public function create(User $user): bool
    {
        return $user->hasPermission('properties.create');
    }

    public function update(User $user, Property $property): bool
    {
        return $user->belongsToOrganization($property->organization_id)
            && $user->hasPermission('properties.update');
    }

    public function delete(User $user, Property $property): bool
    {
        return $user->belongsToOrganization($property->organization_id)
            && $user->hasPermission('properties.delete');
    }
}
```

### Organization Scope Middleware

```php
class ResolveOrganization
{
    public function handle(Request $request, Closure $next)
    {
        $user = $request->user();
        $orgId = $request->header('X-Organization-Id')
              ?? $user->default_organization_id;

        // Verify user belongs to this organization
        $membership = $user->memberships()
            ->where('organization_id', $orgId)
            ->where('status', 'active')
            ->first();

        if (!$membership) {
            abort(403, 'Access denied to this organization.');
        }

        // Set org context for the request
        app()->instance('current_organization', $membership->organization);
        app()->instance('current_membership', $membership);

        return $next($request);
    }
}
```

## Cross-Tenant Security Tests

The following must be tested:

1. User A (Org 1) cannot view User B's (Org 2) properties.
2. User A cannot access Org 2's tenants, invoices, or payments.
3. Caretaker in Org 1 cannot view properties they are not assigned to.
4. Accountant cannot view tenant NID or private documents.
5. Tenant A cannot view Tenant B's invoices, even in the same building.
6. Manipulating `organization_id` in request body is ignored.
7. IDOR: Accessing `/api/v1/properties/{id}` with an ID from another org returns 403.
