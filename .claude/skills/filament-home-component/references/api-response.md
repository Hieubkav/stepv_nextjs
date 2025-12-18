# API Response Format

## Basic Endpoint

```php
// routes/api.php
use App\Models\HomeComponent;

Route::get('/home-components', function () {
    return HomeComponent::query()
        ->where('active', true)
        ->orderBy('order', 'asc')
        ->get()
        ->map(fn ($item) => [
            'type' => $item->type,
            'config' => $item->config,
        ]);
});
```

## Controller-based Approach

```php
<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\HomeComponentResource;
use App\Models\HomeComponent;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Cache;

class HomeComponentController extends Controller
{
    public function index(): JsonResponse
    {
        $components = Cache::remember('home-components', 3600, function () {
            return HomeComponent::query()
                ->where('active', true)
                ->orderBy('order', 'asc')
                ->get();
        });

        return response()->json([
            'success' => true,
            'data' => HomeComponentResource::collection($components),
        ]);
    }

    public function show(string $type): JsonResponse
    {
        $component = Cache::remember("home-component-{$type}", 3600, function () use ($type) {
            return HomeComponent::query()
                ->where('type', $type)
                ->where('active', true)
                ->first();
        });

        if (!$component) {
            return response()->json([
                'success' => false,
                'message' => 'Component not found',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => new HomeComponentResource($component),
        ]);
    }
}
```

## API Resource

```php
<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class HomeComponentResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'type' => $this->type,
            'config' => $this->transformConfig(),
        ];
    }

    protected function transformConfig(): array
    {
        $config = $this->config ?? [];

        // Transform image paths to full URLs
        return $this->transformImagePaths($config);
    }

    protected function transformImagePaths(array $data): array
    {
        $imageFields = ['image', 'logo', 'avatar', 'thumbnail'];

        foreach ($data as $key => $value) {
            if (is_array($value)) {
                $data[$key] = $this->transformImagePaths($value);
            } elseif (in_array($key, $imageFields) && is_string($value) && !empty($value)) {
                $data[$key] = asset('storage/' . $value);
            }
        }

        return $data;
    }
}
```

## Response Examples

### Full Homepage Response

```json
{
  "success": true,
  "data": [
    {
      "type": "hero_carousel",
      "config": {
        "slides": [
          {
            "image": "https://example.com/storage/banners/slide1.webp",
            "alt": "Banner chính",
            "title": "Giải pháp công nghệ toàn diện",
            "link": "/products"
          }
        ]
      }
    },
    {
      "type": "stats",
      "config": {
        "items": [
          { "value": "1,500+", "label": "Khách hàng tin dùng" },
          { "value": "25+", "label": "Đối tác chiến lược" }
        ]
      }
    },
    {
      "type": "about",
      "config": {
        "badge": "Về chúng tôi",
        "title": "Đối tác công nghệ chiến lược",
        "subtitle": "Giải pháp toàn diện cho doanh nghiệp",
        "description": "<p>Mô tả chi tiết...</p>",
        "features": [
          { "title": "Chất lượng", "description": "Cam kết chất lượng cao" }
        ]
      }
    },
    {
      "type": "partners",
      "config": {
        "title": "Đối tác chiến lược",
        "partners": [
          {
            "logo": "https://example.com/storage/partners/hp.png",
            "name": "HP Inc.",
            "link": "https://hp.com"
          }
        ],
        "auto_scroll": true
      }
    },
    {
      "type": "footer",
      "config": {
        "company_name": "Công ty TNHH ABC",
        "address": "123 Đường XYZ, Quận 1, TP.HCM",
        "phone": "1900 6363 40",
        "email": "contact@abc.vn",
        "social_links": [
          { "platform": "facebook", "url": "https://facebook.com/abc" }
        ],
        "policies": [
          { "label": "Chính sách đổi trả", "link": "/doi-tra" }
        ]
      }
    }
  ]
}
```

## Caching Strategy

### Observer Pattern

```php
<?php

namespace App\Observers;

use App\Models\HomeComponent;
use Illuminate\Support\Facades\Cache;

class HomeComponentObserver
{
    public function saved(HomeComponent $component): void
    {
        $this->clearCache($component);
    }

    public function deleted(HomeComponent $component): void
    {
        $this->clearCache($component);
    }

    protected function clearCache(HomeComponent $component): void
    {
        Cache::forget('home-components');
        Cache::forget("home-component-{$component->type}");
    }
}
```

### Register Observer

```php
// App\Providers\AppServiceProvider

public function boot(): void
{
    HomeComponent::observe(HomeComponentObserver::class);
}
```

## Frontend Integration

### TypeScript Types

```typescript
// types/home.ts
export type HomeComponentType =
  | 'hero_carousel'
  | 'stats'
  | 'about'
  | 'product_categories'
  | 'featured_products'
  | 'partners'
  | 'news'
  | 'footer';

export interface HomeComponent<T = Record<string, unknown>> {
  type: HomeComponentType;
  config: T;
}

// Specific config types
export interface HeroSlide {
  image: string;
  alt?: string;
  title?: string;
  subtitle?: string;
  link?: string;
  button_text?: string;
}

export interface HeroCarouselConfig {
  slides: HeroSlide[];
}

export interface StatsConfig {
  items: Array<{
    value: string;
    label: string;
    icon?: string;
  }>;
}

export interface PartnerConfig {
  title: string;
  partners: Array<{
    logo: string;
    name: string;
    link?: string;
  }>;
  auto_scroll?: boolean;
}

// ... other configs
```

### React Component Renderer

```tsx
// components/home/ComponentRenderer.tsx
import { HomeComponent, HomeComponentType } from '@/types/home';
import { Hero } from './Hero';
import { Stats } from './Stats';
import { About } from './About';
import { Partners } from './Partners';
import { News } from './News';
import { Footer } from './Footer';

const componentMap: Record<HomeComponentType, React.ComponentType<{ config: any }>> = {
  hero_carousel: Hero,
  stats: Stats,
  about: About,
  product_categories: CategoryList,
  featured_products: Products,
  partners: Partners,
  news: News,
  footer: Footer,
};

interface Props {
  component: HomeComponent;
}

export const ComponentRenderer: React.FC<Props> = ({ component }) => {
  const Component = componentMap[component.type];

  if (!Component) {
    console.warn(`Unknown component type: ${component.type}`);
    return null;
  }

  return <Component config={component.config} />;
};
```

### Page Component

```tsx
// app/(site)/page.tsx
import { ComponentRenderer } from '@/components/home/ComponentRenderer';
import { HomeComponent } from '@/types/home';

async function getHomeComponents(): Promise<HomeComponent[]> {
  const res = await fetch(`${process.env.API_URL}/api/home-components`, {
    next: { revalidate: 60 }, // ISR: revalidate every 60 seconds
  });

  if (!res.ok) {
    throw new Error('Failed to fetch home components');
  }

  const json = await res.json();
  return json.data;
}

export default async function HomePage() {
  const components = await getHomeComponents();

  return (
    <div className="min-h-screen bg-white">
      {components.map((component, index) => (
        <ComponentRenderer key={`${component.type}-${index}`} component={component} />
      ))}
    </div>
  );
}
```

### Error Handling

```tsx
// With error boundary
import { Suspense } from 'react';
import { ErrorBoundary } from 'react-error-boundary';

function ErrorFallback({ error }: { error: Error }) {
  return (
    <div className="p-4 bg-red-50 text-red-600">
      <p>Something went wrong loading this section.</p>
    </div>
  );
}

function LoadingFallback() {
  return <div className="animate-pulse h-40 bg-gray-100" />;
}

export const SafeComponentRenderer: React.FC<Props> = ({ component }) => {
  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <Suspense fallback={<LoadingFallback />}>
        <ComponentRenderer component={component} />
      </Suspense>
    </ErrorBoundary>
  );
};
```
