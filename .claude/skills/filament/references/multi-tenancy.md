# Multi-Tenancy

## Panel Configuration

```php
<?php

namespace App\Providers\Filament;

use Filament\Panel;
use Filament\PanelProvider;
use App\Models\Team;

class TeamPanelProvider extends PanelProvider
{
    public function panel(Panel $panel): Panel
    {
        return $panel
            ->id('team')
            ->path('team')
            ->tenant(Team::class)
            ->tenantRegistration(RegisterTeam::class)
            ->tenantProfile(EditTeamProfile::class)
            ->tenantMenuItems([
                'settings' => MenuItem::make()
                    ->label('Team Settings')
                    ->url(fn () => route('filament.team.pages.team-settings'))
                    ->icon('heroicon-o-cog'),
                'register' => MenuItem::make()
                    ->label('New Team')
                    ->url(fn () => route('filament.team.tenant.registration'))
                    ->icon('heroicon-o-plus'),
            ])
            ->tenantMiddleware([
                'auth',
                'verified',
            ]);
    }
}
```

## Team Model

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Filament\Models\Contracts\HasTenants;
use Filament\Panel;

class Team extends Model
{
    protected $fillable = ['name', 'slug'];

    public function members(): BelongsToMany
    {
        return $this->belongsToMany(User::class)
            ->withPivot('role')
            ->withTimestamps();
    }

    public function projects(): HasMany
    {
        return $this->hasMany(Project::class);
    }
}
```

## User Model với Tenancy

```php
<?php

namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Filament\Models\Contracts\FilamentUser;
use Filament\Models\Contracts\HasTenants;
use Filament\Panel;
use Illuminate\Support\Collection;

class User extends Authenticatable implements FilamentUser, HasTenants
{
    public function teams(): BelongsToMany
    {
        return $this->belongsToMany(Team::class)
            ->withPivot('role')
            ->withTimestamps();
    }

    public function currentTeam(): BelongsTo
    {
        return $this->belongsTo(Team::class, 'current_team_id');
    }

    // FilamentUser
    public function canAccessPanel(Panel $panel): bool
    {
        return true;
    }

    // HasTenants - Lấy danh sách tenants user có thể truy cập
    public function getTenants(Panel $panel): Collection
    {
        return $this->teams;
    }

    // HasTenants - Kiểm tra user có thể truy cập tenant
    public function canAccessTenant(Model $tenant): bool
    {
        return $this->teams()->whereKey($tenant)->exists();
    }
}
```

## Register Team Page

```php
<?php

namespace App\Filament\Pages\Tenancy;

use Filament\Forms;
use Filament\Forms\Form;
use Filament\Pages\Tenancy\RegisterTenant;
use App\Models\Team;

class RegisterTeam extends RegisterTenant
{
    public static function getLabel(): string
    {
        return 'Register Team';
    }

    public function form(Form $form): Form
    {
        return $form->schema([
            Forms\Components\TextInput::make('name')
                ->required()
                ->maxLength(255),
            
            Forms\Components\TextInput::make('slug')
                ->required()
                ->unique()
                ->maxLength(255),
            
            Forms\Components\Textarea::make('description')
                ->rows(3),
        ]);
    }

    protected function handleRegistration(array $data): Team
    {
        $team = Team::create($data);

        // Attach current user as owner
        $team->members()->attach(auth()->user(), ['role' => 'owner']);

        // Set as current team
        auth()->user()->update(['current_team_id' => $team->id]);

        return $team;
    }
}
```

## Edit Team Profile Page

```php
<?php

namespace App\Filament\Pages\Tenancy;

use Filament\Forms;
use Filament\Forms\Form;
use Filament\Pages\Tenancy\EditTenantProfile;

class EditTeamProfile extends EditTenantProfile
{
    public static function getLabel(): string
    {
        return 'Team Profile';
    }

    public function form(Form $form): Form
    {
        return $form->schema([
            Forms\Components\Section::make('Team Information')
                ->schema([
                    Forms\Components\TextInput::make('name')
                        ->required(),
                    
                    Forms\Components\FileUpload::make('logo')
                        ->image()
                        ->directory('team-logos'),
                    
                    Forms\Components\Textarea::make('description'),
                ]),
            
            Forms\Components\Section::make('Billing')
                ->schema([
                    Forms\Components\Select::make('plan')
                        ->options([
                            'free' => 'Free',
                            'pro' => 'Pro - $29/month',
                            'enterprise' => 'Enterprise - $99/month',
                        ]),
                ]),
        ]);
    }
}
```

## Resource với Tenant Scoping

```php
<?php

namespace App\Filament\Resources;

use Filament\Resources\Resource;
use Filament\Facades\Filament;
use Illuminate\Database\Eloquent\Builder;

class ProjectResource extends Resource
{
    protected static ?string $model = Project::class;

    // Tự động scope query theo tenant
    public static function getEloquentQuery(): Builder
    {
        return parent::getEloquentQuery()
            ->whereBelongsTo(Filament::getTenant());
    }

    public static function form(Schema $schema): Schema
    {
        return $schema->components([
            Forms\Components\TextInput::make('name')
                ->required(),
            
            // Select từ team members
            Forms\Components\Select::make('assigned_to')
                ->label('Assign to')
                ->options(function () {
                    return Filament::getTenant()
                        ->members()
                        ->pluck('name', 'id');
                })
                ->searchable(),
        ]);
    }
}
```

## Automatically Set Tenant

```php
// Trong CreateRecord page
protected function mutateFormDataBeforeCreate(array $data): array
{
    $data['team_id'] = Filament::getTenant()->id;
    
    return $data;
}

// Hoặc trong Model với Observer
class Project extends Model
{
    protected static function booted(): void
    {
        static::creating(function (Project $project) {
            if (Filament::getTenant()) {
                $project->team_id = Filament::getTenant()->id;
            }
        });
    }
}
```

## Team Members Management

```php
<?php

namespace App\Filament\Pages;

use Filament\Pages\Page;
use Filament\Tables;
use Filament\Forms;
use Filament\Facades\Filament;

class TeamMembers extends Page implements Tables\Contracts\HasTable
{
    use Tables\Concerns\InteractsWithTable;

    protected static ?string $navigationIcon = 'heroicon-o-users';
    protected static string $view = 'filament.pages.team-members';

    public function table(Table $table): Table
    {
        return $table
            ->query(
                Filament::getTenant()->members()->getQuery()
            )
            ->columns([
                Tables\Columns\ImageColumn::make('avatar')
                    ->circular(),
                Tables\Columns\TextColumn::make('name'),
                Tables\Columns\TextColumn::make('email'),
                Tables\Columns\TextColumn::make('pivot.role')
                    ->badge(),
            ])
            ->headerActions([
                Tables\Actions\Action::make('invite')
                    ->form([
                        Forms\Components\TextInput::make('email')
                            ->email()
                            ->required(),
                        Forms\Components\Select::make('role')
                            ->options([
                                'member' => 'Member',
                                'admin' => 'Admin',
                            ])
                            ->default('member'),
                    ])
                    ->action(function (array $data) {
                        // Invite logic
                    }),
            ])
            ->actions([
                Tables\Actions\Action::make('changeRole')
                    ->form([
                        Forms\Components\Select::make('role')
                            ->options([
                                'member' => 'Member',
                                'admin' => 'Admin',
                                'owner' => 'Owner',
                            ]),
                    ])
                    ->action(function ($record, array $data) {
                        Filament::getTenant()
                            ->members()
                            ->updateExistingPivot($record->id, [
                                'role' => $data['role'],
                            ]);
                    }),
                Tables\Actions\Action::make('remove')
                    ->requiresConfirmation()
                    ->action(function ($record) {
                        Filament::getTenant()
                            ->members()
                            ->detach($record->id);
                    }),
            ]);
    }
}
```

## Billing/Subscription Integration

```php
// Check subscription trong Resource
public static function canCreate(): bool
{
    $team = Filament::getTenant();
    
    if ($team->plan === 'free') {
        return $team->projects()->count() < 3;
    }
    
    return true;
}

// Middleware cho features
class EnsureTeamHasFeature
{
    public function handle($request, Closure $next, string $feature)
    {
        $team = Filament::getTenant();
        
        if (!$team->hasFeature($feature)) {
            return redirect()->route('filament.team.pages.upgrade');
        }
        
        return $next($request);
    }
}
```

## Global Tenant Access

```php
// Lấy tenant hiện tại
$team = Filament::getTenant();

// Trong Blade
{{ filament()->getTenant()->name }}

// Trong Livewire
$this->getTenant();
```
