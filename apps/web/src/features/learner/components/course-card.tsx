'use client';

import Link from 'next/link';
import type { Id } from '@dohy/backend/convex/_generated/dataModel';
import { normalizeSlug } from '@/lib/slug';

type CourseId = Id<'courses'>;

interface CourseCardProps {
    course: {
        _id: CourseId;
        slug: string;
        title: string;
        subtitle?: string;
        description?: string;
        thumbnailMediaId?: Id<'media'>;
        pricingType: 'free' | 'paid';
        priceAmount?: number;
        isPriceVisible: boolean;
        priceNote?: string;
        order: number;
        active: boolean;
        createdAt: number;
        updatedAt: number;
    };
    className?: string;
}

export function CourseCard({ course, className = '' }: CourseCardProps) {
    const detailSlug = normalizeSlug(course.slug || course.title);
    const detailHref = detailSlug ? `/khoa-hoc/${detailSlug}` : "/khoa-hoc";
    return (
        <div className={`group bg-white rounded-lg shadow hover:shadow-lg transition overflow-hidden ${className}`}>
            {/* Course Image */}
            <div className="relative bg-gradient-to-br from-blue-500 to-purple-600 h-40 flex items-center justify-center overflow-hidden">
                {course.thumbnailMediaId ? (
                    <img
                        src={`/api/media/${course.thumbnailMediaId}`}
                        alt={course.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition"
                    />
                ) : (
                    <div className="text-white text-center px-4">
                        <p className="font-semibold text-sm">{course.title}</p>
                    </div>
                )}
            </div>

            {/* Course Content */}
            <Link href={detailHref as any} className="block p-4 hover:no-underline">
                <h3 className="font-semibold text-gray-900 line-clamp-2 group-hover:text-blue-600 transition">
                    {course.title}
                </h3>
                {course.subtitle && (
                    <p className="text-sm text-gray-600 line-clamp-1 mt-1">
                        {course.subtitle}
                    </p>
                )}
                
                {/* Price */}
                <div className="mt-3">
                    {course.isPriceVisible && course.priceAmount ? (
                        <div className="text-lg font-bold text-blue-600">
                            ${course.priceAmount.toLocaleString()}
                        </div>
                    ) : course.pricingType === 'free' ? (
                        <div className="text-sm font-semibold text-green-600">
                            Miễn phí
                        </div>
                    ) : null}
                    {course.priceNote && (
                        <p className="text-xs text-gray-500 mt-1">{course.priceNote}</p>
                    )}
                </div>
            </Link>
        </div>
    );
}
