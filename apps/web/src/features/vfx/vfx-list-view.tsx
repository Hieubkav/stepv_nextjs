"use client";

import Link from "next/link";
import type { Route } from "next";
import { useEffect, useMemo, useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@dohy/backend/convex/_generated/api";
import { Search, Play, Gauge } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { formatPrice } from "@/lib/format";
import type { MediaDoc, VfxCategory, VfxProductDoc } from "./types";

const categoryOptions: { label: string; value: VfxCategory | "all" }[] = [
  { label: "Tất cả", value: "all" },
  { label: "Explosion", value: "explosion" },
  { label: "Fire", value: "fire" },
  { label: "Smoke", value: "smoke" },
  { label: "Water", value: "water" },
  { label: "Magic", value: "magic" },
  { label: "Particle", value: "particle" },
  { label: "Transition", value: "transition" },
  { label: "Other", value: "other" },
];

const priceOptions = [
  { label: "Tất cả", value: "all" },
  { label: "Miễn phí", value: "free" },
  { label: "Trả phí", value: "paid" },
] as const;

type PriceFilter = (typeof priceOptions)[number]["value"];

type SortOption = "latest" | "oldest" | "popular" | "priceHigh" | "priceLow";

const sortOptions: { label: string; value: SortOption }[] = [
  { label: "Mới nhất", value: "latest" },
  { label: "Cũ nhất", value: "oldest" },
  { label: "Tải nhiều", value: "popular" },
  { label: "Giá cao", value: "priceHigh" },
  { label: "Giá thấp", value: "priceLow" },
];

function normalizeText(value: unknown) {
  return typeof value === "string" ? value.normalize("NFC").toLowerCase() : "";
}

function formatDuration(seconds: number) {
  if (!Number.isFinite(seconds) || seconds <= 0) return "Đang cập nhật";
  if (seconds < 1) return `${(seconds * 1000).toFixed(0)}ms`;
  if (seconds < 60) return `${seconds.toFixed(1).replace(/\.0$/, "")}s`;
  const mins = Math.round(seconds / 60);
  return `${mins} phút`;
}

type VfxCardProps = {
  product: VfxProductDoc;
  previewUrl?: string | null;
  thumbUrl?: string | null;
};

function VfxCard({ product, previewUrl, thumbUrl }: VfxCardProps) {
  const detailHref = (`/vfx/${product.slug}`) as Route;
  const isFree = product.pricingType === "free";
  const priceLabel = isFree ? "Miễn phí" : formatPrice(product.price ?? 0);
  const compareLabel = !isFree && product.originalPrice && product.originalPrice > (product.price ?? 0)
    ? formatPrice(product.originalPrice)
    : null;
  const specs = [product.resolution, `${product.frameRate}fps`, product.format];

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-slate-800/70 bg-[#050914] shadow-[0_20px_60px_rgba(0,0,0,0.45)] transition-all duration-300 hover:-translate-y-1 hover:border-amber-400/60 hover:shadow-[0_25px_80px_rgba(255,193,7,0.18)]">
      <div className="relative aspect-video overflow-hidden bg-[#0a1424]">
        {previewUrl ? (
          <video
            src={previewUrl}
            className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.02]"
            muted
            loop
            playsInline
            preload="metadata"
          />
        ) : thumbUrl ? (
          <img src={thumbUrl} alt={product.title} className="h-full w-full object-cover" />
        ) : (
          <div className="absolute inset-0 grid place-items-center text-xs uppercase tracking-[0.35em] text-amber-200/70">
            Chưa có preview
          </div>
        )}
        <div className="absolute left-3 top-3 flex gap-2 drop-shadow-[0_10px_25px_rgba(0,0,0,0.35)]">
          <Badge className={cn("border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em]", isFree ? "border-emerald-400/60 bg-emerald-500/15 text-emerald-50" : "border-amber-400/60 bg-amber-500/15 text-amber-50")}>{isFree ? "Free" : "Paid"}</Badge>
          <Badge variant="outline" className="border-amber-400/40 bg-black/30 text-amber-100/90 text-[11px]">
            {product.category}
          </Badge>
        </div>
        <div className="absolute bottom-3 left-3 flex items-center gap-2 rounded-full border border-white/10 bg-black/40 px-3 py-1 text-[11px] text-white backdrop-blur">
          <Play className="h-3.5 w-3.5" />
          <span>{formatDuration(product.duration)}</span>
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-3 p-4 text-slate-100">
        <div className="space-y-2">
          <h3 className="line-clamp-2 text-base font-semibold leading-tight text-white transition-colors duration-300 group-hover:text-amber-300">
            {product.title}
          </h3>
          {product.subtitle ? (
            <p className="line-clamp-2 text-xs text-slate-400">{product.subtitle}</p>
          ) : null}
        </div>

        <div className="flex flex-wrap gap-2 text-[11px] font-semibold text-amber-100">
          {specs.map((spec) => (
            <span key={spec} className="rounded-full border border-amber-500/40 bg-[#0a1424] px-3 py-1">
              {spec}
            </span>
          ))}
          {product.hasAlpha ? (
            <span className="rounded-full border border-emerald-400/50 bg-emerald-500/10 px-3 py-1 text-emerald-50">
              Alpha
            </span>
          ) : null}
        </div>

        <div className="mt-auto flex items-center justify-between">
          <div className="flex items-baseline gap-2">
            <span className="text-sm font-semibold bg-gradient-to-r from-amber-300 via-amber-200 to-yellow-200 bg-clip-text text-transparent drop-shadow-[0_0_18px_rgba(255,193,7,0.25)]">
              {priceLabel}
            </span>
            {compareLabel ? (
              <span className="text-[11px] text-amber-100/70 line-through">{compareLabel}</span>
            ) : null}
          </div>
          <div className="flex items-center gap-2 text-[11px] text-slate-400">
            <Gauge className="h-3.5 w-3.5" />
            {product.downloadCount ?? 0} tải
          </div>
        </div>
      </div>

      <div className="border-t border-slate-800/70 bg-[#081120] px-4 py-3">
        <Link
          href={detailHref}
          className="block rounded-lg bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-300 px-3 py-2.5 text-center text-sm font-semibold text-black transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_18px_40px_rgba(255,193,7,0.35)] active:opacity-95"
        >
          Xem chi tiết
        </Link>
      </div>
    </article>
  );
}

function VfxCardSkeleton() {
  return (
    <div className="flex h-full flex-col overflow-hidden rounded-2xl border border-slate-800/70 bg-[#050914] shadow-[0_20px_60px_rgba(0,0,0,0.45)]">
      <Skeleton className="aspect-video w-full rounded-none bg-slate-800/70" />
      <div className="flex flex-1 flex-col gap-3 p-4">
        <Skeleton className="h-5 w-2/3 rounded-md bg-slate-800/70" />
        <Skeleton className="h-3 w-full rounded-md bg-slate-800/70" />
        <Skeleton className="h-3 w-4/5 rounded-md bg-slate-800/70" />
        <Skeleton className="mt-auto h-4 w-1/3 rounded-md bg-slate-800/70" />
      </div>
      <div className="h-[52px] border-t border-slate-800/70 bg-[#081120]" />
    </div>
  );
}

type VfxListState = {
  search: string;
  category: VfxCategory | "all";
  price: PriceFilter;
  sortBy: SortOption;
};

const initialState: VfxListState = {
  search: "",
  category: "all",
  price: "all",
  sortBy: "latest",
};

export default function VfxListView() {
  const [state, setState] = useState<VfxListState>(initialState);
  const [headerOffset, setHeaderOffset] = useState(120);

  const products = useQuery(api.vfx.listVfxProducts, { activeOnly: true }) as VfxProductDoc[] | undefined;
  const media = useQuery(api.media.list, {}) as MediaDoc[] | undefined;

  const mediaMap = useMemo(() => {
    const map = new Map<string, MediaDoc>();
    if (Array.isArray(media)) {
      for (const item of media) {
        map.set(String(item._id), item);
      }
    }
    return map;
  }, [media]);

  const filtered = useMemo(() => {
    if (!products) return [] as VfxProductDoc[];
    const keyword = normalizeText(state.search);

    const list = products.filter((product) => {
      if (state.category !== "all" && product.category !== state.category) return false;
      if (state.price !== "all" && product.pricingType !== state.price) return false;
      if (!keyword) return true;
      const target = [product.title, product.subtitle ?? "", product.description ?? "", product.tags?.join(" ") ?? ""];
      return target.some((t) => normalizeText(t).includes(keyword));
    });

    const sorted = [...list];
    sorted.sort((a, b) => {
      switch (state.sortBy) {
        case "latest":
          return b.createdAt - a.createdAt;
        case "oldest":
          return a.createdAt - b.createdAt;
        case "popular":
          return (b.downloadCount ?? 0) - (a.downloadCount ?? 0);
        case "priceHigh": {
          const aPrice = a.pricingType === "paid" && typeof a.price === "number" ? a.price : 0;
          const bPrice = b.pricingType === "paid" && typeof b.price === "number" ? b.price : 0;
          return bPrice - aPrice;
        }
        case "priceLow": {
          const aPrice = a.pricingType === "paid" && typeof a.price === "number" ? a.price : Number.MAX_SAFE_INTEGER;
          const bPrice = b.pricingType === "paid" && typeof b.price === "number" ? b.price : Number.MAX_SAFE_INTEGER;
          return aPrice - bPrice;
        }
        default:
          return 0;
      }
    });

    return sorted;
  }, [products, state.category, state.price, state.search, state.sortBy]);

  const isLoading = products === undefined;

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

  return (
    <main
      className="relative min-h-screen overflow-hidden bg-[#030712] pb-12 text-slate-50 selection:bg-amber-500/25 selection:text-amber-100"
      style={{ paddingTop: headerOffset }}
    >
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-24 -top-28 h-72 w-72 rounded-full bg-sky-500/10 blur-[140px]" />
        <div className="absolute right-[-20%] top-4 h-80 w-80 rounded-full bg-amber-500/10 blur-[150px]" />
        <div className="absolute left-1/3 bottom-[-28%] h-96 w-96 rounded-full bg-indigo-600/8 blur-[190px]" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 md:px-6">
        <div className="mb-10 space-y-4">
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-500">VFX STORE</p>
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-200 bg-clip-text text-transparent tracking-tight drop-shadow-[0_0_18px_rgba(255,193,7,0.35)]">
              Hiệu ứng VFX
            </h1>
            <p className="text-sm text-slate-400 max-w-2xl">
              Kho hiệu ứng ngắn 1-5s, sẵn sàng drag-and-drop cho dự án quảng cáo, motion hay game. Tham khảo preview và tải ngay.
            </p>
          </div>

          <section className="rounded-xl border border-slate-800/70 bg-[#050914]/90 p-4 shadow-[0_22px_60px_rgba(0,0,0,0.55)]">
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex min-w-[240px] flex-1 items-center gap-2 rounded-lg border border-slate-800/70 bg-[#0a1220] px-4 py-2.5 shadow-inner shadow-black/40">
                <Search className="size-4 text-amber-300/90" />
                <input
                  value={state.search}
                  onChange={(event) => setState((prev) => ({ ...prev, search: event.target.value }))}
                  placeholder="Tìm VFX..."
                  className="w-full min-w-0 bg-transparent text-sm text-white outline-none placeholder:text-slate-400"
                />
              </div>

              <label className="flex items-center gap-2 rounded-lg border border-slate-800/70 bg-[#0a1220] px-4 py-2.5 md:shrink-0 text-white">
                <span className="whitespace-nowrap text-sm font-semibold text-slate-200/80">Danh mục</span>
                <select
                  value={state.category}
                  onChange={(event) => setState((prev) => ({ ...prev, category: event.target.value as VfxCategory | "all" }))}
                  className="bg-transparent text-sm text-white outline-none"
                >
                  {categoryOptions.map((option) => (
                    <option key={option.value} value={option.value} className="bg-[#050914] text-white">
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>

              <label className="flex items-center gap-2 rounded-lg border border-slate-800/70 bg-[#0a1220] px-4 py-2.5 md:shrink-0 text-white">
                <span className="whitespace-nowrap text-sm font-semibold text-slate-200/80">Giá</span>
                <select
                  value={state.price}
                  onChange={(event) => setState((prev) => ({ ...prev, price: event.target.value as PriceFilter }))}
                  className="bg-transparent text-sm text-white outline-none"
                >
                  {priceOptions.map((option) => (
                    <option key={option.value} value={option.value} className="bg-[#050914] text-white">
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>

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
            </div>
          </section>
        </div>

        {filtered.length === 0 && !isLoading ? (
          <div className="rounded-xl border border-dashed border-slate-800/60 bg-[#050914]/80 px-6 py-16 text-center shadow-[0_20px_60px_rgba(0,0,0,0.55)]">
            <div className="space-y-3">
              <div className="text-5xl">✨</div>
              <p className="text-lg font-semibold text-white">Chưa có VFX phù hợp</p>
              <p className="text-sm text-amber-100/80">
                Hãy thử đổi bộ lọc, tìm kiếm khác hoặc xem tất cả VFX.
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

        <section className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 pb-16">
          {isLoading
            ? Array.from({ length: 8 }).map((_, index) => <VfxCardSkeleton key={index} />)
            : filtered.map((product) => {
                const mediaPreview = mediaMap.get(String(product.previewVideoId));
                const thumb = product.thumbnailId ? mediaMap.get(String(product.thumbnailId)) : null;
                const previewUrl = mediaPreview?.url ?? mediaPreview?.externalUrl ?? null;
                const thumbUrl = thumb?.url ?? thumb?.externalUrl ?? null;

                return (
                  <VfxCard
                    key={String(product._id)}
                    product={product}
                    previewUrl={previewUrl}
                    thumbUrl={previewUrl ? previewUrl : thumbUrl}
                  />
                );
              })}
        </section>
      </div>
    </main>
  );
}
