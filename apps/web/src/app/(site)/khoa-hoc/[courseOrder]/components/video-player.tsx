"use client";

import { useState } from "react";
import { Play, Pause, Volume2, Maximize, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

type ThumbnailInfo = {
  url?: string;
  title?: string | null;
};

export function VideoPlayer({ 
  thumbnail, 
  totalDurationText 
}: { 
  thumbnail: ThumbnailInfo | null;
  totalDurationText: string | null;
}) {
  const [isPlaying, setIsPlaying] = useState(false);

  return (
    <Card className="overflow-hidden py-0">
      <div className="relative aspect-video bg-gradient-to-br from-slate-900 to-slate-800">
        {thumbnail?.url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={thumbnail.url} alt={thumbnail.title ?? "Ảnh khóa học"} className="h-full w-full object-cover" />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-white/75">
            <Play className="mb-4 h-10 w-10" />
            <p className="text-sm">Video giới thiệu đang cập nhật</p>
          </div>
        )}

        <div className="absolute inset-0 bg-black/40 opacity-0 transition-opacity duration-200 hover:opacity-100">
          <div className="absolute right-4 bottom-4 left-4">
            <div className="flex items-center justify-between text-white">
              <div className="flex items-center gap-3">
                <Button
                  size="sm"
                  variant="secondary"
                  className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
                  onClick={() => setIsPlaying(!isPlaying)}
                  type="button"
                >
                  {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                </Button>
                <span className="text-sm font-medium">{totalDurationText ? `~ ${totalDurationText}` : "00:00"}</span>
              </div>

              <div className="flex items-center gap-2">
                <Button size="icon" variant="ghost" className="h-8 w-8 text-white hover:bg-white/20" type="button">
                  <Volume2 className="h-4 w-4" />
                </Button>
                <Button size="icon" variant="ghost" className="h-8 w-8 text-white hover:bg-white/20" type="button">
                  <Settings className="h-4 w-4" />
                </Button>
                <Button size="icon" variant="ghost" className="h-8 w-8 text-white hover:bg-white/20" type="button">
                  <Maximize className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
