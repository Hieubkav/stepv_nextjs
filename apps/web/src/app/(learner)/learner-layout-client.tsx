"use client";

import { useMemo, type ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Heart, History, Menu, ShoppingBag, UserCircle2 } from "lucide-react";
import { useQuery } from "convex/react";
import { api } from "@dohy/backend/convex/_generated/api";

import { Button } from "@/components/ui/button";
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

const NAV_LINKS = [
  { label: "Tất cả khóa học", href: "/khoa-hoc" },
  { label: "Danh sách yêu thích", href: "/khoa-hoc/yeu-thich" },
  { label: "Khóa học đã mua", href: "/khoa-hoc/da-mua" },
  { label: "Lịch sử mua", href: "/khoa-hoc/lich-su" },
];

const QUICK_ACTIONS = [
  { label: "Yêu thích", icon: Heart, href: "/khoa-hoc/yeu-thich" },
  { label: "Đã mua", icon: ShoppingBag, href: "/khoa-hoc/da-mua" },
  { label: "Lịch sử", icon: History, href: "/khoa-hoc/lich-su" },
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
            <div className="mx-auto w-full max-w-6xl px-4 py-6">{children}</div>
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
  const pathname = usePathname() ?? "/";
  const { student } = useStudentAuth();

  const isActive = (href: string) => {
    if (href === "/khoa-hoc") {
      return pathname.startsWith("/khoa-hoc");
    }
    return pathname.startsWith(href);
  };

  return (
    <header className="sticky top-0 z-50 border-b border-border/70 bg-background/95 backdrop-blur">
      <div className="mx-auto flex w-full max-w-6xl items-center gap-3 px-4 py-3">
        <Link href="/khoa-hoc" className="flex items-center gap-3" aria-label="Về trang khóa học">
          <div className="h-10 w-10 overflow-hidden rounded-full border border-border/60 bg-muted">
            {logo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={logo} alt="Logo thương hiệu" className="h-full w-full object-cover" />
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
              href={link.href}
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

        <div className="ml-auto flex items-center gap-1">
          {QUICK_ACTIONS.map((action) => (
            <Button
              key={action.href}
              variant="ghost"
              size="icon"
              className="hidden rounded-full md:inline-flex"
              asChild
            >
              <Link href={action.href} aria-label={action.label}>
                <action.icon className="h-5 w-5" />
              </Link>
            </Button>
          ))}

          {student ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="gap-2 rounded-full border-foreground/20"
            >
              <UserCircle2 className="h-5 w-5" />
              <span className="hidden sm:inline-flex max-w-[160px] truncate">
                Chào, {student.fullName || student.account}
              </span>
            </Button>
          ) : (
            <Button variant="default" size="sm" className="gap-2 rounded-full" asChild>
              <Link href="/khoa-hoc/dang-nhap">
                <UserCircle2 className="h-5 w-5" />
                <span>Đăng nhập</span>
              </Link>
            </Button>
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
