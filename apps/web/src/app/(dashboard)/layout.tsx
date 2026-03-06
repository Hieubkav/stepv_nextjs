import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ConvexHttpClient } from "convex/browser";
import { api } from "@dohy/backend/convex/_generated/api";
import { DashboardHeader } from "@/components/layout/dashboard-header";
import { Main } from "@/components/layout/main";
import { AuthenticatedLayout } from "@/components/layout/authenticated-layout";
import { MediaModalProvider } from "@/context/media-modal-provider";
import { MediaTopbarActions, MediaModalMount } from "@/components/media/media-topbar";

export default async function DashboardGroupLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const adminSession = cookieStore.get("admin_session_token");
  const token = adminSession?.value;

  if (!token) {
    redirect("/admin-login");
  }

  const convexUrl = process.env.CONVEX_URL ?? process.env.NEXT_PUBLIC_CONVEX_URL;
  if (!convexUrl) {
    redirect("/admin-login");
  }

  const client = new ConvexHttpClient(convexUrl);
  const session = await client.query(api.adminAuth.verifySession, { token });
  if (!session.valid) {
    redirect("/admin-login");
  }

  return (
    <AuthenticatedLayout>
      <MediaModalProvider>
        <DashboardHeader fixed>
          <MediaTopbarActions />
        </DashboardHeader>
        <MediaModalMount />
        <Main>{children}</Main>
      </MediaModalProvider>
    </AuthenticatedLayout>
  );
}

