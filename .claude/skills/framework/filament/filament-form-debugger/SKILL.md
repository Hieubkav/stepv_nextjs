---
name: filament-form-debugger
description: Diagnose and fix common Filament 4.x form errors - namespace issues (Tabs/Grid/Get), type mismatch, trait errors, Schema core architecture issues. USE WHEN encountering 'Class not found', 'Argument must be of type', namespace errors, performance issues, or Filament compilation/runtime errors.
---
---
## When to Use This Skill

- Error: "Class ... not found"
- Error: "Argument must be of type ..."
- Error: "Trait not found"
- Namespace-related Filament errors
- Form not displaying correctly
- Performance issues with large forms
- Schema architecture problems


---
## ⚡ Filament 4.x Requirements

**Critical breaking changes:**
- PHP 8.2+ required
- Laravel 11.28+ required
- Tailwind CSS 4.0+ (if custom themes)
- New unified Schema architecture
- Directory structure changes

---
## Quick Namespace Map

| Type | Namespace | Examples |
|------|-----------|----------|
| **Layout** | `Schemas\Components\` | Tabs, Grid, Section, Fieldset, Split |
| **Fields** | `Forms\Components\` | TextInput, Select, Toggle, TipTapEditor |
| **Get** | `Schemas\...Utilities\Get` | fn (Get $get) => |
| **Schema** | `Schemas\Schema` | form(Schema $schema) |
| **Actions** | `Actions\` | EditAction, DeleteAction, ExportAction |
| **Enums** | `Support\Enums\` | GridDirection, Alignment |


---
## Quick Debug Process

1. **Read error** → Identify type (namespace/type/trait)
2. **Check imports** → Verify `use` statements
3. **Check signature** → `form(Schema $schema): Schema`
4. **Apply fix** → Use correct namespace
5. **Clear cache** → `php artisan optimize:clear`
6. **Test** → Reload page


---
## Complete Import Template

```php
<?php

// Layout (Schemas) - Unified Schema Core
use Filament\Schemas\Components\Tabs;
use Filament\Schemas\Components\Grid;
use Filament\Schemas\Components\Section;
use Filament\Schemas\Components\Fieldset;
use Filament\Schemas\Components\Split;

// Fields (Forms)
use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\Toggle;
use Filament\Forms\Components\TipTapEditor;  // New in v4
use Filament\Forms\Components\Builder;        // Dynamic forms

// Utilities
use Filament\Schemas\Components\Utilities\Get;
use Filament\Schemas\Components\Utilities\Set;
use Filament\Schemas\Schema;

// Actions (Unified in v4)
use Filament\Actions\EditAction;
use Filament\Actions\DeleteAction;
use Filament\Actions\ExportAction;
use Filament\Actions\ImportAction;

// Enums
use Filament\Support\Enums\GridDirection;
use Filament\Support\Enums\Alignment;
```


---
## Prevention Checklist

Before saving:
- [ ] Tabs/Grid/Section from `Schemas\Components`
- [ ] TextInput/Select from `Forms\Components`
- [ ] Get from `Utilities\Get`
- [ ] Method signature: `form(Schema $schema)`
- [ ] Only `InteractsWithForms` trait
- [ ] Actions from `Filament\Actions`


---
## Quick Commands

```bash
# Clear caches after fixing
php artisan optimize:clear
php artisan filament:clear-cache

# Rebuild autoload
composer dump-autoload

# Upgrade to v4 (automated)
composer require filament/upgrade:"^4.0" -W --dev
vendor/bin/filament-v4

# Check compatibility
php artisan filament:upgrade
```

---
## ⚡ Performance Tips (New in v4)

**Partial Rendering:**
```php
// Enable partial rendering for large forms
->extraAttributes(['wire:loading.class' => 'opacity-50'])
```

**Lazy Loading Fields:**
```php
// Load heavy fields only when needed
->lazy()  // On tabs or sections
```

**Optimize Table Queries:**
```php
// Use modifyQueryUsing for eager loading
->modifyQueryUsing(fn($q) => $q->with(['category', 'tags']))
```

**Custom Data Sources:**
```php
// Use static data for faster performance
use Filament\Tables\Table;

Table::make()
    ->data($cachedData)  // From cache/API instead of Eloquent
    ->columns([...])
```

---
## 🔧 Advanced Debugging

**Utility Injection Issues:**
```php
// ❌ Wrong closure signature
->visible(fn ($get) => ...)  // No type hint

// ✅ Correct
use Filament\Schemas\Components\Utilities\Get;
->visible(fn (Get $get) => ...)
```

**Schema vs Form Context:**
```php
// In Resources/Settings Pages: Use Schema
public function form(Schema $schema): Schema

// In standalone Livewire: May use Form
public function form(Form $form): Form
```

**Builder Component Errors:**
```php
// For dynamic repeatable blocks
use Filament\Forms\Components\Builder;

Builder::make('content')
    ->blocks([
        Builder\Block::make('heading')
            ->schema([
                TextInput::make('content'),
                Select::make('level'),
            ]),
    ])
```

---
## 🆕 New Components in v4

**TipTap Rich Editor:**
```php
use Filament\Forms\Components\TipTapEditor;

TipTapEditor::make('content')
    ->label('Nội dung')
    ->required()
```

**Split Layout:**
```php
use Filament\Schemas\Components\Split;

Split::make([
    // Left side
    Section::make()->schema([...]),
    // Right side
    Section::make()->schema([...]),
])
```

**Fieldset:**
```php
use Filament\Schemas\Components\Fieldset;

Fieldset::make('Address')
    ->schema([
        TextInput::make('street'),
        TextInput::make('city'),
    ])
```

---
## Complete Error Catalog

For full error list, detailed troubleshooting, and advanced fixes:

`read .claude/skills/filament/filament-form-debugger/CLAUDE.md`

**Related skills:**
- Filament standards: `read .claude/skills/filament/filament-rules/SKILL.md`
- Resource generation: `read .claude/skills/filament/filament-resource-generator/SKILL.md`


---

## References

**Top 5 Common Errors & Fixes:** `read .claude/skills/filament/filament-form-debugger/references/top-5-common-errors--fixes.md`
