"use client";

import { useEffect, useRef, useMemo } from "react";
import { Play, Maximize2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { extractYoutubeVideoId } from "@/lib/youtube";

type ThumbnailInfo = {
  url?: string;
  title?: string | null;
};

type VideoInfo = {
  id: string;
  title: string;
  durationLabel: string | null;
};

declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: () => void;
  }
}

export function VideoPlayer({ 
  thumbnail, 
  totalDurationText,
  introVideoUrl,
  selectedLesson,
}: { 
  thumbnail: ThumbnailInfo | null;
  totalDurationText: string | null;
  introVideoUrl?: string | null;
  selectedLesson?: VideoInfo | null;
}) {
  const playerRef = useRef<any>(null);
  const playerContainerRef = useRef<HTMLDivElement>(null);
  const playerWrapperRef = useRef<HTMLDivElement>(null);

  const videoId = useMemo(() => {
    if (selectedLesson?.id) {
      return extractYoutubeVideoId(selectedLesson.id);
    }
    return introVideoUrl ? extractYoutubeVideoId(introVideoUrl) : null;
  }, [selectedLesson?.id, introVideoUrl]);

  const displayTitle = selectedLesson?.title || "Video giới thiệu";
  const displayDuration = selectedLesson?.durationLabel || totalDurationText;

  useEffect(() => {
    if (!videoId) return;

    const loadYouTubeAPI = () => {
      if (window.YT?.Player) {
        initializePlayer();
      } else {
        window.onYouTubeIframeAPIReady = initializePlayer;
        const tag = document.createElement('script');
        tag.src = 'https://www.youtube.com/iframe_api';
        const firstScriptTag = document.getElementsByTagName('script')[0];
        if (firstScriptTag?.parentNode) {
          firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
        }
      }
    };

    const initializePlayer = () => {
      if (playerRef.current || !playerContainerRef.current) return;

      playerRef.current = new window.YT.Player(playerContainerRef.current, {
        height: '100%',
        width: '100%',
        videoId: videoId,
        playerVars: {
          modestbranding: 1,
          controls: 0,
          showinfo: 0,
          rel: 0,
          fs: 1,
          iv_load_policy: 3,
          autoplay: 0,
          disablekb: 1,
        },
        events: {
          onReady: (event: any) => {
            event.target.setSize('100%', '100%');
          },
        },
      });

      const iframe = playerContainerRef.current?.querySelector('iframe');
      if (iframe) {
        iframe.style.display = 'block';
        iframe.setAttribute('allowfullscreen', 'true');
        const allowAttr = iframe.getAttribute('allow');
        iframe.setAttribute('allow', allowAttr ? `${allowAttr}; fullscreen` : 'fullscreen');
        const hideYouTubeUI = () => {
          const ytElements = iframe.parentElement?.querySelectorAll('[role="status"], [role="button"]');
          ytElements?.forEach((el: any) => {
            el.style.display = 'none';
          });
        };
        setTimeout(hideYouTubeUI, 100);
      }
    };

    loadYouTubeAPI();

    return () => {
      if (playerRef.current && typeof playerRef.current.destroy === 'function') {
        playerRef.current.destroy();
        playerRef.current = null;
      }
    };
  }, [videoId]);

  const handleFullscreenToggle = () => {
    if (typeof document === "undefined") return;
    const container = playerWrapperRef.current;
    if (!container) return;

    const doc: any = document;
    const isFullscreen = doc.fullscreenElement || doc.webkitFullscreenElement || doc.msFullscreenElement;

    if (!isFullscreen) {
      const request = container.requestFullscreen || (container as any).webkitRequestFullscreen || (container as any).msRequestFullscreen;
      request?.call(container);
    } else {
      const exit = doc.exitFullscreen || doc.webkitExitFullscreen || doc.msExitFullscreen;
      exit?.call(document);
    }
  };

  if (!videoId) {
    if (thumbnail?.url) {
      return (
        <Card className="overflow-hidden py-0">
          <div className="relative aspect-video bg-gradient-to-br from-slate-900 to-slate-800">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={thumbnail.url} alt={thumbnail.title ?? "Ảnh khóa học"} className="h-full w-full object-cover" />
            <div className="absolute inset-0 bg-black/40 opacity-0 transition-opacity duration-200 hover:opacity-100 flex items-center justify-center">
              <Button
                size="lg"
                className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
                type="button"
              >
                <Play className="h-5 w-5" />
                Phát video
              </Button>
            </div>
          </div>
        </Card>
      );
    }

    return (
      <Card className="overflow-hidden py-0">
        <div className="relative aspect-video bg-gradient-to-br from-slate-900 to-slate-800 flex flex-col items-center justify-center text-white/75">
          <Play className="mb-4 h-10 w-10" />
          <p className="text-sm">Video giới thiệu đang cập nhật</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden py-0">
      <div
        ref={playerWrapperRef}
        className="group relative aspect-video bg-black overflow-hidden"
      >
        <div
          ref={playerContainerRef}
          className="w-full h-full"
          id="youtube-player"
        />
        {selectedLesson && (
          <div className="absolute bottom-0 left-0 right-0 z-10 bg-gradient-to-t from-black/80 to-transparent p-4 text-white pointer-events-none opacity-0 transition-opacity duration-200 group-hover:opacity-100 group-focus-within:opacity-100">
            <div className="text-sm font-medium">{displayTitle}</div>
            {displayDuration && (
              <div className="text-xs text-white/70">~ {displayDuration}</div>
            )}
          </div>
        )}
        <Button
          type="button"
          size="icon"
          className="absolute bottom-4 right-4 z-20 rounded-full bg-black/60 text-white hover:bg-black/80"
          onClick={handleFullscreenToggle}
          aria-label="M? d?ng toàn màn hình"
        >
          <Maximize2 className="h-4 w-4" />
        </Button>
      </div>
    </Card>
  );
}
