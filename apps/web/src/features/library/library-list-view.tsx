"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { useConvex, useQuery } from "convex/react";
import { api } from "@dohy/backend/convex/_generated/api";
import type { Id } from "@dohy/backend/convex/_generated/dataModel";
import { ArrowUpRight, SlidersHorizontal } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import type {
  LibraryResourceDoc,
  LibraryResourceSoftwareLink,
  LibrarySoftwareDoc,
  MediaImageDoc,
} from "./types";

const priceOptions = [
  { label: "Tất cả", value: "all" },
  { label: "Miễn phí", value: "free" },
  { label: "Trả phí", value: "paid" },
] as const;

const sortOptions = [
  { label: "Mới nhất", value: "latest" },
  { label: "Cũ nhất", value: "oldest" },
  { label: "Theo tên (A-Z)", value: "alphabetical" },
] as const;

type PriceFilter = (typeof priceOptions)[number]["value"];
type SortOption = (typeof sortOptions)[number]["value"];

type SoftwareBadge = {
  slug: string;
  name: string;
  iconUrl?: string;
};

type ResourceExtrasMap = Record<string, LibraryResourceSoftwareLink[]>;

const pricingConfig: Record<LibraryResourceDoc["pricingType"], { label: string; badgeClassName: string }> = {
  free: {
    label: "Free",
    badgeClassName: "bg-emerald-400/20 text-emerald-200 border border-emerald-400/50",
  },
  paid: {
    label: "Premium",
    badgeClassName: "bg-amber-400/20 text-amber-200 border border-amber-400/50",
  },
};

type LibraryCardProps = {
  resource: LibraryResourceDoc;
  coverUrl?: string;
  softwares: SoftwareBadge[];
};

function LibraryCard({ resource, coverUrl, softwares }: LibraryCardProps) {
  const pricing = pricingConfig[resource.pricingType];

  return (
    <Link
      href={`/thu-vien/${resource.slug}`}
      className="group relative flex h-full flex-col overflow-hidden rounded-3xl border border-white/10 bg-white/[0.04] p-4 transition-all duration-300 hover:-translate-y-1 hover:border-primary/60 hover:bg-white/[0.06]"
    >
      <div className="relative h-44 overflow-hidden rounded-2xl bg-gradient-to-br from-white/10 via-transparent to-white/10">
        {coverUrl ? (
          <img
            src={coverUrl}
            alt={resource.title}
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-xs uppercase tracking-[0.3em] text-white/55">
            No cover
          </div>
        )}
        <div className="absolute left-4 top-4 flex items-center gap-2">
          <Badge className={cn("uppercase tracking-wide", pricing.badgeClassName)}>{pricing.label}</Badge>
        </div>
        {softwares.length > 0 && (
          <div className="absolute right-4 top-4 flex -space-x-2">
            {softwares.slice(0, 3).map((software) => (
              <div
                key={software.slug}
                className="flex size-8 items-center justify-center rounded-full border border-white/20 bg-black/60 text-xs font-medium uppercase text-white/70 backdrop-blur-md"
                title={software.name}
              >
                {software.iconUrl ? (
                  <img
                    src={software.iconUrl}
                    alt={software.name}
                    className="size-full rounded-full object-cover"
                  />
                ) : (
                  software.name.slice(0, 2)
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="mt-5 flex flex-1 flex-col gap-3">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-lg font-semibold text-white transition-colors group-hover:text-primary">
              {resource.title}
            </h3>
            {resource.description && (
              <p className="mt-1 line-clamp-2 text-sm text-white/72">{resource.description}</p>
            )}
          </div>
          <ArrowUpRight className="size-5 flex-shrink-0 text-white/30 transition-transform group-hover:-translate-y-1 group-hover:translate-x-1 group-hover:text-primary" />
        </div>

        {resource.features && resource.features.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {resource.features.slice(0, 3).map((feature) => (
              <span
                key={feature}
                className="rounded-full border border-white/10 bg-white/[0.05] px-3 py-1 text-xs text-white/55"
              >
                {feature}
              </span>
            ))}
          </div>
        )}

        <div className="mt-auto flex items-center justify-between text-xs font-medium uppercase tracking-[0.2em] text-white/45">
          <span>{resource.pricingType === "free" ? "Miễn phí" : "Trả phí"}</span>
          <span className="flex items-center gap-1">
            Khám phá
            <ArrowUpRight className="size-4" />
          </span>
        </div>
      </div>
    </Link>
  );
}

function LibraryCardSkeleton() {
  return (
    <div className="flex h-full flex-col overflow-hidden rounded-3xl border border-white/10 bg-white/[0.04] p-4">
      <Skeleton className="h-44 w-full rounded-2xl" />
      <div className="mt-5 flex flex-1 flex-col gap-3">
        <Skeleton className="h-6 w-3/4 rounded-full" />
        <Skeleton className="h-4 w-full rounded-full" />
        <Skeleton className="h-4 w-5/6 rounded-full" />
        <Skeleton className="mt-auto h-4 w-1/3 rounded-full" />
      </div>
    </div>
  );
}

type FilterPillProps = {
  active: boolean;
  label: string;
  onClick: () => void;
  iconUrl?: string;
};

function FilterPill({ active, label, onClick, iconUrl }: FilterPillProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "group inline-flex items-center gap-2 rounded-full border px-4 py-2 text-xs uppercase tracking-[0.25em] transition-all duration-300",
        active
          ? "border-transparent bg-gradient-to-br from-[#f6e05e] to-[#f0b429] text-[#18120b] shadow-[0_0_24px_rgba(240,180,41,0.35)]"
          : "border-white/5 bg-white/[0.02] text-white/65 hover:text-white hover:border-white/15",
      )}
    >
      {iconUrl && (
        <span
          className={cn(
            "flex size-5 items-center justify-center overflow-hidden rounded-full border bg-black/70 transition-colors",
            active ? "border-[#f6e05e]/70 bg-[#f6e05e]/20" : "border-white/10",
          )}
        >
          <img src={iconUrl} alt={label} className="size-full object-cover" />
        </span>
      )}
      {label}
    </button>
  );
}

type LibraryListViewState = {
  selectedSoftware: string;
  selectedPrice: PriceFilter;
  sortBy: SortOption;
};

const initialState: LibraryListViewState = {
  selectedSoftware: "all",
  selectedPrice: "all",
  sortBy: "latest",
};

export default function LibraryListView() {
  const [state, setState] = useState<LibraryListViewState>(initialState);
  const convex = useConvex();

  const resources = useQuery(api.library.listResources, { activeOnly: true }) as
    | LibraryResourceDoc[]
    | undefined;
  const softwares = useQuery(api.library.listSoftwares, { activeOnly: true }) as
    | LibrarySoftwareDoc[]
    | undefined;
  const media = useQuery(api.media.list, { kind: "image" }) as MediaImageDoc[] | undefined;

  const extrasRef = useRef<ResourceExtrasMap>({});
  const [extras, setExtras] = useState<ResourceExtrasMap>({});
  const loadedVersions = useRef(new Map<string, number>());

  useEffect(() => {
    if (!resources) return;

    const pending = resources.filter((resource) => {
      const id = String(resource._id);
      const storedVersion = loadedVersions.current.get(id);
      return storedVersion !== resource.updatedAt;
    });

    if (pending.length === 0) return;

    let cancelled = false;

    (async () => {
      const results = await Promise.all(
        pending.map(async (resource) => {
          try {
            const detail = await convex.query(api.library.getResourceDetail, {
              id: resource._id as Id<"library_resources">,
              includeInactive: false,
            });
            return { resource, detail } as const;
          } catch (error) {
            console.error("Không thể tải chi tiết resource", error);
            return { resource, detail: null } as const;
          }
        }),
      );

      if (cancelled) return;

      const nextExtras: ResourceExtrasMap = { ...extrasRef.current };
      let changed = false;

      for (const { resource, detail } of results) {
        const id = String(resource._id);
        loadedVersions.current.set(id, resource.updatedAt);
        const softwaresList = detail?.softwares ?? [];
        nextExtras[id] = softwaresList;
        changed = true;
      }

      if (changed) {
        extrasRef.current = nextExtras;
        setExtras(nextExtras);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [convex, resources]);

  const mediaMap = useMemo(() => {
    const map = new Map<string, MediaImageDoc>();
    if (Array.isArray(media)) {
      for (const item of media) {
        map.set(String(item._id), item);
      }
    }
    return map;
  }, [media]);

  const softwareBadges = useMemo(() => {
    if (!softwares) return [] as SoftwareBadge[];
    return softwares.map((software) => ({
      slug: software.slug,
      name: software.name,
      iconUrl: software.iconImageId ? mediaMap.get(String(software.iconImageId))?.url : undefined,
    }));
  }, [mediaMap, softwares]);

  const filteredResources = useMemo(() => {
    if (!resources) return [] as LibraryResourceDoc[];

    const items = resources
      .filter((resource) => {
        if (state.selectedPrice !== "all" && resource.pricingType !== state.selectedPrice) {
          return false;
        }
        if (state.selectedSoftware === "all") return true;
        const list = extras[String(resource._id)];
        if (!list) return true;
        return list.some((entry) => entry.software.slug === state.selectedSoftware);
      })
      .slice();

    items.sort((a, b) => {
      switch (state.sortBy) {
        case "latest":
          return b.createdAt - a.createdAt;
        case "oldest":
          return a.createdAt - b.createdAt;
        case "alphabetical":
          return a.title.localeCompare(b.title, "vi");
        default:
          return 0;
      }
    });

    return items;
  }, [extras, resources, state.selectedPrice, state.selectedSoftware, state.sortBy]);

  const highlightResource = filteredResources[0] ?? resources?.[0] ?? null;
  const highlightCover = highlightResource?.coverImageId
    ? mediaMap.get(String(highlightResource.coverImageId))?.url
    : undefined;

  const isLoading = resources === undefined;

  return (
    <div className="bg-[#05070f] text-white">
      <section className="relative overflow-hidden border-b border-white/5">
        <div className="absolute inset-0">
          {highlightCover ? (
            <img src={highlightCover} alt="Library hero" className="h-full w-full object-cover" />
          ) : (
            <div className="h-full w-full bg-[radial-gradient(circle_at_top,_#1d2742,_#05070f_60%)]" />
          )}
          <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/80 to-[#05070f]" />
        </div>
        <div className="relative mx-auto flex max-w-6xl flex-col gap-6 px-6 py-24 sm:px-10 lg:py-28">
          <span className="inline-flex w-fit items-center rounded-full border border-white/20 bg-white/10 px-4 py-1 text-xs uppercase tracking-[0.4em] text-white/70 backdrop-blur">
            Dohy Library
          </span>
          <div className="max-w-2xl">
            <h1 className="text-4xl font-semibold uppercase tracking-[0.35em] text-white sm:text-5xl">
              Thư viện
            </h1>
            <p className="mt-6 text-base text-white/80">
              Khám phá bộ sưu tập tài nguyên sáng tạo chất lượng cao dành cho dự án của bạn. Bộ lọc linh hoạt, cập nhật liên tục và tối ưu cho quy trình hậu kỳ.
            </p>
          </div>
          <div className="flex flex-wrap gap-3 text-xs uppercase tracking-[0.25em] text-white/75">
            <span className="rounded-full border border-white/15 bg-black/60 px-4 py-2 backdrop-blur">
              {resources ? `${resources.length} tài nguyên` : "Đang tải dữ liệu"}
            </span>
            <span className="rounded-full border border-white/15 bg-black/60 px-4 py-2 backdrop-blur">
              Cập nhật liên tục
            </span>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-16 sm:px-10">
        <div className="flex flex-wrap items-center justify-between gap-6">
          <div>
            <p className="text-sm uppercase tracking-[0.4em] text-white/55">Bộ sưu tập</p>
            <h2 className="mt-2 text-2xl font-semibold text-white sm:text-3xl">
              Tìm thấy {isLoading ? "..." : filteredResources.length} tài nguyên
            </h2>
          </div>
          <div className="flex items-center gap-3">
            <label className="text-xs uppercase tracking-[0.3em] text-white/55">Sắp xếp</label>
            <select
              value={state.sortBy}
              onChange={(event) =>
                setState((prev) => ({ ...prev, sortBy: event.target.value as SortOption }))
              }
              className="rounded-full border border-white/15 bg-black/60 px-4 py-2 text-sm text-white focus:border-primary focus:outline-none"
            >
              {sortOptions.map((option) => (
                <option key={option.value} value={option.value} className="text-black">
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-10 rounded-3xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur">
          <div className="flex items-center gap-2 text-xs uppercase tracking-[0.3em] text-white/55">
            <SlidersHorizontal className="size-4" />
            Bộ lọc tài nguyên
          </div>

          <div className="mt-6 flex flex-col gap-8">
            <div className="space-y-3">
              <div className="text-xs uppercase tracking-[0.25em] text-white/55">Phần mềm</div>
              {softwares === undefined ? (
                <div className="flex flex-wrap gap-2">
                  {Array.from({ length: 6 }).map((_, index) => (
                    <Skeleton key={index} className="h-8 w-24 rounded-full" />
                  ))}
                </div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  <FilterPill
                    active={state.selectedSoftware === "all"}
                    label="Tất cả"
                    onClick={() => setState((prev) => ({ ...prev, selectedSoftware: "all" }))}
                  />
                  {softwareBadges.map((software) => (
                    <FilterPill
                      key={software.slug}
                      active={state.selectedSoftware === software.slug}
                      label={software.name}
                      iconUrl={software.iconUrl}
                      onClick={() =>
                        setState((prev) => ({ ...prev, selectedSoftware: software.slug }))
                      }
                    />
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-3">
              <div className="text-xs uppercase tracking-[0.25em] text-white/55">Giá</div>
              <div className="flex flex-wrap gap-2">
                {priceOptions.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setState((prev) => ({ ...prev, selectedPrice: option.value }))}
                    className={cn(
                      "rounded-full border px-5 py-2 text-xs uppercase tracking-[0.25em] transition-all duration-300",
                      state.selectedPrice === option.value
                        ? "border-transparent bg-gradient-to-br from-[#f6e05e] to-[#f0b429] text-[#18120b] shadow-[0_0_20px_rgba(240,180,41,0.3)]"
                        : "border-white/5 bg-white/[0.02] text-white/65 hover:text-white hover:border-white/15",
                    )}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {isLoading &&
            Array.from({ length: 6 }).map((_, index) => <LibraryCardSkeleton key={index} />)}

          {!isLoading && filteredResources.length === 0 && (
            <div className="col-span-full flex flex-col items-center gap-3 rounded-3xl border border-white/10 bg-white/[0.03] p-12 text-center">
              <p className="text-base font-medium text-white/80">Không tìm thấy tài nguyên phù hợp.</p>
              <p className="max-w-md text-sm text-white/65">
                Thử thay đổi bộ lọc phần mềm hoặc giá để xem thêm các tài nguyên khác trong thư viện.
              </p>
              <Button
                variant="outline"
                className="rounded-full border-white/10 bg-white/[0.02] text-xs uppercase tracking-[0.25em] text-white/70 hover:bg-white/[0.08] hover:text-white"
                onClick={() => setState(initialState)}
              >
                Đặt lại bộ lọc
              </Button>
            </div>
          )}

          {filteredResources.map((resource) => {
            const coverUrl = resource.coverImageId
              ? mediaMap.get(String(resource.coverImageId))?.url
              : undefined;
            const resourceSoftwares = extras[String(resource._id)] ?? [];
            const softwaresForCard: SoftwareBadge[] = resourceSoftwares.map((entry) => ({
              slug: entry.software.slug,
              name: entry.software.name,
              iconUrl: entry.software.iconImageId
                ? mediaMap.get(String(entry.software.iconImageId))?.url
                : undefined,
            }));

            return (
              <LibraryCard
                key={String(resource._id)}
                resource={resource}
                coverUrl={coverUrl}
                softwares={softwaresForCard}
              />
            );
          })}
        </div>
      </section>


    </div>
  );
}
