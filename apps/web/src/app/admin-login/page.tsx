import type { Metadata, Route } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ConvexHttpClient } from "convex/browser";
import { api } from "@dohy/backend/convex/_generated/api";
import { AdminLoginForm } from "@/components/admin/admin-login-form";

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
  const cookieStore = await cookies();
  const adminSession = cookieStore.get("admin_session_token");
  const token = adminSession?.value;

  if (token) {
    const convexUrl = process.env.CONVEX_URL ?? process.env.NEXT_PUBLIC_CONVEX_URL;
    if (convexUrl) {
      const client = new ConvexHttpClient(convexUrl);
      const session = await client.query(api.adminAuth.verifySession, { token });
      if (session.valid) {
        redirect(nextPath);
      }
    }
  }

  return <AdminLoginForm nextPath={nextPath} />;
}
