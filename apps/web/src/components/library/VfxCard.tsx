'use client';

import Image from 'next/image';
import Link from 'next/link';
import type { Route } from 'next';
import { Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { Id } from '@dohy/backend/convex/_generated/dataModel';

type VfxCardProps = {
    purchaseId: Id<'customer_purchases'>;
    title: string;
    slug?: string;
    format?: string;
    resolution?: string;
    thumbnail?: string;
    previewUrl?: string;
    downloadUrl?: string;
    downloadCount?: number;
};

export default function VfxCard({
    purchaseId,
    title,
    slug,
    format = 'MP4',
    resolution = '1920x1080',
    thumbnail,
    previewUrl,
    downloadUrl,
    downloadCount = 0,
}: VfxCardProps) {
    const detailHref: Route = (slug ? `/vfx/${slug}` : '/vfx') as Route;

    return (
        <div className="group relative overflow-hidden rounded-2xl border border-white/5 bg-white/[0.04] text-slate-100 shadow-[0_18px_55px_rgba(0,0,0,0.45)] transition duration-300 hover:-translate-y-1 hover:border-amber-200/50">
            <Link
                href={detailHref ?? '#'}
                className="relative block h-32 cursor-pointer overflow-hidden bg-gradient-to-br from-slate-800/60 via-slate-900 to-slate-950"
            >
                {thumbnail ? (
                    <Image
                        src={thumbnail}
                        alt={title}
                        fill
                        className="object-cover transition duration-500 group-hover:scale-105"
                    />
                ) : previewUrl ? (
                    <video
                        src={previewUrl}
                        className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                        muted
                        autoPlay
                        loop
                    />
                ) : (
                    <div className="flex h-full w-full items-center justify-center">
                        <Sparkles className="h-8 w-8 text-slate-400" />
                    </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/25 to-transparent" />
                <div className="absolute inset-0 opacity-0 transition duration-500 group-hover:opacity-100">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_32%_18%,#fbbf2433,transparent_35%)]" />
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_78%_18%,#22d3ee33,transparent_36%)]" />
                </div>
            </Link>

            <div className="space-y-3 p-4">
                <Link href={detailHref ?? '#'} className="block">
                    <h3 className="line-clamp-2 text-base font-semibold text-white transition hover:text-amber-200">
                        {title}
                    </h3>
                </Link>

                <div className="space-y-1 text-[12px] text-slate-400">
                    <div>
                        Độ phân giải · <span className="text-amber-100">{resolution}</span>
                    </div>
                    <div>
                        Đã tải: <span className="font-semibold text-amber-100">{downloadCount}</span> lần
                    </div>
                </div>

                <Button
                    size="sm"
                    asChild
                    className="h-9 w-full rounded-full border border-amber-200/60 bg-amber-400 text-slate-950 shadow-[0_10px_30px_rgba(251,191,36,0.35)] transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
                >
                    <Link href={detailHref}>Xem chi tiết</Link>
                </Button>
            </div>
        </div>
    );
}
