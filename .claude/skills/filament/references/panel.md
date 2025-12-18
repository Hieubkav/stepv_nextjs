# Panel Configuration

## Panel Provider cơ bản

```php
<?php

namespace App\Providers\Filament;

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
            ->registration()
            ->passwordReset()
            ->emailVerification()
            ->profile()
            ->colors([
                'primary' => Color::Blue,
                'gray' => Color::Slate,
            ])
            ->discoverResources(in: app_path('Filament/Resources'), for: 'App\\Filament\\Resources')
            ->discoverPages(in: app_path('Filament/Pages'), for: 'App\\Filament\\Pages')
            ->discoverWidgets(in: app_path('Filament/Widgets'), for: 'App\\Filament\\Widgets')
            ->pages([
                \App\Filament\Pages\Dashboard::class,
            ])
            ->middleware([
                'web',
                'auth',
            ])
            ->authMiddleware([
                'auth',
            ]);
    }
}
```

## Branding

```php
$panel
    ->brandName('My Admin Panel')
    ->brandLogo(asset('images/logo.svg'))
    ->brandLogoHeight('2rem')
    ->favicon(asset('images/favicon.png'))
    ->darkModeBrandLogo(asset('images/logo-dark.svg'));
```

## Layout

```php
$panel
    ->maxContentWidth('full')               // 'sm', 'md', 'lg', 'xl', '2xl', 'full'
    ->sidebarCollapsibleOnDesktop()
    ->sidebarFullyCollapsibleOnDesktop()
    ->topNavigation()                       // Dùng top nav thay sidebar
    ->navigationGroups([
        'Content',
        'Settings',
    ]);
```

## Database Notifications

```php
$panel
    ->databaseNotifications()
    ->databaseNotificationsPolling('30s');  // Polling interval
```

## Multi-panel

```php
// Tạo nhiều panel cho các role khác nhau
// AdminPanelProvider.php
$panel->id('admin')->path('admin');

// UserPanelProvider.php  
$panel->id('user')->path('dashboard');
```

## Middleware

```php
$panel
    ->middleware([
        'web',
        \App\Http\Middleware\SetLocale::class,
    ])
    ->authMiddleware([
        'auth',
        'verified',
    ]);
```

## Colors

```php
use Filament\Support\Colors\Color;

$panel->colors([
    'primary' => Color::Blue,
    'danger' => Color::Red,
    'gray' => Color::Slate,
    'info' => Color::Sky,
    'success' => Color::Emerald,
    'warning' => Color::Orange,
]);

// Custom color
$panel->colors([
    'primary' => [
        50 => '238, 242, 255',
        100 => '224, 231, 255',
        // ... 200-900
    ],
]);
```

## Plugins

```php
use Filament\SpatieLaravelTranslatablePlugin;

$panel->plugins([
    SpatieLaravelTranslatablePlugin::make()
        ->defaultLocales(['en', 'vi']),
]);
```

## SPA Mode

```php
$panel->spa();  // Enable SPA mode với wire:navigate
```
