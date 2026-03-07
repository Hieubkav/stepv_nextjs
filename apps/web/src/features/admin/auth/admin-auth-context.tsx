"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import {
  canAccessPath,
  getFirstAccessibleDashboardPath,
  hasAnyReadPermission,
  hasPermission,
} from "@/lib/admin-route-access";

type AdminUser = {
  email: string;
  id: string;
  isSuperAdmin: boolean;
  name: string;
  permissions: Record<string, string[]>;
  roleId: string;
};

type AdminAuthContextValue = {
  isLoading: boolean;
  user: AdminUser | null;
  hasPermission: (moduleKey: string, action: string) => boolean;
  canAccessPath: (pathname: string) => boolean;
  firstAccessiblePath: string | null;
  hasAnyReadAccess: boolean;
  refresh: () => Promise<void>;
};

const AdminAuthContext = createContext<AdminAuthContextValue | null>(null);

export function AdminAuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const load = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/admin/session", { cache: "no-store" });
      if (!response.ok) {
        setUser(null);
        return;
      }
      const payload = await response.json();
      setUser(payload.user ?? null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const hasPermissionMemo = useMemo(() => {
    return (moduleKey: string, action: string) => hasPermission(user, moduleKey, action);
  }, [user]);

  const canAccessPathMemo = useMemo(() => {
    return (pathname: string) => canAccessPath(user, pathname);
  }, [user]);

  const firstAccessiblePath = useMemo(() => getFirstAccessibleDashboardPath(user), [user]);

  const hasAnyReadAccess = useMemo(() => hasAnyReadPermission(user), [user]);

  return (
    <AdminAuthContext.Provider
      value={{
        canAccessPath: canAccessPathMemo,
        firstAccessiblePath,
        hasAnyReadAccess,
        hasPermission: hasPermissionMemo,
        isLoading,
        refresh: load,
        user,
      }}
    >
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  const context = useContext(AdminAuthContext);
  if (!context) {
    throw new Error("useAdminAuth must be used within AdminAuthProvider");
  }
  return context;
}
