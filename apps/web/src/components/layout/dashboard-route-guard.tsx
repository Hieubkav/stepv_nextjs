"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAdminAuth } from "@/features/admin/auth/admin-auth-context";

export function DashboardRouteGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { canAccessPath, firstAccessiblePath, hasAnyReadAccess, isLoading } = useAdminAuth();

  useEffect(() => {
    if (isLoading) return;
    if (!hasAnyReadAccess) {
      router.replace("/admin-login?reason=no-access" as any);
      return;
    }
    if (!canAccessPath(pathname)) {
      if (firstAccessiblePath) {
        router.replace(firstAccessiblePath as any);
      } else {
        router.replace("/admin-login?reason=no-access" as any);
      }
    }
  }, [canAccessPath, firstAccessiblePath, hasAnyReadAccess, isLoading, pathname, router]);

  if (isLoading) return null;
  if (!hasAnyReadAccess) return null;
  if (!canAccessPath(pathname)) return null;
  return <>{children}</>;
}
