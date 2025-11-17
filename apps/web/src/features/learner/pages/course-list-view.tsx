"use client";

import Link from "next/link";
import type { Route } from "next";
import { useEffect, useMemo, useState } from "react";
import { Search, Heart } from "lucide-react";

import { cn } from "@/lib/utils";
import { normalizeSlug } from "@/lib/slug";
import { useStudentAuth } from "@/features/learner/auth/student-auth-context";
import { CourseFavoriteButton } from "@/features/learner/components/course-favorite-button";

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
    studentId,
}: {
    course: CourseListItem;
    thumbnail?: CourseThumbnail;
    studentId: string | null;
}) {
    const normalizedSlug = normalizeSlug(course.slug || course.title);
    const detailHref = (normalizedSlug ? `/khoa-hoc/${normalizedSlug}` : "/khoa-hoc") as Route;
    const priceText = formatPrice(course);
    const subtitle = course.subtitle ?? course.description;

    return (
        <article className="group flex h-full flex-col overflow-hidden rounded-lg border border-slate-200 bg-white transition-all duration-300 hover:border-slate-300">
            <div className="relative aspect-video overflow-hidden bg-slate-100">
                {thumbnail?.url ? (
                    <img
                        src={thumbnail.url}
                        alt={thumbnail.title ?? course.title}
                        className="h-full w-full object-cover transition duration-500 group-hover:scale-103"
                    />
                ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-xs uppercase tracking-[0.35em] text-slate-400">
                        Chưa có ảnh
                    </div>
                )}

                {!course.active && (
                    <span className="absolute right-3 top-3 rounded-full border border-amber-400/60 bg-amber-500/15 px-3 py-1 text-xs font-medium uppercase tracking-[0.25em] text-amber-100">
                        Đang ẩn
                    </span>
                )}

                {/* Heart Button */}
                <div className="absolute right-3 top-3">
                    <CourseFavoriteButton
                        studentId={studentId ? (studentId as any) : null}
                        courseId={course.id as any}
                        size="md"
                    />
                </div>
            </div>

            <div className="flex flex-1 flex-col gap-3 p-4">
                <div className="space-y-2">
                    <h3 className="line-clamp-2 text-base font-semibold leading-tight text-slate-900 transition-colors duration-300 group-hover:text-slate-700">
                        {course.title}
                    </h3>
                    {subtitle ? <p className="line-clamp-2 text-xs text-slate-500">{subtitle}</p> : null}
                </div>

                <div className="mt-auto flex items-center justify-between">
                    <span className="text-xs font-medium text-slate-500">
                        {course.pricingType === "free" ? "Miễn phí" : "Khóa học"}
                    </span>
                    <span className="text-sm font-semibold bg-gradient-to-r from-amber-500 to-yellow-500 bg-clip-text text-transparent">
                        {priceText}
                    </span>
                </div>
            </div>

            <div className="space-y-2 border-t border-slate-100 px-4 py-3">
                <Link
                    href={detailHref}
                    className="block rounded-md bg-gradient-to-r from-amber-500 to-yellow-500 px-3 py-2.5 text-center text-sm font-semibold text-white transition-all duration-200 hover:opacity-90 active:opacity-95"
                >
                    Vào học ngay
                </Link>
                <Link
                    href={detailHref}
                    className="block rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-center text-xs font-medium text-slate-700 transition-all duration-200 hover:border-slate-300 hover:bg-slate-100 active:bg-slate-200"
                >
                    Xem chi tiết
                </Link>
            </div>
        </article>
    );
}

export default function CourseListView({ courses, thumbnails, error }: CourseListViewProps) {
    const { student } = useStudentAuth();
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
        <main className="relative min-h-screen overflow-hidden bg-white pb-2 pt-6 text-slate-900 md:pt-8">
            <div className="relative mx-auto max-w-7xl px-4 md:px-6">
                {/* Header Section */}
                <div className="mb-8">
                    <div className="space-y-2 mb-6">
                        <h1 className="text-3xl md:text-4xl font-bold text-slate-900">Khóa học</h1>
                        <p className="text-slate-600">Khám phá hàng trăm khóa học chất lượng cao</p>
                    </div>

                    {/* Filter Bar */}
                    <section className="space-y-3 rounded-xl border border-slate-200 bg-slate-50 p-4">
                        {/* Price filters */}
                        <div className="flex flex-wrap items-center gap-2">
                            {priceFilters.map((filter) => {
                                const isActive = priceFilter === filter.value;
                                return (
                                    <button
                                        key={filter.value}
                                        type="button"
                                        aria-pressed={isActive}
                                        onClick={() => setPriceFilter(filter.value)}
                                        className={cn(
                                            "rounded-full border px-4 py-2 text-sm font-medium transition duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500",
                                            isActive
                                                ? "border-amber-600 bg-gradient-to-r from-amber-500 to-yellow-500 text-white"
                                                : "border-slate-300 bg-white text-slate-700 hover:border-slate-400 hover:bg-white"
                                        )}
                                    >
                                        {filter.label}
                                    </button>
                                );
                            })}
                        </div>

                        {/* Search & Sort */}
                        <div className="flex flex-col gap-3 md:flex-row md:items-center">
                            <div className="flex flex-1 items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2.5">
                                <Search className="shrink-0 size-4 text-slate-400" />
                                <input
                                    value={searchTerm}
                                    onChange={(event) => setSearchTerm(event.target.value)}
                                    placeholder="Tìm khóa học..."
                                    className="w-full min-w-0 bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400"
                                />
                            </div>

                            <label className="flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2.5 md:shrink-0">
                                <span className="whitespace-nowrap text-sm font-medium text-slate-700">Sắp xếp</span>
                                <select
                                    value={sortBy}
                                    onChange={(event) => setSortBy(event.target.value as SortOption)}
                                    className="bg-transparent text-sm text-slate-900 outline-none"
                                >
                                    {sortOptions.map((option) => (
                                        <option key={option.value} value={option.value} className="bg-white text-slate-900">
                                            {option.label}
                                        </option>
                                    ))}
                                </select>
                            </label>
                        </div>
                    </section>
                </div>

                {error ? (
                    <div className="mb-4 rounded-lg border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700">
                        Không thể tải dữ liệu khóa học. Mã lỗi: {error}.
                    </div>
                ) : null}

                {filteredCourses.length === 0 && !error ? (
                    <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-6 py-16 text-center">
                        <div className="space-y-3">
                            <div className="text-5xl">📚</div>
                            <p className="text-lg font-semibold text-slate-700">Không tìm thấy khóa học</p>
                            <p className="text-sm text-slate-500">
                                {searchTerm || priceFilter !== "all"
                                    ? "Không có khóa học nào phù hợp với bộ lọc hiện tại. Hãy thử thay đổi điều kiện tìm kiếm."
                                    : "Danh sách khóa học sẽ được cập nhật sớm. Vui lòng quay lại sau."}
                            </p>
                        </div>
                    </div>
                ) : null}

                {filteredCourses.length > 0 ? (
                    <>
                        <section className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                            {paginatedCourses.map((course) => (
                                <CourseCard
                                    key={course.id}
                                    course={course}
                                    thumbnail={
                                        course.thumbnailMediaId ? thumbnails[course.thumbnailMediaId] : undefined
                                    }
                                    studentId={student?._id ? String(student._id) : null}
                                />
                            ))}
                        </section>

                        {totalPages > 1 && (
                            <nav className="mt-8 flex items-center justify-center gap-2" aria-label="Pagination">
                                <button
                                    type="button"
                                    onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                                    disabled={currentPage === 1}
                                    className="grid size-9 place-items-center rounded-lg border border-slate-300 bg-white text-sm font-medium transition duration-200 hover:border-slate-400 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
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
                                                "grid size-9 place-items-center rounded-lg border text-sm font-medium transition duration-200",
                                                isActive
                                                    ? "border-amber-600 bg-gradient-to-r from-amber-500 to-yellow-500 text-white"
                                                    : "border-slate-300 bg-white text-slate-700 hover:border-slate-400 hover:bg-slate-50"
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
                                    className="grid size-9 place-items-center rounded-lg border border-slate-300 bg-white text-sm font-medium transition duration-200 hover:border-slate-400 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                                    aria-label="Trang sau"
                                >
                                    ›
                                </button>
                            </nav>
                        )}
                    </>
                ) : null}
            </div>
        </main>
    );
}
