"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useMutation, useQuery } from "convex/react";
import { useRouter } from "next/navigation";
import { api } from "@dohy/backend/convex/_generated/api";
import {
  DownloadCloud,
  Mail,
  ShieldAlert,
  ShoppingCart,
  ArrowLeft,
  ExternalLink,
  MessageCircle,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { formatPrice } from "@/lib/format";
import { useCart } from "@/context/cart-context";
import { useCustomerAuth } from "@/features/auth";
import { toast } from "sonner";
import type { LibraryResourceDetail, LibraryResourceDoc, MediaImageDoc } from "./types";

const detailPricingConfig = {
  free: {
    label: "Miễn phí",
    badgeClassName: "bg-emerald-500/90 text-white border-0",
  },
  paid: {
    label: "Trả phí",
    badgeClassName: "bg-amber-500/90 text-white border-0",
  },
} as const;

type LibraryDetailViewProps = {
  slug: string;
  initialDetail?: LibraryResourceDetail | null | undefined;
};

type SiteSettingsDoc = {
  value?: {
    contactEmail?: string;
    contactPhone?: string;
    siteName?: string;
    address?: string;
    zaloUrl?: string;
    facebookUrl?: string;
    instagramUrl?: string;
    xUrl?: string;
    youtubeUrl?: string;
    tiktokUrl?: string;
    pinterestUrl?: string;
  };
};

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

export default function LibraryDetailView({ slug, initialDetail }: LibraryDetailViewProps) {
  const detailQuery = useQuery(api.library.getResourceDetail, {
    slug,
    includeInactive: false,
  }) as LibraryResourceDetail | null | undefined;
  const media = useQuery(api.media.list, { kind: "image" }) as MediaImageDoc[] | undefined;
  const resourcesWithCover = useQuery(api.library.listResourcesWithCover, { activeOnly: true }) as
    | Array<LibraryResourceDoc & { coverUrl: string | null }>
    | undefined;

  const siteSettingsDoc = useQuery(api.settings.getByKey, { key: "site" }) as SiteSettingsDoc | null | undefined;
  const router = useRouter();
  const { addItem, hasDuplicate } = useCart();
  const { customer } = useCustomerAuth();
  const incrementDownload = useMutation(api.purchases.incrementDownloadCount);

  const [detail, setDetail] = useState<LibraryResourceDetail | null | undefined>(
    initialDetail,
  );
  const [activeImageUrl, setActiveImageUrl] = useState<string | null>(null);
  const [isMainImageLoading, setIsMainImageLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [headerOffset, setHeaderOffset] = useState(110);

  const resourceId = detail?.resource?._id ? String(detail.resource._id) : null;
  const purchase = useQuery(
    api.purchases.getPurchase,
    resourceId && customer?._id
      ? {
          customerId: customer._id as any,
          productType: "resource",
          productId: resourceId,
        }
      : "skip",
  ) as any;
  const productLock = useQuery(
    api.orders.getProductLockStatus,
    resourceId && customer?._id
      ? ({
          customerId: customer._id as any,
          productType: "resource",
          productId: resourceId,
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

  const mediaMap = useMemo(() => {
    const map = new Map<string, MediaImageDoc>();
    if (Array.isArray(media)) {
      for (const item of media) {
        map.set(String(item._id), item);
      }
    }
    return map;
  }, [media]);

  if (detail === undefined) {
    return (
      <div className="bg-[#05070f] text-white">
        <div className="mx-auto max-w-6xl px-6 py-16 sm:px-10">
          <div className="mb-10" />
          <DetailSkeleton />
        </div>
      </div>
    );
  }

  if (detail === null) {
    return (
      <div className="bg-[#05070f] text-white">
        <div className="mx-auto max-w-3xl px-6 py-24 text-center sm:px-10">
          <div className="mx-auto flex size-16 items-center justify-center rounded-full border border-[#f5c542]/30 bg-[#f5c542]/10">
            <ShieldAlert className="size-7 text-[#f8d37f]" />
          </div>
          <h1 className="mt-6 text-3xl font-semibold text-white">Không tìm thấy tài nguyên</h1>
          <p className="mt-2 text-sm text-white/65">
            Tài nguyên bạn yêu cầu có thể đã bị ẩn hoặc chưa được xuất bản. Vui lòng quay lại danh sách để xem các nội dung khác.
          </p>
        </div>
      </div>
    );
  }

  const { resource, images, softwares } = detail;
  const relatedResources = useMemo(() => {
    if (!resourcesWithCover) return [];
    const currentId = String(resource._id);
    return resourcesWithCover
      .filter((item) => String(item._id) !== currentId)
      .sort((a, b) => b.createdAt - a.createdAt)
      .slice(0, 4)
      .map((item) => ({
        resource: item,
        coverUrl: item.coverUrl ?? undefined,
      }));
  }, [resource._id, resourcesWithCover]);
  const isRelatedLoading = resourcesWithCover === undefined;
  const galleryUrls = images
    .map((image) => mediaMap.get(String(image.mediaId))?.url)
    .filter((url): url is string => Boolean(url));
  const coverUrlFallback = resource.coverImageId
    ? mediaMap.get(String(resource.coverImageId))?.url
    : undefined;
  const primaryImageUrl = galleryUrls[0] ?? coverUrlFallback ?? null;

  const preferredImage = useMemo(() => primaryImageUrl, [primaryImageUrl]);

  useEffect(() => {
    if (preferredImage && activeImageUrl === null) {
      setIsMainImageLoading(true);
      setActiveImageUrl(preferredImage);
    }
  }, [preferredImage, activeImageUrl]);

  const pricing = detailPricingConfig[resource.pricingType];
  const releaseDate = new Date(resource.createdAt).toLocaleDateString("vi-VN");
  const siteSettings = siteSettingsDoc ?? undefined;
  const contactEmail = siteSettings?.value?.contactEmail ?? "dohystudio@gmail.com";
  const contactPhone = undefined; // ẩn theo yêu cầu: chỉ giữ email & Zalo
  const contactAddress = undefined;
  const socialLinks = useMemo(() => {
    const value = siteSettings?.value;
    if (!value) return [];
    const links = [
      { label: "Zalo", href: value.zaloUrl, Icon: MessageCircle },
    ];
    return links.filter((item) => Boolean(item.href));
  }, [siteSettings?.value]);
  const priceAmount = typeof resource.price === "number" ? resource.price : 0;
  const compareAmount =
    typeof resource.originalPrice === "number" ? resource.originalPrice : null;
  const comparePriceText =
    compareAmount && compareAmount > priceAmount ? formatPrice(compareAmount) : null;
  const priceText = resource.pricingType === "free" ? "Miễn phí" : formatPrice(priceAmount);
  const hasPurchase = Boolean(purchase);
  const hasActiveOrder = Boolean(productLock?.hasActiveOrder);

  const canDownload = Boolean(
    resource.isDownloadVisible &&
      resource.downloadUrl &&
      (resource.pricingType === "free" || hasPurchase),
  );
  const downloadUrl = resource.downloadUrl?.trim();

  async function handleDownload() {
    if (!downloadUrl) {
      toast.error("Chưa có link tải xuống.");
      return;
    }
    if (!canDownload) {
      toast.error("Bạn cần mua trước khi tải.");
      return;
    }
    setDownloading(true);
    try {
      if (purchase?._id) {
        await incrementDownload({ purchaseId: purchase._id as any });
      }
      window.open(downloadUrl, "_blank");
    } catch (error) {
      console.error("Không thể tải xuống", error);
      toast.error("Không thể tải xuống. Vui lòng thử lại.");
    } finally {
      setDownloading(false);
    }
  }

  function handleAddToCart() {
    if (resource.pricingType !== "paid") return;
    if (!customer) {
      toast.error("Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng.");
      router.push("/login");
      return;
    }
    if (hasPurchase) {
      toast.message("Bạn đã mua tài nguyên này.", {
        description: "Kiểm tra thư viện hoặc đơn hàng của bạn.",
      });
      return;
    }
    if (hasActiveOrder) {
      toast.message("Đã có đơn cho tài nguyên này, vui lòng chờ xử lý.", {
        description: productLock?.activeOrderNumber ?? undefined,
      });
      router.push("/khoa-hoc/don-dat");
      return;
    }
    if (!Number.isFinite(priceAmount) || priceAmount <= 0) {
      toast.error("Tài nguyên chưa được cấu hình giá hợp lý.");
      return;
    }
    const resourceIdString = String(resource._id);
    if (!hasDuplicate("resource", resourceIdString)) {
      addItem({
        id: resourceIdString,
        productType: "resource",
        title: resource.title,
        price: priceAmount,
        thumbnail: primaryImageUrl ?? undefined,
      });
    }
    router.push("/checkout");
  }
  const descriptionHasHtml = Boolean(resource.description && /<\/?[a-z][\s\S]*>/i.test(resource.description));

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

      <header className="relative z-10 max-w-6xl mx-auto px-4 sm:px-8 pt-8 pb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full hover:bg-slate-800 text-slate-400 hover:text-white"
            onClick={() => router.push("/thu-vien")}
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <span
            className="hidden sm:inline text-sm font-medium text-slate-500 hover:text-slate-200 cursor-pointer"
            onClick={() => router.push("/thu-vien")}
          >
            Quay lại thư viện
          </span>
        </div>
        <div />
      </header>

      <main className="relative z-10 max-w-6xl mx-auto px-4 sm:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Left */}
          <div className="lg:col-span-8 flex flex-col gap-10">
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-3">
                <Badge className={cn("text-xs font-semibold", pricing.badgeClassName)}>{pricing.label}</Badge>
                <span className="text-xs uppercase tracking-[0.2em] text-slate-500">{releaseDate}</span>
              </div>
              <h1 className="text-3xl md:text-4xl font-serif font-bold text-white leading-tight">{resource.title}</h1>

              {/* Preview gallery */}
              <div className="rounded-2xl border border-slate-800/70 bg-gradient-to-b from-slate-900/70 to-slate-950 shadow-[0_20px_60px_rgba(0,0,0,0.5)] overflow-hidden">
                {activeImageUrl ? (
                  <div className="relative w-full bg-slate-950/60">
                    <div className="relative aspect-[16/9] w-full max-h-[70vh] bg-gradient-to-b from-slate-950/80 to-slate-950">
                      <img
                        key={activeImageUrl}
                        src={activeImageUrl}
                        alt={resource.title}
                        onLoad={() => setIsMainImageLoading(false)}
                        onError={() => setIsMainImageLoading(false)}
                        className={cn(
                          "absolute inset-0 h-full w-full object-contain transition-opacity duration-200",
                          isMainImageLoading ? "opacity-0" : "opacity-100",
                        )}
                      />
                      <div
                        className={cn(
                          "absolute inset-0 bg-slate-900/60 transition-opacity duration-200",
                          isMainImageLoading ? "opacity-100" : "opacity-0",
                        )}
                      />
                    </div>
                  </div>
                ) : (
                  <div className="aspect-[16/9] flex items-center justify-center text-sm uppercase tracking-[0.2em] text-slate-500 bg-slate-950/60">
                    Chưa có ảnh đại diện
                  </div>
                )}
                {galleryUrls.length > 0 && (
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 p-3 bg-slate-950/70 border-t border-slate-800/60">
                    {galleryUrls.map((url) => {
                      const isActive = activeImageUrl === url;
                      return (
                        <button
                          key={url}
                          onClick={() => {
                            if (url !== activeImageUrl) {
                              setIsMainImageLoading(true);
                              setActiveImageUrl(url);
                            }
                          }}
                          className={cn(
                            "relative aspect-video rounded-lg overflow-hidden border transition-all duration-200",
                            isActive
                              ? "border-amber-400/60 shadow-[0_0_20px_rgba(255,193,7,0.25)]"
                              : "border-slate-800 hover:border-amber-400/40"
                          )}
                        >
                          <img src={url} alt="Preview" className="w-full h-full object-cover" />
                          <span className="absolute inset-0 bg-black/20 opacity-0 hover:opacity-100 transition-opacity" />
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Content */}
            <div className="relative p-[1px] rounded-2xl bg-gradient-to-b from-slate-800/50 to-transparent">
              <div className="bg-[#050914] rounded-xl p-8 border border-slate-800/60 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-20 h-1 bg-amber-500" />
                <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">Chi tiết tài nguyên</h2>

                {resource.description ? (
                  descriptionHasHtml ? (
                    <div className="prose prose-invert prose-p:text-slate-300 prose-headings:text-white max-w-none leading-relaxed" dangerouslySetInnerHTML={{ __html: resource.description }} />
                  ) : (
                    <p className="text-base text-slate-300 leading-relaxed whitespace-pre-line">{resource.description}</p>
                  )
                ) : (
                  <p className="text-slate-500 text-sm">Chưa có mô tả.</p>
                )}

                {softwares.length > 0 && (
                  <div className="mt-8 space-y-3">
                    <h3 className="text-lg font-semibold text-white">Tương thích</h3>
                    <div className="flex flex-wrap gap-2">
                      {softwares.map(({ software }) => (
                        <span key={String(software._id)} className="px-4 py-2 rounded-full border border-amber-400/30 bg-amber-400/10 text-xs font-semibold text-amber-100">
                          {software.name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right */}
          <aside className="lg:col-span-4 space-y-6 relative">
            <div className="absolute inset-0 -z-10 bg-amber-500/5 blur-3xl rounded-full" />
            <div className="sticky top-10 space-y-6">
              <div className="relative">
                <div className="absolute inset-0 bg-amber-500/5 blur-2xl rounded-full -z-10" />
                <div className="rounded-2xl border border-amber-500/20 bg-gradient-to-b from-slate-900/80 to-slate-950/90 overflow-hidden shadow-[0_30px_80px_rgba(0,0,0,0.35)]">
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-amber-500/60 to-transparent" />
                  <div className="p-6 space-y-4">
                    {resource.pricingType === "paid" ? (
                      <div className="flex justify-between items-start">
                        <div className="space-y-1">
                          <span className="text-slate-400 text-sm font-medium">Giá ưu đãi</span>
                          {comparePriceText ? (
                            <span className="text-xs font-bold text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                              -{compareAmount && priceAmount ? Math.round(((compareAmount - priceAmount) / compareAmount) * 100) : 0}%
                            </span>
                          ) : null}
                        </div>
                        <div className="flex flex-col items-end">
                          {comparePriceText && <span className="text-sm text-slate-500 line-through">{comparePriceText}</span>}
                          <span className="text-3xl font-serif text-white tracking-tight">
                            {priceText} <span className="text-lg text-slate-400 font-sans">VND</span>
                          </span>
                        </div>
                      </div>
                    ) : null}

                    <div className="grid gap-3">
                      {resource.pricingType === "paid" && !hasPurchase ? (
                        <Button variant="default" size="lg" className="h-12 w-full font-bold tracking-wide bg-gradient-to-r from-amber-400 to-yellow-300 text-black hover:brightness-110" onClick={handleAddToCart} disabled={hasActiveOrder}>
                          <ShoppingCart className="w-5 h-5 mr-2" />
                          {hasActiveOrder ? "Đã đặt, chờ duyệt" : "Thêm vào giỏ"}
                        </Button>
                      ) : (
                        <Button
                          size="lg"
                          className="h-11 w-full bg-slate-800/50 text-white border border-slate-700 hover:border-amber-400 hover:text-amber-200"
                          onClick={handleDownload}
                          disabled={!canDownload || downloading}
                        >
                          <DownloadCloud className="w-5 h-5 mr-2" />
                          {downloading ? "Đang tải..." : resource.pricingType === "free" ? "Tải miễn phí" : "Tải xuống"}
                        </Button>
                      )}
                      {!canDownload ? (
                        <span className="text-xs text-slate-500">
                          {resource.pricingType === "free"
                            ? "Chưa có link tải, vui lòng kiểm tra lại sau."
                            : "Nút tải sẽ xuất hiện sau khi thanh toán thành công."}
                        </span>
                      ) : null}
                    </div>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-800 bg-slate-950/50 p-6 space-y-4">
                <h3 className="text-sm uppercase tracking-[0.18em] text-slate-400 font-semibold">Liên hệ</h3>
                <div className="flex items-center gap-3 text-sm text-slate-200">
                  <Mail className="w-4 h-4 text-slate-500" />
                  <a href={`mailto:${contactEmail}`} className="hover:text-amber-300 transition-colors">
                    {contactEmail}
                  </a>
                </div>
                {/* Theo yêu cầu: bỏ số điện thoại, địa chỉ */}
                {socialLinks.length > 0 ? (
                  <div className="pt-3 border-t border-slate-800/60">
                    <div className="text-[11px] uppercase tracking-[0.18em] text-slate-500 font-semibold mb-2">Kết nối</div>
                    <div className="flex flex-wrap gap-2">
                      {socialLinks.map(({ label, href, Icon }) => (
                        <a
                          key={label}
                          href={href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="group inline-flex items-center gap-2 rounded-lg border border-slate-800 bg-slate-900/70 px-3 py-2 text-sm text-slate-200 transition-colors hover:border-amber-400/50 hover:text-amber-100"
                        >
                          <Icon className="w-4 h-4 text-slate-500 group-hover:text-amber-300" />
                          <span>{label}</span>
                          <ExternalLink className="w-3 h-3 text-slate-600 group-hover:text-amber-300" />
                        </a>
                      ))}
                    </div>
                  </div>
                ) : null}
              </div>
              {(isRelatedLoading || relatedResources.length > 0) ? (
                <div className="rounded-2xl border border-slate-800 bg-slate-950/40">
                  <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800/60">
                    <h4 className="text-lg font-medium text-white">Tài nguyên liên quan</h4>
                    <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                      {isRelatedLoading ? "Đang tải..." : `${relatedResources.length} gợi ý`}
                    </span>
                  </div>
                  <div className="p-5 space-y-3">
                    {isRelatedLoading ? (
                      Array.from({ length: 3 }).map((_, index) => (
                        <div
                          key={index}
                          className="flex items-center gap-3 rounded-lg border border-slate-800 bg-slate-900/70 p-2"
                        >
                          <Skeleton className="h-12 w-12 rounded-md" />
                          <div className="flex-1 space-y-2">
                            <Skeleton className="h-3 w-3/4" />
                            <Skeleton className="h-3 w-1/2" />
                          </div>
                        </div>
                      ))
                    ) : (
                      relatedResources.map(({ resource: related, coverUrl }) => {
                        const priceLabel =
                          related.pricingType === "free"
                            ? "Miễn phí"
                            : formatPrice(typeof related.price === "number" ? related.price : 0);
                        const fallbackLetter = related.title?.slice(0, 1)?.toUpperCase() ?? "?";
                        return (
                          <Link
                            key={String(related._id)}
                            href={`/thu-vien/${related.slug}`}
                            className="group flex items-center justify-between gap-3 rounded-lg border border-transparent bg-transparent p-2 transition-all hover:border-slate-800 hover:bg-slate-900"
                          >
                            <div className="flex items-center gap-3 w-full">
                              <div className="relative w-12 h-12 flex-shrink-0 overflow-hidden rounded-md border border-slate-800 group-hover:border-slate-600 bg-slate-900">
                                {coverUrl ? (
                                  <img
                                    src={coverUrl}
                                    alt={related.title}
                                    className="w-full h-full object-cover opacity-80 group-hover:opacity-100"
                                  />
                                ) : (
                                  <div className="flex h-full w-full items-center justify-center text-xs font-semibold text-slate-500">
                                    {fallbackLetter}
                                  </div>
                                )}
                              </div>
                              <div className="flex flex-col min-w-0">
                                <span className="text-sm text-slate-200 font-medium group-hover:text-amber-400 transition-colors line-clamp-1">
                                  {related.title}
                                </span>
                                <span className="text-xs text-slate-500">{priceLabel}</span>
                              </div>
                            </div>
                            <ExternalLink className="w-4 h-4 text-slate-600 group-hover:text-amber-400" />
                          </Link>
                        );
                      })
                    )}
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








