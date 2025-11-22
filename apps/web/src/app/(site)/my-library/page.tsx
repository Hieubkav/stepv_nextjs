'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from 'convex/react';
import { api } from '@dohy/backend/convex/_generated/api';
import { useCustomerAuth } from '@/features/auth';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import CourseCard from '@/components/library/CourseCard';
import ResourceCard from '@/components/library/ResourceCard';
import VfxCard from '@/components/library/VfxCard';

export default function MyLibraryPage() {
    const router = useRouter();
    const { customer, status } = useCustomerAuth();

    // Redirect if not authenticated
    useEffect(() => {
        if (status === 'authenticated' || status === 'loading') return;
        if (status === 'idle') {
            router.push('/login');
        }
    }, [status, router]);

    // Load purchases
    const purchases = useQuery(
        api.purchases.getCustomerLibrary,
        customer ? { customerId: customer._id as any } : 'skip'
    ) as any[] | null | undefined;

    if (status === 'loading' || !purchases) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="w-8 h-8 border-4 border-muted border-t-primary rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-muted-foreground">Đang tải thư viện...</p>
                </div>
            </div>
        );
    }

    // Filter purchases by type
    const courses = purchases.filter((p) => p.productType === 'course') || [];
    const resources = purchases.filter((p) => p.productType === 'resource') || [];
    const vfx = purchases.filter((p) => p.productType === 'vfx') || [];

    return (
        <div className="min-h-screen bg-background py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold mb-2">
                        🏠 Thư viện của tôi
                    </h1>
                    <p className="text-muted-foreground">
                        Quản lý các khóa học, tài nguyên và VFX đã mua
                    </p>
                </div>

                {/* Empty state */}
                {courses.length === 0 && resources.length === 0 && vfx.length === 0 ? (
                    <div className="py-16 text-center space-y-4">
                        <div className="text-4xl mb-4">📚</div>
                        <h2 className="text-2xl font-bold">Thư viện trống</h2>
                        <p className="text-muted-foreground mb-6">
                            Bạn chưa mua sản phẩm nào. Hãy bắt đầu mua sắm ngay!
                        </p>
                        <div className="space-x-4">
                            <a
                                href="/khoa-hoc"
                                className="inline-block px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
                            >
                                Khám phá khóa học
                            </a>
                            <a
                                href="/thu-vien"
                                className="inline-block px-6 py-2 border rounded-lg hover:bg-muted"
                            >
                                Khám phá tài nguyên
                            </a>
                        </div>
                    </div>
                ) : (
                    /* Tabs */
                    <Tabs defaultValue="courses" className="space-y-6">
                        <TabsList className="grid w-full max-w-md grid-cols-3">
                            <TabsTrigger value="courses">
                                🎓 Khóa học
                                {courses.length > 0 && (
                                    <span className="ml-2 px-2 py-0.5 bg-primary text-white text-xs rounded-full">
                                        {courses.length}
                                    </span>
                                )}
                            </TabsTrigger>
                            <TabsTrigger value="resources">
                                📦 Tài nguyên
                                {resources.length > 0 && (
                                    <span className="ml-2 px-2 py-0.5 bg-primary text-white text-xs rounded-full">
                                        {resources.length}
                                    </span>
                                )}
                            </TabsTrigger>
                            <TabsTrigger value="vfx">
                                ✨ VFX
                                {vfx.length > 0 && (
                                    <span className="ml-2 px-2 py-0.5 bg-primary text-white text-xs rounded-full">
                                        {vfx.length}
                                    </span>
                                )}
                            </TabsTrigger>
                        </TabsList>

                        {/* Courses Tab */}
                        <TabsContent value="courses">
                            {courses.length === 0 ? (
                                <div className="py-12 text-center">
                                    <p className="text-muted-foreground mb-4">
                                        Bạn chưa mua khóa học nào
                                    </p>
                                    <a
                                        href="/khoa-hoc"
                                        className="inline-block px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
                                    >
                                        Xem các khóa học
                                    </a>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {courses.map((purchase) => (
                                        <CourseCard
                                            key={purchase._id}
                                            id={purchase.productId}
                                            slug={purchase.product?.slug || purchase.productId}
                                            title={purchase.product?.title || 'Khóa học không xác định'}
                                            thumbnail={
                                                purchase.product?.thumbnailMediaId
                                                    ? '/placeholder-course.jpg'
                                                    : undefined
                                            }
                                            progress={purchase.progressPercent}
                                        />
                                    ))}
                                </div>
                            )}
                        </TabsContent>

                        {/* Resources Tab */}
                        <TabsContent value="resources">
                            {resources.length === 0 ? (
                                <div className="py-12 text-center">
                                    <p className="text-muted-foreground mb-4">
                                        Bạn chưa mua tài nguyên nào
                                    </p>
                                    <a
                                        href="/thu-vien"
                                        className="inline-block px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
                                    >
                                        Xem các tài nguyên
                                    </a>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {resources.map((purchase) => (
                                        <ResourceCard
                                            key={purchase._id}
                                            purchaseId={purchase._id}
                                            id={purchase.productId}
                                            title={purchase.product?.title || 'Tài nguyên không xác định'}
                                            thumbnail={
                                                purchase.product?.coverImageId
                                                    ? '/placeholder-resource.jpg'
                                                    : undefined
                                            }
                                            downloadUrl={
                                                purchase.product?.downloadUrl
                                                    ? '/download/resource'
                                                    : undefined
                                            }
                                            downloadCount={purchase.downloadCount}
                                        />
                                    ))}
                                </div>
                            )}
                        </TabsContent>

                        {/* VFX Tab */}
                        <TabsContent value="vfx">
                            {vfx.length === 0 ? (
                                <div className="py-12 text-center">
                                    <p className="text-muted-foreground mb-4">
                                        Bạn chưa mua VFX nào
                                    </p>
                                    <a
                                        href="/vfx"
                                        className="inline-block px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
                                    >
                                        Xem các VFX
                                    </a>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {vfx.map((purchase) => (
                                        <VfxCard
                                            key={purchase._id}
                                            purchaseId={purchase._id}
                                            id={purchase.productId}
                                            title={purchase.product?.title || 'VFX không xác định'}
                                            format={purchase.product?.format}
                                            resolution={purchase.product?.resolution}
                                            thumbnail={
                                                purchase.product?.thumbnailId
                                                    ? '/placeholder-vfx.jpg'
                                                    : undefined
                                            }
                                            previewUrl={
                                                purchase.product?.previewVideoId
                                                    ? '/preview/vfx'
                                                    : undefined
                                            }
                                            downloadUrl={
                                                purchase.product?.downloadFileId
                                                    ? '/download/vfx'
                                                    : undefined
                                            }
                                            downloadCount={purchase.downloadCount}
                                        />
                                    ))}
                                </div>
                            )}
                        </TabsContent>
                    </Tabs>
                )}
            </div>
        </div>
    );
}
