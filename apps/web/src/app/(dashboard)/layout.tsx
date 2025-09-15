import { DashboardHeader } from "@/components/layout/dashboard-header";
import { TopNav } from "@/components/layout/top-nav";
import { Main } from "@/components/layout/main";
import { AuthenticatedLayout } from "@/components/layout/authenticated-layout";
import { Search } from "@/components/search";
import { ThemeSwitch } from "@/components/theme-switch";
import { ProfileDropdown } from "@/components/profile-dropdown";

export default function DashboardGroupLayout({ children }: { children: React.ReactNode }) {
  const links = [
    { title: "Khối giao diện", href: "/dashboard/home-blocks" },
    { title: "Cài đặt", href: "/dashboard/settings" },
  ];

  return (
    <AuthenticatedLayout>
      <DashboardHeader fixed>
        <TopNav links={links} />
        <div className="ms-auto flex items-center space-x-2 sm:space-x-3 flex-nowrap">
          <Search />
          <ThemeSwitch />
          <ProfileDropdown />
        </div>
      </DashboardHeader>
      <Main>{children}</Main>
    </AuthenticatedLayout>
  );
}
