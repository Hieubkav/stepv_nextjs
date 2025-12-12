"use client";

import Link from "next/link";
import type { Route } from "next";
import { useEffect, useMemo, useState } from "react";
import { Search } from "lucide-react";

import { cn } from "@/lib/utils";
import { normalizeSlug } from "@/lib/slug";
import { Skeleton } from "@/components/ui/skeleton";

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
    softwareIds?: string[];
};

export type CourseThumbnail = {
    url?: string;
    title?: string;
};

export type SoftwareItem = {
    id: string;
    name: string;
    slug: string;
    iconImageId: string | null;
};

export type CourseListViewProps = {
    courses: CourseListItem[];
    thumbnails: Record<string, CourseThumbnail>;
    softwares?: SoftwareItem[];
    softwareIcons?: Record<string, string>;
    error?: string | null;
};

const priceFilters = [
    { label: "Tất cả", value: "all" },
    { label: "Miễn phí", value: "free" },
    { label: "Trả phí", value: "paid" },
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

function CourseCardSkeleton() {
    return (
        <div className="group flex h-full flex-col overflow-hidden rounded-xl border border-slate-800/70 bg-[#050914] shadow-[0_20px_60px_rgba(0,0,0,0.5)]">
            <Skeleton className="aspect-video w-full rounded-none bg-slate-800/70" />
            <div className="flex flex-1 flex-col gap-3 p-4">
                <div className="space-y-2">
                    <Skeleton className="h-5 w-2/3 rounded-md bg-slate-800/70" />
                    <Skeleton className="h-3 w-full rounded-md bg-slate-800/70" />
                    <Skeleton className="h-3 w-4/5 rounded-md bg-slate-800/70" />
                </div>
                <div className="mt-auto flex items-center justify-end">
                    <Skeleton className="h-4 w-24 rounded-md bg-slate-800/70" />
                </div>
            </div>
            <div className="h-[52px] border-t border-slate-800/70 bg-[#081120]" />
        </div>
    );
}

function CourseCard({
    course,
    thumbnail,
    courseSoftwares,
    softwareIcons,
}: {
    course: CourseListItem;
    thumbnail?: CourseThumbnail;
    courseSoftwares?: SoftwareItem[];
    softwareIcons?: Record<string, string>;
}) {
    const normalizedSlug = normalizeSlug(course.slug || course.title);
    const detailHref = (normalizedSlug ? `/khoa-hoc/${normalizedSlug}` : "/khoa-hoc") as Route;
    const priceText = formatPrice(course);
    const subtitle = course.subtitle ?? course.description;

    return (
        <article className="group flex h-full flex-col overflow-hidden rounded-xl border border-slate-800/70 bg-[#050914] transition-all duration-300 hover:-translate-y-1 hover:border-amber-400/60 hover:shadow-[0_25px_80px_rgba(255,191,0,0.16)] shadow-[0_18px_55px_rgba(0,0,0,0.5)]">
            <div className="relative aspect-video overflow-hidden bg-[#0a1424]">
                {thumbnail?.url ? (
                    <img
                        src={thumbnail.url}
                        alt={thumbnail.title ?? course.title}
                        className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                    />
                ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-xs uppercase tracking-[0.35em] text-amber-200/70">
                        Chưa có ảnh
                    </div>
                )}

                {!course.active && (
                    <span className="absolute right-3 top-3 rounded-full border border-amber-400/60 bg-amber-500/15 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.25em] text-amber-100 backdrop-blur">
                        Đang ẩn
                    </span>
                )}
            </div>

            <div className="flex flex-1 flex-col gap-3 p-4 text-slate-100">
                <div className="space-y-2">
                    <h3 className="line-clamp-2 text-base font-semibold leading-tight text-white transition-colors duration-300 group-hover:text-amber-300">
                        {course.title}
                    </h3>
                    {subtitle ? <p className="line-clamp-2 text-xs text-slate-400">{subtitle}</p> : null}
                </div>

                {/* Software badges */}
                {courseSoftwares && courseSoftwares.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                        {courseSoftwares.map((software) => (
                            <span
                                key={software.id}
                                className="inline-flex items-center gap-1 rounded-full border border-slate-700/70 bg-slate-800/60 px-2 py-0.5 text-[10px] text-slate-300"
                                title={software.name}
                            >
                                {software.iconImageId && softwareIcons?.[software.iconImageId] ? (
                                    <img
                                        src={softwareIcons[software.iconImageId]}
                                        alt=""
                                        className="h-3 w-3 rounded-sm object-contain"
                                    />
                                ) : null}
                                <span className="truncate max-w-[60px]">{software.name}</span>
                            </span>
                        ))}
                    </div>
                )}

                <div className="mt-auto flex items-center justify-end">
                    <span className="text-sm font-semibold bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-200 bg-clip-text text-transparent drop-shadow-[0_0_18px_rgba(255,193,7,0.25)]">
                        {priceText}
                    </span>
                </div>
            </div>

            <div className="border-t border-slate-800/70 bg-[#081120] px-4 py-3">
                <Link
                    href={detailHref}
                    className="block rounded-lg bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-300 px-3 py-2.5 text-center text-sm font-semibold text-black transition-all duration-200 hover:shadow-[0_18px_40px_rgba(255,193,7,0.35)] hover:translate-y-[-1px] active:opacity-95"
                >
                    Vào học ngay
                </Link>
            </div>
        </article>
    );
}

export default function CourseListView({ courses, thumbnails, softwares = [], softwareIcons = {}, error }: CourseListViewProps) {
    const [searchTerm, setSearchTerm] = useState("");
    const [priceFilter, setPriceFilter] = useState<PriceFilter>("all");
    const [softwareFilter, setSoftwareFilter] = useState<string>("all");
    const [sortBy, setSortBy] = useState<SortOption>("default");
    const [page, setPage] = useState(1);
    const [headerOffset, setHeaderOffset] = useState(112);

    const softwareMap = useMemo(() => {
        const map = new Map<string, SoftwareItem>();
        softwares.forEach((s) => map.set(s.id, s));
        return map;
    }, [softwares]);

    useEffect(() => {
        const updateOffset = () => {
            const header = document.getElementById("site-header");
            const height = header?.getBoundingClientRect().height ?? 0;
            const padding = height > 0 ? height + 16 : 120;
            setHeaderOffset((prev) => (Math.abs(prev - padding) > 0.5 ? padding : prev));
        };

        updateOffset();
        window.addEventListener("resize", updateOffset);

        const observer = typeof ResizeObserver !== "undefined" ? new ResizeObserver(updateOffset) : null;
        const header = document.getElementById("site-header");
        if (observer && header) observer.observe(header);

        return () => {
            window.removeEventListener("resize", updateOffset);
            observer?.disconnect();
        };
    }, []);

    useEffect(() => {
        setPage(1);
    }, [searchTerm, priceFilter, softwareFilter, sortBy]);

    const filteredCourses = useMemo(() => {
        const query = normalizeText(searchTerm);
        const items = courses.filter((course) => {
            if (priceFilter !== "all" && course.pricingType !== priceFilter) {
                return false;
            }

            if (softwareFilter !== "all") {
                const courseSoftwareIds = course.softwareIds || [];
                if (!courseSoftwareIds.includes(softwareFilter)) {
                    return false;
                }
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
    }, [courses, priceFilter, softwareFilter, searchTerm, sortBy]);

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
        <main
            className="relative min-h-screen overflow-hidden bg-[#030712] pb-8 text-slate-50 selection:bg-amber-500/25 selection:text-amber-100"
            style={{ paddingTop: headerOffset }}
        >
            <div className="pointer-events-none absolute inset-0 overflow-hidden">
                <div className="absolute -left-24 -top-28 h-72 w-72 rounded-full bg-sky-500/10 blur-[140px]" />
                <div className="absolute right-[-20%] top-4 h-80 w-80 rounded-full bg-amber-500/10 blur-[150px]" />
                <div className="absolute left-1/3 bottom-[-28%] h-96 w-96 rounded-full bg-indigo-600/8 blur-[190px]" />
            </div>
            <div className="relative mx-auto max-w-7xl px-4 md:px-6">
                <div className="mb-8">
                    <div className="mb-6">
                        <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-200 bg-clip-text text-transparent tracking-tight drop-shadow-[0_0_18px_rgba(255,193,7,0.35)]">
                            Khóa học
                        </h1>
                    </div>

                    <section className="rounded-xl border border-slate-800/70 bg-[#050914]/90 p-4 shadow-[0_22px_60px_rgba(0,0,0,0.55)]">
                        <div className="flex flex-wrap items-center gap-3">
                            <div className="flex flex-1 min-w-[220px] items-center gap-2 rounded-lg border border-slate-800/70 bg-[#0a1220] px-4 py-2.5 shadow-inner shadow-black/40">
                                <Search className="shrink-0 size-4 text-amber-300/90" />
                                <input
                                    value={searchTerm}
                                    onChange={(event) => setSearchTerm(event.target.value)}
                                    placeholder="Tìm khóa học..."
                                    className="w-full min-w-0 bg-transparent text-sm text-white outline-none placeholder:text-slate-400"
                                />
                            </div>

                            <label className="flex items-center gap-2 rounded-lg border border-slate-800/70 bg-[#0a1220] px-4 py-2.5 md:shrink-0 text-white">
                                <span className="whitespace-nowrap text-sm font-semibold text-slate-200/80">Sắp xếp</span>
                                <select
                                    value={sortBy}
                                    onChange={(event) => setSortBy(event.target.value as SortOption)}
                                    className="bg-transparent text-sm text-white outline-none"
                                >
                                    {sortOptions.map((option) => (
                                        <option key={option.value} value={option.value} className="bg-[#050914] text-white">
                                            {option.label}
                                        </option>
                                    ))}
                                </select>
                            </label>

                            <label className="flex items-center gap-2 rounded-lg border border-slate-800/70 bg-[#0a1220] px-4 py-2.5 md:shrink-0 text-white">
                                <span className="whitespace-nowrap text-sm font-semibold text-slate-200/80">Giá</span>
                                <select
                                    value={priceFilter}
                                    onChange={(event) => setPriceFilter(event.target.value as PriceFilter)}
                                    className="bg-transparent text-sm text-white outline-none"
                                >
                                    {priceFilters.map((filter) => (
                                        <option key={filter.value} value={filter.value} className="bg-[#050914] text-white">
                                            {filter.label}
                                        </option>
                                    ))}
                                </select>
                            </label>

                            {softwares.length > 0 && (
                                <label className="flex items-center gap-2 rounded-lg border border-slate-800/70 bg-[#0a1220] px-4 py-2.5 md:shrink-0 text-white">
                                    <span className="whitespace-nowrap text-sm font-semibold text-slate-200/80">Phần mềm</span>
                                    <div className="flex items-center gap-2">
                                        {softwareFilter !== "all" && softwareIcons && (() => {
                                            const selectedSoftware = softwares.find(s => s.id === softwareFilter);
                                            const iconUrl = selectedSoftware?.iconImageId ? softwareIcons[selectedSoftware.iconImageId] : null;
                                            return iconUrl ? (
                                                <img src={iconUrl} alt="" className="h-4 w-4 rounded-sm object-contain" />
                                            ) : null;
                                        })()}
                                        <select
                                            value={softwareFilter}
                                            onChange={(event) => setSoftwareFilter(event.target.value)}
                                            className="bg-transparent text-sm text-white outline-none max-w-[120px]"
                                        >
                                            <option value="all" className="bg-[#050914] text-white">Tất cả</option>
                                            {softwares.map((software) => (
                                                <option key={software.id} value={software.id} className="bg-[#050914] text-white">
                                                    {software.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </label>
                            )}
                        </div>
                    </section>
                </div>

                {error ? (
                    <div className="mb-4 rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-100">
                        Không thể tải dữ liệu khóa học. Mã lỗi: {error}.
                    </div>
                ) : null}

                {filteredCourses.length === 0 && !error ? (
                    <div className="rounded-xl border border-dashed border-slate-800/60 bg-[#050914]/80 px-6 py-16 text-center shadow-[0_20px_60px_rgba(0,0,0,0.55)]">
                        <div className="space-y-3">
                            <div className="text-5xl">📚</div>
                            <p className="text-lg font-semibold text-white">Không tìm thấy khóa học</p>
                            <p className="text-sm text-amber-100/80">
                                {searchTerm || priceFilter !== "all" || softwareFilter !== "all"
                                    ? "Không có khóa học nào phù hợp với bộ lọc hiện tại. Hãy thử thay đổi điều kiện tìm kiếm."
                                    : "Danh sách khóa học sẽ được cập nhật sớm. Vui lòng quay lại sau."}
                            </p>
                        </div>
                    </div>
                ) : null}

                {filteredCourses.length > 0 ? (
                    <>
                        <section className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                            {paginatedCourses.map((course) => {
                                const courseSofts = (course.softwareIds || [])
                                    .map((id) => softwareMap.get(id))
                                    .filter(Boolean) as SoftwareItem[];
                                return (
                                    <CourseCard
                                        key={course.id}
                                        course={course}
                                        thumbnail={course.thumbnailMediaId ? thumbnails[course.thumbnailMediaId] : undefined}
                                        courseSoftwares={courseSofts}
                                        softwareIcons={softwareIcons}
                                    />
                                );
                            })}
                        </section>

                        {totalPages > 1 && (
                            <nav className="mt-8 flex items-center justify-center gap-2" aria-label="Pagination">
                                <button
                                    type="button"
                                    onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                                    disabled={currentPage === 1}
                                    className="grid size-9 place-items-center rounded-lg border border-slate-800/70 bg-[#0a1220] text-sm font-semibold text-amber-100 transition duration-200 hover:border-amber-400/80 hover:bg-[#0f1b30] disabled:cursor-not-allowed disabled:opacity-40"
                                    aria-label="Trang trước"
                                >
                                    &lsaquo;
                                </button>
                                {Array.from({ length: totalPages }, (_, index) => index + 1).map((item) => {
                                    const isActive = item === currentPage;
                                    return (
                                        <button
                                            key={item}
                                            type="button"
                                            onClick={() => setPage(item)}
                                            className={cn(
                                                "grid size-9 place-items-center rounded-lg border text-sm font-semibold transition duration-200",
                                                isActive
                                                    ? "border-amber-500 bg-gradient-to-r from-amber-500 to-yellow-400 text-black shadow-[0_12px_30px_rgba(255,193,7,0.25)]"
                                                    : "border-slate-800/70 bg-[#0a1220] text-amber-100 hover:border-amber-400/80 hover:bg-[#0f1b30]"
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
                                    disabled={currentPage === totalPages}
                                    className="grid size-9 place-items-center rounded-lg border border-slate-800/70 bg-[#0a1220] text-sm font-semibold text-amber-100 transition duration-200 hover:border-amber-400/80 hover:bg-[#0f1b30] disabled:cursor-not-allowed disabled:opacity-40"
                                    aria-label="Trang sau"
                                >
                                    &rsaquo;
                                </button>
                            </nav>
                        )}
                    </>
                ) : null}
            </div>
        </main>
    );
}
