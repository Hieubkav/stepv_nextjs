import type { Metadata, Route } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ConvexHttpClient } from "convex/browser";
import { api } from "@dohy/backend/convex/_generated/api";
import { AdminLoginForm } from "@/components/admin/admin-login-form";
import {
  canAccessPath,
  getFirstAccessibleDashboardPath,
  hasAnyReadPermission,
} from "@/lib/admin-route-access";

type AdminLoginPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

const DEFAULT_REDIRECT: Route = "/dashboard";

const getSafeNextPath = (rawNext?: string | string[]): Route => {
  const candidate = Array.isArray(rawNext) ? rawNext[0] : rawNext;
  if (!candidate || candidate.startsWith("//") || !candidate.startsWith("/")) return DEFAULT_REDIRECT;
  return candidate as Route;
};

export const metadata: Metadata = {
  title: "Đăng nhập quản trị",
  description: "Bảo vệ khu vực dashboard dành cho admin.",
};

export default async function AdminLoginPage({ searchParams }: AdminLoginPageProps) {
  const resolvedSearchParams = await searchParams;
  const nextPath = getSafeNextPath(resolvedSearchParams?.next);
  const reason = typeof resolvedSearchParams?.reason === "string" ? resolvedSearchParams.reason : undefined;
  const cookieStore = await cookies();
  const adminSession = cookieStore.get("admin_session_token");
  const token = adminSession?.value;

  if (token) {
    const convexUrl = process.env.CONVEX_URL ?? process.env.NEXT_PUBLIC_CONVEX_URL;
    if (convexUrl) {
      const client = new ConvexHttpClient(convexUrl);
      const session = await client.query(api.adminAuth.verifySession, { token });
      if (session.valid) {
        if (!hasAnyReadPermission(session.user)) {
          return <AdminLoginForm nextPath={nextPath} reason="no-access" />;
        }
        const fallback = getFirstAccessibleDashboardPath(session.user) ?? DEFAULT_REDIRECT;
        const targetPath = (canAccessPath(session.user, nextPath) ? nextPath : fallback) as Route;
        redirect(targetPath);
      }
    }
  }

  return <AdminLoginForm nextPath={nextPath} reason={reason} />;
}
