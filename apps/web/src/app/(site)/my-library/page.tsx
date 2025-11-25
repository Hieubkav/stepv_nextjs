'use client';

import Link from 'next/link';
import type { Route } from 'next';
import { useEffect, useMemo, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from 'convex/react';
import { api } from '@dohy/backend/convex/_generated/api';
import { useCustomerAuth } from '@/features/auth';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight, BookOpenCheck, DownloadCloud, Library, Loader2, Sparkles } from 'lucide-react';
import CourseCard from '@/components/library/CourseCard';
import ResourceCard from '@/components/library/ResourceCard';
import VfxCard from '@/components/library/VfxCard';

export default function MyLibraryPage() {
    const router = useRouter();
    const { customer, status } = useCustomerAuth();

    useEffect(() => {
        if (status === 'idle' && !customer) {
            router.replace('/login');
        }
    }, [customer, router, status]);

    const purchases = useQuery(
        api.purchases.getCustomerLibrary,
        customer ? { customerId: customer._id as any } : 'skip'
    ) as any[] | null | undefined;
    const mediaList = useQuery(api.media.list, {});

    const isHydrating = useMemo(() => status === 'loading' && !customer, [customer, status]);
    const isLoadingLibrary = status !== 'idle' && purchases === undefined;
    const mediaMap = useMemo(() => {
        const map = new Map<string, any>();
        (mediaList ?? []).forEach((item: any) => {
            map.set(String(item._id), item);
        });
        return map;
    }, [mediaList]);

    const mediaUrl = (id?: string | null) => {
        if (!id) return undefined;
        const item = mediaMap.get(String(id));
        return item?.url ?? item?.externalUrl ?? undefined;
    };

    if (isHydrating || isLoadingLibrary) {
        return (
            <div className="min-h-screen bg-gradient-to-b from-[#050915] via-[#071026] to-[#02050d] text-slate-100">
                <div className="flex h-full items-center justify-center px-6 py-24">
                    <div className="rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-slate-200 shadow-[0_20px_60px_rgba(0,0,0,0.45)]">
                        <div className="flex items-center gap-2">
                            <Loader2 className="h-4 w-4 animate-spin text-amber-200" />
                            <span>Đang tải thư viện của bạn...</span>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (!customer) return null;

    const library = purchases ?? [];
    const courses = library.filter((item) => item.productType === 'course');
    const resources = library.filter((item) => item.productType === 'resource');
    const vfx = library.filter((item) => item.productType === 'vfx');
    const defaultTab = courses.length
        ? 'courses'
        : resources.length
          ? 'resources'
          : vfx.length
            ? 'vfx'
            : 'courses';
    const customerName = customer.fullName || customer.account || 'bạn';

    return (
        <div className="min-h-screen bg-gradient-to-b from-[#050915] via-[#071026] to-[#02050d] text-slate-100">
            <div className="relative mx-auto max-w-6xl px-4 pb-16 pt-28 sm:px-6 sm:pt-32 lg:px-8 lg:pt-36">
                <div className="pointer-events-none absolute inset-x-0 top-0 h-52 bg-[radial-gradient(circle_at_center,#fbbf2426,transparent_62%)] opacity-70 blur-3xl" />
                <div className="pointer-events-none absolute inset-x-16 top-24 h-64 bg-[radial-gradient(circle_at_center,#22d3ee24,transparent_65%)] blur-3xl" />

                <div className="relative z-10 space-y-8">
                    <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-center gap-3">
                            <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-amber-200/50 bg-amber-400/15 text-amber-100 shadow-inner">
                                <Library className="h-5 w-5" />
                            </div>
                            <div className="space-y-1">
                                <p className="text-[11px] uppercase tracking-[0.22em] text-amber-200/80">
                                    Dohy Studio
                                </p>
                                <h1 className="text-3xl font-semibold text-white">Thư viện của {customerName}</h1>
                                <p className="text-sm text-slate-400">
                                    Toàn bộ khóa học, tài nguyên và VFX bạn đã sở hữu ở cùng một nơi.
                                </p>
                            </div>
                        </div>
                        <div className="flex flex-wrap gap-2" />
                    </header>

                    {courses.length === 0 && resources.length === 0 && vfx.length === 0 ? (
                        <EmptyState />
                    ) : (
                        <Tabs defaultValue={defaultTab} className="space-y-5">
                            <TabsList className="grid w-full max-w-xl grid-cols-3 rounded-xl border border-white/10 bg-white/[0.04] p-1 text-[12px] font-semibold text-slate-300 shadow-[0_18px_45px_rgba(0,0,0,0.35)]">
                                <StyledTab value="courses" label="Khóa học" count={courses.length} />
                                <StyledTab value="resources" label="Tài nguyên" count={resources.length} />
                                <StyledTab value="vfx" label="VFX" count={vfx.length} />
                            </TabsList>

                            <TabPanel value="courses">
                                {courses.length === 0 ? (
                                    <TabEmpty
                                        actionHref="/khoa-hoc"
                                        actionLabel="Xem khóa học"
                                        description="Bạn chưa mua khóa học nào. Khám phá lộ trình phù hợp để bắt đầu ngay."
                                    />
                                ) : (
                                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                        {courses.map((purchase) => (
                                            <CourseCard
                                                key={purchase._id}
                                                slug={purchase.product?.slug || purchase.productId}
                                                title={purchase.product?.title || 'Khóa học chưa có tiêu đề'}
                                                thumbnail={mediaUrl(
                                                    purchase.product?.thumbnailMediaId ||
                                                        purchase.product?.thumbnailId ||
                                                        purchase.product?.coverImageId
                                                )}
                                                progress={purchase.progressPercent}
                                            />
                                        ))}
                                    </div>
                                )}
                            </TabPanel>

                            <TabPanel value="resources">
                                {resources.length === 0 ? (
                                    <TabEmpty
                                        actionHref="/thu-vien"
                                        actionLabel="Xem tài nguyên"
                                        description="Bạn chưa có tài nguyên nào. Thêm preset, texture hoặc template để tăng tốc dự án."
                                    />
                                ) : (
                                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                        {resources.map((purchase) => {
                                            const product = purchase.product;
                                            const downloadUrl =
                                                product?.isDownloadVisible && product?.downloadUrl
                                                    ? product.downloadUrl
                                                    : undefined;

                                            return (
                                                <ResourceCard
                                                    key={purchase._id}
                                                    purchaseId={purchase._id}
                                                    slug={product?.slug}
                                                    title={product?.title || 'Tài nguyên chưa có tiêu đề'}
                                                    thumbnail={mediaUrl(
                                                        product?.coverImageId ||
                                                            product?.thumbnailMediaId ||
                                                            product?.thumbnailId
                                                    )}
                                                    downloadUrl={downloadUrl}
                                                    downloadCount={purchase.downloadCount}
                                                />
                                            );
                                        })}
                                    </div>
                                )}
                            </TabPanel>

                            <TabPanel value="vfx">
                                {vfx.length === 0 ? (
                                    <TabEmpty
                                        actionHref="/vfx"
                                        actionLabel="Xem gói VFX"
                                        description="Kho VFX của bạn đang trống. Mua thêm hiệu ứng để dựng hình nhanh hơn."
                                    />
                                ) : (
                                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                        {vfx.map((purchase) => (
                                            <VfxCard
                                                key={purchase._id}
                                                purchaseId={purchase._id}
                                                slug={purchase.product?.slug}
                                                title={purchase.product?.title || 'Gói VFX chưa có tiêu đề'}
                                                format={purchase.product?.format}
                                                resolution={purchase.product?.resolution}
                                                thumbnail={mediaUrl(purchase.product?.thumbnailId)}
                                                previewUrl={mediaUrl(purchase.product?.previewVideoId)}
                                                    downloadUrl={mediaUrl(purchase.product?.downloadFileId)}
                                                    downloadCount={purchase.downloadCount}
                                                />
                                        ))}
                                    </div>
                                )}
                            </TabPanel>
                        </Tabs>
                    )}
                </div>
            </div>
        </div>
    );
}

type StyledTabProps = {
    value: string;
    label: string;
    count: number;
};

function StyledTab({ value, label, count }: StyledTabProps) {
    return (
        <TabsTrigger
            value={value}
            className="relative flex items-center justify-center gap-2 rounded-lg border border-transparent px-3 py-2 uppercase tracking-[0.08em] transition hover:border-white/15 data-[state=active]:border-amber-200/60 data-[state=active]:bg-amber-400/20 data-[state=active]:text-white data-[state=active]:shadow-[0_10px_30px_rgba(251,191,36,0.25)]"
        >
            <span>{label}</span>
            {count > 0 ? (
                <span className="rounded-full bg-white/10 px-2 py-0.5 text-[11px] text-amber-100">{count}</span>
            ) : null}
        </TabsTrigger>
    );
}

type TabPanelProps = {
    value: string;
    children: ReactNode;
};

function TabPanel({ value, children }: TabPanelProps) {
    return (
        <TabsContent value={value} className="focus-visible:outline-none">
            <div className="rounded-2xl border border-white/5 bg-white/[0.03] p-4 shadow-[0_22px_60px_rgba(0,0,0,0.4)]">
                {children}
            </div>
        </TabsContent>
    );
}

function EmptyState() {
    return (
        <Card className="border border-white/5 bg-white/[0.03] text-slate-100 shadow-[0_22px_60px_rgba(0,0,0,0.4)]">
            <CardContent className="flex flex-col items-center gap-4 px-6 py-10 text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-amber-200/50 bg-amber-400/10 text-amber-100">
                    <Library className="h-5 w-5" />
                </div>
                <div className="space-y-2">
                    <h2 className="text-xl font-semibold text-white">Thư viện đang trống</h2>
                    <p className="max-w-md text-sm text-slate-400">
                        Mua khóa học, tài nguyên hoặc gói VFX để chúng xuất hiện ở đây. Bạn có thể quay lại bất cứ lúc
                        nào để tải xuống hoặc tiếp tục học.
                    </p>
                </div>
                <div className="flex flex-wrap justify-center gap-2">
                    <Button
                        asChild
                        className="h-9 rounded-full border border-amber-200/60 bg-amber-400 text-slate-950 shadow-[0_12px_35px_rgba(251,191,36,0.35)] transition hover:brightness-110"
                    >
                        <Link href="/khoa-hoc">
                            <BookOpenCheck className="mr-2 h-4 w-4" />
                            Khám phá khóa học
                        </Link>
                    </Button>
                    <Button
                        asChild
                        variant="secondary"
                        className="h-9 rounded-full border border-white/15 bg-white/[0.08] text-slate-100 hover:border-amber-200/50"
                    >
                        <Link href="/thu-vien">
                            <DownloadCloud className="mr-2 h-4 w-4" />
                            Xem tài nguyên
                        </Link>
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}

type TabEmptyProps = {
    actionHref: Route;
    actionLabel: string;
    description: string;
};

function TabEmpty({ actionHref, actionLabel, description }: TabEmptyProps) {
    return (
        <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-white/10 bg-white/[0.02] px-6 py-10 text-center text-slate-200">
            <p className="text-sm text-slate-400">{description}</p>
            <Button
                asChild
                className="h-9 rounded-full border border-amber-200/60 bg-amber-400 text-slate-950 shadow-[0_12px_35px_rgba(251,191,36,0.35)] transition hover:brightness-110"
            >
                <Link href={actionHref}>
                    {actionLabel}
                    <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
            </Button>
        </div>
    );
}
