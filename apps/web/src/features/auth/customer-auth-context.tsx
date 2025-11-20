'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useConvex, useMutation, useQuery } from 'convex/react';
import { api } from '@dohy/backend/convex/_generated/api';
import type { Id } from '@dohy/backend/convex/_generated/dataModel';

type CustomerAccount = {
    _id: Id<'customers'>;
    account: string;
    email: string;
    fullName: string;
    phone?: string;
    notes?: string;
    order: number;
    active: boolean;
    createdAt: number;
    updatedAt: number;
};

type CustomerSession = {
    customer: CustomerAccount;
    issuedAt: number;
    rememberToken?: string;
};

type AuthStatus = 'idle' | 'loading' | 'authenticated';

type CustomerAuthContextValue = {
    customer: CustomerAccount | null;
    status: AuthStatus;
    error?: string;
    isAuthenticated: boolean;
    login: (input: { email: string; password: string; rememberMe?: boolean }) => Promise<{ ok: boolean; error?: string }>;
    register: (input: {
        account: string;
        email: string;
        password: string;
        fullName: string;
        phone?: string;
    }) => Promise<{ ok: boolean; error?: string; customerId?: string }>;
    logout: () => void;
    refresh: () => void;
    updateProfile: (data: Partial<CustomerAccount>) => Promise<{ ok: boolean; error?: string }>;
};

const CustomerAuthContext = createContext<CustomerAuthContextValue | undefined>(undefined);

const STORAGE_KEY = 'customer.session';

const safeParseSession = (raw: string | null): CustomerSession | null => {
    if (!raw) return null;
    try {
        const parsed = JSON.parse(raw) as CustomerSession;
        if (parsed && parsed.customer && typeof parsed.customer._id === 'string') {
            return parsed;
        }
        return null;
    } catch {
        return null;
    }
};

const readStoredSession = (): CustomerSession | null => {
    if (typeof window === 'undefined') return null;
    return safeParseSession(window.localStorage.getItem(STORAGE_KEY));
};

const writeStoredSession = (session: CustomerSession | null) => {
    if (typeof window === 'undefined') return;
    if (!session) {
        window.localStorage.removeItem(STORAGE_KEY);
        return;
    }
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
};

type InternalState = {
    customer: CustomerAccount | null;
    status: AuthStatus;
    error?: string;
    hydrated: boolean;
};

export function CustomerAuthProvider({ children }: { children: React.ReactNode }) {
    const convex = useConvex();
    const authenticate = useMutation(api.customers.authenticateCustomer);
    const createCustomer = useMutation(api.customers.createCustomer);
    const updateRememberToken = useMutation(api.customers.updateRememberToken);
    const verifyRememberToken = useQuery(
        api.customers.verifyRememberToken,
        { token: '' }
    );
    const [state, setState] = useState<InternalState>({
        customer: null,
        status: 'idle',
        hydrated: false,
    });

    useEffect(() => {
        const stored = readStoredSession();
        if (stored?.customer) {
            setState({
                customer: stored.customer,
                status: stored.customer.active ? 'authenticated' : 'idle',
                error: undefined,
                hydrated: true,
            });
        } else if (stored?.rememberToken && typeof window !== 'undefined') {
            setState((prev) => ({ ...prev, status: 'loading', hydrated: false }));
            convex
                .query(api.customers.verifyRememberToken, { token: stored.rememberToken })
                .then((customer) => {
                    if (customer) {
                        setState({
                            customer,
                            status: 'authenticated',
                            error: undefined,
                            hydrated: true,
                        });
                        writeStoredSession({ customer, issuedAt: Date.now(), rememberToken: stored.rememberToken });
                    } else {
                        setState((prev) => ({ ...prev, status: 'idle', hydrated: true }));
                    }
                })
                .catch(() => {
                    setState((prev) => ({ ...prev, status: 'idle', hydrated: true }));
                });
        } else {
            setState((prev) => ({ ...prev, hydrated: true }));
        }
    }, [convex]);

    useEffect(() => {
        if (typeof window === 'undefined') return;
        const handleStorage = (event: StorageEvent) => {
            if (event.key !== STORAGE_KEY) return;
            const stored = safeParseSession(event.newValue);
            if (stored?.customer) {
                setState({
                    customer: stored.customer,
                    status: stored.customer.active ? 'authenticated' : 'idle',
                    error: undefined,
                    hydrated: true,
                });
            } else {
                setState((prev) => ({
                    customer: null,
                    status: 'idle',
                    error: undefined,
                    hydrated: prev.hydrated,
                }));
            }
        };
        window.addEventListener('storage', handleStorage);
        return () => window.removeEventListener('storage', handleStorage);
    }, []);

    const logout = useCallback(() => {
        writeStoredSession(null);
        setState((prev) => ({
            customer: null,
            status: 'idle',
            error: undefined,
            hydrated: prev.hydrated,
        }));
    }, []);

    const handleProfileUpdate = useCallback((profile: CustomerAccount) => {
        setState((prev) => {
            if (!prev.customer || prev.customer._id !== profile._id) {
                return prev;
            }
            return {
                ...prev,
                customer: profile,
                status: 'authenticated',
                error: undefined,
            };
        });
        writeStoredSession({ customer: profile, issuedAt: Date.now() });
    }, []);

    const login = useCallback(
        async ({ email, password, rememberMe = false }: { email: string; password: string; rememberMe?: boolean }) => {
            const trimmedEmail = email.trim().toLowerCase();
            const trimmedPassword = password.trim();
            if (!trimmedEmail || !trimmedPassword) {
                const error = 'Vui lòng nhập đầy đủ email và mật khẩu';
                setState((prev) => ({ ...prev, status: 'idle', error }));
                writeStoredSession(null);
                return { ok: false, error };
            }

            setState((prev) => ({ ...prev, status: 'loading', error: undefined }));

            try {
                const customer = (await authenticate({
                    email: trimmedEmail,
                    password: trimmedPassword,
                })) as CustomerAccount | null;

                if (!customer) {
                    const error = 'Thông tin đăng nhập không hợp lệ';
                    setState((prev) => ({ ...prev, status: 'idle', error, customer: null }));
                    writeStoredSession(null);
                    return { ok: false, error };
                }

                let rememberToken: string | undefined;
                if (rememberMe) {
                    const result = await updateRememberToken({
                        customerId: customer._id,
                        shouldRemember: true,
                    });
                    if (result.ok) {
                        rememberToken = result.rememberToken;
                    }
                }

                const session: CustomerSession = { customer, issuedAt: Date.now(), rememberToken };
                writeStoredSession(session);
                setState({
                    customer,
                    status: 'authenticated',
                    error: undefined,
                    hydrated: true,
                });
                return { ok: true };
            } catch (error) {
                const message =
                    error instanceof Error ? error.message : 'Không thể đăng nhập tại thời điểm này';
                setState((prev) => ({ ...prev, status: 'idle', error: message, customer: null }));
                writeStoredSession(null);
                return { ok: false, error: message };
            }
        },
        [authenticate, updateRememberToken],
    );

    const register = useCallback(
        async ({
            account,
            email,
            password,
            fullName,
            phone,
        }: {
            account: string;
            email: string;
            password: string;
            fullName: string;
            phone?: string;
        }) => {
            const trimmedAccount = account.trim();
            const trimmedEmail = email.trim().toLowerCase();
            const trimmedPassword = password.trim();
            const trimmedFullName = fullName.trim();

            if (!trimmedAccount || !trimmedEmail || !trimmedPassword || !trimmedFullName) {
                const error = 'Vui lòng điền đầy đủ thông tin bắt buộc';
                setState((prev) => ({ ...prev, status: 'idle', error }));
                return { ok: false, error };
            }

            setState((prev) => ({ ...prev, status: 'loading', error: undefined }));

            try {
                const result = (await createCustomer({
                    account: trimmedAccount,
                    email: trimmedEmail,
                    password: trimmedPassword,
                    fullName: trimmedFullName,
                    phone: phone?.trim(),
                    order: 0,
                    active: true,
                })) as CustomerAccount | null;

                if (!result) {
                    const error = 'Không thể tạo tài khoản';
                    setState((prev) => ({ ...prev, status: 'idle', error, customer: null }));
                    return { ok: false, error };
                }

                const session: CustomerSession = { customer: result, issuedAt: Date.now() };
                writeStoredSession(session);
                setState({
                    customer: result,
                    status: 'authenticated',
                    error: undefined,
                    hydrated: true,
                });
                return { ok: true, customerId: result._id };
            } catch (error) {
                const message =
                    error instanceof Error ? error.message : 'Không thể tạo tài khoản tại thời điểm này';
                setState((prev) => ({ ...prev, status: 'idle', error: message, customer: null }));
                return { ok: false, error: message };
            }
        },
        [createCustomer],
    );

    const refresh = useCallback(async () => {
        const stored = readStoredSession();
        if (!stored?.customer) {
            logout();
            return;
        }

        setState((prev) => ({
            customer: stored.customer,
            status: 'loading',
            error: undefined,
            hydrated: true,
        }));

        try {
            const profile = (await convex.query(api.customers.getCustomerProfile, {
                id: stored.customer._id,
            })) as CustomerAccount | null;
            if (!profile || !profile.active) {
                logout();
                return;
            }
            writeStoredSession({ customer: profile, issuedAt: Date.now() });
            setState({
                customer: profile,
                status: 'authenticated',
                error: undefined,
                hydrated: true,
            });
        } catch (error) {
            const message =
                error instanceof Error ? error.message : 'Không thể đồng bộ tài khoản';
            setState((prev) => ({
                ...prev,
                status: prev.customer ? 'authenticated' : 'idle',
                error: message,
            }));
        }
    }, [convex, logout]);

    const updateProfile = useCallback(
        async (data: Partial<CustomerAccount>) => {
            const stored = readStoredSession();
            if (!stored?.customer) {
                return { ok: false, error: 'Not authenticated' };
            }

            try {
                await convex.mutation(api.customers.updateCustomer, {
                    id: stored.customer._id,
                    ...data,
                } as any);
                
                // Refresh profile after update
                await refresh();
                return { ok: true };
            } catch (error) {
                const message = error instanceof Error ? error.message : 'Failed to update profile';
                return { ok: false, error: message };
            }
        },
        [convex, refresh],
    );

    const value = useMemo<CustomerAuthContextValue>(
        () => ({
            customer: state.customer,
            status: state.hydrated ? state.status : 'loading',
            error: state.error,
            isAuthenticated: state.customer?.active ?? false,
            login,
            register,
            logout,
            refresh,
            updateProfile,
        }),
        [state.customer, state.status, state.error, state.hydrated, login, register, logout, refresh, updateProfile],
    );

    const customerId = state.hydrated && state.customer ? state.customer._id : null;

    return (
        <CustomerAuthContext.Provider value={value}>
            <CustomerProfileWatcher
                customerId={customerId}
                onResolved={handleProfileUpdate}
                onInactive={logout}
            />
            {children}
        </CustomerAuthContext.Provider>
    );
}

type CustomerProfileWatcherProps = {
    customerId: Id<'customers'> | null;
    onResolved: (profile: CustomerAccount) => void;
    onInactive: () => void;
};

function CustomerProfileWatcher({ customerId, onResolved, onInactive }: CustomerProfileWatcherProps) {
    const profile = useQuery(
        api.customers.getCustomerProfile,
        customerId ? { id: customerId } : 'skip',
    ) as CustomerAccount | null | undefined;

    useEffect(() => {
        if (!customerId) return;
        if (profile === undefined) return;
        if (!profile || !profile.active) {
            onInactive();
            return;
        }
        onResolved(profile);
    }, [customerId, profile, onResolved, onInactive]);

    return null;
}

export function useCustomerAuth(): CustomerAuthContextValue {
    const context = useContext(CustomerAuthContext);
    if (!context) {
        throw new Error('useCustomerAuth must be used within CustomerAuthProvider');
    }
    return context;
}
