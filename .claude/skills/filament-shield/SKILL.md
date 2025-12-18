---
name: filament-shield
description: Filament Shield - roles and permissions management for Laravel Filament. Use when implementing authorization, managing roles/permissions, protecting resources/pages/widgets, or when user mentions filament-shield, permissions, roles, access control in Filament projects.
---

# Filament Shield

Roles & permissions management for Laravel Filament using Spatie Laravel Permission.

## Installation

```bash
# Install package
composer require bezhansalleh/filament-shield

# Add HasRoles trait to User model
```

```php
// app/Models/User.php
use Spatie\Permission\Traits\HasRoles;

class User extends Authenticatable
{
    use HasRoles;
}
```

```bash
# Run setup (interactive)
php artisan shield:setup

# Or install for specific panel
php artisan shield:install admin
```

## Commands

```bash
# Setup Shield
php artisan shield:setup
php artisan shield:setup --fresh          # Clean slate
php artisan shield:setup --tenant=org     # With tenancy

# Install for panel
php artisan shield:install {panel}
php artisan shield:install admin --tenant

# Generate permissions/policies
php artisan shield:generate --all
php artisan shield:generate --resource=UserResource,PostResource
php artisan shield:generate --page=Dashboard,Settings
php artisan shield:generate --widget=StatsOverview
php artisan shield:generate --option=policies    # Only policies
php artisan shield:generate --option=permissions # Only permissions

# Assign super admin
php artisan shield:super-admin --user=1 --panel=admin

# Generate seeders
php artisan shield:seeder --generate

# Publish config/resources
php artisan vendor:publish --tag="filament-shield-config"
php artisan shield:publish --panel=admin
```

## Plugin Configuration

```php
// app/Providers/Filament/AdminPanelProvider.php
use BezhanSalleh\FilamentShield\FilamentShieldPlugin;

public function panel(Panel $panel): Panel
{
    return $panel
        ->plugins([
            FilamentShieldPlugin::make()
                // Navigation
                ->navigationLabel('Roles')
                ->navigationIcon('heroicon-o-shield-check')
                ->navigationGroup('Settings')
                ->navigationSort(10)
                
                // Labels
                ->modelLabel('Role')
                ->pluralModelLabel('Roles')
                
                // Layout
                ->gridColumns([
                    'default' => 1,
                    'sm' => 2,
                    'lg' => 3
                ])
                ->sectionColumnSpan(1)
                ->checkboxListColumns([
                    'default' => 1,
                    'sm' => 2,
                    'lg' => 4,
                ])
                
                // Features
                ->simpleResourcePermissionView()
                ->localizePermissionLabels()
                
                // Tenancy
                ->scopeToTenant(true)
                ->tenantRelationshipName('organization')
        ]);
}
```

## Protect Resources

Resources are automatically protected via policies. Generate policies with:

```bash
php artisan shield:generate --resource=UserResource --option=policies
```

Generated policy example:

```php
// app/Policies/UserPolicy.php
class UserPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->can('view_any_user');
    }

    public function view(User $user, User $model): bool
    {
        return $user->can('view_user');
    }

    public function create(User $user): bool
    {
        return $user->can('create_user');
    }

    public function update(User $user, User $model): bool
    {
        return $user->can('update_user');
    }

    public function delete(User $user, User $model): bool
    {
        return $user->can('delete_user');
    }
    
    // ... restore, forceDelete, etc.
}
```

## Protect Pages

```php
<?php

namespace App\Filament\Pages;

use Filament\Pages\Page;
use BezhanSalleh\FilamentShield\Traits\HasPageShield;

class Settings extends Page
{
    use HasPageShield;
    
    // Page is now protected by 'view_settings' permission
}
```

## Protect Widgets

```php
<?php

namespace App\Filament\Widgets;

use Filament\Widgets\StatsOverviewWidget;
use BezhanSalleh\FilamentShield\Traits\HasWidgetShield;

class StatsOverview extends StatsOverviewWidget
{
    use HasWidgetShield;
    
    // Widget is now protected by 'view_stats_overview' permission
}
```

## Assign Roles to Users

### Without Tenancy

```php
// In UserResource form
use Filament\Forms;

Forms\Components\Select::make('roles')
    ->relationship('roles', 'name')
    ->multiple()
    ->preload()
    ->searchable()

// Or with CheckboxList
Forms\Components\CheckboxList::make('roles')
    ->relationship('roles', 'name')
    ->searchable()
```

### With Tenancy

```php
Forms\Components\Select::make('roles')
    ->relationship('roles', 'name')
    ->saveRelationshipsUsing(function (Model $record, $state) {
        $record->roles()->syncWithPivotValues(
            $state, 
            [config('permission.column_names.team_foreign_key') => getPermissionsTeamId()]
        );
    })
    ->multiple()
    ->preload()
    ->searchable()
```

## Custom Permissions

```php
// config/filament-shield.php
'custom_permissions' => [
    'Impersonate:User' => 'Impersonate User',
    'Export:Order' => 'Export Orders',
    'ViewReports' => 'View Reports',
],
```

Check custom permissions:

```php
// In code
if ($user->can('Impersonate:User')) {
    // ...
}

// In Blade
@can('Export:Order')
    <button>Export</button>
@endcan
```

## Configuration

```php
// config/filament-shield.php
return [
    'auth_provider_model' => App\Models\User::class,
    
    'permissions' => [
        'separator' => ':',      // Permission separator
        'case' => 'pascal',      // pascal, snake, kebab
        'generate' => true,
    ],
    
    'policies' => [
        'path' => app_path('Policies'),
        'generate' => true,
        'methods' => [
            'viewAny', 'view', 'create', 'update', 'delete',
            'restore', 'forceDelete', 'forceDeleteAny',
            'restoreAny', 'replicate', 'reorder',
        ],
    ],
    
    'resources' => [
        'subject' => 'model',    // model or class
        'exclude' => [
            // Resources to exclude
        ],
    ],
    
    'pages' => [
        'subject' => 'class',
        'prefix' => 'view',
        'exclude' => [
            Filament\Pages\Dashboard::class,
        ],
    ],
    
    'widgets' => [
        'subject' => 'class',
        'prefix' => 'view',
        'exclude' => [
            Filament\Widgets\AccountWidget::class,
            Filament\Widgets\FilamentInfoWidget::class,
        ],
    ],
    
    'custom_permissions' => [
        // 'permission_key' => 'Permission Label',
    ],
    
    'localization' => [
        'enabled' => false,
        'key' => 'filament-shield::filament-shield',
    ],
];
```

## Register Policies Manually

For models outside default namespace:

```php
// app/Providers/AppServiceProvider.php
use Illuminate\Support\Facades\Gate;

public function boot(): void
{
    // Manual policy registration
    Gate::policy(
        Awcodes\Curator\Models\Media::class, 
        App\Policies\MediaPolicy::class
    );
    
    // Or auto-guess policy names
    Gate::guessPolicyNamesUsing(function (string $modelClass) {
        return str_replace('Models', 'Policies', $modelClass) . 'Policy';
    });
}
```

## Custom Permission Key

```php
// app/Providers/AppServiceProvider.php
use BezhanSalleh\FilamentShield\Facades\FilamentShield;
use Filament\Resources\Resource;

public function boot(): void
{
    FilamentShield::buildPermissionKeyUsing(
        function (string $entity, string $affix, string $subject, string $case, string $separator) {
            // Custom logic for permission key generation
            if (is_subclass_of($entity, Resource::class)) {
                // Include navigation group in permission key
                $subject = str($subject)
                    ->prepend($entity::getNavigationGroup())
                    ->trim()
                    ->toString();
            }

            return FilamentShield::defaultPermissionKeyBuilder(
                affix: $affix,
                separator: $separator,
                subject: $subject,
                case: $case
            );
        }
    );
}
```

## Prohibit Destructive Commands in Production

```php
// app/Providers/AppServiceProvider.php
use BezhanSalleh\FilamentShield\Facades\FilamentShield;
use BezhanSalleh\FilamentShield\Commands;

public function boot(): void
{
    // Prohibit all destructive commands
    FilamentShield::prohibitDestructiveCommands($this->app->isProduction());
    
    // Or individually
    Commands\SetupCommand::prohibit($this->app->isProduction());
    Commands\GenerateCommand::prohibit($this->app->isProduction());
}
```

## Common Workflows

### Fresh Setup

```bash
# 1. Install package
composer require bezhansalleh/filament-shield

# 2. Add HasRoles to User model

# 3. Run setup
php artisan shield:setup --fresh

# 4. Generate permissions for all entities
php artisan shield:generate --all

# 5. Create super admin
php artisan shield:super-admin --user=1
```

### Add Permissions for New Resource

```bash
# Generate policy and permissions
php artisan shield:generate --resource=NewResource

# Or just permissions (if policy exists)
php artisan shield:generate --resource=NewResource --option=permissions
```

### Multi-Tenancy Setup

```bash
# Setup with tenancy
php artisan shield:setup --tenant=organization

# Install for panel with tenancy
php artisan shield:install admin --tenant
```

## Permission Naming Convention

Default format: `{action}_{resource}`

Examples:
- `view_any_user`
- `view_user`
- `create_user`
- `update_user`
- `delete_user`
- `view_dashboard` (page)
- `view_stats_overview` (widget)

## Best Practices

1. **Run `shield:generate --all` after adding new resources**
2. **Use `--fresh` only during initial setup**
3. **Prohibit destructive commands in production**
4. **Use custom permissions for non-CRUD actions**
5. **Register policies manually for third-party models**
6. **Enable localization for multi-language apps**
