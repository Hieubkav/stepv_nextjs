---
name: State Management Patterns
description: Comprehensive guide to choosing and implementing state management solutions in React applications - Redux Toolkit, Zustand, Context API, MobX, Recoil, and React Query
---

# State Management Patterns

## Overview

State management is one of the most critical architectural decisions in frontend applications. The right choice depends on your app's complexity, team expertise, and specific requirements. This guide provides a practical decision framework and implementation patterns for rapid prototyping in 6-day sprints.

**Core Principle**: Choose the simplest solution that meets your needs. Start with local state and Context API, then scale up only when necessary. For server state, always prefer React Query over manual management.

## When to Use

### Decision Matrix

| Solution | Best For | Team Size | Learning Curve | Bundle Size | Boilerplate |
|----------|----------|-----------|----------------|-------------|-------------|
| **useState + Context** | Small apps, shared UI state | 1-3 | Low | 0KB | Minimal |
| **Zustand** | Medium apps, global state | 1-10 | Low | 1.3KB | Minimal |
| **Redux Toolkit** | Large apps, time-travel debugging | 5+ | Medium | 12KB | Low |
| **MobX** | Complex domain models, OOP teams | 3+ | Medium | 16KB | Low |
| **Recoil** | Derived state, atom-based architecture | 3+ | Medium | 18KB | Medium |
| **React Query** | Server state, data fetching | Any | Low | 13KB | Minimal |

### State Classification

1. **Server State**: Data from APIs (use React Query/SWR)
2. **UI State**: Modals, tabs, theme (use local state/Context)
3. **Form State**: Input values, validation (use React Hook Form)
4. **Global App State**: Auth, user prefs (use Zustand/Redux)
5. **URL State**: Filters, pagination (use router state)

## Pattern 1: useState + Context API (Simplest)

### When to Use
- Apps with < 10 components needing shared state
- Simple UI state (theme, sidebar open/closed)
- Quick prototypes in 6-day sprints
- No complex derived state or async logic

### Implementation

```typescript
// contexts/AppContext.tsx
import React, { createContext, useContext, useState, ReactNode } from 'react';

interface User {
  id: string;
  name: string;
  email: string;
}

interface AppState {
  user: User | null;
  theme: 'light' | 'dark';
  sidebarOpen: boolean;
}

interface AppContextType extends AppState {
  setUser: (user: User | null) => void;
  setTheme: (theme: 'light' | 'dark') => void;
  toggleSidebar: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => setSidebarOpen(prev => !prev);

  const value: AppContextType = {
    user,
    theme,
    sidebarOpen,
    setUser,
    setTheme,
    toggleSidebar,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
}
```

```typescript
// Usage in components
import { useApp } from '@/contexts/AppContext';

export function Header() {
  const { user, theme, setTheme, toggleSidebar } = useApp();

  return (
    <header className={theme}>
      <button onClick={toggleSidebar}>Menu</button>
      <span>Welcome, {user?.name}</span>
      <button onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}>
        Toggle Theme
      </button>
    </header>
  );
}
```

### Performance Optimization

```typescript
// Split contexts to avoid unnecessary re-renders
import { createContext, useContext, useState, ReactNode, memo } from 'react';

// Theme Context (changes rarely)
const ThemeContext = createContext<{
  theme: string;
  setTheme: (theme: string) => void;
} | undefined>(undefined);

// User Context (changes on auth)
const UserContext = createContext<{
  user: User | null;
  setUser: (user: User | null) => void;
} | undefined>(undefined);

// UI Context (changes frequently)
const UIContext = createContext<{
  sidebarOpen: boolean;
  toggleSidebar: () => void;
} | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState('light');
  const [user, setUser] = useState<User | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      <UserContext.Provider value={{ user, setUser }}>
        <UIContext.Provider
          value={{
            sidebarOpen,
            toggleSidebar: () => setSidebarOpen(prev => !prev)
          }}
        >
          {children}
        </UIContext.Provider>
      </UserContext.Provider>
    </ThemeContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used within AppProvider');
  return context;
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) throw new Error('useUser must be used within AppProvider');
  return context;
};

export const useUI = () => {
  const context = useContext(UIContext);
  if (!context) throw new Error('useUI must be used within AppProvider');
  return context;
};
```

## Pattern 2: Zustand (Recommended for Most Apps)

### When to Use
- Medium to large apps with global state
- Need simple, boilerplate-free state management
- Want dev tools without Redux complexity
- 6-day sprint timeline with minimal setup

### Installation
```bash
npm install zustand
```

### Implementation

```typescript
// stores/useAppStore.ts
import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

interface User {
  id: string;
  name: string;
  email: string;
}

interface Notification {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

interface AppState {
  // State
  user: User | null;
  notifications: Notification[];
  isLoading: boolean;

  // Actions
  setUser: (user: User | null) => void;
  addNotification: (message: string, type: Notification['type']) => void;
  removeNotification: (id: string) => void;
  setLoading: (loading: boolean) => void;

  // Async actions
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

export const useAppStore = create<AppState>()(
  devtools(
    persist(
      immer((set, get) => ({
        // Initial state
        user: null,
        notifications: [],
        isLoading: false,

        // Sync actions
        setUser: (user) => set({ user }),

        addNotification: (message, type) => set((state) => {
          state.notifications.push({
            id: Date.now().toString(),
            message,
            type,
          });
        }),

        removeNotification: (id) => set((state) => {
          state.notifications = state.notifications.filter(n => n.id !== id);
        }),

        setLoading: (loading) => set({ isLoading: loading }),

        // Async actions
        login: async (email, password) => {
          set({ isLoading: true });
          try {
            const response = await fetch('/api/auth/login', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ email, password }),
            });
            const user = await response.json();
            set({ user, isLoading: false });
            get().addNotification('Login successful', 'success');
          } catch (error) {
            set({ isLoading: false });
            get().addNotification('Login failed', 'error');
            throw error;
          }
        },

        logout: async () => {
          await fetch('/api/auth/logout', { method: 'POST' });
          set({ user: null });
          get().addNotification('Logged out', 'info');
        },
      })),
      {
        name: 'app-storage',
        partialize: (state) => ({ user: state.user }), // Only persist user
      }
    )
  )
);

// Selectors for performance
export const useUser = () => useAppStore((state) => state.user);
export const useNotifications = () => useAppStore((state) => state.notifications);
export const useIsLoading = () => useAppStore((state) => state.isLoading);
```

```typescript
// Usage in components
import { useAppStore, useUser, useNotifications } from '@/stores/useAppStore';

export function LoginForm() {
  const login = useAppStore((state) => state.login);
  const isLoading = useIsLoading();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    await login(
      formData.get('email') as string,
      formData.get('password') as string
    );
  };

  return (
    <form onSubmit={handleSubmit}>
      <input name="email" type="email" required />
      <input name="password" type="password" required />
      <button disabled={isLoading}>Login</button>
    </form>
  );
}

export function NotificationList() {
  const notifications = useNotifications();
  const removeNotification = useAppStore((state) => state.removeNotification);

  return (
    <div className="notifications">
      {notifications.map((notification) => (
        <div key={notification.id} className={notification.type}>
          {notification.message}
          <button onClick={() => removeNotification(notification.id)}>×</button>
        </div>
      ))}
    </div>
  );
}
```

### Slices Pattern (Scale to Large Apps)

```typescript
// stores/slices/authSlice.ts
import { StateCreator } from 'zustand';

export interface AuthSlice {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

export const createAuthSlice: StateCreator<AuthSlice> = (set) => ({
  user: null,
  isAuthenticated: false,
  login: async (email, password) => {
    const user = await fetchUser(email, password);
    set({ user, isAuthenticated: true });
  },
  logout: () => set({ user: null, isAuthenticated: false }),
});

// stores/slices/uiSlice.ts
export interface UISlice {
  theme: 'light' | 'dark';
  sidebarOpen: boolean;
  toggleTheme: () => void;
  toggleSidebar: () => void;
}

export const createUISlice: StateCreator<UISlice> = (set) => ({
  theme: 'light',
  sidebarOpen: false,
  toggleTheme: () => set((state) => ({
    theme: state.theme === 'light' ? 'dark' : 'light'
  })),
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
});

// stores/useStore.ts
import { create } from 'zustand';
import { AuthSlice, createAuthSlice } from './slices/authSlice';
import { UISlice, createUISlice } from './slices/uiSlice';

type StoreState = AuthSlice & UISlice;

export const useStore = create<StoreState>()((...a) => ({
  ...createAuthSlice(...a),
  ...createUISlice(...a),
}));
```

## Pattern 3: Redux Toolkit (Enterprise Scale)

### When to Use
- Large teams (5+ developers)
- Need time-travel debugging
- Complex state interactions
- Strict patterns and TypeScript integration
- Redux ecosystem tools (Redux Saga, etc.)

### Installation
```bash
npm install @reduxjs/toolkit react-redux
```

### Implementation

```typescript
// store/slices/authSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from '../store';

interface User {
  id: string;
  name: string;
  email: string;
}

interface AuthState {
  user: User | null;
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  status: 'idle',
  error: null,
};

// Async thunks
export const login = createAsyncThunk(
  'auth/login',
  async ({ email, password }: { email: string; password: string }) => {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    return response.json();
  }
);

export const logout = createAsyncThunk('auth/logout', async () => {
  await fetch('/api/auth/logout', { method: 'POST' });
});

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<User | null>) => {
      state.user = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(login.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.user = action.payload;
      })
      .addCase(login.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || 'Login failed';
      })
      // Logout
      .addCase(logout.fulfilled, (state) => {
        state.user = null;
        state.status = 'idle';
      });
  },
});

export const { setUser, clearError } = authSlice.actions;

// Selectors
export const selectUser = (state: RootState) => state.auth.user;
export const selectAuthStatus = (state: RootState) => state.auth.status;
export const selectAuthError = (state: RootState) => state.auth.error;

export default authSlice.reducer;
```

```typescript
// store/store.ts
import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import uiReducer from './slices/uiSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    ui: uiReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST'],
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
```

```typescript
// store/hooks.ts
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
import type { RootState, AppDispatch } from './store';

export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
```

```typescript
// Usage
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { login, selectUser, selectAuthStatus } from '@/store/slices/authSlice';

export function LoginForm() {
  const dispatch = useAppDispatch();
  const user = useAppSelector(selectUser);
  const status = useAppSelector(selectAuthStatus);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    await dispatch(login({
      email: formData.get('email') as string,
      password: formData.get('password') as string,
    }));
  };

  return (
    <form onSubmit={handleSubmit}>
      <input name="email" type="email" />
      <input name="password" type="password" />
      <button disabled={status === 'loading'}>Login</button>
    </form>
  );
}
```

## Pattern 4: React Query (Server State)

### When to Use
- Any app that fetches data from APIs
- Need caching, background refetching, optimistic updates
- Want to separate server state from client state
- **Always prefer for server data over Redux/Zustand**

### Installation
```bash
npm install @tanstack/react-query
```

### Implementation

```typescript
// providers/QueryProvider.tsx
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { ReactNode } from 'react';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000, // 1 minute
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

export function QueryProvider({ children }: { children: ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
```

```typescript
// hooks/useUsers.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

interface User {
  id: string;
  name: string;
  email: string;
}

// Query hook
export function useUsers() {
  return useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const response = await fetch('/api/users');
      if (!response.ok) throw new Error('Failed to fetch users');
      return response.json() as Promise<User[]>;
    },
  });
}

// Single user query
export function useUser(id: string) {
  return useQuery({
    queryKey: ['users', id],
    queryFn: async () => {
      const response = await fetch(`/api/users/${id}`);
      if (!response.ok) throw new Error('Failed to fetch user');
      return response.json() as Promise<User>;
    },
    enabled: !!id, // Only run if id exists
  });
}

// Mutation hooks
export function useCreateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (user: Omit<User, 'id'>) => {
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(user),
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
}

export function useUpdateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (user: User) => {
      const response = await fetch(`/api/users/${user.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(user),
      });
      return response.json();
    },
    onMutate: async (newUser) => {
      // Optimistic update
      await queryClient.cancelQueries({ queryKey: ['users', newUser.id] });
      const previousUser = queryClient.getQueryData(['users', newUser.id]);
      queryClient.setQueryData(['users', newUser.id], newUser);
      return { previousUser };
    },
    onError: (err, newUser, context) => {
      // Rollback on error
      queryClient.setQueryData(
        ['users', newUser.id],
        context?.previousUser
      );
    },
    onSettled: (data, error, variables) => {
      queryClient.invalidateQueries({ queryKey: ['users', variables.id] });
    },
  });
}
```

```typescript
// Usage in components
import { useUsers, useCreateUser } from '@/hooks/useUsers';

export function UserList() {
  const { data: users, isLoading, error } = useUsers();
  const createUser = useCreateUser();

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  const handleCreate = async () => {
    await createUser.mutateAsync({
      name: 'New User',
      email: 'new@example.com',
    });
  };

  return (
    <div>
      <button onClick={handleCreate}>Add User</button>
      {users?.map((user) => (
        <div key={user.id}>{user.name}</div>
      ))}
    </div>
  );
}
```

## Migration Guides

### Context API → Zustand

```typescript
// Before: Context API
const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  return (
    <UserContext.Provider value={{ user, setUser }}>
      {children}
    </UserContext.Provider>
  );
}

// After: Zustand
import { create } from 'zustand';

export const useUserStore = create<{
  user: User | null;
  setUser: (user: User | null) => void;
}>((set) => ({
  user: null,
  setUser: (user) => set({ user }),
}));

// Migration steps:
// 1. Install Zustand: npm install zustand
// 2. Create store with same interface
// 3. Replace useContext(UserContext) with useUserStore()
// 4. Remove Provider from component tree
```

### Zustand → Redux Toolkit

```typescript
// Before: Zustand
export const useAppStore = create<AppState>((set) => ({
  count: 0,
  increment: () => set((state) => ({ count: state.count + 1 })),
}));

// After: Redux Toolkit
import { createSlice } from '@reduxjs/toolkit';

const counterSlice = createSlice({
  name: 'counter',
  initialState: { count: 0 },
  reducers: {
    increment: (state) => {
      state.count += 1;
    },
  },
});

// Migration steps:
// 1. Install Redux Toolkit: npm install @reduxjs/toolkit react-redux
// 2. Create slices for each Zustand store
// 3. Setup Redux store
// 4. Replace useAppStore with useAppSelector/useAppDispatch
// 5. Wrap app with Provider
```

## Anti-Patterns

### ❌ Anti-Pattern 1: Using Redux for Server State

```typescript
// DON'T: Manage API data in Redux
const usersSlice = createSlice({
  name: 'users',
  initialState: { data: [], loading: false },
  reducers: {
    fetchUsersStart: (state) => { state.loading = true; },
    fetchUsersSuccess: (state, action) => {
      state.data = action.payload;
      state.loading = false;
    },
  },
});

// DO: Use React Query for server state
export function useUsers() {
  return useQuery({
    queryKey: ['users'],
    queryFn: fetchUsers,
  });
}
```

### ❌ Anti-Pattern 2: Single Giant Context

```typescript
// DON'T: One massive context causes re-renders
const AppContext = createContext({
  user, setUser,
  theme, setTheme,
  cart, setCart,
  notifications, setNotifications,
  // ... 20 more values
});

// DO: Split into multiple contexts or use Zustand
const useUserStore = create((set) => ({ user: null, setUser: (u) => set({ user: u }) }));
const useThemeStore = create((set) => ({ theme: 'light', setTheme: (t) => set({ theme: t }) }));
```

### ❌ Anti-Pattern 3: Overusing Global State

```typescript
// DON'T: Put everything in global state
const useAppStore = create((set) => ({
  modalOpen: false,
  tooltipText: '',
  hoverState: false,
  // ... temporary UI state
}));

// DO: Keep UI state local
function Modal() {
  const [isOpen, setIsOpen] = useState(false);
  // ...
}
```

## Complete Example: E-commerce App State Architecture

```typescript
// stores/useCartStore.ts - Global cart state with Zustand
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface CartItem {
  productId: string;
  quantity: number;
  price: number;
}

interface CartStore {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  total: () => number;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (item) => set((state) => ({
        items: [...state.items, item],
      })),

      removeItem: (productId) => set((state) => ({
        items: state.items.filter((item) => item.productId !== productId),
      })),

      updateQuantity: (productId, quantity) => set((state) => ({
        items: state.items.map((item) =>
          item.productId === productId ? { ...item, quantity } : item
        ),
      })),

      clearCart: () => set({ items: [] }),

      total: () => {
        const { items } = get();
        return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
      },
    }),
    { name: 'cart-storage' }
  )
);

// hooks/useProducts.ts - Server state with React Query
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

interface Product {
  id: string;
  name: string;
  price: number;
  stock: number;
}

export function useProducts(filters?: { category?: string; search?: string }) {
  return useQuery({
    queryKey: ['products', filters],
    queryFn: async () => {
      const params = new URLSearchParams(filters);
      const response = await fetch(`/api/products?${params}`);
      return response.json() as Promise<Product[]>;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useProduct(id: string) {
  return useQuery({
    queryKey: ['products', id],
    queryFn: async () => {
      const response = await fetch(`/api/products/${id}`);
      return response.json() as Promise<Product>;
    },
  });
}

// components/ProductList.tsx - Combined usage
import { useProducts } from '@/hooks/useProducts';
import { useCartStore } from '@/stores/useCartStore';

export function ProductList() {
  const { data: products, isLoading } = useProducts();
  const addItem = useCartStore((state) => state.addItem);

  if (isLoading) return <div>Loading products...</div>;

  return (
    <div className="grid grid-cols-3 gap-4">
      {products?.map((product) => (
        <div key={product.id} className="border p-4">
          <h3>{product.name}</h3>
          <p>${product.price}</p>
          <button
            onClick={() => addItem({
              productId: product.id,
              quantity: 1,
              price: product.price,
            })}
          >
            Add to Cart
          </button>
        </div>
      ))}
    </div>
  );
}

// components/Cart.tsx
import { useCartStore } from '@/stores/useCartStore';
import { useProduct } from '@/hooks/useProducts';

function CartItem({ productId, quantity }: { productId: string; quantity: number }) {
  const { data: product } = useProduct(productId);
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const removeItem = useCartStore((state) => state.removeItem);

  if (!product) return null;

  return (
    <div className="flex items-center gap-4">
      <span>{product.name}</span>
      <input
        type="number"
        value={quantity}
        onChange={(e) => updateQuantity(productId, parseInt(e.target.value))}
        min="1"
      />
      <span>${product.price * quantity}</span>
      <button onClick={() => removeItem(productId)}>Remove</button>
    </div>
  );
}

export function Cart() {
  const items = useCartStore((state) => state.items);
  const total = useCartStore((state) => state.total);
  const clearCart = useCartStore((state) => state.clearCart);

  return (
    <div className="border p-4">
      <h2>Shopping Cart</h2>
      {items.map((item) => (
        <CartItem key={item.productId} {...item} />
      ))}
      <div className="mt-4 font-bold">
        Total: ${total()}
      </div>
      <button onClick={clearCart}>Clear Cart</button>
    </div>
  );
}
```

## Recommended Approach for 6-Day Sprints

**Day 1-2: Start Simple**
- Use local state (useState) for component-specific state
- Use Context API for 1-2 global values (theme, auth)
- Use React Query for all API data

**Day 3-4: Scale If Needed**
- If Context causes re-render issues, migrate to Zustand
- Keep server state in React Query
- Add Zustand slices for cart, preferences, UI state

**Day 5-6: Optimize**
- Add selectors to prevent re-renders
- Implement optimistic updates in React Query
- Add persistence for cart/preferences
- Consider Redux Toolkit only if you need time-travel debugging

**Key Decision Framework:**
1. Server data? → React Query
2. Form data? → React Hook Form
3. URL state? → Next.js router
4. < 5 global values? → Context API
5. Medium complexity? → Zustand
6. Large team/complex? → Redux Toolkit

This approach minimizes upfront architecture decisions while maintaining the flexibility to scale as requirements evolve.
