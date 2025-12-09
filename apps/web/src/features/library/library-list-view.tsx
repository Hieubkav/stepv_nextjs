"use client";

import Link from "next/link";
import type { Route } from "next";
import { useEffect, useMemo, useRef, useState } from "react";
import { useConvex, useQuery } from "convex/react";
import { api } from "@dohy/backend/convex/_generated/api";
import type { Id } from "@dohy/backend/convex/_generated/dataModel";
import { Search } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import { cn, stripHtml } from "@/lib/utils";
import { formatPrice } from "@/lib/format";
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

type ResourceExtras = {
  softwares: LibraryResourceSoftwareLink[];
  firstImageMediaId?: Id<"media">;
};

type ResourceExtrasMap = Record<string, ResourceExtras>;

const pricingConfig: Record<LibraryResourceDoc["pricingType"], { label: string; badgeClassName: string }> = {
  free: {
    label: "Miễn phí",
    badgeClassName: "border-emerald-400/60 bg-emerald-500/15 text-emerald-50",
  },
  paid: {
    label: "Trả phí",
    badgeClassName: "border-amber-400/60 bg-amber-500/15 text-amber-50",
  },
};

function normalizeText(value: unknown) {
  return typeof value === "string" ? value.normalize("NFC").toLowerCase() : "";
}

type LibraryCardProps = {
  resource: LibraryResourceDoc;
  coverUrl?: string;
  softwares: SoftwareBadge[];
};

function LibraryCard({ resource, coverUrl, softwares }: LibraryCardProps) {
  const pricing = pricingConfig[resource.pricingType];
  const detailHref = `/thu-vien/${resource.slug}` as Route;
  const paidPriceLabel =
    typeof resource.price === "number" && resource.price > 0
      ? formatPrice(resource.price)
      : "Trả phí";
  const priceLabel = resource.pricingType === "free" ? "Miễn phí" : paidPriceLabel;
  const compareLabel =
    resource.originalPrice && resource.originalPrice > (resource.price ?? 0)
      ? formatPrice(resource.originalPrice)
      : null;

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-xl border border-slate-800/70 bg-[#050914] shadow-[0_20px_60px_rgba(0,0,0,0.5)] transition-all duration-300 hover:-translate-y-1 hover:border-amber-400/70 hover:shadow-[0_25px_80px_rgba(255,191,0,0.16)]">
      <div className="relative aspect-video overflow-hidden bg-[#0a1424]">
        {coverUrl ? (
          <img
            src={coverUrl}
            alt={resource.title}
            className="h-full w-full object-cover transition duration-700 group-hover:scale-105 group-hover:brightness-110"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-xs uppercase tracking-[0.35em] text-amber-200/70">
          Chưa có ảnh
          </div>
        )}

        <div className="absolute left-3 top-3 drop-shadow-[0_10px_25px_rgba(0,0,0,0.35)]">
          <Badge
            className={cn(
              "border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em]",
              pricing.badgeClassName,
            )}
          >
            {pricing.label}
          </Badge>
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-3 p-4 text-slate-100">
        <div className="space-y-2">
          <h3 className="line-clamp-2 text-base font-semibold leading-tight text-white transition-colors duration-300 group-hover:text-amber-300">
            {resource.title}
          </h3>
          {resource.description ? (
            <p className="line-clamp-2 text-xs text-slate-400">{stripHtml(resource.description)}</p>
          ) : null}
        </div>

        {softwares.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {softwares.slice(0, 3).map((software) => (
              <span
                key={software.slug}
                className="inline-flex items-center gap-1 rounded-full border border-amber-500/40 bg-[#0a1424] px-3 py-1 text-[11px] font-semibold text-amber-100"
              >
                {software.iconUrl ? (
                  <img
                    src={software.iconUrl}
                    alt={software.name}
                    className="size-4 rounded-full object-cover"
                  />
                ) : null}
                {software.name}
              </span>
            ))}
            {softwares.length > 3 ? (
              <span className="rounded-full border border-amber-500/40 bg-[#0a1424] px-3 py-1 text-[11px] font-semibold text-amber-100">
                +{softwares.length - 3}
              </span>
            ) : null}
          </div>
        ) : null}

        <div className="mt-auto flex items-center justify-end">
          <div className="flex items-baseline gap-2">
            <span className="text-sm font-semibold bg-gradient-to-r from-amber-300 via-amber-200 to-yellow-200 bg-clip-text text-transparent drop-shadow-[0_0_18px_rgba(255,193,7,0.25)]">
              {priceLabel}
            </span>
            {compareLabel ? (
              <span className="text-[11px] text-amber-100/70 line-through">{compareLabel}</span>
            ) : null}
          </div>
        </div>
      </div>

      <div className="border-t border-slate-800/70 bg-[#081120] px-4 py-3">
        <Link
          href={detailHref}
          className="block rounded-lg bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-300 px-3 py-2.5 text-center text-sm font-semibold text-black transition-all duration-200 hover:translate-y-[-1px] hover:shadow-[0_18px_40px_rgba(255,193,7,0.35)] active:opacity-95"
        >
          Xem chi tiết
        </Link>
      </div>
    </article>
  );
}

function LibraryCardSkeleton() {
  return (
    <div className="flex h-full flex-col overflow-hidden rounded-xl border border-slate-800/70 bg-[#050914] shadow-[0_20px_60px_rgba(0,0,0,0.45)]">
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

type LibraryListViewState = {
  selectedSoftware: string;
  selectedPrice: PriceFilter;
  sortBy: SortOption;
  searchTerm: string;
};

const initialState: LibraryListViewState = {
  selectedSoftware: "all",
  selectedPrice: "all",
  sortBy: "latest",
  searchTerm: "",
};

export default function LibraryListView() {
  const [state, setState] = useState<LibraryListViewState>(initialState);
  const [headerOffset, setHeaderOffset] = useState(120);
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
            console.error("Không thể tải chi tiết tài nguyên", error);
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
        const firstImageMediaId = detail?.images?.[0]?.mediaId;
        const previous = extrasRef.current[id];
        const nextEntry: ResourceExtras = {
          softwares: softwaresList,
          firstImageMediaId: firstImageMediaId ?? previous?.firstImageMediaId,
        };
        const hasChanged =
          !previous ||
          previous.firstImageMediaId !== nextEntry.firstImageMediaId ||
          previous.softwares !== nextEntry.softwares;
        if (hasChanged) {
          nextExtras[id] = nextEntry;
          changed = true;
        }
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

    const query = normalizeText(state.searchTerm);
    const items = resources
      .filter((resource) => {
        if (state.selectedPrice !== "all" && resource.pricingType !== state.selectedPrice) {
          return false;
        }
        if (state.selectedSoftware !== "all") {
          const list = extras[String(resource._id)]?.softwares;
          if (!list || !list.some((entry) => entry.software.slug === state.selectedSoftware)) {
            return false;
          }
        }
        if (!query) return true;
        const haystack = [resource.title, resource.description ?? "", resource.slug];
        return haystack.some((text) => normalizeText(text).includes(query));
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
  }, [extras, resources, state.searchTerm, state.selectedPrice, state.selectedSoftware, state.sortBy]);

  const isLoading = resources === undefined || softwares === undefined;

  const selectedSoftwareBadge = softwareBadges.find((s) => s.slug === state.selectedSoftware);

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
              Tài nguyên
            </h1>
          </div>

          <section className="rounded-xl border border-slate-800/70 bg-[#050914]/90 p-4 shadow-[0_22px_60px_rgba(0,0,0,0.55)]">
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex min-w-[240px] flex-1 items-center gap-2 rounded-lg border border-slate-800/70 bg-[#0a1220] px-4 py-2.5 shadow-inner shadow-black/40">
                <Search className="size-4 text-amber-300/90" />
                <input
                  value={state.searchTerm}
                  onChange={(event) => setState((prev) => ({ ...prev, searchTerm: event.target.value }))}
                  placeholder="Tìm tài nguyên..."
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

              <label className="flex items-center gap-2 rounded-lg border border-slate-800/70 bg-[#0a1220] px-4 py-2.5 md:shrink-0 text-white">
                <span className="whitespace-nowrap text-sm font-semibold text-slate-200/80">Giá</span>
                <select
                  value={state.selectedPrice}
                  onChange={(event) =>
                    setState((prev) => ({ ...prev, selectedPrice: event.target.value as PriceFilter }))
                  }
                  className="bg-transparent text-sm text-white outline-none"
                >
                  {priceOptions.map((option) => (
                    <option key={option.value} value={option.value} className="bg-[#050914] text-white">
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>

              <div className="flex items-center gap-2 rounded-lg border border-slate-800/70 bg-[#0a1220] px-4 py-2.5 md:shrink-0 text-white">
                <span className="whitespace-nowrap text-sm font-semibold text-slate-200/80">Phần mềm</span>
                <Select
                  value={state.selectedSoftware}
                  onValueChange={(value) => setState((prev) => ({ ...prev, selectedSoftware: value }))}
                >
                  <SelectTrigger className="h-auto min-w-[140px] border-0 bg-transparent p-0 text-sm text-white shadow-none outline-none ring-0 focus:ring-0 [&>svg]:text-white">
                    {state.selectedSoftware === "all" ? (
                      <span>Tất cả phần mềm</span>
                    ) : (
                      <span className="flex items-center gap-2">
                        {selectedSoftwareBadge?.iconUrl && (
                          <img
                            src={selectedSoftwareBadge.iconUrl}
                            alt=""
                            className="size-5 rounded object-cover"
                          />
                        )}
                        {selectedSoftwareBadge?.name}
                      </span>
                    )}
                  </SelectTrigger>
                  <SelectContent className="border-slate-800 bg-[#050914]">
                    <SelectItem value="all" className="text-white focus:bg-slate-800 focus:text-white">
                      Tất cả phần mềm
                    </SelectItem>
                    {softwareBadges.map((software) => (
                      <SelectItem
                        key={software.slug}
                        value={software.slug}
                        className="text-white focus:bg-slate-800 focus:text-white"
                      >
                        <span className="flex items-center gap-2">
                          {software.iconUrl ? (
                            <img
                              src={software.iconUrl}
                              alt={software.name}
                              className="size-5 rounded object-cover"
                            />
                          ) : (
                            <span className="size-5 rounded bg-slate-700" />
                          )}
                          {software.name}
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </section>
        </div>

        {filteredResources.length === 0 && !isLoading ? (
          <div className="rounded-xl border border-dashed border-slate-800/60 bg-[#050914]/80 px-6 py-16 text-center shadow-[0_20px_60px_rgba(0,0,0,0.55)]">
            <div className="space-y-3">
              <div className="text-5xl">🤔</div>
              <p className="text-lg font-semibold text-white">Không tìm thấy tài nguyên</p>
              <p className="text-sm text-amber-100/80">
                Hãy thử thay đổi bộ lọc, tìm kiếm hoặc chọn lại "Tất cả" để xem toàn bộ thư viện.
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

        <section className="grid grid-cols-1 gap-5 pb-16 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {isLoading
            ? Array.from({ length: 8 }).map((_, index) => <LibraryCardSkeleton key={index} />)
            : filteredResources.map((resource) => {
                const extra = extras[String(resource._id)];
                const preferredMediaId =
                  extra?.firstImageMediaId ?? resource.coverImageId ?? undefined;
                const coverUrl = preferredMediaId
                  ? mediaMap.get(String(preferredMediaId))?.url
                  : undefined;
                const resourceSoftwares = extra?.softwares ?? [];
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
        </section>
      </div>
    </main>
  );
}
