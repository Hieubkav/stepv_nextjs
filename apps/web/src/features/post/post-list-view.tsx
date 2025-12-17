"use client";

import Link from "next/link";
import type { Route } from "next";
import { useEffect, useMemo, useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@dohy/backend/convex/_generated/api";
import { Search, Calendar, User, Eye } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn, stripHtml } from "@/lib/utils";
import type { PostWithThumbnail } from "./types";

const sortOptions = [
  { label: "Mới nhất", value: "latest" },
  { label: "Cũ nhất", value: "oldest" },
  { label: "Xem nhiều", value: "popular" },
  { label: "Theo tên (A-Z)", value: "alphabetical" },
] as const;

type SortOption = (typeof sortOptions)[number]["value"];

function normalizeText(value: unknown) {
  return typeof value === "string" ? value.normalize("NFC").toLowerCase() : "";
}

type PostCardProps = {
  post: PostWithThumbnail;
};

function PostCard({ post }: PostCardProps) {
  const detailHref = `/bai-viet/${post.slug}` as Route;
  const publishedDate = post.publishedAt
    ? new Date(post.publishedAt).toLocaleDateString("vi-VN")
    : new Date(post.createdAt).toLocaleDateString("vi-VN");

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-xl border border-slate-800/70 bg-[#050914] shadow-[0_20px_60px_rgba(0,0,0,0.5)] transition-all duration-300 hover:-translate-y-1 hover:border-amber-400/70 hover:shadow-[0_25px_80px_rgba(255,191,0,0.16)]">
      <div className="relative aspect-video overflow-hidden bg-[#0a1424]">
        {post.thumbnailUrl ? (
          <img
            src={post.thumbnailUrl}
            alt={post.title}
            className="h-full w-full object-cover transition duration-700 group-hover:scale-105 group-hover:brightness-110"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-xs uppercase tracking-[0.35em] text-amber-200/70">
            Chưa có ảnh
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-3 p-4 text-slate-100">
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <Calendar className="size-3.5" />
          <span>{publishedDate}</span>
          {post.author && (
            <>
              <span className="text-slate-700">•</span>
              <User className="size-3.5" />
              <span>{post.author}</span>
            </>
          )}
        </div>

        <div className="space-y-2">
          <h3 className="line-clamp-2 text-base font-semibold leading-tight text-white transition-colors duration-300 group-hover:text-amber-300">
            {post.title}
          </h3>
          {post.excerpt ? (
            <p className="line-clamp-3 text-xs text-slate-400">{stripHtml(post.excerpt)}</p>
          ) : null}
        </div>

        {post.tags && post.tags.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {post.tags.slice(0, 3).map((tag) => (
              <Badge
                key={tag}
                variant="outline"
                className="rounded-full border-slate-700 bg-slate-900/50 text-[10px] text-slate-400"
              >
                {tag}
              </Badge>
            ))}
            {post.tags.length > 3 ? (
              <Badge variant="outline" className="rounded-full border-slate-700 bg-slate-900/50 text-[10px] text-slate-400">
                +{post.tags.length - 3}
              </Badge>
            ) : null}
          </div>
        ) : null}

        <div className="mt-auto flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-1">
            <Eye className="size-3.5" />
            <span>{post.viewCount ?? 0} lượt xem</span>
          </div>
        </div>
      </div>

      <div className="border-t border-slate-800/70 bg-[#081120] px-4 py-3">
        <Link
          href={detailHref}
          className="block rounded-lg bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-300 px-3 py-2.5 text-center text-sm font-semibold text-black transition-all duration-200 hover:translate-y-[-1px] hover:shadow-[0_18px_40px_rgba(255,193,7,0.35)] active:opacity-95"
        >
          Đọc tiếp
        </Link>
      </div>
    </article>
  );
}

function PostCardSkeleton() {
  return (
    <div className="flex h-full flex-col overflow-hidden rounded-xl border border-slate-800/70 bg-[#050914] shadow-[0_20px_60px_rgba(0,0,0,0.45)]">
      <Skeleton className="aspect-video w-full rounded-none bg-slate-800/70" />
      <div className="flex flex-1 flex-col gap-3 p-4">
        <Skeleton className="h-3 w-1/3 rounded-md bg-slate-800/70" />
        <Skeleton className="h-5 w-2/3 rounded-md bg-slate-800/70" />
        <Skeleton className="h-3 w-full rounded-md bg-slate-800/70" />
        <Skeleton className="h-3 w-4/5 rounded-md bg-slate-800/70" />
        <Skeleton className="mt-auto h-4 w-1/4 rounded-md bg-slate-800/70" />
      </div>
      <div className="h-[52px] border-t border-slate-800/70 bg-[#081120]" />
    </div>
  );
}

type PostListViewState = {
  sortBy: SortOption;
  searchTerm: string;
  selectedTag: string;
};

const initialState: PostListViewState = {
  sortBy: "latest",
  searchTerm: "",
  selectedTag: "all",
};

export default function PostListView() {
  const [state, setState] = useState<PostListViewState>(initialState);
  const [headerOffset, setHeaderOffset] = useState(120);

  const posts = useQuery(api.posts.listPostsWithThumbnail, { activeOnly: true }) as PostWithThumbnail[] | undefined;

  useEffect(() => {
    const updateOffset = () => {
      const header = document.getElementById("site-header");
      const height = header?.getBoundingClientRect().height ?? 0;
      const padding = height > 0 ? height + 16 : 120;
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

  // Extract all unique tags
  const allTags = useMemo(() => {
    if (!posts) return [];
    const tagSet = new Set<string>();
    for (const post of posts) {
      for (const tag of post.tags ?? []) {
        tagSet.add(tag);
      }
    }
    return Array.from(tagSet).sort();
  }, [posts]);

  const filteredPosts = useMemo(() => {
    if (!posts) return [] as PostWithThumbnail[];

    const query = normalizeText(state.searchTerm);
    const items = posts
      .filter((post) => {
        if (state.selectedTag !== "all") {
          if (!post.tags?.includes(state.selectedTag)) return false;
        }
        if (!query) return true;
        const haystack = [post.title, post.excerpt ?? "", post.slug, ...(post.tags ?? [])];
        return haystack.some((text) => normalizeText(text).includes(query));
      })
      .slice();

    items.sort((a, b) => {
      switch (state.sortBy) {
        case "latest":
          return (b.publishedAt ?? b.createdAt) - (a.publishedAt ?? a.createdAt);
        case "oldest":
          return (a.publishedAt ?? a.createdAt) - (b.publishedAt ?? b.createdAt);
        case "popular":
          return (b.viewCount ?? 0) - (a.viewCount ?? 0);
        case "alphabetical":
          return a.title.localeCompare(b.title, "vi");
        default:
          return 0;
      }
    });

    return items;
  }, [posts, state.searchTerm, state.selectedTag, state.sortBy]);

  const isLoading = posts === undefined;

  return (
    <main
      className="relative min-h-screen overflow-hidden bg-[#030712] pb-12 text-slate-50 selection:bg-amber-500/25 selection:text-amber-100"
      style={{ paddingTop: headerOffset }}
    >
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-24 -top-32 h-72 w-72 rounded-full bg-sky-500/10 blur-[140px]" />
        <div className="absolute right-[-22%] top-6 h-80 w-80 rounded-full bg-amber-500/10 blur-[150px]" />
        <div className="absolute left-1/3 bottom-[-30%] h-96 w-96 rounded-full bg-indigo-600/8 blur-[200px]" />
      </div>
      <div className="relative mx-auto max-w-7xl px-4 md:px-6">
        <div className="mb-10">
          <div className="mb-6 space-y-3">
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-200 bg-clip-text text-transparent tracking-tight drop-shadow-[0_0_18px_rgba(255,193,7,0.35)]">
              Bài viết
            </h1>
            <p className="text-slate-400 max-w-2xl">
              Khám phá các bài viết, hướng dẫn và chia sẻ kinh nghiệm từ DOHY Media
            </p>
          </div>

          <section className="rounded-xl border border-slate-800/70 bg-[#050914]/90 p-4 shadow-[0_22px_60px_rgba(0,0,0,0.55)]">
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex min-w-[240px] flex-1 items-center gap-2 rounded-lg border border-slate-800/70 bg-[#0a1220] px-4 py-2.5 shadow-inner shadow-black/40">
                <Search className="size-4 text-amber-300/90" />
                <input
                  value={state.searchTerm}
                  onChange={(event) => setState((prev) => ({ ...prev, searchTerm: event.target.value }))}
                  placeholder="Tìm bài viết..."
                  className="w-full min-w-0 bg-transparent text-sm text-white outline-none placeholder:text-slate-400"
                />
              </div>

              <label className="flex items-center gap-2 rounded-lg border border-slate-800/70 bg-[#0a1220] px-4 py-2.5 md:shrink-0 text-white">
                <span className="whitespace-nowrap text-sm font-semibold text-slate-200/80">Sắp xếp</span>
                <select
                  value={state.sortBy}
                  onChange={(event) => setState((prev) => ({ ...prev, sortBy: event.target.value as SortOption }))}
                  className="bg-transparent text-sm text-white outline-none"
                >
                  {sortOptions.map((option) => (
                    <option key={option.value} value={option.value} className="bg-[#050914] text-white">
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>

              {allTags.length > 0 && (
                <label className="flex items-center gap-2 rounded-lg border border-slate-800/70 bg-[#0a1220] px-4 py-2.5 md:shrink-0 text-white">
                  <span className="whitespace-nowrap text-sm font-semibold text-slate-200/80">Tag</span>
                  <select
                    value={state.selectedTag}
                    onChange={(event) => setState((prev) => ({ ...prev, selectedTag: event.target.value }))}
                    className="bg-transparent text-sm text-white outline-none"
                  >
                    <option value="all" className="bg-[#050914] text-white">
                      Tất cả
                    </option>
                    {allTags.map((tag) => (
                      <option key={tag} value={tag} className="bg-[#050914] text-white">
                        {tag}
                      </option>
                    ))}
                  </select>
                </label>
              )}
            </div>
          </section>
        </div>

        {filteredPosts.length === 0 && !isLoading ? (
          <div className="rounded-xl border border-dashed border-slate-800/60 bg-[#050914]/80 px-6 py-16 text-center shadow-[0_20px_60px_rgba(0,0,0,0.55)]">
            <div className="space-y-3">
              <div className="text-5xl">📝</div>
              <p className="text-lg font-semibold text-white">Không tìm thấy bài viết</p>
              <p className="text-sm text-amber-100/80">
                Hãy thử thay đổi bộ lọc hoặc từ khóa tìm kiếm.
              </p>
              <div className="mt-4 flex justify-center">
                <Button
                  variant="outline"
                  className="rounded-lg border-slate-700 bg-[#0a1220] text-xs font-semibold uppercase tracking-wide text-amber-100 hover:border-amber-400/80 hover:bg-[#0f1b30]"
                  onClick={() => setState(initialState)}
                >
                  Đặt lại bộ lọc
                </Button>
              </div>
            </div>
          </div>
        ) : null}

        <section className="grid grid-cols-1 gap-5 pb-16 sm:grid-cols-2 lg:grid-cols-3">
          {isLoading
            ? Array.from({ length: 6 }).map((_, index) => <PostCardSkeleton key={index} />)
            : filteredPosts.map((post) => <PostCard key={String(post._id)} post={post} />)}
        </section>
      </div>
    </main>
  );
}
