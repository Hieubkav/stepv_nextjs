---
name: zod
description: Zod TypeScript-first schema validation. Use when validating forms, API responses, environment variables, parsing data, or when user mentions zod, schema validation, form validation, type inference, data parsing.
---

# Zod

TypeScript-first schema validation with static type inference.

## Quick Start

```tsx
import { z } from 'zod'

// Define schema
const UserSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  age: z.number().min(0).optional(),
})

// Infer TypeScript type
type User = z.infer<typeof UserSchema>

// Parse (throws on error)
const user = UserSchema.parse({ name: 'John', email: 'john@example.com' })

// Safe parse (returns result object)
const result = UserSchema.safeParse(data)
if (result.success) {
  console.log(result.data)
} else {
  console.log(result.error.issues)
}
```

## Primitive Types

```tsx
// Strings
z.string()
z.string().min(5)
z.string().max(100)
z.string().length(10)
z.string().email()
z.string().url()
z.string().uuid()
z.string().regex(/^\d+$/)
z.string().trim()
z.string().toLowerCase()

// Numbers
z.number()
z.number().min(0)
z.number().max(100)
z.number().int()
z.number().positive()
z.number().negative()

// Other primitives
z.boolean()
z.date()
z.bigint()
z.undefined()
z.null()
z.void()
z.any()
z.unknown()
```

## String Formats

```tsx
// Common formats
z.string().email()
z.string().url()
z.string().uuid()
z.string().cuid()
z.string().cuid2()
z.string().ulid()
z.string().nanoid()

// Date/time
z.string().datetime()
z.string().date()   // YYYY-MM-DD
z.string().time()   // HH:mm:ss

// Network
z.string().ip()     // IPv4 or IPv6
z.string().cidr()

// Encoding
z.string().base64()
z.string().jwt()
```

## Objects

```tsx
const UserSchema = z.object({
  name: z.string(),
  email: z.string().email(),
  age: z.number().optional(),
})

// Access shape
UserSchema.shape.name // z.string()

// Extend
const AdminSchema = UserSchema.extend({
  role: z.literal('admin'),
})

// Merge
const Combined = Schema1.merge(Schema2)

// Pick/Omit
const NameOnly = UserSchema.pick({ name: true })
const WithoutAge = UserSchema.omit({ age: true })

// Partial (all optional)
const PartialUser = UserSchema.partial()

// Required (all required)
const RequiredUser = UserSchema.required()

// Deep partial
const DeepPartial = UserSchema.deepPartial()
```

### Object Modes

```tsx
// Strip unknown keys (default)
z.object({ name: z.string() }).parse({ name: 'John', extra: 'ignored' })
// => { name: 'John' }

// Strict (error on unknown keys)
z.object({ name: z.string() }).strict()

// Passthrough (keep unknown keys)
z.object({ name: z.string() }).passthrough()
```

## Arrays & Tuples

```tsx
// Array
z.array(z.string())
z.array(z.number()).min(1).max(10)
z.array(z.string()).nonempty()

// Tuple (fixed length)
z.tuple([z.string(), z.number(), z.boolean()])
// ['hello', 42, true]

// Rest elements
z.tuple([z.string()]).rest(z.number())
// ['hello', 1, 2, 3, ...]
```

## Unions & Enums

```tsx
// Union
z.union([z.string(), z.number()])
z.string().or(z.number()) // shorthand

// Discriminated union (better performance)
const ResultSchema = z.discriminatedUnion('status', [
  z.object({ status: z.literal('success'), data: z.string() }),
  z.object({ status: z.literal('error'), error: z.string() }),
])

// Enum
z.enum(['pending', 'active', 'completed'])

// Native enum
enum Status { Pending, Active }
z.nativeEnum(Status)

// Literal
z.literal('hello')
z.literal(42)
z.literal(true)
```

## Optional & Nullable

```tsx
// Optional (undefined allowed)
z.string().optional()  // string | undefined

// Nullable (null allowed)
z.string().nullable()  // string | null

// Nullish (both)
z.string().nullish()   // string | null | undefined

// Default value
z.string().default('default')
z.number().default(() => Math.random())

// Catch (fallback on error)
z.number().catch(0)  // Returns 0 if parsing fails
```

## Transformations

```tsx
// Transform
const StringToNumber = z.string().transform((val) => parseInt(val))
// Input: string, Output: number

// Coerce (auto-convert)
z.coerce.string()  // any -> string
z.coerce.number()  // '123' -> 123
z.coerce.boolean() // 'true' -> true
z.coerce.date()    // '2024-01-01' -> Date

// Pipe (validate after transform)
z.string()
  .transform((val) => val.trim())
  .pipe(z.string().min(1))

// Preprocess
z.preprocess(
  (val) => (val === '' ? undefined : val),
  z.string().optional()
)
```

## Refinements

```tsx
// Basic refinement
z.string().refine((val) => val.includes('@'), {
  message: 'Must contain @',
})

// Async refinement
z.string().refine(async (val) => {
  const exists = await checkEmailExists(val)
  return !exists
}, 'Email already exists')

// Superrefine (multiple errors)
z.object({
  password: z.string(),
  confirm: z.string(),
}).superRefine((data, ctx) => {
  if (data.password !== data.confirm) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Passwords must match',
      path: ['confirm'],
    })
  }
})
```

## Common Patterns

### Form Validation

```tsx
const LoginSchema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(8, 'Min 8 characters'),
})

const SignupSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords must match',
  path: ['confirmPassword'],
})
```

### API Response

```tsx
const ApiResponseSchema = z.discriminatedUnion('success', [
  z.object({
    success: z.literal(true),
    data: z.array(UserSchema),
  }),
  z.object({
    success: z.literal(false),
    error: z.string(),
  }),
])

// Parse API response
const response = await fetch('/api/users')
const json = await response.json()
const result = ApiResponseSchema.parse(json)
```

### Environment Variables

```tsx
const EnvSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']),
  DATABASE_URL: z.string().url(),
  API_KEY: z.string().min(1),
  PORT: z.coerce.number().default(3000),
})

export const env = EnvSchema.parse(process.env)
```

### React Hook Form + Zod

```tsx
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
})

type FormData = z.infer<typeof schema>

function LoginForm() {
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  const onSubmit = (data: FormData) => {
    console.log(data) // Fully typed!
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register('email')} />
      {errors.email && <span>{errors.email.message}</span>}
      
      <input type="password" {...register('password')} />
      {errors.password && <span>{errors.password.message}</span>}
      
      <button type="submit">Login</button>
    </form>
  )
}
```

## Error Handling

```tsx
const result = schema.safeParse(data)

if (!result.success) {
  // Raw issues
  console.log(result.error.issues)
  
  // Formatted errors
  console.log(result.error.format())
  
  // Flattened (for forms)
  console.log(result.error.flatten())
  // { formErrors: [], fieldErrors: { email: ['Invalid email'] } }
}
```

### Custom Error Messages

```tsx
z.string({
  required_error: 'Name is required',
  invalid_type_error: 'Name must be a string',
}).min(2, { message: 'Name must be at least 2 characters' })

// Or with error map
z.string().min(2, 'Too short').max(100, 'Too long')
```

## Type Inference

```tsx
const UserSchema = z.object({
  name: z.string(),
  email: z.string().email(),
})

// Infer output type (after transforms)
type User = z.infer<typeof UserSchema>

// Infer input type (before transforms)
type UserInput = z.input<typeof UserSchema>

// Infer output type explicitly
type UserOutput = z.output<typeof UserSchema>
```

## Records & Maps

```tsx
// Record (object with dynamic keys)
z.record(z.string())  // { [key: string]: string }
z.record(z.string(), z.number())  // { [key: string]: number }

// Map
z.map(z.string(), z.number())

// Set
z.set(z.string())
z.set(z.number()).min(1).max(10)
```

## Best Practices

1. **Use `safeParse`** in production - avoid throwing
2. **Infer types** with `z.infer<typeof Schema>`
3. **Custom messages** - always provide user-friendly errors
4. **Discriminated unions** for better performance
5. **Coerce for external data** (API, form inputs)
6. **Reuse schemas** - compose smaller schemas into larger ones
7. **Validate at boundaries** - API routes, form submissions
