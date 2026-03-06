"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";

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

  const hasPermission = useMemo(() => {
    return (moduleKey: string, action: string) => {
      if (!user) return false;
      if (user.isSuperAdmin) return true;
      const permissions = user.permissions ?? {};
      if (permissions["*"]?.includes("*") || permissions["*"]?.includes(action)) return true;
      if (permissions[moduleKey]?.includes("*") || permissions[moduleKey]?.includes(action)) return true;
      return false;
    };
  }, [user]);

  return (
    <AdminAuthContext.Provider value={{ hasPermission, isLoading, refresh: load, user }}>
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
