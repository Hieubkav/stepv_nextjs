"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useMutation, useQuery } from "convex/react";
import { useRouter } from "next/navigation";
import { api } from "@dohy/backend/convex/_generated/api";
import {
  ArrowLeft,
  Calendar,
  User,
  Eye,
  Clock,
  Share2,
  ExternalLink,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import type { PostDetail, PostWithThumbnail } from "./types";

type PostDetailViewProps = {
  slug: string;
  initialDetail?: PostDetail | null | undefined;
};

function DetailSkeleton() {
  return (
    <div className="space-y-8">
      <Skeleton className="h-8 w-3/4 bg-slate-800/70" />
      <Skeleton className="h-4 w-1/2 bg-slate-800/70" />
      <Skeleton className="aspect-video w-full rounded-2xl bg-slate-800/70" />
      <div className="space-y-4">
        <Skeleton className="h-4 w-full bg-slate-800/70" />
        <Skeleton className="h-4 w-full bg-slate-800/70" />
        <Skeleton className="h-4 w-5/6 bg-slate-800/70" />
        <Skeleton className="h-4 w-full bg-slate-800/70" />
        <Skeleton className="h-4 w-4/5 bg-slate-800/70" />
      </div>
    </div>
  );
}

function estimateReadingTime(html: string): number {
  const text = html.replace(/<[^>]*>/g, "");
  const words = text.split(/\s+/).filter((w) => w.length > 0).length;
  return Math.max(1, Math.ceil(words / 200));
}

export default function PostDetailView({ slug, initialDetail }: PostDetailViewProps) {
  const detailQuery = useQuery(api.posts.getPostDetail, {
    slug,
    includeInactive: false,
  }) as PostDetail | null | undefined;

  const router = useRouter();
  const incrementViewCount = useMutation(api.posts.incrementViewCount);

  const [detail, setDetail] = useState<PostDetail | null | undefined>(initialDetail);
  const [headerOffset, setHeaderOffset] = useState(110);
  const [viewIncremented, setViewIncremented] = useState(false);

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

  // Increment view count once
  useEffect(() => {
    if (detail?.post?._id && !viewIncremented) {
      incrementViewCount({ id: detail.post._id as any });
      setViewIncremented(true);
    }
  }, [detail?.post?._id, incrementViewCount, viewIncremented]);

  useEffect(() => {
    const updateOffset = () => {
      const header = document.getElementById("site-header");
      const height = header?.getBoundingClientRect().height ?? 0;
      const padding = height > 0 ? height + 8 : 110;
      setHeaderOffset((prev) => (Math.abs(prev - padding) > 0.5 ? padding : prev));
    };

    updateOffset();
    window.addEventListener("resize", updateOffset);

    const observer = typeof ResizeObserver !== "undefined" ? new ResizeObserver(updateOffset) : null;
    const header = document.getElementById("site-header");
    if (observer && header) observer.observe(header);

    return () => {
      window.removeEventListener("resize", updateOffset);
      observer?.disconnect();
    };
  }, []);

  // Get related posts
  const relatedPosts = useQuery(
    api.posts.getRelatedPosts,
    detail?.post?._id ? { postId: detail.post._id as any, limit: 4 } : "skip"
  ) as PostWithThumbnail[] | undefined;

  if (detail === undefined) {
    return (
      <div className="bg-[#030712] text-white min-h-screen" style={{ paddingTop: headerOffset }}>
        <div className="mx-auto max-w-4xl px-6 py-16">
          <DetailSkeleton />
        </div>
      </div>
    );
  }

  if (detail === null) {
    return (
      <div className="bg-[#030712] text-white min-h-screen" style={{ paddingTop: headerOffset }}>
        <div className="mx-auto max-w-3xl px-6 py-24 text-center">
          <div className="mx-auto flex size-16 items-center justify-center rounded-full border border-amber-500/30 bg-amber-500/10">
            <span className="text-3xl">📄</span>
          </div>
          <h1 className="mt-6 text-3xl font-semibold text-white">Không tìm thấy bài viết</h1>
          <p className="mt-2 text-sm text-white/65">
            Bài viết bạn yêu cầu có thể đã bị ẩn hoặc chưa được xuất bản.
          </p>
          <Button
            variant="outline"
            className="mt-6"
            onClick={() => router.push("/bai-viet")}
          >
            Quay lại danh sách
          </Button>
        </div>
      </div>
    );
  }

  const { post, thumbnailUrl } = detail;
  const publishedDate = post.publishedAt
    ? new Date(post.publishedAt).toLocaleDateString("vi-VN", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : new Date(post.createdAt).toLocaleDateString("vi-VN", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
  const readingTime = estimateReadingTime(post.content);

  function handleShare() {
    if (navigator.share) {
      navigator.share({
        title: post.title,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
    }
  }

  return (
    <div
      className="min-h-screen bg-[#030712] text-slate-200 pb-20 selection:bg-amber-500/30 selection:text-amber-200"
      style={{ paddingTop: headerOffset }}
    >
      {/* Ambient glows */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] bg-blue-900/10 blur-[120px] rounded-full mix-blend-screen" />
        <div className="absolute top-[20%] -right-[10%] w-[40%] h-[40%] bg-amber-900/8 blur-[110px] rounded-full mix-blend-screen" />
      </div>

      <header className="relative z-10 max-w-4xl mx-auto px-4 sm:px-8 pt-8 pb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full hover:bg-slate-800 text-slate-400 hover:text-white"
            onClick={() => router.push("/bai-viet")}
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <span
            className="hidden sm:inline text-sm font-medium text-slate-500 hover:text-slate-200 cursor-pointer"
            onClick={() => router.push("/bai-viet")}
          >
            Quay lại danh sách
          </span>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="rounded-full hover:bg-slate-800 text-slate-400 hover:text-white"
          onClick={handleShare}
          title="Chia sẻ"
        >
          <Share2 className="w-5 h-5" />
        </Button>
      </header>

      <main className="relative z-10 max-w-4xl mx-auto px-4 sm:px-8">
        {/* Article header */}
        <article className="space-y-8">
          <header className="space-y-4">
            {/* Title */}
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-serif font-bold text-white leading-tight">
              {post.title}
            </h1>

            {/* Meta info */}
            <div className="flex flex-wrap items-center gap-4 text-sm text-slate-400">
              <div className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4" />
                <span>{publishedDate}</span>
              </div>
              {post.author && (
                <div className="flex items-center gap-1.5">
                  <User className="w-4 h-4" />
                  <span>{post.author}</span>
                </div>
              )}
              <div className="flex items-center gap-1.5">
                <Clock className="w-4 h-4" />
                <span>{readingTime} phút đọc</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Eye className="w-4 h-4" />
                <span>{post.viewCount ?? 0} lượt xem</span>
              </div>
            </div>
          </header>

          {/* Featured image */}
          {thumbnailUrl && (
            <div className="rounded-2xl overflow-hidden border border-slate-800/70 shadow-[0_20px_60px_rgba(0,0,0,0.5)]">
              <img
                src={thumbnailUrl}
                alt={post.title}
                className="w-full aspect-video object-cover"
              />
            </div>
          )}

          {/* Content */}
          <div
            className="prose prose-lg prose-invert max-w-none
              prose-headings:font-serif prose-headings:text-white prose-headings:font-bold
              prose-h2:text-2xl prose-h2:mt-12 prose-h2:mb-4
              prose-h3:text-xl prose-h3:mt-8 prose-h3:mb-3
              prose-p:text-slate-300 prose-p:leading-relaxed
              prose-a:text-amber-400 prose-a:no-underline hover:prose-a:underline
              prose-strong:text-white
              prose-blockquote:border-l-amber-500/50 prose-blockquote:text-slate-400 prose-blockquote:italic
              prose-code:text-amber-300 prose-code:bg-slate-800/50 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded
              prose-pre:bg-slate-900/80 prose-pre:border prose-pre:border-slate-800
              prose-img:rounded-xl prose-img:border prose-img:border-slate-800
              prose-ul:text-slate-300 prose-ol:text-slate-300
              prose-li:marker:text-amber-500/70"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />
        </article>

        {/* Related posts */}
        {relatedPosts && relatedPosts.length > 0 && (
          <section className="mt-16">
            <h2 className="text-2xl font-serif font-bold text-white mb-6">Bài viết liên quan</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {relatedPosts.map((relatedPost) => (
                <Link
                  key={String(relatedPost._id)}
                  href={`/bai-viet/${relatedPost.slug}`}
                  className="group flex gap-4 p-4 rounded-xl border border-slate-800 bg-slate-900/30 hover:border-amber-500/40 transition-all"
                >
                  <div className="w-24 h-16 flex-shrink-0 rounded-lg overflow-hidden bg-slate-800">
                    {relatedPost.thumbnailUrl ? (
                      <img
                        src={relatedPost.thumbnailUrl}
                        alt={relatedPost.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-600">
                        📄
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-medium text-white line-clamp-2 group-hover:text-amber-300 transition-colors">
                      {relatedPost.title}
                    </h3>
                    <p className="text-xs text-slate-500 mt-1">
                      {relatedPost.viewCount ?? 0} lượt xem
                    </p>
                  </div>
                  <ExternalLink className="w-4 h-4 text-slate-600 group-hover:text-amber-400 flex-shrink-0" />
                </Link>
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
