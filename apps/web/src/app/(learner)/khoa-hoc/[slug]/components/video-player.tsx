"use client";

import { useEffect, useRef, useMemo, useState } from "react";
import { CheckCircle2, Play, AlertCircle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { extractYoutubeVideoId } from "@/lib/youtube";
import { useMutation } from "convex/react";
import { api } from "@dohy/backend/convex/_generated/api";
import { useStudentAuth } from "@/features/learner/auth/student-auth-context";

type ThumbnailInfo = {
  url?: string;
  title?: string | null;
};

type VideoInfo = {
  id: string;
  title: string;
  durationLabel: string | null;
  videoType?: "youtube" | "drive" | "none";
  videoUrl?: string | null;
  youtubeUrl?: string | null;
};

// Helper function to convert Google Drive URL to embeddable iframe URL
function convertDriveUrlToEmbed(driveUrl: string): string {
  // Convert /view to /preview for embedding
  return driveUrl.replace("/view", "/preview");
}

// Helper function to extract Google Drive file ID
function extractDriveFileId(url: string): string | null {
  const match = url.match(/\/d\/([a-zA-Z0-9-_]+)/);
  return match ? match[1] : null;
}

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
  courseId,
}: {
  thumbnail: ThumbnailInfo | null;
  totalDurationText: string | null;
  introVideoUrl?: string | null;
  selectedLesson?: VideoInfo | null;
  courseId?: string;
}) {
  const playerRef = useRef<any>(null);
  const playerContainerRef = useRef<HTMLDivElement>(null);
  const playerHostRef = useRef<HTMLDivElement | null>(null);
  const { student } = useStudentAuth();

  const [watchedSeconds, setWatchedSeconds] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [totalDuration, setTotalDuration] = useState(0);
  const trackingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const recordLessonView = useMutation(api.progress.recordLessonView);
  const completeLessonIfDone = useMutation(api.progress.completeLessonIfDone);

  // Determine video type and extract ID/URL
  const videoType = useMemo(() => {
    if (!selectedLesson) return "youtube"; // Default to youtube for intro video
    return selectedLesson.videoType ?? "youtube";
  }, [selectedLesson?.videoType]);

  const videoId = useMemo(() => {
    if (!selectedLesson) {
      const id = introVideoUrl ? extractYoutubeVideoId(introVideoUrl) : null;
      if (!id && introVideoUrl) {
        console.warn("Failed to extract YouTube ID from intro URL:", introVideoUrl);
      }
      return id;
    }

    if (videoType === "youtube") {
      const url = selectedLesson.youtubeUrl || selectedLesson.videoUrl;
      return url ? extractYoutubeVideoId(url) : null;
    }

    if (videoType === "drive") {
      const url = selectedLesson.videoUrl || selectedLesson.youtubeUrl;
      return url ? extractDriveFileId(url) : null;
    }

    return null;
  }, [selectedLesson?.youtubeUrl, selectedLesson?.videoUrl, videoType, introVideoUrl]);

  const displayTitle = selectedLesson?.title || "Video giới thiệu";
  const displayDuration = selectedLesson?.durationLabel || totalDurationText;

  useEffect(() => {
    const stopTrackingProgress = () => {
      if (trackingIntervalRef.current) {
        clearInterval(trackingIntervalRef.current);
        trackingIntervalRef.current = null;
      }
    };

    const teardownPlayer = () => {
      stopTrackingProgress();
      if (playerRef.current && typeof playerRef.current.destroy === 'function') {
        try {
          playerRef.current.destroy();
        } catch (error) {
          console.warn("YT destroy error", error);
        }
      }
      playerRef.current = null;

      if (playerHostRef.current) {
        if (playerHostRef.current.parentNode) {
          playerHostRef.current.parentNode.removeChild(playerHostRef.current);
        }
        playerHostRef.current = null;
      }

      if (playerContainerRef.current) {
        playerContainerRef.current.textContent = '';
      }
    };

    if (!videoId || videoType !== "youtube") {
      teardownPlayer();
      return;
    }

    const loadYouTubeAPI = () => {
      if (window.YT?.Player) {
        initializePlayer();
      } else {
        const previousReady = window.onYouTubeIframeAPIReady;
        window.onYouTubeIframeAPIReady = () => {
          previousReady?.();
          initializePlayer();
        };
        if (!document.getElementById('youtube-iframe-api')) {
          const tag = document.createElement('script');
          tag.id = 'youtube-iframe-api';
          tag.src = 'https://www.youtube.com/iframe_api';
          const firstScriptTag = document.getElementsByTagName('script')[0];
          if (firstScriptTag?.parentNode) {
            firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
          } else {
            document.body.appendChild(tag);
          }
        }
      }
    };

    const initializePlayer = () => {
      if (!playerContainerRef.current) return;

      teardownPlayer();

      const mountNode = document.createElement('div');
      mountNode.className = 'h-full w-full';
      playerContainerRef.current.appendChild(mountNode);
      playerHostRef.current = mountNode;

      playerRef.current = new window.YT.Player(mountNode, {
        height: '100%',
        width: '100%',
        videoId: videoId,
        playerVars: {
          modestbranding: 1,
          controls: 1,
          showinfo: 0,
          rel: 0,
          fs: 1,
          iv_load_policy: 3,
          autoplay: 0,
          disablekb: 0,
        },
        events: {
          onReady: (event: any) => {
            event.target.setSize('100%', '100%');
            // Get video duration
            const duration = event.target.getDuration();
            setTotalDuration(duration);
            // Start tracking watch time
            if (trackingIntervalRef.current) {
              clearInterval(trackingIntervalRef.current);
            }
            trackingIntervalRef.current = setInterval(() => {
              const currentTime = event.target.getCurrentTime();
              setWatchedSeconds(Math.floor(currentTime));
            }, 1000);
          },
          onStateChange: (event: any) => {
            if (event.data === window.YT.PlayerState.PLAYING) {
              // Recording view with watch time when playing
              if (selectedLesson && student && courseId) {
                recordLessonView({
                  studentId: student._id,
                  lessonId: selectedLesson.id as any,
                  courseId: courseId as any,
                  watchTimeSeconds: Math.floor(event.target.getCurrentTime()),
                }).catch(err => console.log("Recording view:", err));
              }
            } else if (event.data === window.YT.PlayerState.ENDED) {
              // Auto-complete lesson when video ends
              if (selectedLesson && student && courseId) {
                completeLessonIfDone({
                  studentId: student._id,
                  lessonId: selectedLesson.id as any,
                }).catch(err => console.log("Completing lesson:", err));
              }
            }
          },
        },
      });

      const iframe = playerContainerRef.current?.querySelector('iframe');
      if (iframe) {
        iframe.style.display = 'block';
        iframe.setAttribute('allowfullscreen', 'true');
        const allowAttr = iframe.getAttribute('allow');
        iframe.setAttribute('allow', allowAttr ? `${allowAttr}; fullscreen` : 'fullscreen');
      }
    };

    loadYouTubeAPI();

    return () => {
      teardownPlayer();
    };
  }, [videoId, videoType, selectedLesson?.id, student?._id, courseId, recordLessonView, completeLessonIfDone]);

  // Handle "No video" type - show content/exercise info only
  if (videoType === "none") {
    if (thumbnail?.url) {
      return (
        <Card className="overflow-hidden py-0">
          <div className="relative aspect-video bg-gradient-to-br from-slate-900 to-slate-800 flex flex-col items-center justify-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={thumbnail.url} alt={thumbnail.title ?? "Ảnh khóa học"} className="h-full w-full object-cover" />
            <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center text-white">
              <AlertCircle className="mb-2 h-8 w-8" />
              <p className="text-sm font-medium">Bài học này không có video</p>
              <p className="text-xs text-white/80">Vui lòng xem nội dung và hoàn thành bài tập bên dưới</p>
            </div>
          </div>
        </Card>
      );
    }

    return (
      <Card className="overflow-hidden py-0">
        <div className="relative aspect-video bg-gradient-to-br from-slate-900 to-slate-800 flex flex-col items-center justify-center text-white/75">
          <AlertCircle className="mb-4 h-10 w-10" />
          <p className="text-sm font-medium">Bài học này không có video</p>
          <p className="text-xs text-white/60 mt-1">Hãy tập trung vào nội dung bài học và bài tập</p>
        </div>
      </Card>
    );
  }

  // Handle Google Drive video
  if (videoType === "drive" && videoId) {
    const driveUrl = selectedLesson?.videoUrl || selectedLesson?.youtubeUrl;
    const embedUrl = driveUrl ? convertDriveUrlToEmbed(driveUrl) : "";

    if (!embedUrl) {
      return (
        <Card className="overflow-hidden py-0">
          <div className="relative aspect-video bg-gradient-to-br from-slate-900 to-slate-800 flex flex-col items-center justify-center text-white/75">
            <AlertCircle className="mb-4 h-10 w-10" />
            <p className="text-sm">Google Drive URL không hợp lệ</p>
          </div>
        </Card>
      );
    }

    return (
      <Card className="overflow-hidden py-0">
        <iframe
          src={embedUrl}
          width="100%"
          height="100%"
          allow="autoplay"
          allowFullScreen
          className="aspect-video"
          title={displayTitle}
        />
      </Card>
    );
  }

  // Handle missing video
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

  // Handle YouTube video
  return (
    <Card className="overflow-hidden py-0">
      <div
        ref={playerContainerRef}
        className="relative aspect-video bg-black overflow-hidden"
      >
        <div
          className="w-full h-full"
          id="youtube-player"
        />
      </div>

      {/* Progress Bar */}
      {selectedLesson && totalDuration > 0 && (
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="text-sm font-medium text-gray-700">
                Tiến độ: {Math.round((watchedSeconds / totalDuration) * 100)}%
              </div>
              {isCompleted && (
                <div className="flex items-center gap-1 text-green-600">
                  <CheckCircle2 className="w-4 h-4" />
                  <span className="text-xs font-medium">Hoàn thành</span>
                </div>
              )}
            </div>
            <div className="text-xs text-gray-500">
              {Math.floor(watchedSeconds / 60)}:{String(watchedSeconds % 60).padStart(2, '0')} / {Math.floor(totalDuration / 60)}:{String(Math.floor(totalDuration) % 60).padStart(2, '0')}
            </div>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
            <div
              className="bg-gradient-to-r from-blue-500 to-blue-600 h-full transition-all duration-200"
              style={{ width: `${Math.min((watchedSeconds / totalDuration) * 100, 100)}%` }}
            />
          </div>
        </div>
      )}
    </Card>
  );
}
