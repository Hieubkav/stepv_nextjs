"use client";

import { useMemo, type ReactNode } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { Menu } from "lucide-react";
import { useQuery } from "convex/react";
import { api } from "@dohy/backend/convex/_generated/api";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { StudentAuthProvider, useStudentAuth } from "@/features/learner/auth";
import { SiteLayoutDataContext } from "@/context/site-layout-data";
import {
  mapSiteFooterProps,
  mapSiteHeaderProps,
  partitionSiteLayoutBlocks,
  type HomeBlock,
} from "@/lib/site-layout";

type LearnerLayoutClientProps = {
  children: ReactNode;
};

const NAV_LINKS = [{ label: "Tất cả khóa học", href: "/khoa-hoc" }];

const STUDENT_MENU_LINKS = [
  { label: "Thông tin học viên", href: "/khoa-hoc/thong-tin" },
  { label: "Lịch sử mua", href: "/khoa-hoc/don-dat" },
];

export default function LearnerLayoutClient({ children }: LearnerLayoutClientProps) {
  const homepage = useQuery(api.homepage.getHomepage, { slug: "home" });
  const blocks = useMemo(() => (homepage?.blocks ?? []) as HomeBlock[], [homepage?.blocks]);

  const { headerBlock, footerBlock, contentBlocks } = useMemo(
    () => partitionSiteLayoutBlocks(blocks),
    [blocks],
  );

  const headerProps = useMemo(() => mapSiteHeaderProps(headerBlock?.data), [headerBlock?.data]);
  const footerProps = useMemo(() => mapSiteFooterProps(footerBlock?.data), [footerBlock?.data]);
  const isLoading = homepage === undefined;

  const contextValue = useMemo(
    () => ({
      isLoading,
      blocks,
      contentBlocks,
      headerBlock,
      footerBlock,
      headerProps,
      footerProps,
      settings: homepage?.settings,
      page: homepage?.page,
      raw: homepage,
    }),
    [
      isLoading,
      blocks,
      contentBlocks,
      headerBlock,
      footerBlock,
      headerProps,
      footerProps,
      homepage?.settings,
      homepage?.page,
      homepage,
    ],
  );

  return (
    <SiteLayoutDataContext.Provider value={contextValue}>
      <StudentAuthProvider>
        <div className="flex min-h-screen flex-col bg-background">
          <LearnerTopBar logo={headerProps.logo} />
          <main className="flex-1 bg-muted/30">
            <div className="mx-auto w-full max-w-7xl px-4 py-2">{children}</div>
          </main>
        </div>
      </StudentAuthProvider>
    </SiteLayoutDataContext.Provider>
  );
}

type LearnerTopBarProps = {
  logo?: string;
};

function LearnerTopBar({ logo }: LearnerTopBarProps) {
  const router = useRouter();
  const pathname = usePathname() ?? "/";
  const { student, logout } = useStudentAuth();

  const isActive = (href: string) => {
    if (href === "/khoa-hoc") {
      return pathname.startsWith("/khoa-hoc");
    }
    return pathname.startsWith(href);
  };

  return (
    <header className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex w-full max-w-7xl items-center gap-6 px-4 py-2.5 sm:px-6">
        <Link href="/" className="flex items-center gap-3 shrink-0" aria-label="Về trang chủ">
          <div className="h-11 w-11 overflow-hidden rounded-lg border border-border/40 bg-gradient-to-br from-muted to-muted/70 shadow-sm hover:shadow-md transition-shadow duration-200">
            {logo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={logo} alt="Logo thương hiệu" className="h-full w-full object-contain p-0.5" />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-xs font-bold bg-gradient-to-br from-primary to-primary/80 text-primary-foreground">
                DOHY
              </div>
            )}
          </div>
          <div className="hidden flex-col leading-4 sm:flex">
            <span className="text-[10px] font-bold uppercase tracking-[0.5em] text-muted-foreground">
              LEARNER
            </span>
            <span className="text-[13px] font-medium text-foreground">Không gian học viên</span>
          </div>
        </Link>

        <nav className="hidden flex-1 items-center gap-0.5 lg:flex">
           {NAV_LINKS.map((link) => (
             <Link
               key={link.href}
               href={link.href as any}
               className={`px-4 py-2 text-sm font-semibold transition-all duration-200 relative ${
                 isActive(link.href)
                   ? "text-primary"
                   : "text-muted-foreground hover:text-foreground"
               }`}
             >
               {link.label}
               {isActive(link.href) && (
                 <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-primary to-primary/60 rounded-full" />
               )}
             </Link>
           ))}
         </nav>

        <div className="ml-auto flex items-center gap-3">
          {student ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-9 px-3 hover:bg-muted/80 transition-colors duration-200"
                >
                  <div className="flex flex-col items-start leading-tight gap-0.5">
                    <span className="text-[10px] uppercase font-medium tracking-[0.4em] text-muted-foreground">
                        Học viên
                      </span>
                    <span className="text-[13px] font-semibold text-foreground max-w-[120px] truncate">
                      {student.fullName || student.account}
                    </span>
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-64">
                <DropdownMenuLabel>
                  <p className="text-[11px] uppercase font-medium tracking-[0.3em] text-muted-foreground">Không gian học viên</p>
                  <p className="text-sm font-medium text-foreground mt-1">
                    {student.fullName || student.account}
                  </p>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                {STUDENT_MENU_LINKS.map((item) => (
                  <DropdownMenuItem key={item.href} asChild>
                    <Link href={item.href as any} className="flex w-full items-center justify-between cursor-pointer">
                      <span>{item.label}</span>
                    </Link>
                  </DropdownMenuItem>
                ))}
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onSelect={(event) => {
                    event.preventDefault();
                    logout();
                  }}
                  className="cursor-pointer"
                >
                  Đăng xuất
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="hidden sm:flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="px-4 h-9 font-semibold"
                onClick={() => router.push("/khoa-hoc/dang-nhap")}
              >
                Đăng nhập
              </Button>
              <Button
                size="sm"
                className="px-4 h-9 font-semibold"
                onClick={() => router.push("/khoa-hoc/dang-ky")}
              >
                Đăng ký
              </Button>
            </div>
          )}

          <Button
            variant="ghost"
            size="icon"
            className="inline-flex rounded-lg lg:hidden h-9 w-9"
            aria-label="Mở menu học viên"
          >
            <Menu className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </header>
  );
}
