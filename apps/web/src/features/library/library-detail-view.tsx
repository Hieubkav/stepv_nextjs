"use client";

import { useEffect, useMemo, useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@dohy/backend/convex/_generated/api";
import { Check, DownloadCloud, Mail, Phone, ShieldAlert } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import type { LibraryResourceDetail, MediaImageDoc } from "./types";

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

  const siteSettingsDoc = useQuery(api.settings.getByKey, { key: "site" }) as SiteSettingsDoc | null | undefined;

  const [detail, setDetail] = useState<LibraryResourceDetail | null | undefined>(
    initialDetail,
  );
  const [activeImageUrl, setActiveImageUrl] = useState<string | null>(null);
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
  const coverUrl = resource.coverImageId
    ? mediaMap.get(String(resource.coverImageId))?.url
    : undefined;
  const galleryUrls = images
    .map((image) => mediaMap.get(String(image.mediaId))?.url)
    .filter((url): url is string => Boolean(url));

  const preferredImage = useMemo(() => coverUrl ?? galleryUrls[0] ?? null, [coverUrl, galleryUrls]);

  useEffect(() => {
    setActiveImageUrl(preferredImage);
  }, [preferredImage]);

  const pricing = detailPricingConfig[resource.pricingType];
  const releaseDate = new Date(resource.createdAt).toLocaleDateString("vi-VN");
  const siteSettings = siteSettingsDoc ?? undefined;
  const contactEmail = siteSettings?.value?.contactEmail ?? "dohystudio@gmail.com";
  const contactPhone = siteSettings?.value?.contactPhone;

  const canDownload = Boolean(resource.isDownloadVisible && resource.downloadUrl);

  return (
    <div className="bg-[#05070f] text-white">
      <div className="mx-auto max-w-6xl px-6 py-16 sm:px-10">
        <div className="mb-10" />

        <div className="grid gap-10 lg:grid-cols-[2fr,1.1fr]">
          <div className="space-y-6">
            <div
              className={cn(
                "overflow-hidden rounded-3xl border shadow-lg transition-all duration-200",
                activeImageUrl
                  ? "border-[#f5c542]/40 bg-white/[0.05] shadow-[0_12px_40px_rgba(245,197,66,0.15)]"
                  : "border-[#f5c542]/20 bg-white/[0.03]",
              )}
            >
              {activeImageUrl ? (
                <img src={activeImageUrl} alt={resource.title} className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-80 items-center justify-center text-sm uppercase tracking-[0.15em] text-white/50">
                  Chưa có ảnh đại diện
                </div>
              )}
            </div>

            {galleryUrls.length > 0 && (
              <div className="flex flex-wrap gap-3">
                {galleryUrls.map((url) => {
                  const isActive = activeImageUrl === url;
                  return (
                    <button
                      key={url}
                      type="button"
                      onClick={() => setActiveImageUrl(url)}
                      className={cn(
                        "group h-28 flex-1 min-w-[160px] overflow-hidden rounded-2xl border transition-all duration-200",
                        isActive
                          ? "border-[#f5c542]/50 bg-white/[0.05]"
                          : "border-white/10 bg-white/[0.03] hover:border-[#f5c542]/30",
                      )}
                    >
                      <img
                        src={url}
                        alt="Resource preview"
                        className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                      />
                    </button>
                  );
                })}
              </div>
            )}

            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-3">
                <Badge className={cn("text-xs font-medium", pricing.badgeClassName)}>
                  {pricing.label}
                </Badge>
                <span className="text-xs uppercase tracking-[0.15em] text-white/60">
                  {releaseDate}
                </span>
              </div>

              <h1 className="text-3xl font-semibold text-white sm:text-4xl">{resource.title}</h1>
              {resource.description && (
                <p className="text-base text-white/82">{resource.description}</p>
              )}

              {softwares.length > 0 && (
                <div className="space-y-3">
                  <div className="text-xs uppercase tracking-[0.15em] text-white/60 font-medium">Tương thích</div>
                  <div className="flex flex-wrap gap-2">
                    {softwares.map(({ software }) => (
                      <span
                        key={String(software._id)}
                        className="rounded-full border border-[#f5c542]/30 bg-[#f5c542]/10 px-4 py-2 text-xs text-[#f8d37f]"
                      >
                        {software.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {resource.features && resource.features.length > 0 && (
                <div className="space-y-3">
                  <h2 className="text-base font-semibold text-white">Tính năng nổi bật</h2>
                  <ul className="space-y-2 text-sm text-white/80">
                    {resource.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-3">
                        <span className="mt-0.5 flex size-5 items-center justify-center rounded-full border border-[#f5c542]/30 bg-[#f5c542]/10">
                          <Check className="size-3 text-[#f8d37f]" />
                        </span>
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>

          <aside className="space-y-6">
            <div className="space-y-4 rounded-2xl border border-white/10 bg-white/[0.04] p-6">
              <div className="space-y-2">
                <div className="text-xs uppercase tracking-[0.15em] text-white/60 font-medium">Giá</div>
                <div className="text-2xl font-semibold text-white">
                  {resource.pricingType === "free" ? "Miễn phí" : "Liên hệ báo giá"}
                </div>
              </div>

              <div className="space-y-3 rounded-xl border border-white/10 bg-white/[0.03] p-4">
                <div className="text-xs uppercase tracking-[0.15em] text-white/60 font-medium">Liên hệ</div>
                <div className="flex items-center gap-3 text-sm text-white/80">
                  <Mail className="size-4 text-white/50" />
                  <a href={`mailto:${contactEmail}`} className="hover:text-[#f8d37f] transition-colors">
                    {contactEmail}
                  </a>
                </div>
                {contactPhone && (
                  <div className="flex items-center gap-3 text-sm text-white/80">
                    <Phone className="size-4 text-white/50" />
                    <span>{contactPhone}</span>
                  </div>
                )}
              </div>

            </div>

            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 text-sm text-white/70">
              <h3 className="text-sm font-semibold text-white">Ghi chú</h3>
              <p className="mt-2">
                Nếu bạn cần hỗ trợ cài đặt hoặc demo trước khi mua, hãy liên hệ đội ngũ DOHY Studio để được tư vấn chi tiết.
              </p>
            </div>
          </aside>
        </div>
      </div>


    </div>
  );
}

