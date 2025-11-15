# Widget Patterns Reference

Comprehensive guide cho implementing widgets trong Filament 4.x.

## Table of Contents

- [Stats Overview Widget](#stats-overview-widget)
- [Chart Widgets](#chart-widgets)
- [Table Widgets](#table-widgets)
- [Custom Widgets](#custom-widgets)
- [Performance Optimization](#performance-optimization)

---

## Stats Overview Widget

### Basic Implementation

```php
use Filament\Widgets\StatsOverviewWidget;
use Filament\Widgets\StatsOverviewWidget\Stat;

class StatsOverview extends StatsOverviewWidget
{
    protected function getStats(): array
    {
        return [
            Stat::make('Tổng sản phẩm', Product::count())
                ->description('Tăng 21% so với tháng trước')
                ->descriptionIcon('heroicon-m-arrow-trending-up')
                ->color('success')
                ->chart([7, 2, 10, 3, 15, 4, 17]),
                
            Stat::make('Doanh thu', number_format(Order::sum('total'), 0, ',', '.') . ' đ')
                ->description('Giảm 3% so với tuần trước')
                ->descriptionIcon('heroicon-m-arrow-trending-down')
                ->color('danger'),
                
            Stat::make('Đơn hàng mới', Order::where('status', 'pending')->count())
                ->description('Cần xử lý')
                ->color('warning'),
        ];
    }
}
```

### Advanced Stats with Actions

```php
Stat::make('Đơn hàng chờ', Order::where('status', 'pending')->count())
    ->description('Nhấn để xem chi tiết')
    ->url(route('filament.admin.resources.orders.index', [
        'tableFilters' => ['status' => ['value' => 'pending']],
    ]))
    ->icon('heroicon-o-shopping-cart')
    ->extraAttributes(['class' => 'cursor-pointer'])
```

### Polling/Auto-refresh

```php
protected static ?string $pollingInterval = '10s'; // Auto refresh every 10s

// Or conditional
protected function getPollingInterval(): ?string
{
    return $this->shouldRefresh ? '5s' : null;
}
```

### Stat Colors

Available colors:
- `success` - Green
- `danger` - Red
- `warning` - Yellow/Orange
- `info` - Blue
- `primary` - Theme color
- `gray` - Gray/neutral

---

## Chart Widgets

### Line Chart

```php
use Filament\Widgets\ChartWidget;

class ProductsChart extends ChartWidget
{
    protected static ?string $heading = 'Doanh thu theo tháng';
    protected static ?string $maxHeight = '300px';
    
    protected function getData(): array
    {
        $data = Order::selectRaw('MONTH(created_at) as month, SUM(total) as total')
            ->whereYear('created_at', date('Y'))
            ->groupBy('month')
            ->pluck('total', 'month')
            ->toArray();
            
        return [
            'datasets' => [
                [
                    'label' => 'Doanh thu (VNĐ)',
                    'data' => array_values($data),
                    'borderColor' => 'rgb(59, 130, 246)',
                    'backgroundColor' => 'rgba(59, 130, 246, 0.1)',
                    'fill' => true,
                ],
            ],
            'labels' => ['T1', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'T8', 'T9', 'T10', 'T11', 'T12'],
        ];
    }

    protected function getType(): string
    {
        return 'line';
    }
    
    protected function getOptions(): array
    {
        return [
            'scales' => [
                'y' => [
                    'beginAtZero' => true,
                ],
            ],
            'plugins' => [
                'legend' => [
                    'display' => true,
                ],
            ],
        ];
    }
}
```

### Bar Chart

```php
protected function getData(): array
{
    return [
        'datasets' => [
            [
                'label' => 'Số lượng bán',
                'data' => [65, 59, 80, 81, 56, 55, 40],
                'backgroundColor' => 'rgba(54, 162, 235, 0.5)',
            ],
        ],
        'labels' => ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    ];
}

protected function getType(): string
{
    return 'bar';
}
```

### Pie/Doughnut Chart

```php
protected function getData(): array
{
    return [
        'datasets' => [
            [
                'data' => [
                    Category::where('slug', 'dien-thoai')->count(),
                    Category::where('slug', 'laptop')->count(),
                    Category::where('slug', 'tablet')->count(),
                    Category::where('slug', 'phu-kien')->count(),
                ],
                'backgroundColor' => [
                    'rgb(255, 99, 132)',
                    'rgb(54, 162, 235)',
                    'rgb(255, 205, 86)',
                    'rgb(75, 192, 192)',
                ],
            ],
        ],
        'labels' => ['Điện thoại', 'Laptop', 'Tablet', 'Phụ kiện'],
    ];
}

protected function getType(): string
{
    return 'pie'; // or 'doughnut'
}
```

---

## Table Widgets

### Basic Table Widget

```php
use Filament\Widgets\TableWidget;
use Filament\Tables;
use Filament\Tables\Table;

class RecentOrders extends TableWidget
{
    protected static ?string $heading = 'Đơn hàng gần đây';
    protected int | string | array $columnSpan = 'full';
    
    public function table(Table $table): Table
    {
        return $table
            ->query(
                Order::query()
                    ->with(['customer', 'items'])
                    ->latest()
                    ->limit(10)
            )
            ->columns([
                Tables\Columns\TextColumn::make('code')
                    ->label('Mã đơn')
                    ->searchable(),
                Tables\Columns\TextColumn::make('customer.name')
                    ->label('Khách hàng'),
                Tables\Columns\TextColumn::make('total')
                    ->label('Tổng tiền')
                    ->money('VND'),
                Tables\Columns\BadgeColumn::make('status')
                    ->label('Trạng thái')
                    ->colors([
                        'warning' => 'pending',
                        'success' => 'completed',
                        'danger' => 'cancelled',
                    ]),
                Tables\Columns\TextColumn::make('created_at')
                    ->label('Ngày tạo')
                    ->dateTime('d/m/Y H:i'),
            ]);
    }
}
```

### Custom Data Source

```php
// From API/Cache instead of database
public function table(Table $table): Table
{
    return $table
        ->data(function () {
            return Cache::remember('recent-orders', 300, function () {
                return Http::get('api/orders/recent')->json();
            });
        })
        ->columns([
            // Columns same as above
        ]);
}
```

---

## Custom Widgets

### Create Custom Widget

```php
use Filament\Widgets\Widget;

class CustomStatsWidget extends Widget
{
    protected static string $view = 'filament.widgets.custom-stats-widget';
    
    protected int | string | array $columnSpan = 'full';
    protected static ?int $sort = 2;
    
    public function getData(): array
    {
        return [
            'users' => User::count(),
            'revenue' => Order::sum('total'),
        ];
    }
}
```

**View (resources/views/filament/widgets/custom-stats-widget.blade.php)**:

```blade
<x-filament-widgets::widget>
    <x-filament::section>
        <div class="grid grid-cols-2 gap-4">
            <div>
                <h3 class="text-lg font-semibold">Users</h3>
                <p class="text-3xl">{{ $this->getData()['users'] }}</p>
            </div>
            <div>
                <h3 class="text-lg font-semibold">Revenue</h3>
                <p class="text-3xl">{{ number_format($this->getData()['revenue'], 0, ',', '.') }} đ</p>
            </div>
        </div>
    </x-filament::section>
</x-filament-widgets::widget>
```

---

## Performance Optimization

### Lazy Loading

```php
protected static bool $isLazy = true; // Load widget content on demand

// With custom loading message
protected static ?string $loadingIndicator = 'Đang tải dữ liệu...';
```

### Caching

```php
use Illuminate\Support\Facades\Cache;

protected function getData(): array
{
    return Cache::remember(
        'widget.sales-stats.' . auth()->id(),
        now()->addMinutes(5),
        fn() => $this->fetchData()
    );
}

private function fetchData(): array
{
    // Expensive query...
    return Order::with('items')->get()->toArray();
}
```

### Eager Loading

```php
// In table widgets
->query(
    Order::query()
        ->with(['customer', 'items', 'shipping'])  // Eager load relationships
        ->latest()
)
```

### Widget Filters

```php
use Filament\Forms\Components\Select;

protected function getHeaderWidgets(): array
{
    return [
        Select::make('range')
            ->options([
                'today' => 'Hôm nay',
                'week' => 'Tuần này',
                'month' => 'Tháng này',
            ])
            ->default('today')
            ->live(),  // Update widget when changed
    ];
}

// Use in getData()
protected function getData(): array
{
    $range = $this->filterFormData['range'] ?? 'today';
    
    $query = Order::query();
    
    match($range) {
        'today' => $query->whereDate('created_at', today()),
        'week' => $query->whereBetween('created_at', [now()->startOfWeek(), now()->endOfWeek()]),
        'month' => $query->whereMonth('created_at', now()->month),
    };
    
    return $query->sum('total');
}
```

---

## Widget Visibility

```php
// Per widget
public static function canView(): bool
{
    return auth()->user()->can('view-sales-stats');
}

// Or in dashboard
protected function getVisibleWidgets(): array
{
    $widgets = $this->getWidgets();
    
    if (! auth()->user()->isAdmin()) {
        return array_filter($widgets, fn($w) => $w !== AdminOnlyWidget::class);
    }
    
    return $widgets;
}
```
