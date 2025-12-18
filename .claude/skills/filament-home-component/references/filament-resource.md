# Filament Resource Structure

## Complete Resource Example

```php
<?php

namespace App\Filament\Resources;

use App\Enums\HomeComponentType;
use App\Filament\Resources\HomeComponentResource\Pages;
use App\Models\HomeComponent;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Forms\Get;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;

class HomeComponentResource extends Resource
{
    protected static ?string $model = HomeComponent::class;

    protected static ?string $navigationIcon = 'heroicon-o-home';

    protected static ?string $navigationLabel = 'Quản lý Trang chủ';

    protected static ?string $modelLabel = 'Section Trang chủ';

    protected static ?string $pluralModelLabel = 'Các Section Trang chủ';

    protected static ?int $navigationSort = 1;

    public static function form(Form $form): Form
    {
        return $form
            ->schema([
                Forms\Components\Section::make('Cấu hình chung')
                    ->schema([
                        Forms\Components\Select::make('type')
                            ->label('Loại Section')
                            ->options(HomeComponentType::options())
                            ->required()
                            ->live()
                            ->afterStateUpdated(fn ($set) => $set('config', []))
                            ->disabled(fn (?HomeComponent $record) => $record !== null)
                            ->helperText(fn (?HomeComponent $record) => $record
                                ? 'Không thể thay đổi loại sau khi tạo'
                                : 'Chọn loại section bạn muốn thêm'),

                        Forms\Components\Toggle::make('active')
                            ->label('Hiển thị')
                            ->default(true)
                            ->helperText('Bật/tắt hiển thị section này trên trang chủ'),

                        Forms\Components\TextInput::make('order')
                            ->label('Thứ tự')
                            ->numeric()
                            ->default(0)
                            ->helperText('Số nhỏ hơn sẽ hiển thị trước'),
                    ])
                    ->columns(3),

                Forms\Components\Section::make('Nội dung')
                    ->schema(fn (Get $get) => static::getConfigFields($get('type')))
                    ->visible(fn (Get $get) => $get('type') !== null),
            ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\TextColumn::make('order')
                    ->label('#')
                    ->sortable()
                    ->width(60),

                Tables\Columns\IconColumn::make('type')
                    ->label('Icon')
                    ->icon(fn (HomeComponent $record): string =>
                        HomeComponentType::tryFrom($record->type)?->getIcon() ?? 'heroicon-o-question-mark-circle'
                    )
                    ->width(60),

                Tables\Columns\TextColumn::make('type')
                    ->label('Loại')
                    ->formatStateUsing(fn (string $state): string =>
                        HomeComponentType::tryFrom($state)?->getLabel() ?? $state
                    )
                    ->searchable(),

                Tables\Columns\TextColumn::make('config_summary')
                    ->label('Tóm tắt')
                    ->getStateUsing(fn (HomeComponent $record): string =>
                        static::getConfigSummary($record)
                    )
                    ->wrap()
                    ->limit(80),

                Tables\Columns\ToggleColumn::make('active')
                    ->label('Hiển thị'),

                Tables\Columns\TextColumn::make('updated_at')
                    ->label('Cập nhật')
                    ->dateTime('d/m/Y H:i')
                    ->sortable(),
            ])
            ->defaultSort('order', 'asc')
            ->reorderable('order')
            ->filters([
                Tables\Filters\SelectFilter::make('type')
                    ->label('Loại')
                    ->options(HomeComponentType::options()),

                Tables\Filters\TernaryFilter::make('active')
                    ->label('Trạng thái')
                    ->trueLabel('Đang hiển thị')
                    ->falseLabel('Đang ẩn'),
            ])
            ->actions([
                Tables\Actions\EditAction::make(),
                Tables\Actions\DeleteAction::make(),
            ])
            ->bulkActions([
                Tables\Actions\BulkActionGroup::make([
                    Tables\Actions\DeleteBulkAction::make(),
                ]),
            ]);
    }

    public static function getPages(): array
    {
        return [
            'index' => Pages\ListHomeComponents::route('/'),
            'create' => Pages\CreateHomeComponent::route('/create'),
            'edit' => Pages\EditHomeComponent::route('/{record}/edit'),
        ];
    }

    /**
     * Get dynamic form fields based on component type
     */
    public static function getConfigFields(?string $type): array
    {
        if (!$type) {
            return [
                Forms\Components\Placeholder::make('hint')
                    ->content('Vui lòng chọn loại section ở trên để hiển thị form cấu hình.')
            ];
        }

        return match ($type) {
            HomeComponentType::HeroCarousel->value => static::heroCarouselFields(),
            HomeComponentType::Stats->value => static::statsFields(),
            HomeComponentType::About->value => static::aboutFields(),
            HomeComponentType::ProductCategories->value => static::productCategoriesFields(),
            HomeComponentType::FeaturedProducts->value => static::featuredProductsFields(),
            HomeComponentType::Partners->value => static::partnersFields(),
            HomeComponentType::News->value => static::newsFields(),
            HomeComponentType::Footer->value => static::footerFields(),
            default => [],
        };
    }

    /**
     * Get summary text for table display
     */
    public static function getConfigSummary(HomeComponent $record): string
    {
        $config = $record->config ?? [];

        return match ($record->type) {
            HomeComponentType::HeroCarousel->value =>
                count($config['slides'] ?? []) . ' slides',

            HomeComponentType::Stats->value =>
                count($config['items'] ?? []) . ' chỉ số',

            HomeComponentType::About->value =>
                $config['title'] ?? 'Chưa có tiêu đề',

            HomeComponentType::ProductCategories->value =>
                count($config['categories'] ?? []) . ' danh mục',

            HomeComponentType::FeaturedProducts->value =>
                count($config['products'] ?? []) . ' sản phẩm',

            HomeComponentType::Partners->value =>
                count($config['partners'] ?? []) . ' đối tác',

            HomeComponentType::News->value =>
                ($config['display_mode'] ?? 'latest') === 'latest'
                    ? 'Hiển thị ' . ($config['limit'] ?? 6) . ' bài mới nhất'
                    : count($config['post_ids'] ?? []) . ' bài được chọn',

            HomeComponentType::Footer->value =>
                $config['company_name'] ?? 'Footer',

            default => 'N/A',
        };
    }

    // Field methods - See form-fields.md for details
    protected static function heroCarouselFields(): array { /* ... */ }
    protected static function statsFields(): array { /* ... */ }
    protected static function aboutFields(): array { /* ... */ }
    protected static function productCategoriesFields(): array { /* ... */ }
    protected static function featuredProductsFields(): array { /* ... */ }
    protected static function partnersFields(): array { /* ... */ }
    protected static function newsFields(): array { /* ... */ }
    protected static function footerFields(): array { /* ... */ }
}
```

## Pages Structure

### ListHomeComponents.php

```php
<?php

namespace App\Filament\Resources\HomeComponentResource\Pages;

use App\Filament\Resources\HomeComponentResource;
use Filament\Actions;
use Filament\Resources\Pages\ListRecords;

class ListHomeComponents extends ListRecords
{
    protected static string $resource = HomeComponentResource::class;

    protected function getHeaderActions(): array
    {
        return [
            Actions\CreateAction::make()
                ->label('Thêm Section mới'),
        ];
    }
}
```

### CreateHomeComponent.php

```php
<?php

namespace App\Filament\Resources\HomeComponentResource\Pages;

use App\Filament\Resources\HomeComponentResource;
use Filament\Resources\Pages\CreateRecord;

class CreateHomeComponent extends CreateRecord
{
    protected static string $resource = HomeComponentResource::class;

    protected function getRedirectUrl(): string
    {
        return $this->getResource()::getUrl('index');
    }
}
```

### EditHomeComponent.php

```php
<?php

namespace App\Filament\Resources\HomeComponentResource\Pages;

use App\Filament\Resources\HomeComponentResource;
use Filament\Actions;
use Filament\Resources\Pages\EditRecord;

class EditHomeComponent extends EditRecord
{
    protected static string $resource = HomeComponentResource::class;

    protected function getHeaderActions(): array
    {
        return [
            Actions\DeleteAction::make(),
        ];
    }

    protected function getRedirectUrl(): string
    {
        return $this->getResource()::getUrl('index');
    }
}
```

## Advanced Features

### Separating Form Schema (Optional)

For larger projects, separate form schemas into dedicated classes:

```
app/Filament/Resources/HomeComponents/
├── Schemas/
│   ├── HomeComponentForm.php
│   └── HomeComponentTable.php
└── Pages/
    ├── ListHomeComponents.php
    ├── CreateHomeComponent.php
    └── EditHomeComponent.php
```

### HomeComponentForm.php

```php
<?php

namespace App\Filament\Resources\HomeComponents\Schemas;

use App\Enums\HomeComponentType;
use Filament\Forms;
use Filament\Forms\Get;

class HomeComponentForm
{
    public static function schema(): array
    {
        return [
            Forms\Components\Section::make('Cấu hình')
                ->schema([
                    // ... general fields
                ]),

            Forms\Components\Section::make('Nội dung')
                ->schema(fn (Get $get) => self::getConfigFields($get('type')))
                ->visible(fn (Get $get) => $get('type') !== null),
        ];
    }

    public static function getConfigFields(?string $type): array
    {
        // ... field logic
    }
}
```

### Using in Resource

```php
public static function form(Form $form): Form
{
    return $form->schema(HomeComponentForm::schema());
}
```
