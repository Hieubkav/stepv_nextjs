---
name: livewire
description: Xây dựng UI động với Laravel Livewire 3. Hỗ trợ components, forms, validation, events, file uploads, computed properties, lazy loading, Alpine.js integration. Sử dụng khi cần tạo reactive components, real-time validation, form handling, hoặc khi làm việc với livewire trong Laravel.
---

# Laravel Livewire 3 Best Practices

Framework full-stack cho Laravel để xây dựng UI động chỉ với PHP - không cần JavaScript.

## Khi nào sử dụng Skill này

- Tạo Livewire components mới
- Xử lý forms với real-time validation
- Tối ưu hiệu suất Livewire components
- Giao tiếp giữa các components (events)
- File uploads với progress tracking
- Lazy loading components
- Tích hợp Alpine.js

## Component Cơ Bản

### Tạo Component

```bash
php artisan make:livewire CreatePost
```

### Cấu trúc Component

```php
<?php

namespace App\Livewire;

use Livewire\Component;
use App\Models\Post;

class CreatePost extends Component
{
    public $title = '';
    public $content = '';

    // Khởi tạo component
    public function mount()
    {
        $this->title = 'Default Title';
    }

    // Action method - gọi từ frontend
    public function save()
    {
        Post::create([
            'title' => $this->title,
            'content' => $this->content,
        ]);

        session()->flash('status', 'Post created!');
        return $this->redirect('/posts');
    }

    public function render()
    {
        return view('livewire.create-post');
    }
}
```

## Data Binding

```blade
<form wire:submit="save">
    <!-- Basic binding - cập nhật khi blur/change -->
    <input type="text" wire:model="title">

    <!-- Live binding - cập nhật mỗi keystroke (có debounce) -->
    <input type="text" wire:model.live="content">

    <!-- Blur binding - chỉ cập nhật khi mất focus -->
    <input type="email" wire:model.blur="email">

    <!-- Custom debounce -->
    <input type="search" wire:model.debounce.500ms="searchQuery">

    <button type="submit">Save</button>
</form>
```

## Validation với Attributes

```php
<?php

namespace App\Livewire;

use Livewire\Attributes\Validate;
use Livewire\Component;

class CreatePost extends Component
{
    #[Validate('required|min:5|max:255')]
    public $title = '';

    #[Validate('required|min:10')]
    public $content = '';

    #[Validate('required|email|unique:users,email')]
    public $email = '';

    public function save()
    {
        $this->validate();
        // Tạo post...
    }
}
```

```blade
<input type="text" wire:model.live="title">
@error('title') <span class="error">{{ $message }}</span> @enderror
```

## Form Objects

```php
<?php

namespace App\Livewire\Forms;

use Livewire\Attributes\Validate;
use Livewire\Form;

class PostForm extends Form
{
    #[Validate('required|min:5|max:255')]
    public $title = '';

    #[Validate('required|min:10')]
    public $content = '';

    public function store()
    {
        $this->validate();
        return Post::create($this->all());
    }
}
```

```php
<?php

namespace App\Livewire;

use App\Livewire\Forms\PostForm;
use Livewire\Component;

class CreatePost extends Component
{
    public PostForm $form;

    public function save()
    {
        $post = $this->form->store();
        return $this->redirect('/posts');
    }
}
```

```blade
<input type="text" wire:model="form.title">
@error('form.title') <span>{{ $message }}</span> @enderror
```

## Computed Properties (Quan trọng cho Performance)

```php
<?php

namespace App\Livewire;

use Livewire\Attributes\Computed;
use Livewire\Component;
use App\Models\Product;

class ProductList extends Component
{
    public $search = '';
    public $category = 'all';

    // Cached cho đến khi dependencies thay đổi
    #[Computed]
    public function products()
    {
        return Product::query()
            ->when($this->search, fn($q) =>
                $q->where('name', 'like', "%{$this->search}%")
            )
            ->when($this->category !== 'all', fn($q) =>
                $q->where('category', $this->category)
            )
            ->get();
    }

    #[Computed]
    public function totalProducts()
    {
        return $this->products->count();
    }

    public function render()
    {
        return view('livewire.product-list');
    }
}
```

```blade
<p>Found {{ $this->totalProducts }} products</p>
@foreach($this->products as $product)
    <div>{{ $product->name }}</div>
@endforeach
```

## Event System

### Dispatch Events

```php
// Dispatch global event
$this->dispatch('post-created', title: $post->title, id: $post->id);

// Dispatch đến component cụ thể
$this->dispatchTo('post-list', 'refresh-list');

// Dispatch đến chính nó
$this->dispatchSelf('clear-form');
```

### Listen Events

```php
use Livewire\Attributes\On;

#[On('post-created')]
public function updatePostList($title, $id)
{
    $this->posts = Post::all();
}

// Dynamic event name
#[On('post-updated.{post.id}')]
public function refreshPost()
{
    $this->post->refresh();
}
```

## File Uploads

```php
<?php

namespace App\Livewire;

use Livewire\Attributes\Validate;
use Livewire\Component;
use Livewire\WithFileUploads;

class UploadPhoto extends Component
{
    use WithFileUploads;

    #[Validate('required|image|max:1024')]
    public $photo;

    #[Validate('nullable|array')]
    #[Validate('photos.*', 'image|max:1024')]
    public $photos = [];

    public function save()
    {
        $this->validate();
        
        // Lưu file
        $path = $this->photo->store('photos', 'public');
        
        // Multiple files
        foreach ($this->photos as $photo) {
            $photo->store('photos', 'public');
        }

        $this->reset('photo', 'photos');
    }
}
```

```blade
<input type="file" wire:model="photo">

<!-- Loading progress -->
<div wire:loading wire:target="photo">Uploading...</div>

<!-- Preview -->
@if ($photo)
    <img src="{{ $photo->temporaryUrl() }}" width="200">
@endif

<!-- Progress bar với Alpine -->
<div
    x-data="{ uploading: false, progress: 0 }"
    x-on:livewire-upload-start="uploading = true"
    x-on:livewire-upload-finish="uploading = false"
    x-on:livewire-upload-progress="progress = $event.detail.progress"
>
    <input type="file" wire:model="photo">
    <div x-show="uploading">
        <progress max="100" x-bind:value="progress"></progress>
    </div>
</div>
```

## Loading States

```blade
<!-- Basic loading -->
<button wire:click="save">
    Save
    <span wire:loading wire:target="save">Saving...</span>
</button>

<!-- Delay để tránh flashing -->
<div wire:loading.delay wire:target="save">Processing...</div>

<!-- Disable button khi loading -->
<button wire:click="process" wire:loading.attr="disabled">Process</button>

<!-- Thêm CSS class khi loading -->
<button wire:click="save" wire:loading.class="opacity-50">Save</button>
```

## Lazy Loading (Performance)

```php
<?php

namespace App\Livewire;

use Livewire\Component;

class HeavyComponent extends Component
{
    public function placeholder()
    {
        return <<<'HTML'
        <div class="animate-pulse">
            <div class="h-4 bg-gray-200 rounded w-3/4"></div>
        </div>
        HTML;
    }

    public function render()
    {
        return view('livewire.heavy-component');
    }
}
```

```blade
<!-- Lazy load component -->
<livewire:heavy-component lazy />

<!-- Hoặc trong component tag -->
<livewire:revenue lazy />
```

## URL Query Parameters

```php
<?php

namespace App\Livewire;

use Livewire\Attributes\Url;
use Livewire\Component;

class SearchProducts extends Component
{
    #[Url]
    public $search = '';

    #[Url(as: 'q')]
    public $query = '';

    #[Url(history: true)]
    public $category = '';
}
```

## Alpine.js Integration

```blade
<div x-data="{ open: false }">
    <!-- Two-way binding giữa Alpine và Livewire -->
    <input type="text" x-model="$wire.title">

    <!-- Entangle cho reactive binding -->
    <div x-data="{ title: $wire.entangle('title') }">
        <input type="text" x-model="title">
    </div>
</div>

<script>
    // Gọi Livewire methods từ JS
    $wire.save();
    $wire.delete(123);
    
    // Lấy/set properties
    $wire.title = 'New Title';
    let title = await $wire.title;
    
    // Watch changes
    $wire.$watch('title', (value) => {
        console.log('Title changed:', value);
    });
</script>
```

## Polling

```blade
<!-- Poll mỗi 2 giây -->
<div wire:poll>
    Current time: {{ now() }}
</div>

<!-- Poll mỗi 5 giây -->
<div wire:poll.5s>
    Updated every 5 seconds
</div>

<!-- Poll và gọi method cụ thể -->
<div wire:poll.10s="checkStatus">
    Status: {{ $status }}
</div>
```

## Best Practices - Performance

### 1. Sử dụng wire:key trong loops

```blade
@foreach($posts as $post)
    <div wire:key="{{ $post->id }}">
        {{ $post->title }}
    </div>
@endforeach
```

### 2. Giữ properties nhẹ (slim properties)

```php
// ❌ Không tốt - truyền toàn bộ model
public Post $post;

// ✅ Tốt - chỉ truyền ID
public int $postId;

public function mount(int $postId)
{
    $this->postId = $postId;
}

#[Computed]
public function post()
{
    return Post::find($this->postId);
}
```

### 3. Tránh N+1 queries

```php
// ❌ Không tốt
public function render()
{
    return view('livewire.users', [
        'users' => User::all() // N+1 nếu access relations
    ]);
}

// ✅ Tốt - eager loading
#[Computed]
public function users()
{
    return User::with('posts')->get();
}
```

### 4. Sử dụng debounce cho search

```blade
<!-- Tránh gửi quá nhiều requests -->
<input type="search" wire:model.debounce.500ms="search">
```

### 5. Pagination

```php
use Livewire\WithPagination;

class UserList extends Component
{
    use WithPagination;

    public function render()
    {
        return view('livewire.user-list', [
            'users' => User::paginate(10)
        ]);
    }
}
```

### 6. Tránh nest component quá sâu

```php
// ❌ Không tốt - nest quá sâu
<livewire:parent>
    <livewire:child>
        <livewire:grandchild />
    </livewire:child>
</livewire:parent>

// ✅ Tốt - dùng Blade components cho nested UI
<livewire:parent>
    <x-child>
        <x-grandchild />
    </x-child>
</livewire:parent>
```

### 7. Bảo vệ dữ liệu nhạy cảm

```php
use Livewire\Attributes\Locked;

class UserProfile extends Component
{
    #[Locked]
    public $userId; // Không thể sửa từ frontend
}
```

## Testing

```php
<?php

namespace Tests\Feature\Livewire;

use App\Livewire\CreatePost;
use Livewire\Livewire;
use Tests\TestCase;

class CreatePostTest extends TestCase
{
    public function test_can_create_post()
    {
        Livewire::test(CreatePost::class)
            ->set('title', 'New Post')
            ->set('content', 'Post content')
            ->call('save')
            ->assertRedirect('/posts');
    }

    public function test_title_is_required()
    {
        Livewire::test(CreatePost::class)
            ->set('title', '')
            ->call('save')
            ->assertHasErrors(['title' => 'required']);
    }

    public function test_dispatches_event()
    {
        Livewire::test(CreatePost::class)
            ->set('title', 'New Post')
            ->call('save')
            ->assertDispatched('post-created');
    }
}
```

## Checklist Performance

- [ ] Sử dụng `wire:key` trong loops
- [ ] Dùng `#[Computed]` cho queries
- [ ] Tránh truyền full model - chỉ truyền ID
- [ ] Sử dụng `wire:model.debounce` cho search
- [ ] Pagination cho danh sách lớn
- [ ] Eager loading để tránh N+1
- [ ] Lazy loading cho components nặng
- [ ] Giới hạn nest components (max 1 level)
- [ ] Bảo vệ dữ liệu nhạy cảm với `#[Locked]`
- [ ] Dùng Alpine.js cho UI interactions đơn giản

## Resources

- [Official Docs](https://livewire.laravel.com/docs)
- [Best Practices Repository](https://github.com/michael-rubel/livewire-best-practices)
