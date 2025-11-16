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
  { label: "Khóa học yêu thích", href: "/khoa-hoc/yeu-thich" },
  { label: "Khóa học đã mua", href: "/khoa-hoc/da-mua" },
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
            <div className="mx-auto w-full max-w-7xl px-4 py-6">{children}</div>
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
    <header className="sticky top-0 z-50 border-b border-border/70 bg-background/95 backdrop-blur">
      <div className="mx-auto flex w-full max-w-6xl items-center gap-3 px-4 py-3">
        <Link href="/" className="flex items-center gap-3" aria-label="Về trang chủ">
          <div className="h-12 w-12 overflow-hidden border border-border/60 bg-muted">
            {logo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={logo} alt="Logo thương hiệu" className="h-full w-full object-contain" />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-sm font-semibold">
                DOHY
              </div>
            )}
          </div>
          <div className="hidden flex-col leading-tight sm:flex">
            <span className="text-xs font-semibold uppercase tracking-[0.4em] text-muted-foreground">
              Learner
            </span>
            <span className="text-sm font-medium text-foreground">Không gian học viên</span>
          </div>
        </Link>

        <nav className="hidden flex-1 items-center gap-1 lg:flex">
           {NAV_LINKS.map((link) => (
             <Link
               key={link.href}
               href={link.href as any}
               className={`rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${
                 isActive(link.href)
                   ? "bg-primary text-primary-foreground shadow-sm"
                   : "text-muted-foreground hover:bg-muted/80"
               }`}
             >
               {link.label}
             </Link>
           ))}
         </nav>

        <div className="ml-auto flex items-center gap-2">
          {student ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="border-border/70 px-3 h-9"
                >
                  <div className="flex flex-col items-start leading-tight">
                    <span className="text-[11px] uppercase tracking-[0.3em] text-muted-foreground">
                      Học viên
                    </span>
                    <span className="text-sm font-medium">
                      {student.fullName || student.account}
                    </span>
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-64">
                <DropdownMenuLabel>
                  <p className="text-xs text-muted-foreground">Không gian học viên</p>
                  <p className="text-sm font-medium text-foreground">
                    {student.fullName || student.account}
                  </p>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                {STUDENT_MENU_LINKS.map((item) => (
                  <DropdownMenuItem key={item.href} asChild>
                    <Link href={item.href as any} className="flex w-full items-center justify-between">
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
                >
                  Đăng xuất
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="px-4"
                onClick={() => router.push("/khoa-hoc/dang-nhap")}
              >
                Đăng nhập
              </Button>
              <Button
                size="sm"
                className="px-4"
                onClick={() => router.push("/khoa-hoc/dang-ky")}
              >
                Đăng ký
              </Button>
            </div>
          )}

          <Button
            variant="ghost"
            size="icon"
            className="inline-flex rounded-full lg:hidden"
            aria-label="Mở menu học viên"
          >
            <Menu className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </header>
  );
}
