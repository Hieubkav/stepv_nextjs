"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMutation, useQuery } from "convex/react";
import { api } from "@dohy/backend/convex/_generated/api";
import {
  ArrowLeft,
  DownloadCloud,
  Film,
  ShieldAlert,
  ShoppingCart,
  Sparkles,
  HardDrive,
  Lock,
} from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { formatPrice } from "@/lib/format";
import { useCart } from "@/context/cart-context";
import { useCustomerAuth } from "@/features/auth";
import type { MediaDoc, VfxProductDoc, VfxAssetDoc } from "./types";

const categoryLabels: Record<string, string> = {
  explosion: "Explosion",
  fire: "Fire",
  smoke: "Smoke",
  water: "Water",
  magic: "Magic",
  particle: "Particle",
  transition: "Transition",
  other: "Other",
};

const pricingBadge: Record<VfxProductDoc["pricingType"], { label: string; className: string }> = {
  free: { label: "Miễn phí", className: "bg-emerald-500/90 text-white border-0" },
  paid: { label: "Trả phí", className: "bg-amber-500/90 text-white border-0" },
};

type VfxDetailViewProps = {
  slug: string;
  initialProduct?: VfxProductDoc | null;
};

function formatDuration(seconds: number | undefined) {
  if (!Number.isFinite(seconds)) return "1-5s";
  if (!seconds || seconds <= 0) return "1-5s";
  if (seconds < 1) return `${(seconds * 1000).toFixed(0)}ms`;
  if (seconds < 60) return `${seconds.toFixed(1).replace(/\.0$/, "")}s`;
  return `${Math.round(seconds / 60)} phút`;
}

function formatFileSize(bytes: number | undefined) {
  if (!Number.isFinite(bytes) || !bytes) return "--";
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function DetailSkeleton() {
  return (
    <div className="space-y-10">
      <div className="flex items-center gap-4 text-white/70">
        <Skeleton className="h-10 w-10 rounded-full" />
        <Skeleton className="h-4 w-40 rounded-full" />
      </div>
      <div className="grid gap-10 lg:grid-cols-[2fr,1.1fr]">
        <div className="space-y-6">
          <Skeleton className="h-80 w-full rounded-3xl" />
          <Skeleton className="h-6 w-3/4 rounded-full" />
          <Skeleton className="h-4 w-full rounded-full" />
          <Skeleton className="h-4 w-5/6 rounded-full" />
        </div>
        <div className="space-y-4">
          <Skeleton className="h-40 w-full rounded-3xl" />
          <Skeleton className="h-32 w-full rounded-3xl" />
        </div>
      </div>
    </div>
  );
}

export default function VfxDetailView({ slug, initialProduct }: VfxDetailViewProps) {
  const router = useRouter();
  const { customer } = useCustomerAuth();
  const { addItem, hasDuplicate } = useCart();

  const productQuery = useQuery(api.vfx.getVfxProductBySlug, { slug }) as VfxProductDoc | null | undefined;
  const media = useQuery(api.media.list, {}) as MediaDoc[] | undefined;
  const assets = useQuery(
    api.vfx.listVfxAssets,
    productQuery?._id || initialProduct?._id ? ({ vfxId: (productQuery?._id ?? initialProduct?._id) as any } as any) : "skip",
  ) as VfxAssetDoc[] | undefined;
  const relatedQuery = useQuery(api.vfx.listVfxProducts, { activeOnly: true }) as VfxProductDoc[] | undefined;

  const [product, setProduct] = useState<VfxProductDoc | null | undefined>(initialProduct);
  const [downloading, setDownloading] = useState(false);
  const [headerOffset, setHeaderOffset] = useState(112);

  const productIdForPurchase = product?._id ?? productQuery?._id;
  const purchase = useQuery(
    api.purchases.getPurchase,
    productIdForPurchase && customer?._id
      ? ({
          customerId: customer._id as any,
          productType: "vfx",
          productId: String(productIdForPurchase),
        } as any)
      : "skip",
  ) as any;
  const productLock = useQuery(
    api.orders.getProductLockStatus,
    productIdForPurchase && customer?._id
      ? ({
          customerId: customer._id as any,
          productType: "vfx",
          productId: String(productIdForPurchase),
        } as const)
      : "skip",
  ) as
    | {
        hasPurchased: boolean;
        hasActiveOrder: boolean;
        activeOrderStatus: string | null;
        activeOrderNumber: string | null;
      }
    | null
    | undefined;

  const incrementPurchaseDownload = useMutation(api.purchases.incrementDownloadCount);
  const incrementVfxDownload = useMutation(api.vfx.incrementVfxDownloadCount);

  useEffect(() => {
    if (productQuery !== undefined) setProduct(productQuery);
  }, [productQuery]);

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

  const mediaMap = useMemo(() => {
    const map = new Map<string, MediaDoc>();
    if (Array.isArray(media)) {
      for (const item of media) {
        map.set(String(item._id), item);
      }
    }
    return map;
  }, [media]);

  const getMediaUrl = (id?: string) => {
    if (!id) return null;
    const item = mediaMap.get(String(id));
    return item?.url ?? item?.externalUrl ?? null;
  };

  const activeAssets = useMemo(() => {
    const list = Array.isArray(assets) ? assets.filter((a) => a.active) : [];
    const previews = list.filter((a) => a.kind === "preview").sort((a, b) => a.order - b.order);
    const downloads = list.filter((a) => a.kind === "download").sort((a, b) => a.order - b.order);
    return { previews, downloads };
  }, [assets]);

  const previewAsset = activeAssets.previews.find((a) => a.isPrimary) ?? activeAssets.previews[0] ?? null;
  const downloadAsset = activeAssets.downloads.find((a) => a.isPrimary) ?? activeAssets.downloads[0] ?? null;

  const thumbMedia = product?.thumbnailId ? mediaMap.get(String(product.thumbnailId)) : null;
  const previewUrl = previewAsset ? getMediaUrl(previewAsset.mediaId) : getMediaUrl(product?.previewVideoId);
  const thumbUrl = thumbMedia?.url ?? thumbMedia?.externalUrl ?? null;

  const downloadItems = activeAssets.downloads.map((asset) => ({
    asset,
    media: mediaMap.get(String(asset.mediaId)),
    url: getMediaUrl(asset.mediaId),
    label: asset.label || asset.variant || "Tải xuống",
  }));
  const fallbackDownloadUrl = getMediaUrl(product?.downloadFileId);
  const downloadOptions = downloadItems.length
    ? downloadItems
    : fallbackDownloadUrl
      ? [{ asset: null as any, media: mediaMap.get(String(product?.downloadFileId)), url: fallbackDownloadUrl, label: "Tải xuống" }]
      : [];
  const primaryDownloadUrl = downloadOptions[0]?.url ?? null;

  const previewOptions = activeAssets.previews.map((asset, index) => ({
    asset,
    url: getMediaUrl(asset.mediaId),
    label: asset.label || asset.variant || `Preview ${index + 1}`,
    isPrimary: asset.isPrimary || index === 0,
  }));

  const [currentPreviewUrl, setCurrentPreviewUrl] = useState<string | null>(previewUrl);
  useEffect(() => {
    setCurrentPreviewUrl(previewUrl);
  }, [previewUrl]);

  const getPreviewThumb = (asset: VfxAssetDoc) => {
    const m = mediaMap.get(String(asset.mediaId));
    return m?.url ?? m?.externalUrl ?? thumbUrl ?? null;
  };

  if (product === undefined) {
    return (
      <div className="bg-[#05070f] text-white" style={{ paddingTop: headerOffset }}>
        <div className="mx-auto max-w-6xl px-6 py-16 sm:px-10">
          <DetailSkeleton />
        </div>
      </div>
    );
  }

  if (product === null || !product.active) {
    return (
      <div className="bg-[#05070f] text-white" style={{ paddingTop: headerOffset }}>
        <div className="mx-auto max-w-3xl px-6 py-24 text-center sm:px-10">
          <div className="mx-auto flex size-16 items-center justify-center rounded-full border border-[#f5c542]/30 bg-[#f5c542]/10">
            <ShieldAlert className="size-7 text-[#f8d37f]" />
          </div>
          <h1 className="mt-6 text-3xl font-semibold text-white">VFX không khả dụng</h1>
          <p className="mt-2 text-sm text-white/65">
            Hiệu ứng này có thể đã bị ẩn hoặc chưa xuất bản. Hãy xem các VFX khác trong kho.
          </p>
          <Button className="mt-6" asChild>
            <Link href="/vfx">Quay lại VFX</Link>
          </Button>
        </div>
      </div>
    );
  }

  const pricing = pricingBadge[product.pricingType];
  const priceAmount = typeof product.price === "number" ? product.price : 0;
  const compareAmount = typeof product.originalPrice === "number" ? product.originalPrice : null;
  const priceText = product.pricingType === "free" ? "Miễn phí" : formatPrice(priceAmount);
  const compareText = compareAmount && compareAmount > priceAmount ? formatPrice(compareAmount) : null;
  const isOwned = product.pricingType === "free" || Boolean(purchase);
  const hasActiveOrder = Boolean(productLock?.hasActiveOrder);
  const canDownload = isOwned && Boolean(primaryDownloadUrl);
  const fileSizeLabel = formatFileSize(product.fileSize);
  const resolutionLabel = product.resolution;

  const related = useMemo(() => {
    if (!relatedQuery || !product) return [] as VfxProductDoc[];
    return relatedQuery
      .filter((item) => String(item._id) !== String(product._id))
      .slice(0, 4);
  }, [product, relatedQuery]);

  async function handleDownload(url?: string) {
    if (!product) return;
    const finalUrl = url ?? primaryDownloadUrl;
    if (!canDownload || !finalUrl) {
      toast.error("Bạn cần mua hoặc VFX chưa có file tải.");
      return;
    }
    setDownloading(true);
    try {
      if (purchase?._id) {
        await incrementPurchaseDownload({ purchaseId: purchase._id as any });
      }
      await incrementVfxDownload({ id: product._id as any });
      window.open(finalUrl, "_blank");
    } catch (error) {
      console.error("Không thể tải", error);
      toast.error("Không thể tải. Thử lại sau.");
    } finally {
      setDownloading(false);
    }
  }

  function handleAddToCart() {
    if (!product) return;
    if (product.pricingType !== "paid") return;
    if (!customer) {
      toast.error("Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng.");
      router.push("/login");
      return;
    }
    if (isOwned) {
      toast.message("Bạn đã sở hữu VFX này.");
      return;
    }
    if (hasActiveOrder) {
      toast.message("VFX đã được đặt, vui lòng chờ xử lý.", {
        description: productLock?.activeOrderNumber ?? undefined,
      });
      router.push("/khoa-hoc/don-dat");
      return;
    }
    if (!Number.isFinite(priceAmount) || priceAmount <= 0) {
      toast.error("VFX chưa cấu hình giá hợp lý.");
      return;
    }
    const id = String(product._id);
    if (!hasDuplicate("vfx", id)) {
      addItem({ id, productType: "vfx", title: product.title, price: priceAmount, thumbnail: thumbUrl ?? previewUrl ?? undefined });
      toast.success("Đã thêm vào giỏ");
    }
    router.push("/checkout");
  }

  return (
    <div
      className="min-h-screen bg-[#030712] text-slate-200 pb-20 selection:bg-amber-500/30 selection:text-amber-200"
      style={{ paddingTop: headerOffset }}
    >
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] bg-blue-900/10 blur-[120px] rounded-full mix-blend-screen" />
        <div className="absolute top-[20%] -right-[10%] w-[40%] h-[40%] bg-amber-900/8 blur-[110px] rounded-full mix-blend-screen" />
      </div>

      <header className="relative z-10 max-w-6xl mx-auto px-4 sm:px-8 pt-8 pb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full hover:bg-slate-800 text-slate-400 hover:text-white"
            onClick={() => router.push("/vfx")}
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <span
            className="hidden sm:inline text-sm font-medium text-slate-500 hover:text-slate-200 cursor-pointer"
            onClick={() => router.push("/vfx")}
          >
            Quay lại VFX
          </span>
        </div>
        <Badge variant="outline" className="border-amber-400/40 bg-amber-400/10 text-amber-100">
          {categoryLabels[product.category] ?? product.category}
        </Badge>
      </header>

      <main className="relative z-10 max-w-6xl mx-auto px-4 sm:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          <div className="lg:col-span-8 flex flex-col gap-10">
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-3">
                <Badge className={cn("text-xs font-semibold", pricing.className)}>{pricing.label}</Badge>
                <span className="text-xs uppercase tracking-[0.2em] text-slate-500">
                  Cập nhật {new Date(product.updatedAt).toLocaleDateString("vi-VN")}
                </span>
              </div>
              <h1 className="text-3xl md:text-4xl font-serif font-bold text-white leading-tight">{product.title}</h1>
              {product.subtitle ? (
                <p className="text-base text-slate-300 leading-relaxed">{product.subtitle}</p>
              ) : null}

              <section className="space-y-3 rounded-2xl border border-slate-800/70 bg-gradient-to-b from-slate-900/70 to-slate-950 shadow-[0_20px_60px_rgba(0,0,0,0.5)]">
                <div className="relative w-full overflow-hidden rounded-2xl">
                  {currentPreviewUrl ? (
                    <video
                      src={currentPreviewUrl}
                      className="w-full aspect-video max-h-[520px] object-cover bg-black"
                      controls
                      loop
                      playsInline
                      poster={thumbUrl ?? undefined}
                    />
                  ) : thumbUrl ? (
                    <img src={thumbUrl} alt={product.title} className="w-full aspect-video object-cover bg-black" />
                  ) : (
                    <div className="aspect-video flex items-center justify-center bg-slate-950 text-sm uppercase tracking-[0.2em] text-slate-500">
                      Chưa có preview
                    </div>
                  )}
                </div>

                {previewOptions.length > 0 && (
                  <div className="flex gap-2 overflow-x-auto px-3 py-2 border-t border-slate-800/60 bg-slate-950/70">
                    {previewOptions.map((option, index) => {
                      const active = option.url === currentPreviewUrl;
                      return (
                        <button
                          key={option.url ?? index}
                          type="button"
                          onClick={() => setCurrentPreviewUrl(option.url ?? null)}
                          disabled={!option.url}
                          className={cn(
                            "relative h-20 w-32 shrink-0 overflow-hidden rounded-lg border transition-all",
                            active
                              ? "border-amber-400 shadow-[0_0_0_2px_rgba(251,191,36,0.3)]"
                              : "border-slate-800 hover:border-amber-300/70",
                            !option.url ? "opacity-50 cursor-not-allowed" : "",
                          )}
                        >
                          <div className="grid h-full w-full place-items-center bg-slate-900 text-[12px] text-slate-200 font-semibold px-2 text-center">
                            <span className="truncate w-full">{option.label}</span>
                            {option.isPrimary ? (
                              <Badge variant="outline" className="mt-1 border-amber-400/70 text-[10px] text-amber-200">
                                Primary
                              </Badge>
                            ) : null}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}

                <div className="flex flex-wrap gap-2 px-4 py-3 bg-slate-950/70 border-t border-slate-800/60">
                  <Badge variant="outline" className="border-slate-700 bg-slate-900 text-slate-200">
                    <Film className="w-3.5 h-3.5 mr-2" /> {resolutionLabel}
                  </Badge>
                  <Badge variant="outline" className="border-slate-700 bg-slate-900 text-slate-200">
                    <HardDrive className="w-3.5 h-3.5 mr-2" /> Dung lượng {fileSizeLabel}
                  </Badge>
                </div>
              </section>

              <section className="relative p-[1px] rounded-2xl bg-gradient-to-b from-slate-800/50 to-transparent">
                <div className="relative overflow-hidden rounded-[18px] border border-slate-800/60 bg-[#050914] p-8">
                  <div className="absolute top-0 left-0 h-1 w-24 bg-amber-500" />
                  <h2 className="mb-6 flex items-center gap-2 text-xl font-semibold text-white">
                    <Sparkles className="h-5 w-5 text-amber-400" /> Chi tiết hiệu ứng
                  </h2>

                  {product.description ? (
                    <p className="text-base text-slate-300 leading-relaxed whitespace-pre-line">{product.description}</p>
                  ) : (
                    <p className="text-slate-500 text-sm">Chưa có mô tả.</p>
                  )}

                  <div className="mt-8 grid gap-3 sm:grid-cols-2">
                    <div className="flex items-center gap-2 rounded-lg border border-slate-800 bg-slate-900/60 px-3 py-2 text-sm text-slate-200">
                      <Film className="h-4 w-4 text-amber-300" /> {resolutionLabel}
                    </div>
                    <div className="flex items-center gap-2 rounded-lg border border-slate-800 bg-slate-900/60 px-3 py-2 text-sm text-slate-200">
                      <HardDrive className="h-4 w-4 text-amber-300" /> Dung lượng {fileSizeLabel}
                    </div>
                  </div>

                  {product.tags && product.tags.length > 0 ? (
                    <div className="mt-6 space-y-3">
                      <h3 className="text-lg font-semibold text-white">Tag</h3>
                      <div className="flex flex-wrap gap-2">
                        {product.tags.map((tag) => (
                          <span
                            key={tag}
                            className="px-3 py-1 rounded-full border border-amber-400/30 bg-amber-400/10 text-xs font-semibold text-amber-100"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  ) : null}
                </div>
              </section>

            </div>
          </div>

          <aside className="lg:col-span-4 space-y-6 relative">
            <div className="absolute inset-0 -z-10 bg-amber-500/5 blur-3xl rounded-full" />
            <div className="sticky top-10 space-y-6">
              <div className="relative">
                <div className="absolute inset-0 bg-amber-500/5 blur-2xl rounded-full -z-10" />
                <div className="rounded-2xl border border-amber-500/20 bg-gradient-to-b from-slate-900/80 to-slate-950/90 overflow-hidden shadow-[0_30px_80px_rgba(0,0,0,0.35)]">
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-amber-500/60 to-transparent" />
                  <div className="p-6 space-y-4">
                    {product.pricingType === "paid" ? (
                      <div className="flex justify-between items-start">
                        <div className="space-y-1">
                          <span className="text-slate-400 text-sm font-medium">Giá ưu đãi</span>
                          {compareText ? (
                            <span className="text-xs font-bold text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                              -{compareAmount && priceAmount ? Math.round(((compareAmount - priceAmount) / compareAmount) * 100) : 0}%
                            </span>
                          ) : null}
                        </div>
                        <div className="flex flex-col items-end">
                          {compareText && <span className="text-sm text-slate-500 line-through">{compareText}</span>}
                          <span className="text-3xl font-serif text-white tracking-tight">
                            {priceText} <span className="text-lg text-slate-400 font-sans">VND</span>
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-emerald-200">
                        <Badge className="bg-emerald-500/20 text-emerald-100 border-emerald-400/40">Free</Badge>
                        <span className="text-lg font-semibold">Tải miễn phí</span>
                      </div>
                    )}

                    <div className="grid gap-3">
                    {product.pricingType === "paid" && !isOwned ? (
                      <Button
                        variant="default"
                        size="lg"
                        className="h-12 w-full font-bold tracking-wide bg-gradient-to-r from-amber-400 to-yellow-300 text-black hover:brightness-110"
                        onClick={handleAddToCart}
                        disabled={hasActiveOrder}
                      >
                        <ShoppingCart className="w-5 h-5 mr-2" /> {hasActiveOrder ? "Đã đặt, chờ duyệt" : "Thêm vào giỏ"}
                      </Button>
                    ) : null}

                    <div className="space-y-2">
                      {downloadOptions.length ? (
                        downloadOptions.map((option, index) => (
                          <Button
                            key={option.url ?? index}
                            size="lg"
                            className="h-11 w-full bg-slate-800/50 text-white border border-slate-700 hover:border-amber-400 hover:text-amber-200"
                            onClick={() => handleDownload(option.url ?? undefined)}
                            disabled={!canDownload || downloading || !option.url}
                          >
                            {canDownload ? (
                              <DownloadCloud className="w-5 h-5 mr-2" />
                            ) : (
                              <Lock className="w-5 h-5 mr-2" />
                            )}
                            {downloading ? "Đang tải..." : option.label}
                          </Button>
                        ))
                      ) : (
                        <Button
                          size="lg"
                          className="h-11 w-full bg-slate-800/50 text-white border border-slate-700"
                          disabled
                        >
                          <DownloadCloud className="w-5 h-5 mr-2" />
                          Chưa có file tải
                        </Button>
                      )}
                      {!canDownload ? (
                        <span className="text-xs text-slate-500 flex items-center gap-1">
                          <Lock className="h-3.5 w-3.5" />
                          Bạn cần mua hoặc sản phẩm miễn phí để mở khóa tải xuống.
                        </span>
                      ) : null}
                    </div>
                    </div>
                  </div>
                </div>
              </div>

              {related.length > 0 ? (
                <div className="rounded-2xl border border-slate-800 bg-slate-950/40">
                  <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800/60">
                    <h4 className="text-lg font-medium text-white">VFX liên quan</h4>
                    <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">{related.length} gợi ý</span>
                  </div>
                  <div className="p-5 space-y-3">
                    {related.map((item) => {
                      const thumb = item.thumbnailId ? mediaMap.get(String(item.thumbnailId)) : null;
                      const thumbUrlRelated = thumb?.url ?? thumb?.externalUrl ?? null;
                      const priceLabel = item.pricingType === "free" ? "Miễn phí" : formatPrice(item.price ?? 0);
                      return (
                        <Link
                          key={String(item._id)}
                          href={`/vfx/${item.slug}`}
                          className="group flex items-center justify-between gap-3 rounded-lg border border-transparent bg-transparent p-2 transition-all hover:border-slate-800 hover:bg-slate-900"
                        >
                          <div className="flex items-center gap-3 w-full">
                            <div className="relative w-12 h-12 flex-shrink-0 overflow-hidden rounded-md border border-slate-800 group-hover:border-slate-600 bg-slate-900">
                              {thumbUrlRelated ? (
                                <img
                                  src={thumbUrlRelated}
                                  alt={item.title}
                                  className="w-full h-full object-cover opacity-80 group-hover:opacity-100"
                                />
                              ) : (
                                <div className="flex h-full w-full items-center justify-center text-xs font-semibold text-slate-500">
                                  {item.title.slice(0, 1).toUpperCase()}
                                </div>
                              )}
                            </div>
                            <div className="flex flex-col min-w-0">
                              <span className="text-sm text-slate-200 font-medium group-hover:text-amber-400 transition-colors line-clamp-1">
                                {item.title}
                              </span>
                              <span className="text-xs text-slate-500">{priceLabel}</span>
                            </div>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              ) : null}
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}





