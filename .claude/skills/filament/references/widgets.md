# Dashboard Widgets

## Stats Overview

```php
<?php

namespace App\Filament\Widgets;

use Filament\Widgets\StatsOverviewWidget;
use Filament\Widgets\StatsOverviewWidget\Stat;
use App\Models\Order;
use App\Models\User;

class StatsOverview extends StatsOverviewWidget
{
    protected static ?int $sort = 1;
    
    protected int | string | array $columnSpan = 'full';

    protected function getStats(): array
    {
        $todaySales = Order::whereDate('created_at', today())->sum('total');
        $yesterdaySales = Order::whereDate('created_at', today()->subDay())->sum('total');
        $change = $yesterdaySales > 0
            ? (($todaySales - $yesterdaySales) / $yesterdaySales) * 100
            : 0;

        return [
            Stat::make('Total Revenue', '$' . number_format($todaySales, 2))
                ->description(abs($change) . '% ' . ($change >= 0 ? 'increase' : 'decrease'))
                ->descriptionIcon($change >= 0 
                    ? 'heroicon-m-arrow-trending-up' 
                    : 'heroicon-m-arrow-trending-down')
                ->color($change >= 0 ? 'success' : 'danger')
                ->chart([7, 3, 4, 5, 6, 3, 5, 3]),    // Mini chart
            
            Stat::make('New Users', User::whereDate('created_at', today())->count())
                ->description('Today')
                ->descriptionIcon('heroicon-m-user-plus')
                ->color('info'),
            
            Stat::make('Pending Orders', Order::where('status', 'pending')->count())
                ->description('Requires attention')
                ->descriptionIcon('heroicon-m-clock')
                ->color('warning')
                ->extraAttributes([
                    'class' => 'cursor-pointer',
                    'wire:click' => "redirectToOrders",
                ]),
        ];
    }

    protected function getColumns(): int
    {
        return 3;
    }
}
```

## Chart Widget

```php
<?php

namespace App\Filament\Widgets;

use Filament\Widgets\ChartWidget;
use App\Models\Order;
use Carbon\Carbon;

class SalesChart extends ChartWidget
{
    protected static ?string $heading = 'Monthly Sales';
    protected static ?int $sort = 2;
    protected int | string | array $columnSpan = 2;

    public ?string $filter = '12months';

    protected function getFilters(): ?array
    {
        return [
            '7days' => 'Last 7 days',
            '30days' => 'Last 30 days',
            '90days' => 'Last 90 days',
            '12months' => 'Last 12 months',
        ];
    }

    protected function getData(): array
    {
        $data = $this->getChartData();

        return [
            'datasets' => [
                [
                    'label' => 'Sales',
                    'data' => $data['values'],
                    'backgroundColor' => 'rgba(59, 130, 246, 0.1)',
                    'borderColor' => 'rgb(59, 130, 246)',
                    'fill' => true,
                ],
            ],
            'labels' => $data['labels'],
        ];
    }

    protected function getType(): string
    {
        return 'line';  // 'line', 'bar', 'pie', 'doughnut', 'radar', 'polarArea'
    }

    protected function getOptions(): array
    {
        return [
            'plugins' => [
                'legend' => [
                    'display' => false,
                ],
            ],
            'scales' => [
                'y' => [
                    'beginAtZero' => true,
                ],
            ],
        ];
    }

    private function getChartData(): array
    {
        // Based on $this->filter
        $months = match ($this->filter) {
            '7days' => 7,
            '30days' => 30,
            '90days' => 90,
            '12months' => 12,
        };

        $labels = [];
        $values = [];

        for ($i = $months - 1; $i >= 0; $i--) {
            $date = Carbon::now()->subMonths($i);
            $labels[] = $date->format('M Y');
            $values[] = Order::whereYear('created_at', $date->year)
                ->whereMonth('created_at', $date->month)
                ->sum('total');
        }

        return compact('labels', 'values');
    }
}
```

## Table Widget

```php
<?php

namespace App\Filament\Widgets;

use Filament\Tables;
use Filament\Widgets\TableWidget;
use App\Models\Order;
use Illuminate\Database\Eloquent\Builder;

class LatestOrders extends TableWidget
{
    protected static ?string $heading = 'Latest Orders';
    protected static ?int $sort = 3;
    protected int | string | array $columnSpan = 'full';

    protected function getTableQuery(): Builder
    {
        return Order::query()
            ->with(['customer'])
            ->latest()
            ->limit(10);
    }

    protected function getTableColumns(): array
    {
        return [
            Tables\Columns\TextColumn::make('order_number')
                ->label('Order #')
                ->searchable(),
            
            Tables\Columns\TextColumn::make('customer.name')
                ->searchable(),
            
            Tables\Columns\TextColumn::make('total')
                ->money('USD')
                ->sortable(),
            
            Tables\Columns\TextColumn::make('status')
                ->badge()
                ->color(fn (string $state) => match ($state) {
                    'pending' => 'warning',
                    'processing' => 'primary',
                    'completed' => 'success',
                    'cancelled' => 'danger',
                }),
            
            Tables\Columns\TextColumn::make('created_at')
                ->since(),
        ];
    }

    protected function getTableActions(): array
    {
        return [
            Tables\Actions\Action::make('view')
                ->url(fn ($record) => route('filament.admin.resources.orders.view', $record)),
        ];
    }
}
```

## Custom Widget

```php
<?php

namespace App\Filament\Widgets;

use Filament\Widgets\Widget;

class WelcomeWidget extends Widget
{
    protected static string $view = 'filament.widgets.welcome';
    
    protected static ?int $sort = 0;
    
    protected int | string | array $columnSpan = 'full';

    public function getViewData(): array
    {
        return [
            'user' => auth()->user(),
            'stats' => $this->getStats(),
        ];
    }

    private function getStats(): array
    {
        return [
            'tasks' => auth()->user()->tasks()->pending()->count(),
            'notifications' => auth()->user()->unreadNotifications()->count(),
        ];
    }
}
```

```blade
{{-- resources/views/filament/widgets/welcome.blade.php --}}
<x-filament-widgets::widget>
    <x-filament::section>
        <div class="flex items-center gap-4">
            <div>
                <h2 class="text-xl font-bold">Welcome back, {{ $user->name }}!</h2>
                <p class="text-gray-500">You have {{ $stats['tasks'] }} pending tasks.</p>
            </div>
        </div>
    </x-filament::section>
</x-filament-widgets::widget>
```

## Widget Configuration

```php
// Trong Widget class
protected static ?int $sort = 1;                    // Thứ tự hiển thị
protected int | string | array $columnSpan = 2;     // Số cột (1-12 hoặc 'full')
protected static bool $isLazy = true;               // Lazy loading
protected static ?string $pollingInterval = '30s';  // Auto refresh

// Conditional display
public static function canView(): bool
{
    return auth()->user()->can('view_dashboard');
}

// Only show on specific pages
protected static ?string $page = 'dashboard';
```

## Register Widgets

```php
// Trong PanelProvider
$panel->widgets([
    Widgets\StatsOverview::class,
    Widgets\SalesChart::class,
    Widgets\LatestOrders::class,
]);

// Hoặc discover tự động
$panel->discoverWidgets(
    in: app_path('Filament/Widgets'), 
    for: 'App\\Filament\\Widgets'
);
```

## Livewire Integration

```php
<?php

namespace App\Filament\Widgets;

use Filament\Widgets\Widget;
use Livewire\Attributes\On;

class NotificationWidget extends Widget
{
    protected static string $view = 'filament.widgets.notifications';
    
    public int $count = 0;

    public function mount(): void
    {
        $this->count = auth()->user()->unreadNotifications()->count();
    }

    #[On('notification-received')]
    public function refreshCount(): void
    {
        $this->count = auth()->user()->unreadNotifications()->count();
    }

    public function markAllAsRead(): void
    {
        auth()->user()->unreadNotifications->markAsRead();
        $this->count = 0;
    }
}
```
