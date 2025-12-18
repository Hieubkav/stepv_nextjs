# Form Components

## Text Inputs

```php
Forms\Components\TextInput::make('name')
    ->required()
    ->maxLength(255)
    ->minLength(3)
    ->placeholder('Enter name')
    ->helperText('Your full name')
    ->prefix('Mr./Ms.')
    ->suffix('@example.com')
    ->autocomplete('name')
    ->autofocus()
    ->disabled()
    ->readOnly()
    ->default('Default value')
    ->live()                    // Cập nhật real-time
    ->live(onBlur: true)        // Cập nhật khi blur
    ->afterStateUpdated(fn ($state, $set) => $set('slug', \Str::slug($state)));

// Numeric
Forms\Components\TextInput::make('price')
    ->numeric()
    ->inputMode('decimal')
    ->step(0.01)
    ->minValue(0)
    ->maxValue(10000)
    ->prefix('$');

// Password
Forms\Components\TextInput::make('password')
    ->password()
    ->revealable()
    ->confirmed();              // Requires password_confirmation field

// Email, URL, Tel
Forms\Components\TextInput::make('email')->email();
Forms\Components\TextInput::make('website')->url();
Forms\Components\TextInput::make('phone')->tel();
```

## Textarea & Rich Editor

```php
Forms\Components\Textarea::make('description')
    ->rows(5)
    ->cols(20)
    ->autosize()
    ->maxLength(1000);

Forms\Components\RichEditor::make('content')
    ->toolbarButtons([
        'bold', 'italic', 'underline', 'strike',
        'h2', 'h3', 'bulletList', 'orderedList',
        'link', 'blockquote', 'codeBlock',
    ])
    ->fileAttachmentsDirectory('uploads')
    ->columnSpanFull();

Forms\Components\MarkdownEditor::make('notes')
    ->fileAttachmentsDirectory('notes');
```

## Select

```php
Forms\Components\Select::make('status')
    ->options([
        'draft' => 'Draft',
        'published' => 'Published',
        'archived' => 'Archived',
    ])
    ->default('draft')
    ->required()
    ->native(false)             // Custom dropdown UI
    ->searchable()
    ->preload();

// Relationship
Forms\Components\Select::make('category_id')
    ->relationship('category', 'name')
    ->searchable()
    ->preload()
    ->createOptionForm([        // Create inline
        Forms\Components\TextInput::make('name')
            ->required(),
    ])
    ->editOptionForm([          // Edit inline
        Forms\Components\TextInput::make('name')
            ->required(),
    ]);

// Multiple select
Forms\Components\Select::make('tags')
    ->multiple()
    ->relationship('tags', 'name')
    ->preload();
```

## Checkbox & Toggle

```php
Forms\Components\Checkbox::make('agree_terms')
    ->label('I agree to the terms')
    ->required();

Forms\Components\Toggle::make('is_active')
    ->label('Active')
    ->default(true)
    ->onColor('success')
    ->offColor('danger')
    ->inline(false);

Forms\Components\CheckboxList::make('permissions')
    ->options([
        'create' => 'Create',
        'edit' => 'Edit',
        'delete' => 'Delete',
    ])
    ->columns(2)
    ->searchable();
```

## Date & Time

```php
Forms\Components\DatePicker::make('birth_date')
    ->native(false)
    ->displayFormat('d/m/Y')
    ->minDate(now()->subYears(100))
    ->maxDate(now());

Forms\Components\DateTimePicker::make('published_at')
    ->native(false)
    ->displayFormat('d/m/Y H:i')
    ->timezone('Asia/Ho_Chi_Minh')
    ->seconds(false);

Forms\Components\TimePicker::make('start_time')
    ->native(false)
    ->seconds(false);
```

## File Upload

```php
Forms\Components\FileUpload::make('avatar')
    ->image()
    ->imageEditor()
    ->imageEditorAspectRatios([
        '16:9',
        '4:3',
        '1:1',
    ])
    ->circleCropper()
    ->maxSize(2048)             // KB
    ->directory('avatars')
    ->visibility('public')
    ->disk('s3')
    ->preserveFilenames()
    ->downloadable()
    ->openable();

// Multiple files
Forms\Components\FileUpload::make('attachments')
    ->multiple()
    ->reorderable()
    ->maxFiles(5)
    ->acceptedFileTypes(['application/pdf', 'image/*']);
```

## Repeater

```php
Forms\Components\Repeater::make('items')
    ->schema([
        Forms\Components\TextInput::make('name')
            ->required(),
        Forms\Components\TextInput::make('quantity')
            ->numeric()
            ->default(1),
        Forms\Components\TextInput::make('price')
            ->numeric()
            ->prefix('$'),
    ])
    ->columns(3)
    ->collapsible()
    ->collapsed()
    ->cloneable()
    ->reorderable()
    ->itemLabel(fn (array $state) => $state['name'] ?? 'Item')
    ->addActionLabel('Add item')
    ->minItems(1)
    ->maxItems(10)
    ->defaultItems(1);

// Relationship
Forms\Components\Repeater::make('addresses')
    ->relationship()
    ->schema([...]);
```

## Layout Components

```php
// Section
Forms\Components\Section::make('Personal Information')
    ->description('Your personal details')
    ->icon('heroicon-o-user')
    ->collapsible()
    ->collapsed()
    ->schema([...])
    ->columns(2);

// Grid
Forms\Components\Grid::make(3)
    ->schema([...]);

// Tabs
Forms\Components\Tabs::make('Settings')
    ->tabs([
        Forms\Components\Tabs\Tab::make('General')
            ->icon('heroicon-o-cog')
            ->schema([...]),
        Forms\Components\Tabs\Tab::make('Advanced')
            ->schema([...]),
    ]);

// Wizard
Forms\Components\Wizard::make([
    Forms\Components\Wizard\Step::make('Account')
        ->schema([...]),
    Forms\Components\Wizard\Step::make('Profile')
        ->schema([...]),
])
    ->submitAction(view('submit-button'));

// Fieldset
Forms\Components\Fieldset::make('Address')
    ->schema([...]);
```

## Dynamic Fields

```php
// Conditional visibility
Forms\Components\TextInput::make('tax_rate')
    ->visible(fn (Get $get) => $get('has_tax'))
    ->required(fn (Get $get) => $get('has_tax'));

// Dynamic options
Forms\Components\Select::make('city_id')
    ->options(fn (Get $get) => 
        City::where('country_id', $get('country_id'))->pluck('name', 'id')
    )
    ->live();

// Disable based on condition
Forms\Components\TextInput::make('discount')
    ->disabled(fn (Get $get) => $get('status') === 'completed');
```

## Validation

```php
Forms\Components\TextInput::make('email')
    ->email()
    ->required()
    ->unique(ignoreRecord: true)
    ->rules(['email', 'max:255'])
    ->validationMessages([
        'email' => 'The email must be valid.',
        'unique' => 'This email is already registered.',
    ]);
```

## Custom Components

```php
Forms\Components\ColorPicker::make('color');
Forms\Components\TagsInput::make('tags')->separator(',');
Forms\Components\KeyValue::make('meta')
    ->keyLabel('Key')
    ->valueLabel('Value');
Forms\Components\Hidden::make('user_id')->default(auth()->id());
Forms\Components\Placeholder::make('created_at')
    ->content(fn ($record) => $record?->created_at?->diffForHumans());
```
