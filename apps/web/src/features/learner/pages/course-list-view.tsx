"use client";

import Link from "next/link";
import type { Route } from "next";
import { useEffect, useMemo, useState } from "react";
import { Search } from "lucide-react";

import { cn } from "@/lib/utils";

export type CourseListItem = {
  id: string;
  slug: string;
  title: string;
  subtitle: string | null;
  description: string | null;
  thumbnailMediaId: string | null;
  pricingType: "free" | "paid";
  priceAmount: number | null;
  priceNote: string | null;
  isPriceVisible: boolean;
  order: number;
  active: boolean;
  createdAt: number;
  updatedAt: number;
};

export type CourseThumbnail = {
  url?: string;
  title?: string;
};

export type CourseListViewProps = {
  courses: CourseListItem[];
  thumbnails: Record<string, CourseThumbnail>;
  error?: string | null;
};

const priceFilters = [
  { label: "Tất cả", value: "all" },
  { label: "Miễn phí", value: "free" },
  { label: "Trả tiền", value: "paid" },
] as const;

type PriceFilter = (typeof priceFilters)[number]["value"];

const sortOptions = [
  { label: "Mặc định", value: "default" },
  { label: "A → Z", value: "az" },
  { label: "Z → A", value: "za" },
  { label: "Mới nhất", value: "newest" },
  { label: "Cũ nhất", value: "oldest" },
  { label: "Mắc → rẻ", value: "expensive" },
  { label: "Rẻ → mắc", value: "cheap" },
] as const;

type SortOption = (typeof sortOptions)[number]["value"];

const PAGE_SIZE = 12;

const currencyFormatter = new Intl.NumberFormat("vi-VN", {
  style: "currency",
  currency: "VND",
  maximumFractionDigits: 0,
});

function formatPrice({
  pricingType,
  priceAmount,
  priceNote,
  isPriceVisible,
}: Pick<CourseListItem, "pricingType" | "priceAmount" | "priceNote" | "isPriceVisible">) {
  if (pricingType === "free") return "Miễn phí";
  if (!isPriceVisible) return priceNote ? priceNote : "Liên hệ";
  if (typeof priceAmount === "number" && priceAmount > 0) {
    return currencyFormatter.format(priceAmount);
  }
  return priceNote ? priceNote : "Liên hệ";
}

function normalizeText(value: unknown) {
  if (typeof value !== "string") return "";
  return value.normalize("NFC").toLowerCase();
}

function CourseCard({
  course,
  thumbnail,
}: {
  course: CourseListItem;
  thumbnail?: CourseThumbnail;
}) {
  const detailHref = `/khoa-hoc/${course.order}` as Route;
  const priceText = formatPrice(course);
  const subtitle = course.subtitle ?? course.description;

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-3xl border border-white/10 bg-[#0c0a12] shadow-[0_12px_40px_rgba(0,0,0,0.35)] transition duration-300 hover:-translate-y-1 hover:border-[#f5c542]">
      <div className="relative aspect-video overflow-hidden bg-gradient-to-br from-[#f5c542]/18 via-transparent to-transparent">
        {thumbnail?.url ? (
          <img
            src={thumbnail.url}
            alt={thumbnail.title ?? course.title}
            className="h-full w-full object-cover transition duration-700 group-hover:scale-105 group-hover:brightness-105"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-xs uppercase tracking-[0.35em] text-white/35">
            Chưa có ảnh
          </div>
        )}

        {!course.active && (
          <span className="absolute right-3 top-3 rounded-full border border-amber-400/60 bg-amber-500/15 px-3 py-1 text-xs font-medium uppercase tracking-[0.25em] text-amber-100">
            Đang ẩn
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-3 p-4">
        <div className="space-y-2">
          <h3 className="text-base font-semibold leading-snug text-white transition-colors duration-300 group-hover:text-[#f5c542]">
            {course.title}
          </h3>
          {subtitle ? <p className="line-clamp-2 text-sm text-white/65">{subtitle}</p> : null}
        </div>

        <div className="mt-auto flex items-start justify-end border-t border-white/10 pt-3 text-sm text-white/80">
          <span className="text-sm font-semibold text-[#f8d37f]">{priceText}</span>
        </div>
      </div>

      <div className="flex gap-2 border-t border-white/10 bg-black/30 p-3">
        <Link
          href={detailHref}
          className="flex-1 rounded-lg border border-white/15 bg-white/[0.04] px-3 py-2 text-center text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:border-[#f5c542]/60 hover:text-[#f8d37f]"
        >
          Xem chi tiết
        </Link>
        <Link
          href={detailHref}
          className="flex-1 rounded-lg bg-gradient-to-br from-[#f6e05e] to-[#f0b429] px-3 py-2 text-center text-sm font-semibold text-[#1b1309] transition hover:-translate-y-0.5 hover:shadow-[0_18px_45px_rgba(240,180,41,0.35)]"
        >
          Vào học
        </Link>
      </div>
    </article>
  );
}

export default function CourseListView({ courses, thumbnails, error }: CourseListViewProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [priceFilter, setPriceFilter] = useState<PriceFilter>("all");
  const [sortBy, setSortBy] = useState<SortOption>("default");
  const [page, setPage] = useState(1);

  useEffect(() => {
    setPage(1);
  }, [searchTerm, priceFilter, sortBy]);

  const filteredCourses = useMemo(() => {
    const query = normalizeText(searchTerm);
    const items = courses.filter((course) => {
      if (priceFilter !== "all" && course.pricingType !== priceFilter) {
        return false;
      }

      if (!query) return true;

      const targets = [
        course.title,
        course.subtitle ?? "",
        course.description ?? "",
        course.slug,
      ];
      return targets.some((target) => normalizeText(target).includes(query));
    });

    const sorted = items.slice();
    sorted.sort((a, b) => {
      switch (sortBy) {
        case "az":
          return a.title.localeCompare(b.title, "vi");
        case "za":
          return b.title.localeCompare(a.title, "vi");
        case "newest":
          return b.createdAt - a.createdAt;
        case "oldest":
          return a.createdAt - b.createdAt;
        case "expensive": {
          const aPrice = a.pricingType === "paid" && typeof a.priceAmount === "number" ? a.priceAmount : 0;
          const bPrice = b.pricingType === "paid" && typeof b.priceAmount === "number" ? b.priceAmount : 0;
          return bPrice - aPrice;
        }
        case "cheap": {
          const aPrice = a.pricingType === "paid" && typeof a.priceAmount === "number" ? a.priceAmount : 0;
          const bPrice = b.pricingType === "paid" && typeof b.priceAmount === "number" ? b.priceAmount : 0;
          return aPrice - bPrice;
        }
        case "default":
        default:
          return a.order - b.order;
      }
    });

    return sorted;
  }, [courses, priceFilter, searchTerm, sortBy]);

  const totalPages = Math.max(1, Math.ceil(filteredCourses.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const paginatedCourses = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredCourses.slice(start, start + PAGE_SIZE);
  }, [currentPage, filteredCourses]);

  useEffect(() => {
    if (page !== currentPage) {
      setPage(currentPage);
    }
  }, [currentPage, page]);

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#05070f] px-5 pb-20 pt-24 text-white md:pt-32">
      <div className="pointer-events-none absolute left-[-18%] top-[-28%] h-[42rem] w-[42rem] rounded-full bg-[radial-gradient(circle,_rgba(245,197,66,0.22)_0%,_transparent_72%)]" />
      <div className="pointer-events-none absolute right-[-22%] top-[-24%] h-[36rem] w-[36rem] rounded-full bg-[radial-gradient(circle,_rgba(250,204,21,0.15)_0%,_transparent_75%)]" />
      <div className="pointer-events-none absolute left-[10%] bottom-[-32%] h-[32rem] w-[32rem] rounded-full bg-[radial-gradient(circle,_rgba(245,158,11,0.1)_0%,_transparent_78%)]" />
      <div className="relative mx-auto max-w-[1200px]">
        <section className="relative z-10 mb-8 flex flex-wrap items-center gap-2 rounded-2xl border border-white/10 bg-[#0a090f]/90 p-3 backdrop-blur">
          {priceFilters.map((filter) => {
            const isActive = priceFilter === filter.value;
            return (
              <button
                key={filter.value}
                type="button"
                aria-pressed={isActive}
                onClick={() => setPriceFilter(filter.value)}
                className={cn(
                  "rounded-full border px-3 py-2 text-sm transition hover:-translate-y-0.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#f5c542]",
                  isActive
                    ? "border-transparent bg-gradient-to-br from-[#f6e05e] to-[#f0b429] text-[#1b1309] shadow-[0_0_20px_rgba(240,180,41,0.35)]"
                    : "border-white/12 bg-white/[0.04] text-white/75 hover:text-white"
                )}
              >
                {filter.label}
              </button>
            );
          })}

          <div className="grow" />

          <div className="flex items-center gap-2 rounded-lg border border-white/12 bg-white/[0.04] px-3 py-2">
            <Search className="size-4 text-white/50" />
            <input
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Tìm trong kết quả"
              className="min-w-[160px] bg-transparent text-sm text-white outline-none placeholder:text-white/40 sm:min-w-[200px]"
            />
          </div>

          <label className="flex items-center gap-2 rounded-lg border border-white/12 bg-white/[0.04] px-3 py-2">
            <span className="text-sm font-medium text-white">Sort</span>
            <select
              value={sortBy}
              onChange={(event) => setSortBy(event.target.value as SortOption)}
              className="bg-transparent text-sm text-white outline-none"
            >
              {sortOptions.map((option) => (
                <option key={option.value} value={option.value} className="bg-[#05070f] text-white">
                  {option.label}
                </option>
              ))}
            </select>
          </label>
        </section>

        {error ? (
          <div className="mb-6 rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-100">
            Không thể tải dữ liệu khóa học. Mã lỗi: {error}.
          </div>
        ) : null}

        {filteredCourses.length === 0 && !error ? (
          <div className="rounded-2xl border border-dashed border-white/12 bg-white/[0.05] px-6 py-10 text-center text-sm text-white/70">
            Không tìm thấy khóa học nào phù hợp với bộ lọc hiện tại.
          </div>
        ) : null}

        {filteredCourses.length > 0 ? (
          <>
            <section className="grid grid-cols-[repeat(auto-fill,minmax(260px,1fr))] gap-4">
              {paginatedCourses.map((course) => (
                <CourseCard
                  key={course.id}
                  course={course}
                  thumbnail={
                    course.thumbnailMediaId ? thumbnails[course.thumbnailMediaId] : undefined
                  }
                />
              ))}
            </section>

            <nav className="mt-8 flex items-center justify-center gap-2" aria-label="Pagination">
              <button
                type="button"
                onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                className="grid size-9 place-items-center rounded-lg border border-white/12 bg-[#0c0f17] text-sm transition hover:-translate-y-0.5 hover:text-[#f8d37f]"
                aria-label="Trang trước"
              >
                ‹
              </button>
              {Array.from({ length: totalPages }, (_, index) => index + 1).map((item) => {
                const isActive = item === currentPage;
                return (
                  <button
                    key={item}
                    type="button"
                    onClick={() => setPage(item)}
                    className={cn(
                      "grid size-9 place-items-center rounded-lg border text-sm transition hover:-translate-y-0.5",
                      isActive
                        ? "border-transparent bg-gradient-to-br from-[#f6e05e] to-[#f0b429] font-semibold text-[#1b1309]"
                        : "border-white/12 bg-[#0c0f17] text-white hover:text-[#f8d37f]"
                    )}
                    aria-current={isActive ? "page" : undefined}
                  >
                    {item}
                  </button>
                );
              })}
              <button
                type="button"
                onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
                className="grid size-9 place-items-center rounded-lg border border-white/12 bg-[#0c0f17] text-sm transition hover:-translate-y-0.5 hover:text-[#f8d37f]"
                aria-label="Trang sau"
              >
                ›
              </button>
            </nav>
          </>
        ) : null}
      </div>
    </main>
  );
}
