import { DashboardHeader } from "@/components/layout/dashboard-header";
import { Main } from "@/components/layout/main";
import { AuthenticatedLayout } from "@/components/layout/authenticated-layout";
import { MediaModalProvider } from "@/context/media-modal-provider";
import { MediaTopbarActions, MediaModalMount } from "@/components/media/media-topbar";

export default function DashboardGroupLayout({ children }: { children: React.ReactNode }) {

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

