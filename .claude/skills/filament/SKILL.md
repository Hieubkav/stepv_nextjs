---
name: filament
description: Xây dựng admin panels và ứng dụng full-stack với Filament 4x cho Laravel. Hỗ trợ tạo Resources, Forms, Tables, Widgets, Actions, Notifications, Authorization, Multi-tenancy. Sử dụng khi cần tạo admin panel, dashboard, CRUD resources, forms động, data tables, hoặc khi làm việc với filamentphp trong Laravel.
---

# Filament 4x - Laravel Admin Panel Framework

Filament là một Server-Driven UI (SDUI) framework cho Laravel, xây dựng trên Livewire v3. Cho phép định nghĩa giao diện hoàn toàn bằng PHP, không cần viết JavaScript.

## Quick Start

### Cài đặt

```bash
# Yêu cầu: PHP 8.2+, Laravel 11+
composer require filament/filament:"^4.0"
php artisan filament:install --panels
```

### Tạo User Admin

```bash
php artisan make:filament-user
```

### Tạo Resource CRUD

```bash
php artisan make:filament-resource Post --generate
```

## Core Components

### 1. Panel Provider

File: `app/Providers/Filament/AdminPanelProvider.php`

```php
use Filament\Panel;
use Filament\PanelProvider;
use Filament\Support\Colors\Color;

class AdminPanelProvider extends PanelProvider
{
    public function panel(Panel $panel): Panel
    {
        return $panel
            ->id('admin')
            ->path('admin')
            ->login()
            ->colors(['primary' => Color::Blue])
            ->discoverResources(in: app_path('Filament/Resources'), for: 'App\\Filament\\Resources')
            ->discoverPages(in: app_path('Filament/Pages'), for: 'App\\Filament\\Pages')
            ->discoverWidgets(in: app_path('Filament/Widgets'), for: 'App\\Filament\\Widgets')
            ->middleware(['web', 'auth'])
            ->authMiddleware(['auth']);
    }
}
```

### 2. Resource (CRUD)

```php
use Filament\Resources\Resource;
use Filament\Schemas\Schema;
use Filament\Forms;
use Filament\Tables;

class PostResource extends Resource
{
    protected static ?string $model = Post::class;
    protected static ?string $navigationIcon = 'heroicon-o-document-text';
    protected static ?string $navigationGroup = 'Content';

    public static function form(Schema $schema): Schema
    {
        return $schema->components([
            Forms\Components\TextInput::make('title')
                ->required()
                ->maxLength(255),
            Forms\Components\RichEditor::make('content')
                ->required()
                ->columnSpanFull(),
            Forms\Components\Select::make('status')
                ->options(['draft' => 'Draft', 'published' => 'Published'])
                ->required(),
        ]);
    }

    public static function table(Tables\Table $table): Tables\Table
    {
        return $table
            ->columns([
                Tables\Columns\TextColumn::make('title')->searchable()->sortable(),
                Tables\Columns\TextColumn::make('status')->badge(),
                Tables\Columns\TextColumn::make('created_at')->dateTime(),
            ])
            ->filters([
                Tables\Filters\SelectFilter::make('status')
                    ->options(['draft' => 'Draft', 'published' => 'Published']),
            ])
            ->actions([
                Tables\Actions\EditAction::make(),
                Tables\Actions\DeleteAction::make(),
            ])
            ->bulkActions([
                Tables\Actions\DeleteBulkAction::make(),
            ]);
    }

    public static function getPages(): array
    {
        return [
            'index' => Pages\ListPosts::route('/'),
            'create' => Pages\CreatePost::route('/create'),
            'edit' => Pages\EditPost::route('/{record}/edit'),
        ];
    }
}
```

### 3. Form Components

```php
Forms\Components\TextInput::make('name')->required();
Forms\Components\Select::make('category_id')
    ->relationship('category', 'name')
    ->searchable()
    ->preload();
Forms\Components\FileUpload::make('image')
    ->image()
    ->directory('uploads');
Forms\Components\RichEditor::make('content');
Forms\Components\Toggle::make('is_active');
Forms\Components\DateTimePicker::make('published_at');
Forms\Components\Repeater::make('items')
    ->schema([...])
    ->collapsible();
```

### 4. Table Columns

```php
Tables\Columns\TextColumn::make('title')->searchable()->sortable();
Tables\Columns\ImageColumn::make('avatar')->circular();
Tables\Columns\IconColumn::make('is_active')->boolean();
Tables\Columns\TextColumn::make('status')
    ->badge()
    ->color(fn (string $state) => match ($state) {
        'draft' => 'warning',
        'published' => 'success',
    });
```

### 5. Actions

```php
Tables\Actions\Action::make('approve')
    ->icon('heroicon-o-check')
    ->color('success')
    ->requiresConfirmation()
    ->action(fn ($record) => $record->approve());
```

### 6. Widgets

```php
use Filament\Widgets\StatsOverviewWidget;
use Filament\Widgets\StatsOverviewWidget\Stat;

class StatsOverview extends StatsOverviewWidget
{
    protected function getStats(): array
    {
        return [
            Stat::make('Total Users', User::count())
                ->description('Active users')
                ->color('success'),
        ];
    }
}
```

### 7. Notifications

```php
use Filament\Notifications\Notification;

Notification::make()
    ->success()
    ->title('Saved successfully')
    ->body('Your changes have been saved.')
    ->send();
```

## Authorization

```php
// Trong Resource
public static function canViewAny(): bool
{
    return auth()->user()->can('view_posts');
}

// Hoặc sử dụng Policy
// App\Policies\PostPolicy sẽ tự động được áp dụng
```

## Multi-Tenancy

```php
$panel->tenant(Team::class)
    ->tenantRegistration(RegisterTeam::class)
    ->tenantProfile(EditTeamProfile::class);
```

## Best Practices

1. **Cấu trúc thư mục**: Đặt Resources trong `app/Filament/Resources/`
2. **Naming**: Resource name = Model name + "Resource" (e.g., `PostResource`)
3. **Relationships**: Sử dụng `->relationship()` cho Select/Repeater
4. **Validation**: Sử dụng Laravel validation rules trong form components
5. **Authorization**: Sử dụng Laravel Policies cho phân quyền
6. **Performance**: Sử dụng `->searchable()` và `->preload()` hợp lý

## Tài liệu chi tiết

- [Panel Configuration](references/panel.md) - Cấu hình Panel Provider
- [Resources](references/resources.md) - CRUD Resources đầy đủ
- [Forms](references/forms.md) - Form components và validation
- [Tables](references/tables.md) - Table columns, filters, actions
- [Actions](references/actions.md) - Custom actions và modals
- [Widgets](references/widgets.md) - Dashboard widgets và charts
- [Notifications](references/notifications.md) - Toast và database notifications
- [Authorization](references/authorization.md) - Phân quyền và policies
- [Multi-Tenancy](references/multi-tenancy.md) - Ứng dụng multi-tenant

## Artisan Commands

```bash
php artisan make:filament-resource ModelName --generate  # Tạo resource với form/table
php artisan make:filament-page PageName                  # Tạo custom page
php artisan make:filament-widget WidgetName              # Tạo widget
php artisan make:filament-user                           # Tạo admin user
```
