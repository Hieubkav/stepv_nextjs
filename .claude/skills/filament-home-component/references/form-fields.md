# Form Fields Reference

Chi tiết các field cho từng loại HomeComponent.

## Hero Carousel

```php
protected static function heroCarouselFields(): array
{
    return [
        Forms\Components\Repeater::make('config.slides')
            ->label('Danh sách Slides')
            ->schema([
                Forms\Components\FileUpload::make('image')
                    ->label('Ảnh Banner')
                    ->image()
                    ->directory('banners')
                    ->imageResizeMode('cover')
                    ->imageCropAspectRatio('16:9')
                    ->required(),

                Forms\Components\TextInput::make('alt')
                    ->label('Mô tả ảnh (Alt text)')
                    ->maxLength(255)
                    ->helperText('Dùng cho SEO và accessibility'),

                Forms\Components\TextInput::make('title')
                    ->label('Tiêu đề (tùy chọn)')
                    ->maxLength(100),

                Forms\Components\TextInput::make('subtitle')
                    ->label('Phụ đề (tùy chọn)')
                    ->maxLength(200),

                Forms\Components\TextInput::make('link')
                    ->label('Link đến')
                    ->url()
                    ->placeholder('https://example.com/products'),

                Forms\Components\TextInput::make('button_text')
                    ->label('Text nút CTA')
                    ->placeholder('Xem thêm'),
            ])
            ->columns(2)
            ->reorderable()
            ->collapsible()
            ->defaultItems(1)
            ->maxItems(10)
            ->itemLabel(fn (array $state): ?string =>
                $state['alt'] ?? $state['title'] ?? 'Slide'
            ),
    ];
}
```

## Stats

```php
protected static function statsFields(): array
{
    return [
        Forms\Components\Repeater::make('config.items')
            ->label('Các chỉ số thống kê')
            ->schema([
                Forms\Components\TextInput::make('value')
                    ->label('Giá trị')
                    ->placeholder('1,500+')
                    ->required()
                    ->maxLength(20),

                Forms\Components\TextInput::make('label')
                    ->label('Mô tả')
                    ->placeholder('Khách hàng tin dùng')
                    ->required()
                    ->maxLength(100),

                Forms\Components\Select::make('icon')
                    ->label('Icon (tùy chọn)')
                    ->options([
                        'users' => 'Người dùng',
                        'building' => 'Tòa nhà',
                        'chart' => 'Biểu đồ',
                        'star' => 'Ngôi sao',
                        'trophy' => 'Cúp',
                        'check' => 'Tick',
                    ]),
            ])
            ->columns(3)
            ->reorderable()
            ->defaultItems(4)
            ->maxItems(8)
            ->grid(2),
    ];
}
```

## About

```php
protected static function aboutFields(): array
{
    return [
        Forms\Components\Grid::make(2)
            ->schema([
                Forms\Components\TextInput::make('config.badge')
                    ->label('Badge text')
                    ->placeholder('Về chúng tôi')
                    ->maxLength(50),

                Forms\Components\TextInput::make('config.title')
                    ->label('Tiêu đề chính')
                    ->placeholder('Đối tác công nghệ chiến lược')
                    ->required()
                    ->maxLength(100),
            ]),

        Forms\Components\TextInput::make('config.subtitle')
            ->label('Tiêu đề phụ')
            ->placeholder('Giải pháp toàn diện cho doanh nghiệp')
            ->maxLength(150)
            ->columnSpanFull(),

        Forms\Components\RichEditor::make('config.description')
            ->label('Mô tả chi tiết')
            ->toolbarButtons([
                'bold', 'italic', 'underline',
                'bulletList', 'orderedList',
                'link',
            ])
            ->columnSpanFull(),

        Forms\Components\Textarea::make('config.quote')
            ->label('Trích dẫn / Slogan')
            ->placeholder('Cam kết mang đến giải pháp tối ưu...')
            ->rows(2)
            ->columnSpanFull(),

        Forms\Components\FileUpload::make('config.image')
            ->label('Ảnh minh họa')
            ->image()
            ->directory('about')
            ->columnSpanFull(),

        Forms\Components\Repeater::make('config.features')
            ->label('Điểm nổi bật')
            ->schema([
                Forms\Components\TextInput::make('title')
                    ->label('Tiêu đề')
                    ->required()
                    ->maxLength(50),

                Forms\Components\Textarea::make('description')
                    ->label('Mô tả')
                    ->rows(2)
                    ->maxLength(200),

                Forms\Components\Select::make('icon')
                    ->label('Icon')
                    ->options([
                        'shield-check' => 'Bảo mật',
                        'lightning-bolt' => 'Nhanh chóng',
                        'users' => 'Đội ngũ',
                        'cog' => 'Kỹ thuật',
                        'heart' => 'Tận tâm',
                        'globe' => 'Toàn cầu',
                    ]),
            ])
            ->columns(3)
            ->reorderable()
            ->maxItems(6)
            ->grid(2)
            ->columnSpanFull(),
    ];
}
```

## Product Categories

```php
protected static function productCategoriesFields(): array
{
    return [
        Forms\Components\TextInput::make('config.title')
            ->label('Tiêu đề section')
            ->default('Danh mục sản phẩm')
            ->maxLength(100),

        Forms\Components\Repeater::make('config.categories')
            ->label('Danh sách danh mục')
            ->schema([
                Forms\Components\FileUpload::make('image')
                    ->label('Ảnh đại diện')
                    ->image()
                    ->directory('categories')
                    ->required(),

                Forms\Components\TextInput::make('name')
                    ->label('Tên danh mục')
                    ->required()
                    ->maxLength(50),

                Forms\Components\TextInput::make('description')
                    ->label('Mô tả ngắn')
                    ->maxLength(100),

                Forms\Components\TextInput::make('link')
                    ->label('Link đến')
                    ->placeholder('/products/category-slug'),

                Forms\Components\ColorPicker::make('color')
                    ->label('Màu nền (tùy chọn)'),
            ])
            ->columns(2)
            ->reorderable()
            ->collapsible()
            ->maxItems(12)
            ->grid(2)
            ->itemLabel(fn (array $state): ?string => $state['name'] ?? 'Danh mục'),
    ];
}
```

## Featured Products

```php
protected static function featuredProductsFields(): array
{
    return [
        Forms\Components\TextInput::make('config.title')
            ->label('Tiêu đề section')
            ->default('Sản phẩm nổi bật')
            ->maxLength(100),

        Forms\Components\TextInput::make('config.subtitle')
            ->label('Mô tả section')
            ->maxLength(200),

        Forms\Components\Select::make('config.display_mode')
            ->label('Chế độ hiển thị')
            ->options([
                'manual' => 'Chọn thủ công',
                'latest' => 'Sản phẩm mới nhất',
                'bestseller' => 'Bán chạy nhất',
                'featured' => 'Đánh dấu nổi bật',
            ])
            ->default('manual')
            ->live(),

        Forms\Components\TextInput::make('config.limit')
            ->label('Số lượng hiển thị')
            ->numeric()
            ->default(8)
            ->minValue(4)
            ->maxValue(24)
            ->visible(fn (Get $get) => $get('config.display_mode') !== 'manual'),

        Forms\Components\Repeater::make('config.products')
            ->label('Chọn sản phẩm')
            ->visible(fn (Get $get) => $get('config.display_mode') === 'manual')
            ->schema([
                Forms\Components\Select::make('product_id')
                    ->label('Sản phẩm')
                    ->options(fn () => \App\Models\Product::pluck('name', 'id'))
                    ->searchable()
                    ->required(),
            ])
            ->simple(
                Forms\Components\Select::make('product_id')
                    ->options(fn () => \App\Models\Product::pluck('name', 'id'))
                    ->searchable()
                    ->required()
            )
            ->reorderable()
            ->maxItems(24),

        Forms\Components\TextInput::make('config.view_all_link')
            ->label('Link "Xem tất cả"')
            ->placeholder('/products'),
    ];
}
```

## Partners

```php
protected static function partnersFields(): array
{
    return [
        Forms\Components\TextInput::make('config.title')
            ->label('Tiêu đề section')
            ->default('Đối tác chiến lược')
            ->maxLength(100),

        Forms\Components\Repeater::make('config.partners')
            ->label('Danh sách đối tác')
            ->schema([
                Forms\Components\FileUpload::make('logo')
                    ->label('Logo đối tác')
                    ->image()
                    ->directory('partners')
                    ->required(),

                Forms\Components\TextInput::make('name')
                    ->label('Tên đối tác')
                    ->required()
                    ->maxLength(100),

                Forms\Components\TextInput::make('link')
                    ->label('Website')
                    ->url()
                    ->placeholder('https://partner.com'),
            ])
            ->columns(3)
            ->reorderable()
            ->collapsible()
            ->maxItems(20)
            ->grid(2)
            ->itemLabel(fn (array $state): ?string => $state['name'] ?? 'Đối tác'),

        Forms\Components\Toggle::make('config.auto_scroll')
            ->label('Tự động cuộn')
            ->default(true),

        Forms\Components\Select::make('config.scroll_speed')
            ->label('Tốc độ cuộn')
            ->options([
                'slow' => 'Chậm',
                'normal' => 'Bình thường',
                'fast' => 'Nhanh',
            ])
            ->default('normal')
            ->visible(fn (Get $get) => $get('config.auto_scroll')),
    ];
}
```

## News

```php
protected static function newsFields(): array
{
    return [
        Forms\Components\TextInput::make('config.title')
            ->label('Tiêu đề section')
            ->default('Tin tức & Sự kiện')
            ->maxLength(100),

        Forms\Components\Select::make('config.display_mode')
            ->label('Chế độ hiển thị')
            ->options([
                'latest' => 'Bài mới nhất',
                'manual' => 'Chọn thủ công',
            ])
            ->default('latest')
            ->live(),

        Forms\Components\TextInput::make('config.limit')
            ->label('Số bài hiển thị')
            ->numeric()
            ->default(6)
            ->minValue(3)
            ->maxValue(12)
            ->visible(fn (Get $get) => $get('config.display_mode') === 'latest'),

        Forms\Components\Select::make('config.category_id')
            ->label('Lọc theo danh mục')
            ->options(fn () => \App\Models\PostCategory::pluck('name', 'id'))
            ->placeholder('Tất cả danh mục')
            ->visible(fn (Get $get) => $get('config.display_mode') === 'latest'),

        Forms\Components\Repeater::make('config.post_ids')
            ->label('Chọn bài viết')
            ->visible(fn (Get $get) => $get('config.display_mode') === 'manual')
            ->simple(
                Forms\Components\Select::make('post_id')
                    ->options(fn () => \App\Models\Post::latest()->pluck('title', 'id'))
                    ->searchable()
                    ->required()
            )
            ->reorderable()
            ->maxItems(12),

        Forms\Components\TextInput::make('config.view_all_link')
            ->label('Link "Xem tất cả"')
            ->placeholder('/news'),
    ];
}
```

## Footer

```php
protected static function footerFields(): array
{
    return [
        Forms\Components\Section::make('Thông tin công ty')
            ->schema([
                Forms\Components\TextInput::make('config.company_name')
                    ->label('Tên công ty')
                    ->required()
                    ->maxLength(100),

                Forms\Components\Textarea::make('config.address')
                    ->label('Địa chỉ')
                    ->rows(2),

                Forms\Components\TextInput::make('config.phone')
                    ->label('Số điện thoại')
                    ->tel(),

                Forms\Components\TextInput::make('config.hotline')
                    ->label('Hotline')
                    ->placeholder('1900 xxxx'),

                Forms\Components\TextInput::make('config.email')
                    ->label('Email')
                    ->email(),

                Forms\Components\TextInput::make('config.tax_code')
                    ->label('Mã số thuế'),
            ])
            ->columns(2),

        Forms\Components\Section::make('Mạng xã hội')
            ->schema([
                Forms\Components\Repeater::make('config.social_links')
                    ->label('Liên kết mạng xã hội')
                    ->schema([
                        Forms\Components\Select::make('platform')
                            ->label('Nền tảng')
                            ->options([
                                'facebook' => 'Facebook',
                                'zalo' => 'Zalo',
                                'youtube' => 'YouTube',
                                'tiktok' => 'TikTok',
                                'instagram' => 'Instagram',
                                'linkedin' => 'LinkedIn',
                                'twitter' => 'Twitter/X',
                            ])
                            ->required(),

                        Forms\Components\TextInput::make('url')
                            ->label('Đường dẫn')
                            ->url()
                            ->required(),
                    ])
                    ->columns(2)
                    ->reorderable()
                    ->maxItems(8),
            ]),

        Forms\Components\Section::make('Chính sách')
            ->schema([
                Forms\Components\Repeater::make('config.policies')
                    ->label('Danh sách chính sách')
                    ->schema([
                        Forms\Components\TextInput::make('label')
                            ->label('Tên chính sách')
                            ->required()
                            ->maxLength(50),

                        Forms\Components\TextInput::make('link')
                            ->label('Đường dẫn')
                            ->placeholder('/chinh-sach-doi-tra'),
                    ])
                    ->columns(2)
                    ->reorderable()
                    ->maxItems(10)
                    ->defaultItems(4),
            ]),

        Forms\Components\Section::make('Bản quyền')
            ->schema([
                Forms\Components\TextInput::make('config.copyright')
                    ->label('Text bản quyền')
                    ->placeholder('© 2024 Công ty ABC. Bảo lưu mọi quyền.')
                    ->helperText('Dùng {year} để tự động thay năm hiện tại'),
            ]),
    ];
}
```

## Common Patterns

### Conditional Fields với `visible()` và `live()`

```php
Forms\Components\Select::make('config.mode')
    ->options(['a' => 'Option A', 'b' => 'Option B'])
    ->live(), // Trigger re-render khi thay đổi

Forms\Components\TextInput::make('config.field_a')
    ->visible(fn (Get $get) => $get('config.mode') === 'a'),
```

### Repeater với Item Label

```php
Forms\Components\Repeater::make('config.items')
    ->itemLabel(fn (array $state): ?string =>
        $state['title'] ?? $state['name'] ?? 'Item mới'
    )
```

### File Upload với Image Optimization

```php
Forms\Components\FileUpload::make('image')
    ->image()
    ->directory('uploads')
    ->imageResizeMode('cover')
    ->imageCropAspectRatio('16:9')
    ->imageResizeTargetWidth(1200)
    ->imageResizeTargetHeight(675)
    ->maxSize(2048) // 2MB
    ->acceptedFileTypes(['image/jpeg', 'image/png', 'image/webp'])
```
