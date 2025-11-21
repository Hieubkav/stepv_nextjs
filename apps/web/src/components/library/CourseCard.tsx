'use client';

import Link from 'next/link';
import Image from 'next/image';
import { PlayCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatPercent } from '@/lib/format';

type CourseCardProps = {
    id: string;
    slug: string;
    title: string;
    thumbnail?: string;
    progress?: number;
};

export default function CourseCard({
    id,
    slug,
    title,
    thumbnail,
    progress = 0,
}: CourseCardProps) {
    const displayProgress = formatPercent(progress);

    return (
        <div className="rounded-lg border overflow-hidden hover:shadow-lg transition-shadow">
            {/* Thumbnail */}
            <Link href={`/khoa-hoc/${slug}`} className="block relative h-32 bg-muted overflow-hidden">
                {thumbnail ? (
                    <Image
                        src={thumbnail}
                        alt={title}
                        fill
                        className="object-cover hover:scale-105 transition-transform"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center">
                        <PlayCircle className="w-8 h-8 text-muted-foreground" />
                    </div>
                )}
            </Link>

            {/* Info */}
            <div className="p-3 space-y-2">
                <Link href={`/khoa-hoc/${slug}`}>
                    <h3 className="font-semibold hover:text-primary line-clamp-2">
                        {title}
                    </h3>
                </Link>

                {/* Progress */}
                <div className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">Tiến độ:</span>
                        <span className="font-bold">{displayProgress}</span>
                    </div>
                    <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                        <div
                            className="h-full bg-primary transition-all"
                            style={{ width: `${progress || 0}%` }}
                        />
                    </div>
                </div>

                {/* Button */}
                <Button
                    size="sm"
                    className="w-full mt-2"
                    asChild
                >
                    <Link href={`/khoa-hoc/${slug}`}>
                        Tiếp tục học
                    </Link>
                </Button>
            </div>
        </div>
    );
}
