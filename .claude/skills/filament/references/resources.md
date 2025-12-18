# Resources - CRUD Operations

## Tạo Resource

```bash
php artisan make:filament-resource Post --generate
php artisan make:filament-resource Post --soft-deletes
php artisan make:filament-resource Post --view
```

## Resource đầy đủ

```php
<?php

namespace App\Filament\Resources;

use Filament\Forms;
use Filament\Tables;
use Filament\Schemas\Schema;
use Filament\Resources\Resource;
use App\Models\Post;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\SoftDeletingScope;

class PostResource extends Resource
{
    protected static ?string $model = Post::class;
    
    // Navigation
    protected static ?string $navigationIcon = 'heroicon-o-document-text';
    protected static ?string $navigationGroup = 'Content';
    protected static ?int $navigationSort = 1;
    protected static ?string $navigationLabel = 'Posts';
    
    // Global Search
    protected static ?string $recordTitleAttribute = 'title';
    
    // Labels
    protected static ?string $modelLabel = 'post';
    protected static ?string $pluralModelLabel = 'posts';

    public static function form(Schema $schema): Schema
    {
        return $schema->components([
            Forms\Components\Section::make('Basic Information')
                ->description('Enter the post details')
                ->schema([
                    Forms\Components\TextInput::make('title')
                        ->required()
                        ->maxLength(255)
                        ->live(onBlur: true)
                        ->afterStateUpdated(fn ($state, $set) => 
                            $set('slug', \Str::slug($state))),
                    
                    Forms\Components\TextInput::make('slug')
                        ->required()
                        ->unique(ignoreRecord: true),
                    
                    Forms\Components\Select::make('category_id')
                        ->relationship('category', 'name')
                        ->searchable()
                        ->preload()
                        ->createOptionForm([
                            Forms\Components\TextInput::make('name')
                                ->required(),
                        ]),
                    
                    Forms\Components\Select::make('author_id')
                        ->relationship('author', 'name')
                        ->default(auth()->id()),
                ])
                ->columns(2),
            
            Forms\Components\Section::make('Content')
                ->schema([
                    Forms\Components\RichEditor::make('content')
                        ->required()
                        ->fileAttachmentsDirectory('posts/attachments')
                        ->columnSpanFull(),
                ]),
            
            Forms\Components\Section::make('Media')
                ->schema([
                    Forms\Components\FileUpload::make('featured_image')
                        ->image()
                        ->imageEditor()
                        ->directory('posts/images'),
                ]),
            
            Forms\Components\Section::make('Settings')
                ->schema([
                    Forms\Components\Select::make('status')
                        ->options([
                            'draft' => 'Draft',
                            'published' => 'Published',
                        ])
                        ->default('draft')
                        ->required(),
                    
                    Forms\Components\DateTimePicker::make('published_at')
                        ->visible(fn ($get) => $get('status') === 'published'),
                    
                    Forms\Components\Toggle::make('is_featured'),
                    
                    Forms\Components\TagsInput::make('tags'),
                ])
                ->columns(2),
        ]);
    }

    public static function table(Tables\Table $table): Tables\Table
    {
        return $table
            ->columns([
                Tables\Columns\ImageColumn::make('featured_image')
                    ->circular(),
                
                Tables\Columns\TextColumn::make('title')
                    ->searchable()
                    ->sortable()
                    ->description(fn ($record) => \Str::limit($record->excerpt, 50)),
                
                Tables\Columns\TextColumn::make('category.name')
                    ->badge()
                    ->sortable(),
                
                Tables\Columns\TextColumn::make('status')
                    ->badge()
                    ->color(fn (string $state) => match ($state) {
                        'draft' => 'warning',
                        'published' => 'success',
                    }),
                
                Tables\Columns\IconColumn::make('is_featured')
                    ->boolean(),
                
                Tables\Columns\TextColumn::make('created_at')
                    ->dateTime()
                    ->sortable()
                    ->toggleable(isToggledHiddenByDefault: true),
            ])
            ->defaultSort('created_at', 'desc')
            ->filters([
                Tables\Filters\SelectFilter::make('status')
                    ->options([
                        'draft' => 'Draft',
                        'published' => 'Published',
                    ]),
                
                Tables\Filters\SelectFilter::make('category')
                    ->relationship('category', 'name'),
                
                Tables\Filters\TernaryFilter::make('is_featured'),
                
                Tables\Filters\TrashedFilter::make(),
            ])
            ->actions([
                Tables\Actions\ViewAction::make(),
                Tables\Actions\EditAction::make(),
                Tables\Actions\DeleteAction::make(),
            ])
            ->bulkActions([
                Tables\Actions\BulkActionGroup::make([
                    Tables\Actions\DeleteBulkAction::make(),
                    Tables\Actions\ForceDeleteBulkAction::make(),
                    Tables\Actions\RestoreBulkAction::make(),
                ]),
            ]);
    }

    public static function getRelations(): array
    {
        return [
            RelationManagers\CommentsRelationManager::class,
        ];
    }

    public static function getPages(): array
    {
        return [
            'index' => Pages\ListPosts::route('/'),
            'create' => Pages\CreatePost::route('/create'),
            'view' => Pages\ViewPost::route('/{record}'),
            'edit' => Pages\EditPost::route('/{record}/edit'),
        ];
    }

    public static function getEloquentQuery(): Builder
    {
        return parent::getEloquentQuery()
            ->withoutGlobalScopes([
                SoftDeletingScope::class,
            ]);
    }
    
    // Global search
    public static function getGlobalSearchResultDetails($record): array
    {
        return [
            'Category' => $record->category?->name,
            'Author' => $record->author?->name,
        ];
    }
}
```

## Relation Manager

```php
<?php

namespace App\Filament\Resources\PostResource\RelationManagers;

use Filament\Resources\RelationManagers\RelationManager;
use Filament\Forms;
use Filament\Tables;

class CommentsRelationManager extends RelationManager
{
    protected static string $relationship = 'comments';

    public function form(Form $form): Form
    {
        return $form->schema([
            Forms\Components\Textarea::make('content')
                ->required()
                ->columnSpanFull(),
        ]);
    }

    public function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\TextColumn::make('user.name'),
                Tables\Columns\TextColumn::make('content')
                    ->limit(50),
                Tables\Columns\TextColumn::make('created_at')
                    ->dateTime(),
            ])
            ->headerActions([
                Tables\Actions\CreateAction::make(),
            ])
            ->actions([
                Tables\Actions\EditAction::make(),
                Tables\Actions\DeleteAction::make(),
            ])
            ->bulkActions([
                Tables\Actions\DeleteBulkAction::make(),
            ]);
    }
}
```

## Navigation Badge

```php
public static function getNavigationBadge(): ?string
{
    return static::getModel()::where('status', 'pending')->count();
}

public static function getNavigationBadgeColor(): ?string
{
    return static::getModel()::where('status', 'pending')->count() > 10
        ? 'warning'
        : 'primary';
}
```
