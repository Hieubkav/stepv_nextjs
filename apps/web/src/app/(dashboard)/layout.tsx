import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { DashboardHeader } from "@/components/layout/dashboard-header";
import { Main } from "@/components/layout/main";
import { AuthenticatedLayout } from "@/components/layout/authenticated-layout";
import { MediaModalProvider } from "@/context/media-modal-provider";
import { MediaTopbarActions, MediaModalMount } from "@/components/media/media-topbar";

export default async function DashboardGroupLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const adminSession = cookieStore.get("admin_session");

  if (adminSession?.value !== "authenticated") {
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

