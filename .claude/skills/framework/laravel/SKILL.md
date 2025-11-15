---
name: laravel
description: Laravel v12.x - The PHP Framework For Web Artisans with powerful new features including Automatic Eager Loading, Native Health Checks, Route Attributes, Queue Batches 2.0, and Typed Auth Guards
---
## When to Use This Skill

This skill should be triggered when:
- Building Laravel applications or APIs
- Working with Eloquent models, relationships, and queries
- Setting up authentication, authorization, or API tokens
- Creating database migrations, seeders, or factories
- Implementing middleware, service providers, or events
- Using Laravel's built-in features (queues, cache, validation, etc.)
- Troubleshooting Laravel errors or performance issues
- Following Laravel best practices and conventions
- Implementing RESTful APIs with Laravel Sanctum or Passport
- Working with Laravel Mix, Vite, or frontend assets

## Laravel 12.x New Features

Laravel 12.x introduces several game-changing features that significantly improve developer productivity:

### Automatic Eager Loading (12.8+)
Automatically resolves N+1 query problems by eager-loading relationships when accessed. No more manual `with()` calls needed in many cases.

### Native Health Checks
Built-in health check endpoints for monitoring system status without external dependencies. Perfect for container orchestration and monitoring tools.

### Route Attributes (PHP 8+)
Simplified controller routing using PHP 8+ attributes, reducing boilerplate code and keeping routing definitions close to controller methods.

### Queue Batches 2.0
Enhanced batch processing with conditional chaining, real-time progress events, and automatic cleanup on failures. Reduces boilerplate by ~40%.

### Typed Properties in Auth Guards
Full IDE autocompletion and static analysis support for authentication guards, catching bugs during CI without runtime overhead.

### Context API & Scoping
New `Context::scope()` for better context management and `ContextLogProcessor` for enhanced logging capabilities.

### Performance Improvements
- Enhanced routing performance with improved caching
- Faster job batching and runtime execution
- Better query readability and optimization

## Reference Files

This skill includes comprehensive documentation in `references/`:

- **other.md** - Laravel 12.x installation guide and core documentation

Use the reference files for detailed information about:
- Installation and configuration
- Framework architecture and concepts
- Advanced features and packages
- Deployment and optimization

## Key Concepts

### MVC Architecture
Laravel follows the Model-View-Controller pattern:
- **Models**: Eloquent ORM classes representing database tables
- **Views**: Blade templates for rendering HTML
- **Controllers**: Handle HTTP requests and return responses

### Eloquent ORM
Laravel's powerful database abstraction layer:
- **Active Record pattern**: Each model instance represents a database row
- **Relationships**: belongsTo, hasMany, belongsToMany, morphMany, etc.
- **Query Builder**: Fluent interface for building SQL queries
- **Eager Loading**: Prevent N+1 query problems with `with()`

### Routing
Define application endpoints:
- **Route methods**: get, post, put, patch, delete
- **Route parameters**: Required `{id}` and optional `{id?}`
- **Route groups**: Share middleware, prefixes, namespaces
- **Resource routes**: Auto-generate RESTful routes

### Middleware
Filter HTTP requests:
- **Built-in**: auth, throttle, verified, signed
- **Custom**: Create your own request/response filters
- **Global**: Apply to all routes
- **Route-specific**: Apply to specific routes or groups

### Service Container
Laravel's dependency injection container:
- **Automatic resolution**: Type-hint dependencies in constructors
- **Binding**: Register class implementations
- **Singletons**: Share single instance across requests

### Context API (Laravel 12+)
Advanced context management for logging and tracing:
- **Context::scope()**: Create isolated context scopes for better request tracking
- **ContextLogProcessor**: Enhanced logging with contextual information
- **Automatic propagation**: Context flows through jobs, events, and queues

### Health Checks (Laravel 12+)
Native application health monitoring:
- **Built-in endpoints**: Monitor application, database, cache, and queue status
- **Custom checks**: Define application-specific health criteria
- **Container-ready**: Perfect for Kubernetes liveness/readiness probes

### Typed Auth Guards (Laravel 12+)
Enhanced type safety for authentication:
- **IDE autocompletion**: Full IntelliSense support for auth guards
- **Static analysis**: Catch authentication bugs during development
- **Type hints**: Explicit return types for better code quality

### Artisan Commands
Laravel's CLI tool with enhanced capabilities in v12:
```bash
php artisan make:model Post -mcr  # Create model, migration, controller, resource
php artisan migrate               # Run migrations
php artisan db:seed              # Seed database
php artisan queue:work           # Process queue jobs
php artisan optimize:clear       # Clear all caches

# Laravel 12+ new commands
php artisan health:check         # Run application health checks
php artisan context:clear        # Clear context cache
php artisan route:cache          # Improved route caching performance
```

## Working with This Skill

### For Beginners
Start with:
1. **Installation**: Set up Laravel using Composer
2. **Routing**: Learn basic route definitions in `routes/web.php`
3. **Controllers**: Create controllers with `php artisan make:controller`
4. **Models**: Understand Eloquent basics and relationships
5. **Migrations**: Define database schema with migrations
6. **Blade Templates**: Create views with Laravel's templating engine

### For Intermediate Users
Focus on:
- **Form Requests**: Validation and authorization in dedicated classes
- **API Resources**: Transform models for JSON responses
- **Authentication**: Implement with Laravel Breeze or Sanctum
- **Relationships**: Master eager loading and complex relationships
- **Queues**: Offload time-consuming tasks to background jobs
- **Events & Listeners**: Decouple application logic

### For Advanced Users
Explore:
- **Service Providers**: Register application services
- **Custom Middleware**: Create reusable request filters
- **Package Development**: Build reusable Laravel packages
- **Testing**: Write feature and unit tests with PHPUnit
- **Performance**: Optimize queries, caching, and response times
- **Deployment**: CI/CD pipelines and production optimization

### Navigation Tips
- Check **Quick Reference** for common code patterns
- Reference the official docs at https://laravel.com/docs/12.x
- Use `php artisan route:list` to view all registered routes
- Use `php artisan tinker` for interactive debugging
- Enable query logging to debug database performance

## Resources

### Official Documentation
- Laravel Docs: https://laravel.com/docs/12.x
- API Reference: https://laravel.com/api/12.x
- Laracasts: https://laracasts.com (video tutorials)

### Community
- Laravel News: https://laravel-news.com
- Laravel Forums: https://laracasts.com/discuss
- GitHub: https://github.com/laravel/laravel

### Tools
- Laravel Telescope: Debugging and monitoring
- Laravel Horizon: Queue monitoring
- Laravel Debugbar: Development debugging
- Laravel IDE Helper: IDE autocompletion

## Best Practices

1. **Use Form Requests**: Separate validation logic from controllers
2. **Leverage Automatic Eager Loading (Laravel 12+)**: Let Laravel auto-eager load relationships when accessed
3. **Use Route Attributes (Laravel 12+)**: Define routes directly on controller methods with PHP 8+ attributes
4. **Use Resource Controllers**: Follow RESTful conventions
5. **Type Hints & Typed Guards (Laravel 12+)**: Use typed properties for better IDE support and static analysis
6. **Database Transactions**: Wrap related database operations
7. **Queue Batches 2.0 (Laravel 12+)**: Use enhanced batch processing with conditional chaining
8. **Cache Queries**: Cache expensive database queries
9. **API Resources**: Transform data consistently for APIs
10. **Events**: Decouple application logic with events and listeners
11. **Health Checks (Laravel 12+)**: Implement native health endpoints for monitoring
12. **Context Scoping (Laravel 12+)**: Use Context::scope() for better request tracking and logging
13. **Tests**: Write tests for critical application logic

## Notes

- **Laravel 12.x requires PHP 8.2 or higher** (minimum requirement updated from PHP 8.1)
- Uses Composer for dependency management
- Includes Vite for asset compilation (replaces Laravel Mix)
- Supports multiple database systems (MySQL, PostgreSQL, SQLite, SQL Server)
- Built-in support for queues, cache, sessions, and file storage
- Excellent ecosystem with first-party packages (Sanctum, Horizon, Telescope, etc.)
- Enhanced performance with improved routing, job batching, and runtime execution
- Native health checks, context API, and typed auth guards available out-of-the-box


---

## References

**Quick Reference:** `read .claude/skills/laravel/references/quick-reference.md`
**Common Patterns:** `read .claude/skills/laravel/references/common-patterns.md`
