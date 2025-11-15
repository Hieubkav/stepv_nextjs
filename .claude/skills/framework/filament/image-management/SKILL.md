---
name: image-management
description: Centralized polymorphic image management with CheckboxList picker, WebP auto-conversion, order management (order=0 for cover), soft deletes, bulk operations, and advanced Filament 4.x integrations. USE WHEN adding images/gallery to models, implementing image upload, working with ImagesRelationManager, bulk image actions, or fixing image errors.
---
---
## When to Use

- Adding image gallery to models
- Implementing single featured image
- Setting up logo/favicon
- Fixing image upload issues
- Working with ImagesRelationManager
- Image picker implementation
- Bulk image operations (delete, reorder, optimize)
- Integration with Filament 4.x actions

---
## ⚡ Filament 4.x Enhancements

**New Features:**
- Unified action system for image operations
- Bulk image management with notifications
- Advanced file upload with previews
- Custom storage drivers integration
- Performance optimizations
- Better drag-drop reordering

---
## System Overview

**Centralized Polymorphic:**
- Single `images` table for ALL entities
- Polymorphic relationships
- Order management (0 = cover)
- Auto WebP conversion (85%)
- Soft deletes with cleanup
- CheckboxList picker (native Filament)


---
---
## ImagesRelationManager

**Auto-generated features:**
- Upload with drag-drop
- Reorder with drag-drop
- Set cover (order=0)
- Edit alt text/title
- Delete with confirmation
- WebP auto-conversion

**Generate:**
```bash
php artisan make:filament-relation-manager ProductResource images file_path
```


---
## ImageObserver

**Auto-features:**
- Alt text from model name
- Order auto-increment
- Cover auto-set
- Soft delete cleanup

```php
class ImageObserver
{
    public function creating(Image $image): void
    {
        if (empty($image->alt_text) && $image->model) {
            $image->alt_text = $image->model->name ?? 'Image';
        }
        
        if ($image->order === null) {
            $max = Image::where('model_type', $image->model_type)
                ->where('model_id', $image->model_id)
                ->max('order');
            $image->order = ($max ?? -1) + 1;
        }
    }
}
```


---
## WebP Conversion

**Automatic on upload:**
- Original preserved
- WebP created (85% quality)
- Stored in `storage/app/public/images/`
- Auto-served via intervention

**Manual conversion:**
```php
$webpPath = Image::convertToWebP($originalPath);
```


---
---
## 🆕 Advanced Image Actions (v4)

**Bulk Image Operations:**
```php
use Filament\Actions\BulkAction;
use Filament\Notifications\Notification;

// In ImagesRelationManager
public function table(Table $table): Table
{
    return $table
        ->columns([...])
        ->bulkActions([
            BulkAction::make('optimize')
                ->label('Tối ưu WebP')
                ->icon('heroicon-o-photo')
                ->action(function (Collection $records) {
                    foreach ($records as $image) {
                        Image::convertToWebP($image->file_path);
                    }
                    
                    Notification::make()
                        ->success()
                        ->title('Đã tối ưu ' . $records->count() . ' ảnh')
                        ->send();
                })
                ->deselectRecordsAfterCompletion(),
                
            BulkAction::make('set_cover')
                ->label('Đặt làm ảnh đại diện')
                ->icon('heroicon-o-star')
                ->requiresConfirmation()
                ->action(function (Collection $records) {
                    // Only first selected image becomes cover
                    $newCover = $records->first();
                    
                    // Reset other covers
                    Image::where('model_type', $newCover->model_type)
                        ->where('model_id', $newCover->model_id)
                        ->where('order', 0)
                        ->update(['order' => 999]);
                    
                    $newCover->update(['order' => 0]);
                    
                    Notification::make()
                        ->success()
                        ->title('Đã đặt ảnh đại diện')
                        ->send();
                }),
        ]);
}
```

**Custom Upload with Preview:**
```php
use Filament\Forms\Components\FileUpload;

FileUpload::make('file_path')
    ->label('Ảnh')
    ->image()
    ->disk('public')
    ->directory('images')
    ->visibility('public')
    ->imageEditor()                    // Image editor
    ->imageEditorAspectRatios([        // Aspect ratios
        '16:9', '4:3', '1:1',
    ])
    ->imageCropAspectRatio('16:9')     // Default crop
    ->imageResizeTargetWidth('1920')   // Max width
    ->imageResizeTargetHeight('1080')  // Max height
    ->maxSize(5120)                    // 5MB
    ->acceptedFileTypes(['image/jpeg', 'image/png', 'image/webp'])
    ->downloadable()
    ->previewable()
    ->openable()
    ->deletable()
```

**Advanced Reordering:**
```php
// In ImagesRelationManager
->reorderable('order')
->reorderRecordsTriggerAction(
    fn (Action $action, bool $isReordering) => $action
        ->button()
        ->label($isReordering ? 'Xong' : 'Sắp xếp lại')
)
->defaultSort('order', 'asc')
```

---
## 📦 Storage Drivers Integration

**Custom S3/Cloud Storage:**
```php
// config/filesystems.php
'disks' => [
    's3-images' => [
        'driver' => 's3',
        'key' => env('AWS_ACCESS_KEY_ID'),
        'secret' => env('AWS_SECRET_ACCESS_KEY'),
        'region' => env('AWS_DEFAULT_REGION'),
        'bucket' => env('AWS_BUCKET'),
        'url' => env('AWS_URL'),
        'endpoint' => env('AWS_ENDPOINT'),
    ],
],

// In Image model
protected $disk = 's3-images';

public function getUrlAttribute(): string
{
    return Storage::disk($this->disk)->url($this->file_path);
}
```

**Local with CDN:**
```php
// Use signed URLs for security
public function getUrlAttribute(): string
{
    return Storage::disk('public')
        ->temporaryUrl(
            $this->file_path,
            now()->addMinutes(30)
        );
}
```

---
## Common Issues

### Issue: Unique constraint violation on order

**Solution:**
```php
// ImageObserver handles auto-increment
// Don't manually set order=0 for all images
```

### Issue: Images not showing

**Check:**
1. Storage link: `php artisan storage:link`
2. Disk config: `config/filesystems.php`
3. Image path: `Storage::url($image->file_path)`

### Issue: Multiple covers (order=0)

**Solution:**
```php
// When setting new cover
Image::where('model_type', $type)
    ->where('model_id', $id)
    ->where('order', 0)
    ->update(['order' => 999]);  // Reset old cover

$newCover->update(['order' => 0]);
```

### Issue: WebP conversion fails

**Solution:**
```php
// Ensure GD or Imagick installed
php -m | grep -E 'gd|imagick'

// Install if missing
apt-get install php-gd
# or
apt-get install php-imagick
```

### Issue: Large file uploads timeout

**Solution:**
```php
// .env
MAX_UPLOAD_SIZE=10240

// php.ini
upload_max_filesize = 10M
post_max_size = 10M
max_execution_time = 300

// Nginx
client_max_body_size 10M;
```


## Complete Guide

For detailed implementation, advanced patterns, and troubleshooting:

`read .claude/skills/filament/image-management/CLAUDE.md`

**Related:**
- Filament standards: `read .claude/skills/filament/filament-rules/SKILL.md`
- Resource generator: `read .claude/skills/filament/filament-resource-generator/SKILL.md`


---

## References

**Quick Patterns:** `read .claude/skills/filament/image-management/references/quick-patterns.md`
