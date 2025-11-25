import type { Metadata, Route } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { AdminLoginForm } from "@/components/admin/admin-login-form";

type AdminLoginPageProps = {
  searchParams?: Record<string, string | string[] | undefined>;
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
  const nextPath = getSafeNextPath(searchParams?.next);
  const cookieStore = await cookies();
  const adminSession = cookieStore.get("admin_session");

  if (adminSession?.value === "authenticated") {
    redirect(nextPath);
  }

  return <AdminLoginForm nextPath={nextPath} />;
}
