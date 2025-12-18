# Authorization & Policies

## Resource Authorization

Filament tự động sử dụng Laravel Policies cho authorization.

### Policy Methods

```php
<?php

namespace App\Policies;

use App\Models\Post;
use App\Models\User;

class PostPolicy
{
    // List/Index
    public function viewAny(User $user): bool
    {
        return $user->can('view_posts');
    }

    // View single record
    public function view(User $user, Post $post): bool
    {
        return $user->can('view_posts');
    }

    // Create
    public function create(User $user): bool
    {
        return $user->can('create_posts');
    }

    // Update
    public function update(User $user, Post $post): bool
    {
        return $user->can('edit_posts') || $user->id === $post->author_id;
    }

    // Delete
    public function delete(User $user, Post $post): bool
    {
        return $user->can('delete_posts');
    }

    // Bulk delete
    public function deleteAny(User $user): bool
    {
        return $user->can('delete_posts');
    }

    // Restore soft-deleted
    public function restore(User $user, Post $post): bool
    {
        return $user->can('restore_posts');
    }

    // Force delete
    public function forceDelete(User $user, Post $post): bool
    {
        return $user->can('force_delete_posts');
    }

    // Reorder
    public function reorder(User $user): bool
    {
        return $user->can('reorder_posts');
    }
}
```

### Đăng ký Policy

```php
// app/Providers/AuthServiceProvider.php
protected $policies = [
    Post::class => PostPolicy::class,
];
```

## Override trong Resource

```php
class PostResource extends Resource
{
    // Ghi đè policy methods
    public static function canViewAny(): bool
    {
        return auth()->user()->is_admin;
    }

    public static function canCreate(): bool
    {
        return auth()->user()->can('create_posts');
    }

    public static function canEdit(Model $record): bool
    {
        return auth()->user()->id === $record->author_id 
            || auth()->user()->is_admin;
    }

    public static function canDelete(Model $record): bool
    {
        return auth()->user()->is_admin;
    }

    // Ẩn hoàn toàn resource khỏi navigation
    public static function canAccess(): bool
    {
        return auth()->user()->hasAnyRole(['admin', 'editor']);
    }
}
```

## Action Authorization

```php
// Trong table actions
Tables\Actions\EditAction::make()
    ->authorize('update');          // Sử dụng policy method

Tables\Actions\DeleteAction::make()
    ->authorize('delete');

// Custom authorization
Tables\Actions\Action::make('approve')
    ->authorize(fn ($record) => 
        auth()->user()->can('approve', $record))
    ->action(fn ($record) => $record->approve());

// Visibility based on permission
Tables\Actions\Action::make('publish')
    ->visible(fn ($record) => 
        auth()->user()->can('publish_posts') 
        && $record->status === 'draft');
```

## Page Authorization

```php
// Custom page
class Settings extends Page
{
    public static function canAccess(): bool
    {
        return auth()->user()->is_admin;
    }
}

// Resource page
class CreatePost extends CreateRecord
{
    protected function authorizeAccess(): void
    {
        parent::authorizeAccess();
        
        abort_unless(
            auth()->user()->can('create_posts'),
            403
        );
    }
}
```

## Widget Authorization

```php
class AdminStatsWidget extends StatsOverviewWidget
{
    public static function canView(): bool
    {
        return auth()->user()->is_admin;
    }
}
```

## Role-based với Spatie Permission

```bash
composer require spatie/laravel-permission
```

```php
// Trong User model
use Spatie\Permission\Traits\HasRoles;

class User extends Authenticatable
{
    use HasRoles;
}
```

```php
// Kiểm tra role
public static function canAccess(): bool
{
    return auth()->user()->hasRole('admin');
}

// Kiểm tra permission
public static function canCreate(): bool
{
    return auth()->user()->hasPermissionTo('create posts');
}

// Nhiều roles
public static function canViewAny(): bool
{
    return auth()->user()->hasAnyRole(['admin', 'editor', 'moderator']);
}
```

## Navigation Authorization

```php
class PostResource extends Resource
{
    // Ẩn khỏi navigation nếu không có quyền
    public static function shouldRegisterNavigation(): bool
    {
        return auth()->user()->can('view_posts');
    }
}
```

## Form Field Authorization

```php
Forms\Components\TextInput::make('salary')
    ->visible(fn () => auth()->user()->can('view_salary'))
    ->disabled(fn () => !auth()->user()->can('edit_salary'));

Forms\Components\Section::make('Admin Settings')
    ->visible(fn () => auth()->user()->is_admin)
    ->schema([
        // Admin-only fields
    ]);
```

## Table Column Authorization

```php
Tables\Columns\TextColumn::make('salary')
    ->visible(fn () => auth()->user()->can('view_salary'));

Tables\Columns\TextColumn::make('internal_notes')
    ->visible(fn () => auth()->user()->hasRole('admin'));
```

## Filter Authorization

```php
Tables\Filters\SelectFilter::make('author')
    ->relationship('author', 'name')
    ->visible(fn () => auth()->user()->is_admin);
```

## Bulk Action Authorization

```php
Tables\Actions\BulkAction::make('approve')
    ->action(fn (Collection $records) => 
        $records->each->approve())
    ->visible(fn () => auth()->user()->can('approve_posts'));
```

## Shield Plugin (Recommended)

```bash
composer require bezhansalleh/filament-shield
php artisan vendor:publish --tag=filament-shield-config
php artisan shield:install
```

Shield tự động tạo permissions cho:
- `view_any_post`
- `view_post`
- `create_post`
- `update_post`
- `delete_post`
- `delete_any_post`
- `force_delete_post`
- `force_delete_any_post`
- `restore_post`
- `restore_any_post`
- `reorder_post`
