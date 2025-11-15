---
name: filament-resource-generator
description: Automated Filament 4.x resource generation following coding standards (Schema namespace, Vietnamese labels, Observer patterns, ImagesRelationManager). Includes namespace rules, best practices, form/table patterns, RelationManagers, export/import actions, custom data sources, and advanced table features. USE WHEN creating resources, fixing namespace errors, implementing forms/tables, RelationManagers, Settings pages, or any Filament development.
---

# Filament Resource Generator - Quick Workflow

Generate standardized Filament 4.x resources with correct namespaces, Vietnamese labels, Observer patterns, and advanced features.

## When to Activate This Skill

- User says "tạo resource mới cho [Model]"
- User says "create new resource"
- User wants to "scaffold admin panel"
- Adding new entity to Filament admin
- Implementing export/import features
- Setting up custom data sources
- Creating multi-dashboard resources

---
## ⚡ Filament 4.x New Features

**Breaking Changes:**
- PHP 8.2+ & Laravel 11.28+ required
- New directory structure (resources in own folder)
- Unified Schema architecture
- Actions consolidation
- Performance improvements (2-3x faster)

**New Capabilities:**
- Export/Import actions (CSV/XLSX)
- Custom data sources (API/Cache)
- Advanced filter sets
- Builder component for dynamic forms
- TipTap rich editor
- Multi-dashboard support

---

## Quick Workflow

### 1. Gather Requirements

Ask user:
- **Model name** (singular): Product, Category, Article
- **Has images?** Gallery or single featured image?
- **Relationships?** BelongsTo, BelongsToMany
- **Need ordering?** Drag-drop reordering (requires `order` column)
- **SEO fields?** Usually yes (slug, meta_title, meta_description)

### 2. Generate Resource

```bash
# Standard resource
php artisan make:filament-resource Product --generate

# With soft deletes
php artisan make:filament-resource Product --soft-deletes

# Simple resource (single page)
php artisan make:filament-resource Product --simple

# With view page
php artisan make:filament-resource Product --view
```

**Creates (New v4 structure):**
```
app/Filament/Resources/
├── ProductResource/
│   ├── ProductResource.php      # Main resource
│   ├── Pages/
│   │   ├── ListProducts.php
│   │   ├── CreateProduct.php
│   │   ├── EditProduct.php
│   │   └── ViewProduct.php      # Optional
│   └── RelationManagers/
│       └── ImagesRelationManager.php
```

**Migration to new structure:**
```bash
# Migrate existing resources to v4 structure
php artisan filament:upgrade --resources

# Dry run to preview changes
php artisan filament:upgrade --resources --dry-run
```

### 3. Update Resource

**Critical namespaces:**
```php
// Layout components → Schemas
use Filament\Schemas\Components\Tabs;
use Filament\Schemas\Components\Grid;
use Filament\Schemas\Components\Section;

// Form fields → Forms
use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\Toggle;

// Schema (NOT Form!)
use Filament\Schemas\Schema;
```

**Vietnamese labels:**
```php
protected static ?string $navigationLabel = 'Sản phẩm';
protected static ?string $modelLabel = 'Sản phẩm';
protected static ?string $pluralModelLabel = 'Các sản phẩm';
protected static ?string $navigationIcon = 'heroicon-o-shopping-bag';
```

**Navigation badge:**
```php
public static function getNavigationBadge(): ?string
{
    return (string) static::getModel()::where('active', true)->count();
}
```

### 4. Implement Form & Table

```php
// Form with Tabs
public static function form(Schema $schema): Schema {
    return $schema->schema([
        Tabs::make()->tabs([
            Tabs\Tab::make('Thông tin')->schema([
                TextInput::make('name')->label('Tên')->required(),
                Select::make('category_id')->label('Danh mục')->relationship('category', 'name'),
                Toggle::make('active')->label('Hiển thị')->default(true),
            ]),
        ])->columnSpanFull(),
    ]);
}

// Table with eager loading
public static function table(Table $table): Table {
    return $table
        ->modifyQueryUsing(fn($q) => $q->with(['category']))
        ->reorderable('order')  // If has order column
        ->columns([
            TextColumn::make('name')->label('Tên')->searchable(),
            ToggleColumn::make('active')->label('Hiển thị'),
        ])
        ->recordActions([EditAction::make()->iconButton()]);
}
```

### 5. Create Observer

```php
class ProductObserver {
    public function creating(Product $p): void {
        if (empty($p->slug)) $p->slug = Str::slug($p->name);
        if (empty($p->meta_title)) $p->meta_title = $p->name;
        if ($p->order === null) $p->order = (Product::max('order') ?? 0) + 1;
    }
}

// AppServiceProvider::boot()
Product::observe(ProductObserver::class);
```

### 6. Add Images (Optional)

```php
// Model
public function images(): MorphMany {
    return $this->morphMany(Image::class, 'model');
}

// Resource
public static function getRelations(): array {
    return [ImagesRelationManager::class];
}
```

### 7. Add Export/Import (New in v4)

**Generate Exporter:**
```bash
php artisan make:filament-exporter Product --generate
```

**Add to Resource:**
```php
use App\Filament\Exports\ProductExporter;
use Filament\Actions\ExportAction;
use Filament\Actions\ImportAction;

// Header actions
public static function table(Table $table): Table
{
    return $table
        ->headerActions([
            ExportAction::make()
                ->exporter(ProductExporter::class),
            ImportAction::make()
                ->importer(ProductImporter::class),
        ])
        ->columns([...]);
}

// Or as bulk action
->bulkActions([
    ExportBulkAction::make()
        ->exporter(ProductExporter::class),
])
```

**Custom Exporter:**
```php
class ProductExporter extends Exporter
{
    protected static ?string $model = Product::class;

    public static function getColumns(): array
    {
        return [
            ExportColumn::make('name')->label('Tên'),
            ExportColumn::make('price')->label('Giá'),
            ExportColumn::make('category.name')->label('Danh mục'),
        ];
    }
}
```

### 8. Custom Data Sources (New in v4)

**From API/Cache:**
```php
use Filament\Tables\Table;

public static function table(Table $table): Table
{
    return $table
        ->data(function () {
            // From cache
            return Cache::remember('products', 3600, fn() => 
                Http::get('api/products')->json()
            );
        })
        ->columns([
            TextColumn::make('name'),
            TextColumn::make('price'),
        ])
        ->filters([...])
        ->actions([...]);
}
```

---

## Checklist

Before declaring resource complete:

- [ ] Correct namespaces (Schemas vs Forms)
- [ ] Vietnamese labels (100%)
- [ ] Form with Tabs/Grid structure
- [ ] Table with eager loading
- [ ] Reorderable if order column
- [ ] ImagesRelationManager if images
- [ ] Observer for SEO + order
- [ ] Observer registered in AppServiceProvider
- [ ] Navigation badge showing count
- [ ] Export/Import actions (if needed)
- [ ] Custom data sources (if applicable)
- [ ] Advanced filters configured
- [ ] Tested create/edit/delete/export

---
## 🆕 Advanced Features (v4)

**Builder Component (Dynamic Forms):**
```php
use Filament\Forms\Components\Builder;

Builder::make('page_content')
    ->blocks([
        Builder\Block::make('heading')
            ->schema([
                TextInput::make('content')->label('Tiêu đề'),
                Select::make('level')->options([
                    'h1' => 'H1', 'h2' => 'H2', 'h3' => 'H3',
                ]),
            ]),
        Builder\Block::make('paragraph')
            ->schema([
                TipTapEditor::make('content')->label('Nội dung'),
            ]),
        Builder\Block::make('image')
            ->schema([
                FileUpload::make('url')->image(),
                TextInput::make('alt')->label('Alt text'),
            ]),
    ])
    ->collapsible()
    ->addActionLabel('Thêm block')
```

**Advanced Filter Sets:**
```php
use Filament\Tables\Filters\TernaryFilter;
use Filament\Tables\Filters\SelectFilter;

->filters([
    TernaryFilter::make('active')
        ->label('Hiển thị')
        ->placeholder('Tất cả')
        ->trueLabel('Đang hiển thị')
        ->falseLabel('Đã ẩn'),
    
    SelectFilter::make('category')
        ->relationship('category', 'name')
        ->multiple()
        ->preload(),
        
    // Date range filter
    Filter::make('created_at')
        ->form([
            DatePicker::make('created_from')->label('Từ ngày'),
            DatePicker::make('created_until')->label('Đến ngày'),
        ])
        ->query(function (Builder $query, array $data): Builder {
            return $query
                ->when($data['created_from'], 
                    fn($q, $date) => $q->whereDate('created_at', '>=', $date))
                ->when($data['created_until'], 
                    fn($q, $date) => $q->whereDate('created_at', '<=', $date));
        }),
])
```

**Multi-Dashboard Resources:**
```php
// Create second dashboard
php artisan make:filament-page CustomDashboard

class CustomDashboard extends Dashboard
{
    protected static ?string $navigationIcon = 'heroicon-o-chart-bar';
    protected static string $routePath = 'custom';
    
    public function getWidgets(): array
    {
        return [
            ProductStatsWidget::class,
            RecentProductsWidget::class,
        ];
    }
}
```

**Table Reordering with Groups:**
```php
->reorderable('order')
->groups([
    Group::make('category.name')
        ->label('Danh mục')
        ->collapsible(),
])
```

---

## Key Principles

1. **Namespace correctness**: `Schemas` for layouts, `Forms` for fields
2. **Vietnamese first**: All labels tiếng Việt
3. **Observer patterns**: SEO auto-generated, hidden from form
4. **Eager loading**: Always `modifyQueryUsing()` for relations
5. **Standard structure**: Tabs → Grid → Fields

---

## References

**Detailed implementations:** `read .claude/skills/filament/filament-resource-generator/references/detailed-implementation.md`
**Complete guide:** `read .claude/skills/filament/filament-resource-generator/CLAUDE.md`

**Related:** filament-rules, image-management, filament-form-debugger
