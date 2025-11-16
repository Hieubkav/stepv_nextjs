'use client';

import { useQuery } from 'convex/react';
import { api } from '@dohy/backend/convex/_generated/api';
import { useStudentAuth } from '@/features/learner/auth/student-auth-context';
import Link from 'next/link';
import { Heart } from 'lucide-react';

export default function FavoritesPage() {
    const { student } = useStudentAuth();
    const favorites = useQuery(
        api.course_favorites.listStudentFavorites,
        student ? { studentId: student._id } : 'skip'
    );

    if (!student) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
                <div className="text-center">
                    <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">Danh sách yêu thích</h1>
                    <p className="text-gray-600 mb-6">Vui lòng đăng nhập để xem danh sách yêu thích của bạn</p>
                    <Link
                        href="/khoa-hoc/dang-nhap"
                        className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-lg transition"
                    >
                        Đăng nhập
                    </Link>
                </div>
            </div>
        );
    }

    if (favorites === undefined) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Đang tải danh sách yêu thích...</p>
                </div>
            </div>
        );
    }

    if (!favorites || favorites.length === 0) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
                <div className="text-center">
                    <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">Danh sách yêu thích trống</h1>
                    <p className="text-gray-600 mb-6">Bạn chưa thêm khóa học nào vào yêu thích</p>
                    <Link
                        href="/khoa-hoc"
                        className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-lg transition"
                    >
                        Khám phá khóa học
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-12 px-4">
            <div className="max-w-6xl mx-auto">
                <div className="flex items-center gap-3 mb-8">
                    <Heart className="w-8 h-8 fill-red-500 text-red-500" />
                    <h1 className="text-3xl font-bold text-gray-900">Danh sách yêu thích</h1>
                    <span className="ml-auto text-sm font-medium text-gray-600 bg-white px-3 py-1 rounded-full">
                        {favorites.length} khóa học
                    </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {favorites.map((course: any) => (
                        <Link
                            key={course._id}
                            href={`/khoa-hoc/${course.slug}`}
                            className="group bg-white rounded-lg shadow hover:shadow-lg transition overflow-hidden"
                        >
                            <div className="bg-gradient-to-br from-blue-500 to-purple-600 h-40 flex items-center justify-center relative overflow-hidden">
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
                            <div className="p-4">
                                <h3 className="font-semibold text-gray-900 line-clamp-2 group-hover:text-blue-600 transition">
                                    {course.title}
                                </h3>
                                {course.subtitle && (
                                    <p className="text-sm text-gray-600 line-clamp-1 mt-1">
                                        {course.subtitle}
                                    </p>
                                )}
                                {course.isPriceVisible && course.priceAmount ? (
                                    <div className="mt-3 text-lg font-bold text-blue-600">
                                        ${course.priceAmount.toLocaleString()}
                                    </div>
                                ) : course.pricingType === 'free' ? (
                                    <div className="mt-3 text-sm font-semibold text-green-600">
                                        Miễn phí
                                    </div>
                                ) : null}
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
}
