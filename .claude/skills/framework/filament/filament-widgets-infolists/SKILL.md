---
name: filament-widgets-infolists
description: Master Filament 4.x Widgets and Infolists - create dynamic dashboards, stats widgets, chart widgets, table widgets, and read-only infolists. Includes partial rendering, custom data sources, multi-dashboard support. USE WHEN creating dashboards, stats displays, charts, read-only data views, or organizing widgets/infolists in Filament.
---

# Filament Widgets & Infolists

## Level 1: Overview (Always Read First)

Skill này giúp tạo và quản lý Widgets & Infolists trong Filament 4.x - từ stats overview, charts, table widgets đến read-only data displays (infolists). Bao gồm advanced features như partial rendering, custom data sources, multi-dashboard support.

## Prerequisites

- Filament 4.x installed (PHP 8.2+, Laravel 11.28+)
- Basic understanding of Livewire
- Knowledge of Chart.js (for chart widgets)

## What This Skill Does

1. Tạo các loại widgets: Stats, Chart, Table, Custom
2. Implement Infolists cho read-only data views
3. Setup multi-dashboard layouts
4. Optimize performance với caching và lazy loading
5. Advanced patterns: filters, polling, custom data sources

---

## Level 2: Quick Start (For Fast Onboarding)

### Create Widget

```bash
# Stats overview
php artisan make:filament-widget StatsOverview --stats-overview

# Chart widget
php artisan make:filament-widget ProductsChart --chart

# Table widget
php artisan make:filament-widget RecentOrders --table

# Custom widget
php artisan make:filament-widget CustomWidget
```

### Register Widget

```php
// In Dashboard or Resource
public function getWidgets(): array
{
    return [
        StatsOverview::class,
        ProductsChart::class,
    ];
}

// Widget properties
protected static ?int $sort = 1;  // Order
protected int | string | array $columnSpan = 'full';  // Width
```

### Quick Stats Widget

```php
use Filament\Widgets\StatsOverviewWidget\Stat;

protected function getStats(): array
{
    return [
        Stat::make('Tổng sản phẩm', Product::count())
            ->description('Tăng 21%')
            ->descriptionIcon('heroicon-m-arrow-trending-up')
            ->color('success')
            ->chart([7, 2, 10, 3, 15]),
    ];
}
```

### Quick Chart Widget

```php
protected function getData(): array
{
    return [
        'datasets' => [
            [
                'label' => 'Doanh thu',
                'data' => [10, 20, 30, 40, 50],
            ],
        ],
        'labels' => ['T1', 'T2', 'T3', 'T4', 'T5'],
    ];
}

protected function getType(): string
{
    return 'line'; // 'bar', 'pie', 'doughnut'
}
```

### Quick Infolist

```php
use Filament\Infolists\Components\TextEntry;
use Filament\Infolists\Components\Section;

public function infolist(Infolist $infolist): Infolist
{
    return $infolist
        ->schema([
            Section::make('Thông tin')
                ->schema([
                    TextEntry::make('name')->label('Tên'),
                    TextEntry::make('price')->money('VND'),
                ])
                ->columns(2),
        ]);
}
```

---

## Level 3: Reference Guides

- [widget-patterns.md](./references/widget-patterns.md) - Use when: Implementing stats, charts, tables widgets với advanced patterns
- [infolist-patterns.md](./references/infolist-patterns.md) - Use when: Creating read-only displays, complex layouts
- [dashboard-setup.md](./references/dashboard-setup.md) - Use when: Setting up multi-dashboard, custom layouts, permissions

---

## Common Use Cases

### Case 1: Dashboard với Stats + Charts
- Stats overview widget cho quick metrics
- Line/Bar charts cho trends
- Table widget cho recent data

### Case 2: Read-Only Data Display
- Product details view
- Order information display
- User profile display

### Case 3: Multi-Dashboard Admin Panel
- Sales dashboard
- Analytics dashboard
- Support dashboard
- Each với custom widgets

---

## Key Filament 4.x Features

### New in v4:
- **Unified Schema architecture** - Consistent component usage
- **Partial rendering** - Better performance for large datasets
- **Custom data sources** - API/Cache instead of database
- **Multi-dashboard support** - Multiple dashboard pages
- **Better widget composition** - Mix widgets easily
- **Enhanced infolist components** - More entry types

### Performance Tips:
```php
// Lazy loading
protected static bool $isLazy = true;

// Polling
protected static ?string $pollingInterval = '10s';

// Caching
protected function getData(): array
{
    return Cache::remember('widget-data', 300, fn() => 
        $this->fetchData()
    );
}
```

---

## Best Practices

1. **Cache Expensive Queries** - Use Cache::remember cho heavy data
2. **Lazy Load Heavy Widgets** - Set $isLazy = true
3. **Use Eager Loading** - Preload relationships trong table widgets
4. **Optimize Polling** - Chỉ poll khi cần, không dưới 5s
5. **Responsive Design** - Test widgets trên mobile/tablet
6. **Check Permissions** - Verify user can view data

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Widget không hiển thị | Check getWidgets() array, verify widget registered |
| Slow loading | Enable lazy loading, add caching |
| Chart không render | Check Chart.js loaded, verify getData() format |
| Infolist errors | Check schema syntax, verify model relationships |
| Wrong column span | Set $columnSpan property correctly |

---

## Checklist

Widget/Infolist implementation:

- [ ] Widget type phù hợp với use case
- [ ] Vietnamese labels
- [ ] Performance optimization (caching/eager loading)
- [ ] Polling interval configured (if needed)
- [ ] Column span set correctly
- [ ] Sort order configured
- [ ] Permissions checked
- [ ] Mobile responsive tested
- [ ] Real data tested
