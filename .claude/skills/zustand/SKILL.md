---
name: zustand
description: Zustand state management for React. Use when managing global state, creating stores, handling async actions, persisting state, or when user mentions zustand, global state, store, state management in React projects.
---

# Zustand

Lightweight state management for React with hooks-based API.

## Quick Start

```tsx
import { create } from 'zustand'

// Create store
const useStore = create((set) => ({
  count: 0,
  increment: () => set((state) => ({ count: state.count + 1 })),
  reset: () => set({ count: 0 }),
}))

// Use in component
function Counter() {
  const count = useStore((state) => state.count)
  const increment = useStore((state) => state.increment)
  return <button onClick={increment}>{count}</button>
}
```

## Core Patterns

### Basic Store with TypeScript

```tsx
import { create } from 'zustand'

interface BearState {
  bears: number
  increase: (by: number) => void
  reset: () => void
}

const useBearStore = create<BearState>()((set) => ({
  bears: 0,
  increase: (by) => set((state) => ({ bears: state.bears + by })),
  reset: () => set({ bears: 0 }),
}))
```

### Async Actions

```tsx
const useStore = create((set) => ({
  data: null,
  isLoading: false,
  error: null,
  
  fetch: async (url) => {
    set({ isLoading: true, error: null })
    try {
      const response = await fetch(url)
      const data = await response.json()
      set({ data, isLoading: false })
    } catch (error) {
      set({ error: error.message, isLoading: false })
    }
  },
}))
```

### Reading State in Actions (get)

```tsx
const useStore = create((set, get) => ({
  items: [],
  
  addItem: (item) => {
    const currentItems = get().items
    set({ items: [...currentItems, item] })
  },
  
  getTotal: () => {
    return get().items.reduce((sum, item) => sum + item.price, 0)
  },
}))
```

### Selectors (Prevent Re-renders)

```tsx
// Bad: Re-renders on any state change
const { bears, fish } = useStore()

// Good: Only re-renders when bears changes
const bears = useStore((state) => state.bears)

// Multiple values with useShallow
import { useShallow } from 'zustand/react/shallow'

const { bears, fish } = useStore(
  useShallow((state) => ({ bears: state.bears, fish: state.fish }))
)
```

## Middleware

### Persist (localStorage)

```tsx
import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

const useStore = create(
  persist(
    (set) => ({
      theme: 'light',
      setTheme: (theme) => set({ theme }),
    }),
    {
      name: 'app-storage', // localStorage key
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ theme: state.theme }), // Only persist theme
    }
  )
)
```

### DevTools

```tsx
import { create } from 'zustand'
import { devtools } from 'zustand/middleware'

const useStore = create(
  devtools(
    (set) => ({
      count: 0,
      increment: () => set(
        (state) => ({ count: state.count + 1 }),
        undefined,
        'increment' // Action name in DevTools
      ),
    }),
    { name: 'MyStore', enabled: process.env.NODE_ENV !== 'production' }
  )
)
```

### Immer (Mutable Syntax)

```tsx
import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'

const useStore = create(
  immer((set) => ({
    nested: { deep: { value: 0 } },
    
    increment: () => set((state) => {
      state.nested.deep.value += 1 // Direct mutation with Immer
    }),
  }))
)
```

### Combine Multiple Middleware

```tsx
import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'

const useStore = create<State>()(
  devtools(
    persist(
      immer((set) => ({
        // ... state and actions
      })),
      { name: 'app-storage' }
    ),
    { name: 'AppStore' }
  )
)
```

## Advanced Patterns

### Slices Pattern (Large Stores)

```tsx
// userSlice.ts
const createUserSlice = (set) => ({
  user: null,
  setUser: (user) => set({ user }),
  logout: () => set({ user: null }),
})

// cartSlice.ts
const createCartSlice = (set) => ({
  items: [],
  addItem: (item) => set((state) => ({ 
    items: [...state.items, item] 
  })),
})

// store.ts
import { create } from 'zustand'

const useStore = create((...a) => ({
  ...createUserSlice(...a),
  ...createCartSlice(...a),
}))
```

### Subscribe to Changes

```tsx
// Outside React
const unsub = useStore.subscribe(
  (state) => console.log('State changed:', state)
)

// With selector (subscribeWithSelector middleware)
import { subscribeWithSelector } from 'zustand/middleware'

const useStore = create(
  subscribeWithSelector((set) => ({
    count: 0,
    increment: () => set((state) => ({ count: state.count + 1 })),
  }))
)

// Subscribe to specific value
useStore.subscribe(
  (state) => state.count,
  (count, prevCount) => console.log('Count:', prevCount, '->', count)
)
```

### External Access (Outside React)

```tsx
// Get current state
const currentState = useStore.getState()

// Update state
useStore.setState({ count: 10 })

// Replace entire state
useStore.setState({ count: 0 }, true)
```

### Context for Dependency Injection

```tsx
import { createContext, useContext } from 'react'
import { createStore, useStore } from 'zustand'

const StoreContext = createContext(null)

function StoreProvider({ children, initialState }) {
  const store = createStore((set) => ({
    ...initialState,
    increment: () => set((s) => ({ count: s.count + 1 })),
  }))
  
  return (
    <StoreContext.Provider value={store}>
      {children}
    </StoreContext.Provider>
  )
}

function useAppStore(selector) {
  const store = useContext(StoreContext)
  return useStore(store, selector)
}
```

## Common Patterns

### Form State

```tsx
const useFormStore = create((set) => ({
  values: { email: '', password: '' },
  errors: {},
  
  setValue: (field, value) => set((state) => ({
    values: { ...state.values, [field]: value },
  })),
  
  setError: (field, error) => set((state) => ({
    errors: { ...state.errors, [field]: error },
  })),
  
  reset: () => set({ values: { email: '', password: '' }, errors: {} }),
}))
```

### Modal/Dialog State

```tsx
const useModalStore = create((set) => ({
  isOpen: false,
  modalType: null,
  modalProps: {},
  
  openModal: (type, props = {}) => set({ 
    isOpen: true, 
    modalType: type, 
    modalProps: props 
  }),
  
  closeModal: () => set({ 
    isOpen: false, 
    modalType: null, 
    modalProps: {} 
  }),
}))
```

### Auth State

```tsx
interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  login: (credentials: Credentials) => Promise<void>
  logout: () => void
}

const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      
      login: async (credentials) => {
        const { user, token } = await authApi.login(credentials)
        set({ user, token, isAuthenticated: true })
      },
      
      logout: () => {
        set({ user: null, token: null, isAuthenticated: false })
      },
    }),
    { 
      name: 'auth-storage',
      partialize: (state) => ({ token: state.token }),
    }
  )
)
```

## Best Practices

1. **Use selectors** - Prevent unnecessary re-renders
2. **Keep stores small** - Use slices for large apps
3. **Actions in store** - Keep logic in store, not components
4. **TypeScript** - Use `create<Type>()((set) => ...)` syntax
5. **Persist selectively** - Use `partialize` to persist only needed state
6. **DevTools in dev only** - Disable in production
