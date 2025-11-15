# Dashboard Setup Reference

Guide cho setting up dashboards, multi-dashboard layouts, và custom configurations trong Filament 4.x.

## Table of Contents

- [Single Dashboard Setup](#single-dashboard-setup)
- [Multi-Dashboard](#multi-dashboard)
- [Dashboard Customization](#dashboard-customization)
- [Permissions & Access Control](#permissions--access-control)

---

## Single Dashboard Setup

### Customize Default Dashboard

```bash
php artisan make:filament-page Dashboard --type=dashboard
```

**app/Filament/Pages/Dashboard.php**:

```php
use Filament\Pages\Dashboard as BaseDashboard;

class Dashboard extends BaseDashboard
{
    protected static ?string $navigationIcon = 'heroicon-o-home';
    protected static ?string $navigationLabel = 'Trang chủ';
    protected static ?int $navigationSort = 1;
    
    public function getWidgets(): array
    {
        return [
            StatsOverview::class,
            RevenueChart::class,
            RecentOrders::class,
        ];
    }
    
    public function getColumns(): int | string | array
    {
        return 3;  // Number of columns
    }
}
```

### Register Dashboard

**app/Providers/Filament/AdminPanelProvider.php**:

```php
use App\Filament\Pages\Dashboard;

public function panel(Panel $panel): Panel
{
    return $panel
        ->pages([
            Dashboard::class,
        ]);
}
```

---

## Multi-Dashboard

### Create Additional Dashboards

**Sales Dashboard**:
```bash
php artisan make:filament-page SalesDashboard --type=dashboard
```

```php
use Filament\Pages\Dashboard;

class SalesDashboard extends Dashboard
{
    protected static ?string $navigationIcon = 'heroicon-o-chart-bar';
    protected static string $routePath = 'sales';
    protected static ?string $navigationLabel = 'Dashboard Bán hàng';
    protected static ?string $navigationGroup = 'Dashboards';
    protected static ?int $navigationSort = 2;
    
    public function getWidgets(): array
    {
        return [
            SalesStatsWidget::class,
            RevenueByMonthChart::class,
            TopProductsTable::class,
        ];
    }
    
    public function getColumns(): int | string | array
    {
        return [
            'sm' => 1,
            'md' => 2,
            'lg' => 3,
        ];
    }
}
```

**Analytics Dashboard**:
```php
class AnalyticsDashboard extends Dashboard
{
    protected static ?string $navigationIcon = 'heroicon-o-presentation-chart-line';
    protected static string $routePath = 'analytics';
    protected static ?string $navigationLabel = 'Dashboard Phân tích';
    
    public function getWidgets(): array
    {
        return [
            UserStatsWidget::class,
            TrafficChart::class,
            ConversionRateWidget::class,
        ];
    }
}
```

### Dashboard Navigation

Dashboards tự động xuất hiện trong navigation menu. Control order bằng `$navigationSort`.

---

## Dashboard Customization

### Responsive Columns

```php
public function getColumns(): int | string | array
{
    return [
        'default' => 1,
        'sm' => 1,
        'md' => 2,
        'lg' => 3,
        'xl' => 4,
        '2xl' => 4,
    ];
}
```

### Widget Visibility

**Per Widget**:
```php
// In widget class
public static function canView(): bool
{
    return auth()->user()->can('view-sales-stats');
}
```

**Per Dashboard**:
```php
public function getWidgets(): array
{
    $widgets = [
        StatsOverview::class,
    ];
    
    if (auth()->user()->isAdmin()) {
        $widgets[] = AdminStatsWidget::class;
    }
    
    if (auth()->user()->can('view-sales')) {
        $widgets[] = SalesWidget::class;
    }
    
    return $widgets;
}
```

### Dashboard Title & Description

```php
public function getTitle(): string
{
    return 'Dashboard Bán hàng ' . now()->format('M Y');
}

public function getSubheading(): ?string
{
    return 'Tổng quan doanh thu và đơn hàng';
}
```

### Custom Header Actions

```php
use Filament\Actions\Action;

protected function getHeaderActions(): array
{
    return [
        Action::make('export')
            ->label('Xuất báo cáo')
            ->icon('heroicon-o-document-arrow-down')
            ->action(fn () => $this->exportReport()),
            
        Action::make('refresh')
            ->label('Làm mới')
            ->icon('heroicon-o-arrow-path')
            ->action(fn () => $this->dispatch('refresh-widgets')),
    ];
}
```

---

## Permissions & Access Control

### Dashboard-level Permissions

```php
public static function canAccess(): bool
{
    return auth()->user()->can('view-sales-dashboard');
}
```

### Role-based Dashboards

**Admin Dashboard**:
```php
class AdminDashboard extends Dashboard
{
    public static function canAccess(): bool
    {
        return auth()->user()->isAdmin();
    }
    
    public function getWidgets(): array
    {
        return [
            SystemHealthWidget::class,
            UserActivityWidget::class,
            ErrorLogsWidget::class,
        ];
    }
}
```

**Manager Dashboard**:
```php
class ManagerDashboard extends Dashboard
{
    public static function canAccess(): bool
    {
        return auth()->user()->isManager();
    }
    
    public function getWidgets(): array
    {
        return [
            TeamPerformanceWidget::class,
            ProjectStatusWidget::class,
        ];
    }
}
```

### Default Dashboard per Role

**In PanelProvider**:
```php
public function panel(Panel $panel): Panel
{
    return $panel
        ->default(function () {
            $user = auth()->user();
            
            return match(true) {
                $user->isAdmin() => AdminDashboard::class,
                $user->isManager() => ManagerDashboard::class,
                default => Dashboard::class,
            };
        });
}
```

---

## Advanced Patterns

### Dashboard Filters

```php
use Filament\Forms\Components\DatePicker;
use Filament\Forms\Components\Select;

protected function getHeaderWidgets(): array
{
    return [
        Select::make('range')
            ->options([
                'today' => 'Hôm nay',
                'week' => 'Tuần này',
                'month' => 'Tháng này',
                'year' => 'Năm nay',
            ])
            ->default('month')
            ->live(),
            
        DatePicker::make('date_from')
            ->label('Từ ngày')
            ->live(),
            
        DatePicker::make('date_to')
            ->label('Đến ngày')
            ->live(),
    ];
}

// Access in widgets
public function getData(): array
{
    $filters = $this->getOwnerRecord()->filterFormData ?? [];
    $range = $filters['range'] ?? 'month';
    
    // Use filters in query...
}
```

### Widget Communication

**Emit Events**:
```php
// In widget A
$this->dispatch('data-updated', data: $newData);

// In widget B
protected $listeners = ['data-updated' => 'refresh'];

public function refresh($data)
{
    // Update widget based on new data
}
```

### Lazy Loading Dashboard

```php
use Filament\Support\Enums\MaxWidth;

public function getMaxWidth(): MaxWidth | string | null
{
    return MaxWidth::SevenExtraLarge;
}

// Widgets will lazy load
protected function getWidgets(): array
{
    return array_map(function ($widget) {
        $widget::$isLazy = true;
        return $widget;
    }, [
        StatsOverview::class,
        Chart::class,
    ]);
}
```

### Custom Dashboard Layout

**Override View**:
```php
protected static string $view = 'filament.pages.custom-dashboard';
```

**resources/views/filament/pages/custom-dashboard.blade.php**:
```blade
<x-filament-panels::page>
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Left sidebar -->
        <div class="lg:col-span-1">
            @foreach($this->getWidgets() as $widget)
                @if($widget::class === 'App\\Filament\\Widgets\\QuickActions')
                    @livewire($widget)
                @endif
            @endforeach
        </div>
        
        <!-- Main content -->
        <div class="lg:col-span-2">
            @foreach($this->getWidgets() as $widget)
                @if($widget::class !== 'App\\Filament\\Widgets\\QuickActions')
                    @livewire($widget)
                @endif
            @endforeach
        </div>
    </div>
</x-filament-panels::page>
```

---

## Best Practices

1. **Organize by Purpose** - Group related widgets in same dashboard
2. **Performance First** - Lazy load heavy widgets
3. **Role-based Access** - Different dashboards for different roles
4. **Responsive Design** - Test on mobile/tablet
5. **Widget Communication** - Use events for dynamic updates
6. **Caching** - Cache expensive queries
7. **Permissions** - Always check permissions before displaying data
8. **Loading States** - Show appropriate loading indicators

---

## Example: Complete Dashboard Setup

```php
namespace App\Filament\Pages;

use App\Filament\Widgets\{
    StatsOverview,
    RevenueChart,
    TopProducts,
    RecentOrders,
    QuickActions
};
use Filament\Pages\Dashboard as BaseDashboard;
use Filament\Actions\Action;
use Filament\Forms\Components\Select;

class SalesDashboard extends BaseDashboard
{
    protected static ?string $navigationIcon = 'heroicon-o-chart-bar';
    protected static string $routePath = 'sales';
    protected static ?string $navigationLabel = 'Dashboard Bán hàng';
    protected static ?int $navigationSort = 1;
    
    // Access control
    public static function canAccess(): bool
    {
        return auth()->user()->can('view-sales-dashboard');
    }
    
    // Title & description
    public function getTitle(): string
    {
        return 'Dashboard Bán hàng';
    }
    
    public function getSubheading(): ?string
    {
        return 'Tổng quan doanh thu tháng ' . now()->format('m/Y');
    }
    
    // Widgets
    public function getWidgets(): array
    {
        return [
            StatsOverview::class,
            RevenueChart::class,
            TopProducts::class,
            RecentOrders::class,
        ];
    }
    
    // Responsive columns
    public function getColumns(): int | string | array
    {
        return [
            'default' => 1,
            'md' => 2,
            'xl' => 3,
        ];
    }
    
    // Header actions
    protected function getHeaderActions(): array
    {
        return [
            Action::make('export')
                ->label('Xuất báo cáo')
                ->icon('heroicon-o-document-arrow-down')
                ->action(fn () => $this->exportSalesReport()),
        ];
    }
    
    // Header filters
    protected function getHeaderWidgets(): array
    {
        return [
            Select::make('period')
                ->options([
                    'today' => 'Hôm nay',
                    'week' => 'Tuần này',
                    'month' => 'Tháng này',
                ])
                ->default('month')
                ->live(),
        ];
    }
    
    // Export action
    protected function exportSalesReport()
    {
        // Export logic...
    }
}
```
