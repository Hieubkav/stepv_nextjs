# Notifications

## Toast Notifications

```php
use Filament\Notifications\Notification;

// Basic
Notification::make()
    ->title('Saved successfully')
    ->send();

// With body
Notification::make()
    ->success()
    ->title('Order confirmed')
    ->body('Your order #12345 has been confirmed.')
    ->send();

// Types
Notification::make()->success()->title('Success')->send();
Notification::make()->warning()->title('Warning')->send();
Notification::make()->danger()->title('Error')->send();
Notification::make()->info()->title('Info')->send();
```

## Duration & Persistence

```php
Notification::make()
    ->title('Important')
    ->body('This will stay longer')
    ->duration(10000)           // 10 seconds (ms)
    ->send();

// Persistent (requires manual dismiss)
Notification::make()
    ->title('Action required')
    ->body('Please review this item')
    ->persistent()
    ->send();
```

## Icons & Colors

```php
Notification::make()
    ->title('Low stock')
    ->icon('heroicon-o-exclamation-triangle')
    ->iconColor('warning')
    ->color('warning')
    ->send();
```

## Actions trong Notification

```php
use Filament\Notifications\Actions\Action;

Notification::make()
    ->title('New comment')
    ->body('Someone commented on your post')
    ->actions([
        Action::make('view')
            ->button()
            ->url(route('posts.show', $post)),
        
        Action::make('markAsRead')
            ->link()
            ->markAsRead(),
    ])
    ->send();
```

## Database Notifications

```php
// Gửi đến database
Notification::make()
    ->title('New order received')
    ->body("Order #{$order->number} from {$order->customer->name}")
    ->actions([
        Action::make('view')
            ->url(route('filament.admin.resources.orders.view', $order)),
    ])
    ->sendToDatabase($user);

// Gửi cho nhiều users
$admins = User::role('admin')->get();
foreach ($admins as $admin) {
    Notification::make()
        ->title('New user registered')
        ->sendToDatabase($admin);
}
```

## Broadcast Notifications

```php
// Real-time qua websockets
Notification::make()
    ->title('Urgent!')
    ->body('System maintenance in 5 minutes')
    ->broadcast($user);

// Cả database và broadcast
Notification::make()
    ->title('Important update')
    ->sendToDatabase($user)
    ->broadcast($user);
```

## Sử dụng trong Actions

```php
Tables\Actions\Action::make('approve')
    ->action(function ($record) {
        $record->update(['status' => 'approved']);
        
        Notification::make()
            ->success()
            ->title('Approved')
            ->body("Record #{$record->id} has been approved.")
            ->send();
    });

// Hoặc dùng built-in
Tables\Actions\Action::make('approve')
    ->action(fn ($record) => $record->approve())
    ->successNotificationTitle('Approved successfully')
    ->failureNotificationTitle('Failed to approve');
```

## Notification trong Form Submission

```php
// Trong Resource Page
protected function getCreatedNotification(): ?Notification
{
    return Notification::make()
        ->success()
        ->title('Post created')
        ->body('Your post has been created and is pending review.');
}

protected function getSavedNotification(): ?Notification
{
    return Notification::make()
        ->success()
        ->title('Changes saved')
        ->body('Your changes have been saved.');
}

protected function getDeletedNotification(): ?Notification
{
    return Notification::make()
        ->warning()
        ->title('Post deleted')
        ->body('The post has been moved to trash.');
}
```

## Custom Notification Service

```php
<?php

namespace App\Services;

use Filament\Notifications\Notification;
use Filament\Notifications\Actions\Action;
use App\Models\User;

class NotificationService
{
    public function orderConfirmed(Order $order): void
    {
        Notification::make()
            ->success()
            ->title('Order confirmed')
            ->body("Order #{$order->number} is being processed.")
            ->icon('heroicon-o-shopping-bag')
            ->actions([
                Action::make('view')
                    ->button()
                    ->url(route('filament.admin.resources.orders.view', $order)),
                Action::make('track')
                    ->link()
                    ->url($order->tracking_url),
            ])
            ->sendToDatabase($order->customer->user);
    }

    public function lowStockAlert(Product $product): void
    {
        $admins = User::role('admin')->get();

        foreach ($admins as $admin) {
            Notification::make()
                ->warning()
                ->title('Low stock alert')
                ->body("Product \"{$product->name}\" has only {$product->stock} items left.")
                ->icon('heroicon-o-exclamation-triangle')
                ->actions([
                    Action::make('restock')
                        ->button()
                        ->url(route('filament.admin.resources.products.edit', [
                            'record' => $product,
                        ])),
                ])
                ->sendToDatabase($admin);
        }
    }

    public function systemAlert(string $title, string $body, array $users): void
    {
        foreach ($users as $user) {
            Notification::make()
                ->danger()
                ->title($title)
                ->body($body)
                ->persistent()
                ->sendToDatabase($user)
                ->broadcast($user);
        }
    }
}
```

## Panel Configuration

```php
// Trong PanelProvider
$panel
    ->databaseNotifications()
    ->databaseNotificationsPolling('30s')   // Kiểm tra mỗi 30s
    ->broadcastNotifications();              // Enable broadcast
```

## Đọc Notifications

```php
// Trong Livewire component
public function getUnreadNotifications()
{
    return auth()->user()
        ->unreadNotifications()
        ->limit(10)
        ->get();
}

public function markAsRead($notificationId)
{
    auth()->user()
        ->notifications()
        ->find($notificationId)
        ->markAsRead();
}

public function markAllAsRead()
{
    auth()->user()
        ->unreadNotifications
        ->markAsRead();
}
```
