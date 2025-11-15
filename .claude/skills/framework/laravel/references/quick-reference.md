## Quick Reference

### Basic Routing

```php
// Basic routes
Route::get('/users', [UserController::class, 'index']);
Route::post('/users', [UserController::class, 'store']);

// Route parameters
Route::get('/users/{id}', function ($id) {
    return User::find($id);
});

// Named routes
Route::get('/profile', ProfileController::class)->name('profile');

// Route groups with middleware
Route::middleware(['auth'])->group(function () {
    Route::get('/dashboard', [DashboardController::class, 'index']);
    Route::resource('posts', PostController::class);
});
```

### Route Attributes (Laravel 12+)

```php
// Define routes directly on controller methods using PHP 8 attributes
namespace App\Http\Controllers;

use Illuminate\Routing\Attributes\Route;

class UserController extends Controller
{
    #[Route('/users', methods: ['GET'], name: 'users.index')]
    public function index()
    {
        return User::all();
    }

    #[Route('/users/{user}', methods: ['GET'], name: 'users.show')]
    public function show(User $user)
    {
        return $user;
    }

    #[Route('/users', methods: ['POST'], name: 'users.store', middleware: ['auth'])]
    public function store(Request $request)
    {
        return User::create($request->validated());
    }
}
```

### Eloquent Model Basics

```php
// Define a model with relationships
namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Post extends Model
{
    protected $fillable = ['title', 'content', 'user_id'];

    protected $casts = [
        'published_at' => 'datetime',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function comments(): HasMany
    {
        return $this->hasMany(Comment::class);
    }
}
```

### Database Migrations

```php
// Create a migration
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('posts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('title');
            $table->text('content');
            $table->timestamp('published_at')->nullable();
            $table->timestamps();

            $table->index(['user_id', 'published_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('posts');
    }
};
```

### Form Validation

```php
// Controller validation
public function store(Request $request)
{
    $validated = $request->validate([
        'title' => 'required|max:255',
        'content' => 'required',
        'email' => 'required|email|unique:users',
        'tags' => 'array|min:1',
        'tags.*' => 'string|max:50',
    ]);

    return Post::create($validated);
}

// Form Request validation
namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StorePostRequest extends FormRequest
{
    public function rules(): array
    {
        return [
            'title' => 'required|max:255',
            'content' => 'required|min:100',
        ];
    }
}
```

### Eloquent Query Builder

```php
// Common query patterns
// Eager loading to avoid N+1 queries
$posts = Post::with(['user', 'comments'])
    ->where('published_at', '<=', now())
    ->orderBy('published_at', 'desc')
    ->paginate(15);

// Conditional queries
$query = Post::query();

if ($request->has('search')) {
    $query->where('title', 'like', "%{$request->search}%");
}

if ($request->has('author')) {
    $query->whereHas('user', function ($q) use ($request) {
        $q->where('name', $request->author);
    });
}

$posts = $query->get();
```

### Automatic Eager Loading (Laravel 12.8+)

```php
// Laravel 12.8+ automatically eager loads relationships when accessed
// No need to manually use with() in many cases

// Before Laravel 12.8 - Manual eager loading required
$posts = Post::all(); // N+1 problem
foreach ($posts as $post) {
    echo $post->user->name; // Each iteration = 1 query
}

// Laravel 12.8+ - Automatic eager loading
$posts = Post::all(); 
foreach ($posts as $post) {
    echo $post->user->name; // Automatically batched, no N+1!
}

// Still can use manual eager loading for complex scenarios
$posts = Post::with(['user', 'comments.user'])->get();

// Check query performance
DB::enableQueryLog();
$posts = Post::all();
foreach ($posts as $post) {
    echo $post->user->name;
}
dd(DB::getQueryLog()); // See automatic eager loading in action
```

### API Resource Controllers

```php
namespace App\Http\Controllers\Api;

use App\Models\Post;
use App\Http\Resources\PostResource;
use Illuminate\Http\Request;

class PostController extends Controller
{
    public function index()
    {
        return PostResource::collection(
            Post::with('user')->latest()->paginate()
        );
    }

    public function store(Request $request)
    {
        $post = Post::create($request->validated());

        return new PostResource($post);
    }

    public function show(Post $post)
    {
        return new PostResource($post->load('user', 'comments'));
    }

    public function update(Request $request, Post $post)
    {
        $post->update($request->validated());

        return new PostResource($post);
    }
}
```

### API Resources (Transformers)

```php
namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class PostResource extends JsonResource
{
    public function toArray($request): array
    {
        return [
            'id' => $this->id,
            'title' => $this->title,
            'slug' => $this->slug,
            'excerpt' => $this->excerpt,
            'content' => $this->when($request->routeIs('posts.show'), $this->content),
            'author' => new UserResource($this->whenLoaded('user')),
            'comments_count' => $this->when($this->comments_count, $this->comments_count),
            'published_at' => $this->published_at?->toISOString(),
            'created_at' => $this->created_at->toISOString(),
        ];
    }
}
```

### Authentication with Sanctum

```php
// API token authentication setup
// In config/sanctum.php - configure stateful domains

// Issue tokens
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens;
}

// Login endpoint
public function login(Request $request)
{
    $credentials = $request->validate([
        'email' => 'required|email',
        'password' => 'required',
    ]);

    if (!Auth::attempt($credentials)) {
        return response()->json(['message' => 'Invalid credentials'], 401);
    }

    $token = $request->user()->createToken('api-token')->plainTextToken;

    return response()->json(['token' => $token]);
}

// Protect routes
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/user', fn(Request $r) => $r->user());
});
```

### Jobs and Queues

```php
// Create a job
namespace App\Jobs;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Queue\InteractsWithQueue;

class ProcessVideo implements ShouldQueue
{
    use InteractsWithQueue, Queueable;

    public function __construct(
        public Video $video
    ) {}

    public function handle(): void
    {
        // Process the video
        $this->video->process();
    }
}

// Dispatch jobs
ProcessVideo::dispatch($video);
ProcessVideo::dispatch($video)->onQueue('videos')->delay(now()->addMinutes(5));
```

### Queue Batches 2.0 (Laravel 12+)

```php
use Illuminate\Bus\Batch;
use Illuminate\Support\Facades\Bus;

// Create batch with enhanced features
$batch = Bus::batch([
    new ProcessVideo($video1),
    new ProcessVideo($video2),
    new ProcessVideo($video3),
])
->then(function (Batch $batch) {
    // All jobs completed successfully
    Notification::send('Batch completed');
})
->catch(function (Batch $batch, Throwable $e) {
    // First job failure detected
    Log::error('Batch failed', ['error' => $e->getMessage()]);
})
->finally(function (Batch $batch) {
    // Batch finished executing (success or failure)
    $batch->cleanup(); // Automatic cleanup
})
->allowFailures() // Continue even if some jobs fail
->dispatch();

// Conditional chaining - chain jobs based on batch success
$batch = Bus::batch($jobs)
    ->then(function (Batch $batch) {
        // Only runs if ALL jobs succeed
        GenerateReport::dispatch($batch->id);
    })
    ->dispatch();

// Real-time progress tracking
$batch = Bus::batch($jobs)
    ->progress(function (Batch $batch) {
        // Called after each job completes
        broadcast(new BatchProgressEvent(
            $batch->processedJobs(),
            $batch->totalJobs,
            $batch->progress()
        ));
    })
    ->dispatch();

// Check batch status
$batch = Bus::findBatch($batchId);
echo "Progress: {$batch->progress()}%";
echo "Processed: {$batch->processedJobs()}/{$batch->totalJobs}";
```

### Service Container and Dependency Injection

```php
// Bind services in AppServiceProvider
use App\Services\PaymentService;

public function register(): void
{
    $this->app->singleton(PaymentService::class, function ($app) {
        return new PaymentService(
            config('services.stripe.secret')
        );
    });
}

// Use dependency injection in controllers
public function __construct(
    protected PaymentService $payment
) {}

public function charge(Request $request)
{
    return $this->payment->charge(
        $request->user(),
        $request->amount
    );
}
```

### Typed Auth Guards (Laravel 12+)

```php
// Define typed auth guard in controller
use Illuminate\Support\Facades\Auth;
use App\Models\User;

class ProfileController extends Controller
{
    public function show(Request $request): User
    {
        // Typed return - IDE autocompletion works!
        return Auth::user();
    }

    public function update(Request $request)
    {
        /** @var User $user */
        $user = Auth::user(); // Full type inference
        
        $user->update($request->validated());
        
        return $user;
    }
}

// Custom guard with typed return
use Illuminate\Contracts\Auth\Guard;

class AdminGuard implements Guard
{
    public function user(): ?Admin
    {
        // Returns Admin model, not generic User
        return $this->provider->retrieveById($this->id);
    }
}

// Usage with full IDE support
$admin = Auth::guard('admin')->user(); // Returns Admin, not User
$admin->adminSpecificMethod(); // IDE knows this method exists!
```

### Health Checks (Laravel 12+)

```php
// config/health.php - Configure health checks
return [
    'checks' => [
        'database' => true,
        'cache' => true,
        'queue' => true,
        'storage' => true,
    ],
    
    'endpoint' => '/health',
];

// Create custom health check
namespace App\Health;

use Illuminate\Support\Facades\Http;

class ApiHealthCheck
{
    public function check(): bool
    {
        try {
            $response = Http::timeout(3)->get('https://api.example.com/ping');
            return $response->successful();
        } catch (\Exception $e) {
            return false;
        }
    }
}

// Register custom check in AppServiceProvider
use Illuminate\Support\Facades\Health;

public function boot(): void
{
    Health::check('external-api', new ApiHealthCheck);
}

// Access health endpoint
// GET /health
// Response:
// {
//   "status": "healthy",
//   "checks": {
//     "database": "ok",
//     "cache": "ok",
//     "queue": "ok",
//     "external-api": "ok"
//   },
//   "timestamp": "2025-11-14T10:30:00Z"
// }

// Use in Kubernetes liveness probe
// livenessProbe:
//   httpGet:
//     path: /health
//     port: 80
//   initialDelaySeconds: 30
//   periodSeconds: 10
```

### Context API & Scoping (Laravel 12+)

```php
use Illuminate\Support\Facades\Context;

// Set context for request tracking
Context::add('user_id', auth()->id());
Context::add('request_id', Str::uuid());
Context::add('ip_address', request()->ip());

// Context automatically flows through logs
Log::info('Processing payment'); 
// Logs include: user_id, request_id, ip_address automatically

// Scoped context - isolated from parent scope
Context::scope(function () {
    Context::add('batch_id', $batch->id);
    Context::add('job_name', 'ProcessVideo');
    
    // This context only exists in this scope
    ProcessVideoJob::dispatch($video);
}); 
// batch_id and job_name are removed after scope exits

// Context in jobs - automatically propagated
class ProcessOrder implements ShouldQueue
{
    public function handle()
    {
        // Context from dispatch location is available here!
        $requestId = Context::get('request_id');
        $userId = Context::get('user_id');
        
        Log::info('Processing order', [
            'order_id' => $this->order->id,
            // request_id and user_id automatically included
        ]);
    }
}

// ContextLogProcessor - enhanced logging
// config/logging.php
'stack' => [
    'driver' => 'stack',
    'channels' => ['daily'],
    'processors' => [
        \Illuminate\Log\Context\ContextLogProcessor::class,
    ],
],

// All logs now include context automatically
Log::info('User action'); 
// Output: [2025-11-14 10:30:00] local.INFO: User action 
// {"user_id":123,"request_id":"uuid-here","ip":"192.168.1.1"}
```
