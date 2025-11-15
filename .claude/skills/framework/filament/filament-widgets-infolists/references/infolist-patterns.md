# Infolist Patterns Reference

Comprehensive guide cho implementing infolists (read-only data displays) trong Filament 4.x.

## Table of Contents

- [Basic Infolist](#basic-infolist)
- [Entry Types](#entry-types)
- [Layout Components](#layout-components)
- [Advanced Patterns](#advanced-patterns)

---

## Basic Infolist

### In Resource View Page

```php
use Filament\Infolists\Infolist;
use Filament\Infolists\Components\TextEntry;
use Filament\Infolists\Components\Section;

public function infolist(Infolist $infolist): Infolist
{
    return $infolist
        ->schema([
            Section::make('Thông tin sản phẩm')
                ->schema([
                    TextEntry::make('name')->label('Tên'),
                    TextEntry::make('sku')->label('Mã SKU'),
                    TextEntry::make('price')
                        ->label('Giá')
                        ->money('VND'),
                    TextEntry::make('category.name')->label('Danh mục'),
                ])
                ->columns(2),
        ]);
}
```

### In Custom Livewire Component

```php
use Filament\Infolists\Concerns\InteractsWithInfolists;
use Filament\Infolists\Contracts\HasInfolists;
use Livewire\Component;

class ViewProduct extends Component implements HasInfolists
{
    use InteractsWithInfolists;
    
    public Product $product;
    
    public function productInfolist(Infolist $infolist): Infolist
    {
        return $infolist
            ->record($this->product)
            ->schema([
                // Schema here
            ]);
    }
    
    public function render()
    {
        return view('livewire.view-product');
    }
}
```

**View**:
```blade
<div>
    {{ $this->productInfolist }}
</div>
```

---

## Entry Types

### TextEntry

```php
TextEntry::make('name')
    ->label('Tên sản phẩm')
    ->default('N/A')  // If null
    ->placeholder('Chưa có tên')  // If empty
    ->badge()  // Display as badge
    ->color('success')
    ->icon('heroicon-o-check-circle')
    ->iconPosition('after')
    ->copyable()  // Add copy button
    ->copyMessage('Đã copy!')
```

### IconEntry

```php
use Filament\Infolists\Components\IconEntry;

IconEntry::make('active')
    ->label('Trạng thái')
    ->boolean()
    ->trueIcon('heroicon-o-check-circle')
    ->falseIcon('heroicon-o-x-circle')
    ->trueColor('success')
    ->falseColor('danger')
```

### ImageEntry

```php
use Filament\Infolists\Components\ImageEntry;

ImageEntry::make('image')
    ->label('Ảnh sản phẩm')
    ->square()
    ->size(150)
    ->defaultImageUrl(url('/images/placeholder.png'))
```

### ColorEntry

```php
use Filament\Infolists\Components\ColorEntry;

ColorEntry::make('color')
    ->label('Màu sắc')
```

### KeyValueEntry

```php
use Filament\Infolists\Components\KeyValueEntry;

KeyValueEntry::make('specs')
    ->label('Thông số kỹ thuật')
    ->keyLabel('Thuộc tính')
    ->valueLabel('Giá trị')
```

**Model data**:
```php
$product->specs = [
    'RAM' => '8GB',
    'Storage' => '256GB SSD',
    'Display' => '15.6 inch',
];
```

### RepeatableEntry

```php
use Filament\Infolists\Components\RepeatableEntry;

RepeatableEntry::make('variants')
    ->label('Biến thể')
    ->schema([
        TextEntry::make('size')->label('Size'),
        TextEntry::make('color')->label('Màu'),
        TextEntry::make('stock')->label('Tồn kho'),
    ])
    ->columns(3)
```

---

## Layout Components

### Section

```php
use Filament\Infolists\Components\Section;

Section::make('Thông tin cơ bản')
    ->description('Chi tiết về sản phẩm')
    ->schema([
        TextEntry::make('name'),
        TextEntry::make('sku'),
    ])
    ->columns(2)
    ->collapsible()
    ->collapsed(false)
    ->icon('heroicon-o-information-circle')
```

### Split

```php
use Filament\Infolists\Components\Split;

Split::make([
    Section::make('Left side')
        ->schema([
            TextEntry::make('name'),
            TextEntry::make('price'),
        ]),
    Section::make('Right side')
        ->schema([
            ImageEntry::make('image'),
        ])
        ->grow(false),  // Don't grow
])
```

### Grid

```php
use Filament\Infolists\Components\Grid;

Grid::make(3)
    ->schema([
        TextEntry::make('field1'),
        TextEntry::make('field2'),
        TextEntry::make('field3'),
    ])
```

### Fieldset

```php
use Filament\Infolists\Components\Fieldset;

Fieldset::make('Address')
    ->schema([
        TextEntry::make('street'),
        TextEntry::make('city'),
        TextEntry::make('country'),
    ])
```

### Tabs

```php
use Filament\Infolists\Components\Tabs;

Tabs::make('Product Details')
    ->tabs([
        Tabs\Tab::make('Thông tin')
            ->schema([
                TextEntry::make('name'),
                TextEntry::make('price'),
            ]),
        Tabs\Tab::make('Mô tả')
            ->schema([
                TextEntry::make('description')->html(),
            ]),
        Tabs\Tab::make('Thông số')
            ->schema([
                KeyValueEntry::make('specs'),
            ]),
    ])
```

---

## Advanced Patterns

### Conditional Display

```php
TextEntry::make('discount_price')
    ->label('Giá khuyến mãi')
    ->money('VND')
    ->visible(fn ($record) => $record->discount_price > 0)
```

### Custom Formatting

```php
TextEntry::make('created_at')
    ->label('Ngày tạo')
    ->formatStateUsing(fn (string $state): string => 
        Carbon::parse($state)->diffForHumans()
    )
```

### HTML Content

```php
TextEntry::make('description')
    ->label('Mô tả')
    ->html()
    ->columnSpanFull()
```

### Relationship Data

```php
// Dot notation
TextEntry::make('category.name')->label('Danh mục')

// Or explicit relationship
TextEntry::make('name')
    ->label('Danh mục')
    ->relationship('category', 'name')
```

### Multiple Values

```php
TextEntry::make('tags.name')
    ->label('Tags')
    ->badge()
    ->separator(',')
```

### Custom State

```php
TextEntry::make('stock_status')
    ->label('Tình trạng')
    ->state(function ($record) {
        if ($record->stock > 100) return 'Còn hàng';
        if ($record->stock > 0) return 'Sắp hết';
        return 'Hết hàng';
    })
    ->color(fn ($state) => match($state) {
        'Còn hàng' => 'success',
        'Sắp hết' => 'warning',
        'Hết hàng' => 'danger',
    })
```

### Action Buttons

```php
use Filament\Infolists\Components\Actions;
use Filament\Infolists\Components\Actions\Action;

Actions::make([
    Action::make('edit')
        ->label('Chỉnh sửa')
        ->url(fn ($record) => route('filament.admin.resources.products.edit', $record))
        ->icon('heroicon-o-pencil'),
    Action::make('delete')
        ->label('Xóa')
        ->requiresConfirmation()
        ->action(fn ($record) => $record->delete())
        ->icon('heroicon-o-trash')
        ->color('danger'),
])
```

### Complex Layout Example

```php
public function infolist(Infolist $infolist): Infolist
{
    return $infolist
        ->schema([
            Split::make([
                // Left column
                Section::make('Thông tin chính')
                    ->schema([
                        TextEntry::make('name')->label('Tên'),
                        TextEntry::make('sku')->label('Mã SKU'),
                        TextEntry::make('category.name')->label('Danh mục'),
                        TextEntry::make('price')->money('VND'),
                        IconEntry::make('active')->boolean(),
                    ])
                    ->columns(2),
                    
                // Right column - Image
                Section::make('Hình ảnh')
                    ->schema([
                        ImageEntry::make('image')
                            ->square()
                            ->size(200),
                    ])
                    ->grow(false),
            ]),
            
            Tabs::make('Chi tiết')
                ->tabs([
                    Tabs\Tab::make('Mô tả')
                        ->schema([
                            TextEntry::make('description')
                                ->html()
                                ->columnSpanFull(),
                        ]),
                        
                    Tabs\Tab::make('Thông số')
                        ->schema([
                            KeyValueEntry::make('specs')
                                ->columnSpanFull(),
                        ]),
                        
                    Tabs\Tab::make('Biến thể')
                        ->schema([
                            RepeatableEntry::make('variants')
                                ->schema([
                                    TextEntry::make('size'),
                                    TextEntry::make('color'),
                                    TextEntry::make('stock'),
                                    TextEntry::make('price')->money('VND'),
                                ])
                                ->columns(4),
                        ]),
                ]),
                
            Section::make('Metadata')
                ->schema([
                    TextEntry::make('created_at')
                        ->dateTime('d/m/Y H:i'),
                    TextEntry::make('updated_at')
                        ->dateTime('d/m/Y H:i'),
                    TextEntry::make('creator.name')
                        ->label('Người tạo'),
                ])
                ->columns(3)
                ->collapsible()
                ->collapsed(),
        ]);
}
```

### Performance Tips

**Eager Load Relationships**:
```php
// In Resource ViewPage
protected function resolveRecord($key): Model
{
    return static::getModel()::with(['category', 'variants', 'creator'])
        ->findOrFail($key);
}
```

**Cache Heavy Computations**:
```php
TextEntry::make('total_sales')
    ->state(function ($record) {
        return Cache::remember(
            "product.{$record->id}.total_sales",
            3600,
            fn() => $record->orders()->sum('quantity')
        );
    })
```
