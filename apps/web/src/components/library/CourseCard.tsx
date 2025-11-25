'use client';

import Image from 'next/image';
import Link from 'next/link';
import { PlayCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatPercent } from '@/lib/format';

type CourseCardProps = {
    slug: string;
    title: string;
    thumbnail?: string;
    progress?: number;
};

export default function CourseCard({ slug, title, thumbnail, progress = 0 }: CourseCardProps) {
    const displayProgress = formatPercent(progress);
    const safeProgress = Math.min(Math.max(progress, 0), 100);

    return (
        <div className="group relative overflow-hidden rounded-2xl border border-white/5 bg-white/[0.04] text-slate-100 shadow-[0_18px_55px_rgba(0,0,0,0.45)] transition duration-300 hover:-translate-y-1 hover:border-amber-200/50">
            <Link
                href={`/khoa-hoc/${slug}`}
                className="relative block h-36 overflow-hidden bg-gradient-to-br from-slate-800/60 via-slate-900 to-slate-950"
            >
                {thumbnail ? (
                    <Image
                        src={thumbnail}
                        alt={title}
                        fill
                        className="object-cover transition duration-500 group-hover:scale-105"
                    />
                ) : (
                    <div className="flex h-full w-full items-center justify-center">
                        <PlayCircle className="h-9 w-9 text-slate-400" />
                    </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/25 to-transparent" />
                <div className="absolute inset-0 opacity-0 transition duration-500 group-hover:opacity-100">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,#fbbf2433,transparent_35%)]" />
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_10%,#22d3ee33,transparent_38%)]" />
                </div>
            </Link>

            <div className="space-y-3 p-4">
                <Link href={`/khoa-hoc/${slug}`}>
                    <h3 className="line-clamp-2 text-base font-semibold text-white transition hover:text-amber-200">
                        {title}
                    </h3>
                </Link>

                <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-[12px] text-slate-400">
                        <span>Tiến độ</span>
                        <span className="font-semibold text-amber-100">{displayProgress}</span>
                    </div>
                    <div className="h-2 rounded-full bg-white/10">
                        <div
                            className="h-full rounded-full bg-amber-300 shadow-[0_6px_18px_rgba(251,191,36,0.35)] transition-all"
                            style={{ width: `${safeProgress}%` }}
                        />
                    </div>
                </div>

                <Button
                    size="sm"
                    asChild
                    className="h-9 w-full rounded-full border border-amber-200/60 bg-amber-400 text-slate-950 shadow-[0_10px_30px_rgba(251,191,36,0.35)] transition hover:brightness-110"
                >
                    <Link href={`/khoa-hoc/${slug}`}>Tiếp tục học</Link>
                </Button>
            </div>
        </div>
    );
}
