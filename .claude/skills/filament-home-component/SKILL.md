---
name: filament-home-component
description: Create and manage dynamic homepage components using JSON-config pattern for Laravel Filament. Use when user needs to build homepage management with flexible sections (hero banners, stats, about, products, partners, news, footer) that can be reordered, toggled, and configured via admin panel.
version: 1.0.0
---

# Filament HomeComponent Pattern

## Overview

Pattern thiết kế quản lý các section trang chủ linh hoạt bằng **1 Model duy nhất** với JSON config, thay vì tạo nhiều model riêng lẻ.

**Ưu điểm:**
- 1 bảng quản lý tất cả section
- Form động theo type (chọn type nào hiện form đó)
- Drag-drop reorder
- Toggle ẩn/hiện từng section
- Dễ thêm section mới

## Architecture

```
HomeComponent Model:
├── id
├── type (enum: hero_carousel, stats, about, ...)
├── config (JSON - chứa tất cả data động)
├── order (sắp xếp)
├── active (ẩn/hiện)
└── timestamps
```

## Quick Start

### Step 1: Create Migration

```php
Schema::create('home_components', function (Blueprint $table) {
    $table->id();
    $table->string('type', 50);
    $table->json('config')->nullable();
    $table->unsignedInteger('order')->default(0);
    $table->boolean('active')->default(true);
    $table->timestamps();

    $table->index(['active', 'order']);
});
```

### Step 2: Create Enum

```php
<?php

namespace App\Enums;

enum HomeComponentType: string
{
    case HeroCarousel = 'hero_carousel';
    case Stats = 'stats';
    case About = 'about';
    case ProductCategories = 'product_categories';
    case FeaturedProducts = 'featured_products';
    case Partners = 'partners';
    case News = 'news';
    case Footer = 'footer';

    public function getLabel(): string
    {
        return match ($this) {
            self::HeroCarousel => 'Hero Carousel - Banner chính',
            self::Stats => 'Stats - Thống kê nổi bật',
            self::About => 'About - Về chúng tôi',
            self::ProductCategories => 'Product Categories - Danh mục sản phẩm',
            self::FeaturedProducts => 'Featured Products - Sản phẩm nổi bật',
            self::Partners => 'Partners - Đối tác chiến lược',
            self::News => 'News - Tin tức sự kiện',
            self::Footer => 'Footer - Chân trang',
        };
    }

    public function getDescription(): string
    {
        return match ($this) {
            self::HeroCarousel => 'Slider banner lớn ở đầu trang',
            self::Stats => 'Các chỉ số thống kê (VD: 1500+ khách hàng)',
            self::About => 'Giới thiệu công ty và điểm mạnh',
            self::ProductCategories => 'Lưới danh mục sản phẩm',
            self::FeaturedProducts => 'Sản phẩm nổi bật/yêu thích',
            self::Partners => 'Logo đối tác chiến lược',
            self::News => 'Tin tức và sự kiện mới nhất',
            self::Footer => 'Thông tin chân trang, liên hệ, social links',
        };
    }

    public function getIcon(): string
    {
        return match ($this) {
            self::HeroCarousel => 'heroicon-o-photo',
            self::Stats => 'heroicon-o-chart-bar',
            self::About => 'heroicon-o-information-circle',
            self::ProductCategories => 'heroicon-o-squares-2x2',
            self::FeaturedProducts => 'heroicon-o-star',
            self::Partners => 'heroicon-o-building-office',
            self::News => 'heroicon-o-newspaper',
            self::Footer => 'heroicon-o-bars-3-bottom-left',
        };
    }

    public static function options(): array
    {
        $options = [];
        foreach (self::cases() as $case) {
            $options[$case->value] = $case->getLabel();
        }
        return $options;
    }
}
```

### Step 3: Create Model

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class HomeComponent extends Model
{
    protected $fillable = [
        'type',
        'config',
        'order',
        'active',
    ];

    protected function casts(): array
    {
        return [
            'config' => 'array',
            'order' => 'int',
            'active' => 'bool',
        ];
    }

    public function scopeActive($query)
    {
        return $query->where('active', true);
    }

    public function scopeOrdered($query)
    {
        return $query->orderBy('order', 'asc');
    }
}
```

### Step 4: Create Filament Resource

Xem chi tiết trong [references/filament-resource.md](./references/filament-resource.md)

## Config Fields by Type

### hero_carousel

```php
Repeater::make('config.slides')
    ->schema([
        FileUpload::make('image')->image()->directory('banners'),
        TextInput::make('alt')->label('Mô tả ảnh'),
        TextInput::make('link')->label('Link đến'),
    ])
```

**JSON structure:**
```json
{
  "slides": [
    {"image": "banners/slide1.webp", "alt": "Banner 1", "link": "/products"}
  ]
}
```

### stats

```php
Repeater::make('config.items')
    ->schema([
        TextInput::make('value')->placeholder('1,500+'),
        TextInput::make('label')->placeholder('Khách hàng tin dùng'),
    ])
```

**JSON structure:**
```json
{
  "items": [
    {"value": "1,500+", "label": "Khách hàng tin dùng"},
    {"value": "25+", "label": "Đối tác chiến lược"}
  ]
}
```

### about

```php
[
    TextInput::make('config.badge')->placeholder('Về chúng tôi'),
    TextInput::make('config.title'),
    TextInput::make('config.subtitle'),
    Textarea::make('config.description'),
    TextInput::make('config.quote'),
    Repeater::make('config.features')
        ->schema([
            TextInput::make('title'),
            TextInput::make('description'),
        ])
]
```

### product_categories

```php
Repeater::make('config.categories')
    ->schema([
        Select::make('category_id')
            ->relationship('productCategories', 'name'),
        // hoặc manual
        TextInput::make('label'),
        FileUpload::make('image'),
        TextInput::make('link'),
    ])
```

### featured_products

```php
[
    TextInput::make('config.title')->default('Sản phẩm nổi bật'),
    Repeater::make('config.products')
        ->simple(
            Select::make('product_id')
                ->options(Product::pluck('name', 'id'))
        )
]
```

### partners

```php
[
    TextInput::make('config.title')->default('Đối tác chiến lược'),
    Repeater::make('config.partners')
        ->schema([
            TextInput::make('name'),
            FileUpload::make('logo'),
            TextInput::make('link'),
        ])
]
```

### news

```php
[
    TextInput::make('config.title')->default('Tin tức & Sự kiện'),
    Select::make('config.display_mode')
        ->options(['latest' => 'Bài mới nhất', 'manual' => 'Chọn thủ công']),
    TextInput::make('config.limit')->numeric()->default(6),
    Repeater::make('config.post_ids')
        ->visible(fn (Get $get) => $get('config.display_mode') === 'manual')
        ->simple(Select::make('post_id')->options(Post::pluck('title', 'id')))
]
```

### footer

```php
[
    TextInput::make('config.company_name'),
    Textarea::make('config.address'),
    TextInput::make('config.phone'),
    TextInput::make('config.email'),
    Repeater::make('config.social_links')
        ->schema([
            Select::make('platform')
                ->options(['facebook' => 'Facebook', 'zalo' => 'Zalo', ...]),
            TextInput::make('url'),
        ]),
    Repeater::make('config.policies')
        ->schema([
            TextInput::make('label'),
            TextInput::make('link'),
        ])
]
```

## Dynamic Form Pattern

```php
public static function getConfigFields(?string $type): array
{
    if (!$type) {
        return [];
    }

    return match ($type) {
        HomeComponentType::HeroCarousel->value => self::heroCarouselFields(),
        HomeComponentType::Stats->value => self::statsFields(),
        HomeComponentType::About->value => self::aboutFields(),
        // ... other types
        default => [],
    };
}
```

## API Endpoint

```php
// routes/api.php
Route::get('/home-components', function () {
    return HomeComponent::active()
        ->ordered()
        ->get()
        ->map(fn ($item) => [
            'type' => $item->type,
            'config' => $item->config,
        ]);
});
```

## Frontend Integration

```typescript
// types.ts
interface HomeComponent {
  type: string;
  config: Record<string, any>;
}

// page.tsx
const components = await fetch('/api/home-components').then(r => r.json());

return (
  <>
    {components.map((component, index) => (
      <ComponentRenderer key={index} type={component.type} config={component.config} />
    ))}
  </>
);
```

## Best Practices

1. **Validate JSON structure** - Tạo rules validation cho từng type
2. **Cache API response** - Cache homepage data để tăng performance
3. **Image optimization** - Convert images sang WebP khi upload
4. **Fallback values** - Luôn có default values trong frontend
5. **Observer pattern** - Clear cache khi HomeComponent thay đổi

## Reference Files

- [Filament Resource Structure](./references/filament-resource.md)
- [Form Fields Reference](./references/form-fields.md)
- [API Response Format](./references/api-response.md)
