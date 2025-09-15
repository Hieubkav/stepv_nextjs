import { DashboardHeader } from "@/components/layout/dashboard-header";
import { TopNav } from "@/components/layout/top-nav";
import { Main } from "@/components/layout/main";
import { AuthenticatedLayout } from "@/components/layout/authenticated-layout";
import { MediaModalProvider } from "@/context/media-modal-provider";
import { MediaTopbarActions, MediaModalMount } from "@/components/media/media-topbar";

export default function DashboardGroupLayout({ children }: { children: React.ReactNode }) {
  const links = [
    { title: "Tổng quan", href: "/dashboard" },
    { title: "Thư viện", href: "/dashboard/media" },
    { title: "Khối giao diện", href: "/dashboard/home-blocks" },
    { title: "Cài đặt", href: "/dashboard/settings" },
  ];

  return (
    <AuthenticatedLayout>
      <MediaModalProvider>
        <DashboardHeader fixed>
          <TopNav links={links} />
          <MediaTopbarActions />
        </DashboardHeader>
        <MediaModalMount />
        <Main>{children}</Main>
      </MediaModalProvider>
    </AuthenticatedLayout>
  );
}

