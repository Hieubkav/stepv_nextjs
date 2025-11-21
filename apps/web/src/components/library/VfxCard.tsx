'use client';

import Image from 'next/image';
import { Download, Sparkles } from 'lucide-react';
import { useState } from 'react';
import { useConvex, useMutation } from 'convex/react';
import { api } from '@dohy/backend/convex/_generated/api';
import { Button } from '@/components/ui/button';
import type { Id } from '@dohy/backend/convex/_generated/dataModel';

type VfxCardProps = {
    purchaseId: Id<'customer_purchases'>;
    id: string;
    title: string;
    format?: string;
    resolution?: string;
    thumbnail?: string;
    previewUrl?: string;
    downloadUrl?: string;
    downloadCount?: number;
};

export default function VfxCard({
    purchaseId,
    id,
    title,
    format = 'MP4',
    resolution = '1920x1080',
    thumbnail,
    previewUrl,
    downloadUrl,
    downloadCount = 0,
}: VfxCardProps) {
    const [isDownloading, setIsDownloading] = useState(false);
    const [showPreview, setShowPreview] = useState(false);
    const incrementDownloadMutation = useMutation(api.purchases.incrementDownloadCount);

    const handleDownload = async () => {
        if (!downloadUrl) return;

        setIsDownloading(true);
        try {
            // Increment download counter
            await incrementDownloadMutation({ purchaseId });

            // Open download
            window.open(downloadUrl, '_blank');
        } catch (error) {
            console.error('Download error:', error);
        } finally {
            setIsDownloading(false);
        }
    };

    return (
        <div className="rounded-lg border overflow-hidden hover:shadow-lg transition-shadow">
            {/* Thumbnail / Preview */}
            <div className="relative h-32 bg-muted overflow-hidden cursor-pointer group">
                {previewUrl ? (
                    <video
                        src={previewUrl}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        muted
                        autoPlay
                        loop
                    />
                ) : thumbnail ? (
                    <Image
                        src={thumbnail}
                        alt={title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center">
                        <Sparkles className="w-8 h-8 text-muted-foreground" />
                    </div>
                )}
            </div>

            {/* Info */}
            <div className="p-3 space-y-2">
                <h3 className="font-semibold line-clamp-2">{title}</h3>

                {/* Specs */}
                <div className="text-xs text-muted-foreground space-y-0.5">
                    <div>📺 {resolution} • {format}</div>
                    <div>📥 Đã tải: <span className="font-semibold">{downloadCount}</span> lần</div>
                </div>

                {/* Button */}
                <Button
                    size="sm"
                    className="w-full mt-2"
                    onClick={handleDownload}
                    disabled={!downloadUrl || isDownloading}
                >
                    <Download className="w-4 h-4 mr-1" />
                    {isDownloading ? 'Đang tải...' : 'Tải VFX'}
                </Button>
            </div>
        </div>
    );
}
