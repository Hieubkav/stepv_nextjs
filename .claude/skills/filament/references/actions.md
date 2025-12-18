# Actions & Modals

## Action cơ bản

```php
use Filament\Actions\Action;

Action::make('approve')
    ->label('Approve')
    ->icon('heroicon-o-check')
    ->color('success')
    ->size('sm')                    // 'xs', 'sm', 'md', 'lg', 'xl'
    ->outlined()
    ->action(fn ($record) => $record->approve());
```

## Confirmation Modal

```php
Action::make('delete')
    ->requiresConfirmation()
    ->modalHeading('Delete item')
    ->modalDescription('Are you sure you want to delete this? This cannot be undone.')
    ->modalSubmitActionLabel('Yes, delete')
    ->modalCancelActionLabel('No, cancel')
    ->action(fn ($record) => $record->delete());
```

## Modal với Form

```php
Action::make('updateStatus')
    ->form([
        Forms\Components\Select::make('status')
            ->options([
                'pending' => 'Pending',
                'approved' => 'Approved',
                'rejected' => 'Rejected',
            ])
            ->required(),
        
        Forms\Components\Textarea::make('reason')
            ->label('Reason')
            ->visible(fn (Get $get) => $get('status') === 'rejected')
            ->required(fn (Get $get) => $get('status') === 'rejected'),
    ])
    ->fillForm(fn ($record) => [
        'status' => $record->status,
    ])
    ->modalWidth('lg')              // 'sm', 'md', 'lg', 'xl', '2xl', '3xl'
    ->action(function ($record, array $data) {
        $record->update($data);
        
        Notification::make()
            ->success()
            ->title('Status updated')
            ->send();
    });
```

## Action với Wizard

```php
Action::make('create')
    ->steps([
        Forms\Components\Wizard\Step::make('Account')
            ->schema([
                Forms\Components\TextInput::make('email')
                    ->email()
                    ->required(),
            ]),
        Forms\Components\Wizard\Step::make('Profile')
            ->schema([
                Forms\Components\TextInput::make('name')
                    ->required(),
            ]),
    ])
    ->action(function (array $data) {
        User::create($data);
    });
```

## Visibility & Authorization

```php
Action::make('edit')
    ->visible(fn ($record) => $record->status !== 'completed')
    ->hidden(fn ($record) => $record->is_locked)
    ->disabled(fn ($record) => $record->status === 'processing')
    ->authorize('update')           // Sử dụng policy
    ->tooltip('Edit this record');
```

## Action Lifecycle

```php
Action::make('process')
    ->before(function ($record) {
        // Chạy trước action
        $record->update(['status' => 'processing']);
    })
    ->action(function ($record) {
        // Logic chính
        $record->process();
    })
    ->after(function ($record) {
        // Chạy sau action
        Notification::make()
            ->success()
            ->title('Processed')
            ->send();
    })
    ->successNotificationTitle('Successfully processed')
    ->failureNotificationTitle('Failed to process');
```

## Action Groups

```php
use Filament\Actions\ActionGroup;

ActionGroup::make([
    Action::make('view'),
    Action::make('edit'),
    Action::make('delete'),
])
    ->label('Actions')
    ->icon('heroicon-m-ellipsis-vertical')
    ->color('gray')
    ->button()                      // Hiển thị như button
    ->dropdown();                   // Hiển thị dropdown
```

## Page Actions

```php
// Trong Page class
protected function getHeaderActions(): array
{
    return [
        Action::make('save')
            ->action(fn () => $this->save()),
        
        Action::make('cancel')
            ->color('gray')
            ->url($this->getResource()::getUrl('index')),
    ];
}
```

## Import/Export Actions

```php
use Filament\Actions\Imports\ImportAction;
use Filament\Actions\Exports\ExportAction;

// Import
ImportAction::make()
    ->importer(ProductImporter::class);

// Export
ExportAction::make()
    ->exporter(ProductExporter::class);
```

## Custom Action Component

```php
<?php

namespace App\Filament\Actions;

use Filament\Actions\Action;

class SendEmailAction extends Action
{
    public static function getDefaultName(): ?string
    {
        return 'sendEmail';
    }

    protected function setUp(): void
    {
        parent::setUp();

        $this
            ->label('Send Email')
            ->icon('heroicon-o-envelope')
            ->color('primary')
            ->form([
                Forms\Components\TextInput::make('subject')
                    ->required(),
                Forms\Components\RichEditor::make('body')
                    ->required(),
            ])
            ->action(function ($record, array $data) {
                Mail::to($record->email)->send(
                    new CustomEmail($data['subject'], $data['body'])
                );
                
                Notification::make()
                    ->success()
                    ->title('Email sent')
                    ->send();
            });
    }
}

// Sử dụng
SendEmailAction::make();
```

## URL Actions

```php
Action::make('view')
    ->url(fn ($record) => route('posts.show', $record))
    ->openUrlInNewTab();

Action::make('download')
    ->url(fn ($record) => $record->download_url)
    ->action(function ($record) {
        return response()->download($record->file_path);
    });
```

## Slide-over Modal

```php
Action::make('preview')
    ->slideOver()
    ->modalContent(fn ($record) => view('preview', ['record' => $record]));
```
