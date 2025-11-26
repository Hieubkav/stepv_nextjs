"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@dohy/backend/convex/_generated/api";
import { Play, Pause, ShieldAlert, Zap, ChevronLeft, ChevronRight, Maximize2, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import type { MediaDoc, ProjectDetail } from "./types";

type ProjectDetailViewProps = {
  slug: string;
  initialDetail?: ProjectDetail | null | undefined;
};

function DetailSkeleton() {
  return (
    <div className="space-y-8">
      <div className="flex items-center gap-3 text-white/80">
        <Skeleton className="h-10 w-10 rounded-full" />
        <Skeleton className="h-5 w-48 rounded-full" />
      </div>
      <Skeleton className="h-72 w-full rounded-2xl" />
      <div className="grid gap-6 lg:grid-cols-[1.1fr,0.9fr]">
        <Skeleton className="h-64 w-full rounded-2xl" />
        <Skeleton className="h-64 w-full rounded-2xl" />
      </div>
    </div>
  );
}

export default function ProjectDetailView({ slug, initialDetail }: ProjectDetailViewProps) {
  const detailQuery = useQuery(api.projects.getProjectDetail, {
    slug,
    includeInactive: false,
  }) as ProjectDetail | null | undefined;
  const media = useQuery(api.media.list, {}) as MediaDoc[] | undefined;

  const [detail, setDetail] = useState<ProjectDetail | null | undefined>(initialDetail);
  const [lightbox, setLightbox] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const videoShellRef = useRef<HTMLDivElement | null>(null);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (initialDetail !== undefined) {
      setDetail(initialDetail);
    }
  }, [initialDetail]);

  useEffect(() => {
    if (detailQuery !== undefined) {
      setDetail(detailQuery);
    }
  }, [detailQuery]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);

    video.addEventListener("play", handlePlay);
    video.addEventListener("pause", handlePause);
    video.addEventListener("ended", handlePause);

    return () => {
      video.removeEventListener("play", handlePlay);
      video.removeEventListener("pause", handlePause);
      video.removeEventListener("ended", handlePause);
    };
  }, [detail?.project?._id]);

  const mediaMap = useMemo(() => {
    const map = new Map<string, MediaDoc>();
    (media ?? []).forEach((item) => map.set(String(item._id), item));
    return map;
  }, [media]);

  const toggleVideo = async () => {
    const video = videoRef.current;
    if (!video) return;

    // Tránh AbortError do play promise bị ngắt bởi pause.
    try {
      if (video.paused) {
        await video.play();
      } else {
        video.pause();
      }
    } catch (error) {
      console.warn("Không thể toggle video", error);
    }
  };

  const scrollGallery = (direction: "left" | "right") => {
    const container = scrollRef.current;
    if (!container) return;
    const distance = container.clientWidth / 1.5;
    container.scrollBy({
      left: direction === "left" ? -distance : distance,
      behavior: "smooth",
    });
  };

  const toggleFullscreen = () => {
    const target = videoShellRef.current ?? videoRef.current;
    if (!target) return;

    const doc: Document & {
      webkitExitFullscreen?: () => Promise<void>;
      webkitFullscreenElement?: Element | null;
    } = document;

    const el: HTMLElement & {
      webkitRequestFullscreen?: () => Promise<void>;
    } = target as HTMLElement;

    const isFs = Boolean(document.fullscreenElement || doc.webkitFullscreenElement);

    if (isFs) {
      if (document.exitFullscreen) {
        void document.exitFullscreen();
      } else if (doc.webkitExitFullscreen) {
        void doc.webkitExitFullscreen();
      }
      return;
    }

    if (el.requestFullscreen) {
      void el.requestFullscreen();
    } else if (el.webkitRequestFullscreen) {
      void el.webkitRequestFullscreen();
    }
  };

  if (detail === undefined) {
    return (
      <div className="bg-[#050508] text-white">
        <div className="mx-auto max-w-6xl px-6 pb-14 pt-28 sm:px-10 sm:pt-32">
          <DetailSkeleton />
        </div>
      </div>
    );
  }

  if (detail === null) {
    return (
      <div className="bg-[#050508] text-white">
        <div className="mx-auto max-w-4xl px-6 pb-20 pt-28 text-center sm:px-10 sm:pt-32">
          <div className="mx-auto flex size-16 items-center justify-center rounded-full border border-amber-300/40 bg-amber-300/10">
            <ShieldAlert className="h-7 w-7 text-amber-300" />
          </div>
          <h1 className="mt-6 text-3xl font-semibold text-white">Không tìm thấy dự án</h1>
          <p className="mt-2 text-sm text-white/70">Dự án bạn yêu cầu có thể đã bị ẩn hoặc chưa được xuất bản.</p>
          <Button asChild className="mt-6" variant="outline">
            <a href="/project">Quay lại danh sách</a>
          </Button>
        </div>
      </div>
    );
  }

  const { project, category, images } = detail;
  const thumbnailUrl = project.thumbnailId
    ? mediaMap.get(String(project.thumbnailId))?.url
    : undefined;
  const gallery = images
    .map((img) => mediaMap.get(String(img.mediaId))?.url)
    .filter((url): url is string => Boolean(url));

  const videoUrl = project.videoMediaId
    ? mediaMap.get(String(project.videoMediaId))?.url ||
      mediaMap.get(String(project.videoMediaId))?.externalUrl
    : project.videoUrl;

  const isYouTube =
    typeof videoUrl === "string" &&
    (videoUrl.includes("youtube.com") || videoUrl.includes("youtu.be"));

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-[#050508] text-slate-200 selection:bg-blue-500/30">
      <div className="pointer-events-none fixed left-1/2 top-[-30%] z-0 h-[520px] w-[860px] -translate-x-1/2 rounded-full bg-blue-900/15 blur-[150px]" />
      <div className="pointer-events-none fixed bottom-[-20%] right-[-10%] z-0 h-[420px] w-[520px] rounded-full bg-amber-500/10 blur-[140px]" />

      <main className="relative z-10 container mx-auto max-w-5xl px-4 pb-16 pt-28 sm:px-6 sm:pt-32">
        <div className="mb-8 flex flex-col gap-4">
          <Badge className="w-fit border border-blue-500/30 bg-blue-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.25em] text-blue-300">
            {category?.name ?? "VFX"}
          </Badge>
          <h1 className="text-4xl font-bold leading-tight text-white drop-shadow md:text-5xl">
            {project.title}
          </h1>
        </div>

        <div
          ref={videoShellRef}
          className="relative w-full overflow-hidden rounded-3xl border border-white/10 bg-black shadow-2xl shadow-blue-900/25"
        >
          {videoUrl ? (
            isYouTube ? (
              <div className="relative aspect-video">
                <iframe
                  src={videoUrl.replace("watch?v=", "embed/")}
                  title={project.title}
                  className="h-full w-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
              </div>
            ) : (
              <div className="group relative aspect-video">
                <video
                  ref={videoRef}
                  poster={thumbnailUrl}
                  src={videoUrl}
                  className="h-full w-full object-cover opacity-90 transition-opacity duration-500"
                  playsInline
                  loop
                />

                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent transition-opacity duration-300" />

                <div className="pointer-events-none absolute bottom-0 left-0 right-0 p-4 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                  <div className="flex items-center justify-between">
                    <Button
                      size="icon"
                      variant="ghost"
                      className="pointer-events-auto h-11 w-11 rounded-full border border-white/10 bg-black/40 text-white hover:bg-white/15"
                      onClick={toggleVideo}
                    >
                      {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="pointer-events-auto h-11 w-11 rounded-full border border-white/10 bg-black/40 text-white hover:bg-white/15"
                      onClick={toggleFullscreen}
                    >
                      <Maximize2 className="h-5 w-5" />
                    </Button>
                  </div>
                </div>
              </div>
            )
          ) : (
            <div className="relative aspect-video bg-gradient-to-b from-slate-900 to-black">
              {thumbnailUrl ? (
                <img
                  src={thumbnailUrl}
                  alt={project.title}
                  className="h-full w-full object-cover"
                  loading="lazy"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-sm text-slate-400">
                  Chưa có nội dung media
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/30 to-transparent" />
            </div>
          )}
        </div>

        <section className="mt-12 space-y-6 max-w-4xl">
          <div className="flex items-center gap-3">
            <span className="h-6 w-1 rounded-full bg-blue-500" />
            <h2 className="text-xl font-semibold text-white">Mô tả chi tiết</h2>
          </div>
          <div className="prose prose-invert prose-lg max-w-none leading-relaxed text-slate-300">
            {project.content ? (
              <div dangerouslySetInnerHTML={{ __html: project.content }} />
            ) : (
              <p className="text-slate-400">Đang cập nhật nội dung.</p>
            )}
          </div>
        </section>

        <section className="mt-16 space-y-6">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <Zap className="h-6 w-6 text-yellow-400" />
              <h3 className="text-2xl font-bold text-white">Thư viện ảnh</h3>
            </div>
            {gallery.length > 0 ? (
              <div className="flex gap-2">
                <Button
                  size="icon"
                  variant="outline"
                  className="rounded-full border-white/15 bg-white/5 text-white hover:bg-white/10"
                  onClick={() => scrollGallery("left")}
                >
                  <ChevronLeft className="h-5 w-5" />
                </Button>
                <Button
                  size="icon"
                  variant="outline"
                  className="rounded-full border-white/15 bg-white/5 text-white hover:bg-white/10"
                  onClick={() => scrollGallery("right")}
                >
                  <ChevronRight className="h-5 w-5" />
                </Button>
              </div>
            ) : null}
          </div>

          {gallery.length === 0 ? (
            <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-slate-400">
              Chưa có ảnh minh họa.
            </div>
          ) : (
            <div
              ref={scrollRef}
              className="flex gap-6 overflow-x-auto pb-6 pt-2"
              style={{ scrollBehavior: "smooth" }}
            >
              {gallery.map((url, index) => (
                <button
                  key={`${url}-${index}`}
                  type="button"
                  onClick={() => setLightbox(url)}
                  className="group relative min-w-[85%] snap-center overflow-hidden rounded-2xl border border-white/10 bg-slate-900/60 shadow-lg shadow-blue-900/20 transition-transform duration-500 hover:-translate-y-1 md:min-w-[45%] lg:min-w-[30%]"
                  aria-label={`Xem ảnh ${index + 1}`}
                >
                  <img
                    src={url}
                    alt={`${project.title} - ${index + 1}`}
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                  <div className="absolute inset-0 flex items-end p-5">
                    <p className="translate-y-4 text-base font-semibold text-white opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
                      Ảnh {index + 1}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </section>
      </main>

      {lightbox ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 px-4 py-10 backdrop-blur-md">
          <button
            type="button"
            className="absolute right-6 top-6 rounded-full bg-white/10 p-2 text-white transition hover:bg-white/20"
            onClick={() => setLightbox(null)}
            aria-label="Đóng ảnh"
          >
            <X className="h-6 w-6" />
          </button>
          <img
            src={lightbox}
            alt="Xem toàn màn hình"
            className="max-h-[85vh] max-w-full rounded-2xl shadow-[0_0_60px_rgba(59,130,246,0.35)]"
          />
        </div>
      ) : null}
    </div>
  );
}
