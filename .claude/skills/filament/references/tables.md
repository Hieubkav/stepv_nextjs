# Table Components

## Columns

### Text Column

```php
Tables\Columns\TextColumn::make('title')
    ->searchable()
    ->sortable()
    ->limit(50)
    ->wrap()
    ->copyable()
    ->copyMessage('Copied!')
    ->weight('bold')
    ->color('primary')
    ->description(fn ($record) => $record->subtitle)
    ->url(fn ($record) => route('posts.show', $record))
    ->openUrlInNewTab()
    ->formatStateUsing(fn (string $state) => strtoupper($state))
    ->toggleable()
    ->toggleable(isToggledHiddenByDefault: true);

// Date formatting
Tables\Columns\TextColumn::make('created_at')
    ->dateTime()
    ->date('d/m/Y')
    ->since()
    ->timezone('Asia/Ho_Chi_Minh');

// Numeric formatting
Tables\Columns\TextColumn::make('price')
    ->money('USD')
    ->numeric(decimalPlaces: 2)
    ->summarize([
        Tables\Columns\Summarizers\Sum::make()->money('USD'),
        Tables\Columns\Summarizers\Average::make()->money('USD'),
    ]);

// Badge
Tables\Columns\TextColumn::make('status')
    ->badge()
    ->color(fn (string $state) => match ($state) {
        'draft' => 'warning',
        'reviewing' => 'primary',
        'published' => 'success',
        'archived' => 'danger',
    })
    ->icon(fn (string $state) => match ($state) {
        'draft' => 'heroicon-o-pencil',
        'published' => 'heroicon-o-check-circle',
    });
```

### Image Column

```php
Tables\Columns\ImageColumn::make('avatar')
    ->circular()
    ->square()
    ->size(40)
    ->defaultImageUrl(url('/images/placeholder.png'))
    ->stacked()                 // For multiple images
    ->limit(3)
    ->limitedRemainingText();
```

### Icon Column

```php
Tables\Columns\IconColumn::make('is_active')
    ->boolean()
    ->trueIcon('heroicon-o-check-circle')
    ->falseIcon('heroicon-o-x-circle')
    ->trueColor('success')
    ->falseColor('danger');

Tables\Columns\IconColumn::make('status')
    ->icon(fn (string $state) => match ($state) {
        'pending' => 'heroicon-o-clock',
        'approved' => 'heroicon-o-check',
    })
    ->color(fn (string $state) => match ($state) {
        'pending' => 'warning',
        'approved' => 'success',
    });
```

### Color Column

```php
Tables\Columns\ColorColumn::make('color')
    ->copyable()
    ->copyMessage('Color code copied');
```

### Custom Column

```php
Tables\Columns\TextColumn::make('full_name')
    ->state(fn ($record) => "{$record->first_name} {$record->last_name}")
    ->searchable(['first_name', 'last_name']);
```

## Filters

```php
return $table->filters([
    // Select filter
    Tables\Filters\SelectFilter::make('status')
        ->options([
            'draft' => 'Draft',
            'published' => 'Published',
        ])
        ->multiple()
        ->preload()
        ->native(false),
    
    // Relationship filter
    Tables\Filters\SelectFilter::make('category')
        ->relationship('category', 'name')
        ->searchable()
        ->preload(),
    
    // Ternary filter (Yes/No/All)
    Tables\Filters\TernaryFilter::make('is_featured')
        ->label('Featured')
        ->placeholder('All')
        ->trueLabel('Featured only')
        ->falseLabel('Not featured'),
    
    // Custom filter with form
    Tables\Filters\Filter::make('created_at')
        ->form([
            Forms\Components\DatePicker::make('from'),
            Forms\Components\DatePicker::make('until'),
        ])
        ->query(function (Builder $query, array $data): Builder {
            return $query
                ->when($data['from'], fn ($q, $date) => 
                    $q->whereDate('created_at', '>=', $date))
                ->when($data['until'], fn ($q, $date) => 
                    $q->whereDate('created_at', '<=', $date));
        })
        ->indicateUsing(function (array $data): array {
            $indicators = [];
            if ($data['from']) {
                $indicators['from'] = 'From ' . Carbon::parse($data['from'])->toFormattedDateString();
            }
            if ($data['until']) {
                $indicators['until'] = 'Until ' . Carbon::parse($data['until'])->toFormattedDateString();
            }
            return $indicators;
        }),
    
    // Toggle filter
    Tables\Filters\Filter::make('high_value')
        ->label('High Value Orders')
        ->query(fn (Builder $query) => $query->where('total', '>=', 500))
        ->toggle(),
    
    // Trashed filter
    Tables\Filters\TrashedFilter::make(),
]);
```

## Actions

```php
return $table->actions([
    Tables\Actions\ViewAction::make(),
    Tables\Actions\EditAction::make(),
    Tables\Actions\DeleteAction::make(),
    
    // Custom action
    Tables\Actions\Action::make('approve')
        ->label('Approve')
        ->icon('heroicon-o-check')
        ->color('success')
        ->visible(fn ($record) => $record->status === 'pending')
        ->requiresConfirmation()
        ->modalHeading('Approve this item?')
        ->modalDescription('This action cannot be undone.')
        ->modalSubmitActionLabel('Yes, approve')
        ->action(function ($record) {
            $record->update(['status' => 'approved']);
            
            Notification::make()
                ->success()
                ->title('Approved')
                ->send();
        }),
    
    // Action with form
    Tables\Actions\Action::make('updateStatus')
        ->form([
            Forms\Components\Select::make('status')
                ->options(['draft', 'published'])
                ->required(),
        ])
        ->action(fn ($record, array $data) => 
            $record->update($data)),
    
    // Action group
    Tables\Actions\ActionGroup::make([
        Tables\Actions\ViewAction::make(),
        Tables\Actions\EditAction::make(),
        Tables\Actions\DeleteAction::make(),
    ])
        ->icon('heroicon-m-ellipsis-vertical')
        ->color('gray'),
]);
```

## Bulk Actions

```php
return $table->bulkActions([
    Tables\Actions\BulkActionGroup::make([
        Tables\Actions\DeleteBulkAction::make(),
        
        Tables\Actions\BulkAction::make('updateStatus')
            ->label('Update Status')
            ->icon('heroicon-o-arrow-path')
            ->form([
                Forms\Components\Select::make('status')
                    ->options(['draft', 'published'])
                    ->required(),
            ])
            ->action(function (Collection $records, array $data) {
                $records->each->update(['status' => $data['status']]);
                
                Notification::make()
                    ->success()
                    ->title('Updated ' . $records->count() . ' records')
                    ->send();
            })
            ->deselectRecordsAfterCompletion(),
        
        Tables\Actions\BulkAction::make('export')
            ->label('Export Selected')
            ->icon('heroicon-o-arrow-down-tray')
            ->action(fn (Collection $records) => 
                // Export logic
            ),
    ]),
]);
```

## Header Actions

```php
protected function getHeaderActions(): array
{
    return [
        Tables\Actions\CreateAction::make(),
        Tables\Actions\Action::make('export')
            ->label('Export')
            ->icon('heroicon-o-arrow-down-tray')
            ->action(fn () => $this->export()),
    ];
}
```

## Table Configuration

```php
return $table
    ->columns([...])
    ->filters([...])
    ->actions([...])
    ->bulkActions([...])
    ->defaultSort('created_at', 'desc')
    ->reorderable('sort_order')         // Drag & drop reorder
    ->poll('60s')                       // Auto refresh
    ->deferLoading()                    // Lazy load
    ->striped()
    ->paginated([10, 25, 50, 100, 'all'])
    ->defaultPaginationPageOption(25)
    ->searchPlaceholder('Search posts...')
    ->emptyStateHeading('No posts yet')
    ->emptyStateDescription('Create your first post.')
    ->emptyStateActions([
        Tables\Actions\CreateAction::make(),
    ]);
```

## Grouping

```php
return $table
    ->groups([
        Tables\Grouping\Group::make('status')
            ->label('Status')
            ->collapsible(),
        Tables\Grouping\Group::make('category.name')
            ->label('Category'),
    ])
    ->defaultGroup('status');
```
