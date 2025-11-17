'use client';

import { useQuery } from 'convex/react';
import { api } from '@dohy/backend/convex/_generated/api';
import type { Doc } from '@dohy/backend/convex/_generated/dataModel';
import { useStudentAuth } from '@/features/learner/auth/student-auth-context';
import Link from 'next/link';
import { Heart } from 'lucide-react';
import type { Route } from 'next';
import { CourseFavoriteButton } from '@/features/learner/components/course-favorite-button';
import { useEffect, useState } from 'react';

const currencyFormatter = new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
});

type CourseDoc = Doc<'courses'>;

function formatPrice({
    pricingType,
    priceAmount,
    priceNote,
    isPriceVisible,
}: Pick<CourseDoc, 'pricingType' | 'priceAmount' | 'priceNote' | 'isPriceVisible'>) {
    if (pricingType === 'free') return 'Miễn phí';
    if (!isPriceVisible) return priceNote ? priceNote : 'Liên hệ';
    if (typeof priceAmount === 'number' && priceAmount > 0) {
        return currencyFormatter.format(priceAmount);
    }
    return priceNote ? priceNote : 'Liên hệ';
}

export default function FavoritesPage() {
    const { student } = useStudentAuth();
    const favorites = useQuery(
        api.course_favorites.listStudentFavorites,
        student ? { studentId: student._id } : 'skip'
    ) as CourseDoc[] | undefined;
    const [thumbnailUrls, setThumbnailUrls] = useState<Record<string, string>>({});

    // Load thumbnail URLs when favorites change
    useEffect(() => {
        if (!favorites || favorites.length === 0) return;

        const loadThumbnailUrls = async () => {
            try {
                const urls: Record<string, string> = {};
                for (const course of favorites) {
                    if (course.thumbnailMediaId) {
                        try {
                            // The API endpoint redirects to the actual URL,
                            // but we can use it directly as src in img tag
                            urls[course.thumbnailMediaId] = `/api/media/${course.thumbnailMediaId}`;
                        } catch (error) {
                            console.warn(`Failed to load thumbnail for ${course._id}`, error);
                        }
                    }
                }
                setThumbnailUrls(urls);
            } catch (error) {
                console.error('Failed to load thumbnail URLs', error);
            }
        };

        loadThumbnailUrls();
    }, [favorites]);

    if (!student) {
        return (
            <main className="relative min-h-screen overflow-hidden bg-white pb-2 pt-6 text-slate-900 md:pt-8">
                <div className="relative mx-auto max-w-7xl px-4 md:px-6">
                    <div className="flex h-96 items-center justify-center rounded-xl border border-dashed border-slate-300 bg-slate-50">
                        <div className="space-y-3 text-center">
                            <div className="text-5xl">🔐</div>
                            <p className="text-lg font-semibold text-slate-700">Vui lòng đăng nhập</p>
                            <p className="text-sm text-slate-500">Đăng nhập để xem danh sách khóa học yêu thích của bạn</p>
                            <Link
                                href="/khoa-hoc/dang-nhap"
                                className="inline-block rounded-md bg-gradient-to-r from-amber-500 to-yellow-500 px-6 py-2 text-sm font-semibold text-white transition-all duration-200 hover:opacity-90"
                            >
                                Đăng nhập
                            </Link>
                        </div>
                    </div>
                </div>
            </main>
        );
    }

    if (favorites === undefined) {
        return (
            <main className="relative min-h-screen overflow-hidden bg-white pb-2 pt-6 text-slate-900 md:pt-8">
                <div className="relative mx-auto max-w-7xl px-4 md:px-6">
                    <div className="flex h-96 items-center justify-center">
                        <div className="space-y-3 text-center">
                            <div className="inline-block">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500"></div>
                            </div>
                            <p className="text-slate-600">Đang tải danh sách yêu thích...</p>
                        </div>
                    </div>
                </div>
            </main>
        );
    }

    if (!favorites || favorites.length === 0) {
        return (
            <main className="relative min-h-screen overflow-hidden bg-white pb-2 pt-6 text-slate-900 md:pt-8">
                <div className="relative mx-auto max-w-7xl px-4 md:px-6">
                    <div className="mb-8">
                        <h1 className="text-3xl md:text-4xl font-bold text-slate-900">Khóa học yêu thích</h1>
                    </div>
                    <div className="flex h-96 items-center justify-center rounded-xl border border-dashed border-slate-300 bg-slate-50">
                        <div className="space-y-3 text-center">
                            <div className="text-5xl">💔</div>
                            <p className="text-lg font-semibold text-slate-700">Danh sách trống</p>
                            <p className="text-sm text-slate-500">Bạn chưa thêm khóa học nào vào danh sách yêu thích</p>
                            <Link
                                href="/khoa-hoc"
                                className="inline-block rounded-md bg-gradient-to-r from-amber-500 to-yellow-500 px-6 py-2 text-sm font-semibold text-white transition-all duration-200 hover:opacity-90"
                            >
                                Khám phá khóa học
                            </Link>
                        </div>
                    </div>
                </div>
            </main>
        );
    }

    const favoriteCourses = favorites as CourseDoc[];

    return (
        <main className="relative min-h-screen overflow-hidden bg-white pb-2 pt-6 text-slate-900 md:pt-8">
            <div className="relative mx-auto max-w-7xl px-4 md:px-6">
                {/* Header */}
                <div className="mb-8">
                    <div className="space-y-2 mb-6">
                        <h1 className="text-3xl md:text-4xl font-bold text-slate-900">Khóa học yêu thích</h1>
                        <p className="text-slate-600">{favoriteCourses.length} khóa học trong danh sách yêu thích của bạn</p>
                    </div>
                </div>

                {/* Grid */}
                <section className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {favorites.map((course) => {
                         const detailHref = `/khoa-hoc/${course.slug}` as Route;
                        const priceText = formatPrice(course);

                        return (
                            <article
                                key={course._id}
                                className="group flex h-full flex-col overflow-hidden rounded-lg border border-slate-200 bg-white transition-all duration-300 hover:border-slate-300"
                            >
                                {/* Image */}
                                <div className="relative aspect-video overflow-hidden bg-slate-100">
                                    {course.thumbnailMediaId && thumbnailUrls[course.thumbnailMediaId] ? (
                                        <img
                                            src={thumbnailUrls[course.thumbnailMediaId]}
                                            alt={course.title}
                                            className="h-full w-full object-cover transition duration-500 group-hover:scale-103"
                                            onError={(e) => {
                                                (e.target as HTMLImageElement).style.display = 'none';
                                            }}
                                        />
                                    ) : (
                                        <div className="absolute inset-0 flex items-center justify-center text-xs uppercase tracking-[0.35em] text-slate-400">
                                            Chưa có ảnh
                                        </div>
                                    )}

                                    {/* Heart Button */}
                                    <div className="absolute right-3 top-3">
                                        <CourseFavoriteButton
                                            studentId={student?._id ? (student._id as any) : null}
                                            courseId={course._id as any}
                                            size="md"
                                        />
                                    </div>
                                </div>

                                {/* Content */}
                                <div className="flex flex-1 flex-col gap-3 p-4">
                                    <div className="space-y-2">
                                        <h3 className="line-clamp-2 text-base font-semibold leading-tight text-slate-900 transition-colors duration-300 group-hover:text-slate-700">
                                            {course.title}
                                        </h3>
                                        {course.subtitle && (
                                            <p className="line-clamp-2 text-xs text-slate-500">{course.subtitle}</p>
                                        )}
                                    </div>

                                    <div className="mt-auto flex items-center justify-between">
                                        <span className="text-xs font-medium text-slate-500">
                                            {course.pricingType === 'free' ? 'Miễn phí' : 'Khóa học'}
                                        </span>
                                        <span className="text-sm font-semibold bg-gradient-to-r from-amber-500 to-yellow-500 bg-clip-text text-transparent">
                                            {priceText}
                                        </span>
                                    </div>
                                </div>

                                {/* Footer */}
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
                    })}
                </section>
            </div>
        </main>
    );
}
