"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { useConvex, useQuery } from "convex/react";
import { api } from "@dohy/backend/convex/_generated/api";
import type { Id } from "@dohy/backend/convex/_generated/dataModel";
import { SlidersHorizontal } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn, stripHtml } from "@/lib/utils";
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
        badgeClassName: "bg-emerald-500/90 text-white border-0",
    },
    paid: {
        label: "Premium",
        badgeClassName: "bg-amber-500/90 text-white border-0",
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
            className="group flex h-full flex-col overflow-hidden rounded-3xl border border-[#f5c542]/20 bg-[#0c0a12] shadow-[0_12px_40px_rgba(0,0,0,0.35)] transition duration-300 hover:-translate-y-1 hover:border-[#f5c542]/60 hover:shadow-[0_18px_45px_rgba(245,197,66,0.2)]"
        >
            <div className="relative aspect-video overflow-hidden bg-gradient-to-br from-[#f5c542]/20 via-transparent to-transparent">
                {coverUrl ? (
                    <img
                        src={coverUrl}
                        alt={resource.title}
                        className="h-full w-full object-cover transition duration-700 group-hover:scale-105 group-hover:brightness-110"
                    />
                ) : (
                    <div className="flex h-full items-center justify-center text-xs uppercase tracking-[0.35em] text-white/35">
                        Chưa có ảnh
                    </div>
                )}
                <div className="absolute left-3 top-3">
                    <Badge className={cn("text-xs font-medium", pricing.badgeClassName)}>{pricing.label}</Badge>
                </div>
                {softwares.length > 0 && (
                    <div className="absolute right-3 top-3 flex -space-x-2">
                        {softwares.slice(0, 2).map((software) => (
                            <div
                                key={software.slug}
                                className="flex size-8 items-center justify-center rounded-full border border-[#f5c542]/40 bg-[#f5c542]/10 text-xs font-medium text-white"
                                title={software.name}
                            >
                                {software.iconUrl ? (
                                    <img
                                        src={software.iconUrl}
                                        alt={software.name}
                                        className="size-full rounded-full object-cover"
                                    />
                                ) : (
                                    software.name.slice(0, 2).toUpperCase()
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <div className="flex flex-1 flex-col gap-3 p-4">
                <div className="flex-1">
                    <h3 className="text-base font-semibold leading-snug text-white transition-colors duration-300 group-hover:text-[#f5c542]">
                        {resource.title}
                    </h3>
                    {resource.description && (
                        <p className="mt-1 line-clamp-2 text-sm text-white/70">
                            {stripHtml(resource.description)}
                        </p>
                    )}
                </div>

                <div className="mt-auto flex items-start justify-end border-t border-[#f5c542]/20 pt-3 text-sm text-white/80">
                    <span className="text-sm font-semibold text-[#f8d37f] group-hover:text-[#fadb51] transition-colors">
                        {resource.pricingType === "free" ? "Miễn phí" : "Trả phí"}
                    </span>
                </div>
            </div>
        </Link>
    );
}

function LibraryCardSkeleton() {
    return (
        <div className="flex h-full flex-col overflow-hidden rounded-3xl border border-white/10 bg-[#0c0a12] shadow-[0_12px_40px_rgba(0,0,0,0.35)]">
            <Skeleton className="aspect-video w-full" />
            <div className="flex flex-1 flex-col gap-3 p-4">
                <Skeleton className="h-5 w-2/3 rounded-lg" />
                <Skeleton className="h-3 w-full rounded-lg" />
                <Skeleton className="h-3 w-4/5 rounded-lg" />
                <Skeleton className="mt-auto h-4 w-1/3 rounded-lg" />
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
                "inline-flex items-center gap-2 rounded-lg border px-4 py-2 text-xs font-medium uppercase tracking-wider transition-all duration-200",
                active
                    ? "border-[#f5c542]/50 bg-[#f5c542]/20 text-[#f8d37f]"
                    : "border-white/15 bg-white/[0.04] text-white/70 hover:border-white/25 hover:bg-white/[0.08]",
            )}
        >
            {iconUrl && (
                <span
                    className={cn(
                        "flex size-5 items-center justify-center overflow-hidden rounded-full border transition-colors",
                        active ? "border-[#f5c542]/50 bg-[#f5c542]/20" : "border-white/20 bg-white/10",
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
        <div className="min-h-screen bg-[#05070f] text-white">
            <section className="mx-auto max-w-6xl px-6 pt-32 sm:px-10 sm:pt-36">
                <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
                    <div>
                        <h2 className="text-2xl font-bold text-white">
                            {isLoading ? "Đang tải..." : `${filteredResources.length} tài nguyên`}
                        </h2>
                    </div>
                    <div className="flex items-center gap-3">
                        <label className="text-xs font-medium uppercase tracking-wider text-white/60">Sắp xếp</label>
                        <select
                            value={state.sortBy}
                            onChange={(event) =>
                                setState((prev) => ({ ...prev, sortBy: event.target.value as SortOption }))
                            }
                            className="rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-sm text-white focus:border-[#f5c542]/50 focus:outline-none focus:ring-1 focus:ring-[#f5c542]/30"
                        >
                            {sortOptions.map((option) => (
                                <option key={option.value} value={option.value} className="bg-[#0c0a12] text-white">
                                    {option.label}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="mt-8 rounded-2xl border border-white/10 bg-white/[0.03] p-5">
                    <div className="flex items-center gap-2 text-sm font-semibold text-white">
                        <SlidersHorizontal className="size-4" />
                        Bộ lọc
                    </div>

                    <div className="mt-5 flex flex-col gap-5">
                        <div className="space-y-3">
                            <div className="text-xs font-semibold uppercase tracking-wider text-white/60">Phần mềm</div>
                            {softwares === undefined ? (
                                <div className="flex flex-wrap gap-2">
                                    {Array.from({ length: 4 }).map((_, index) => (
                                        <Skeleton key={index} className="h-8 w-20 rounded-full" />
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
                            <div className="text-xs font-semibold uppercase tracking-wider text-white/60">Giá</div>
                            <div className="flex flex-wrap gap-2">
                                {priceOptions.map((option) => (
                                    <button
                                        key={option.value}
                                        type="button"
                                        onClick={() => setState((prev) => ({ ...prev, selectedPrice: option.value }))}
                                        className={cn(
                                            "rounded-lg border px-4 py-2 text-xs font-medium uppercase tracking-wider transition-all duration-200",
                                            state.selectedPrice === option.value
                                                ? "border-[#f5c542]/50 bg-[#f5c542]/20 text-[#f8d37f]"
                                                : "border-white/15 bg-white/[0.04] text-white/70 hover:border-white/25 hover:bg-white/[0.08]",
                                        )}
                                    >
                                        {option.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mt-10 grid gap-6 pb-16 sm:grid-cols-2 lg:grid-cols-3">
                    {isLoading &&
                        Array.from({ length: 6 }).map((_, index) => <LibraryCardSkeleton key={index} />)}

                    {!isLoading && filteredResources.length === 0 && (
                        <div className="col-span-full flex flex-col items-center gap-4 rounded-2xl border border-white/10 bg-white/[0.03] p-12 text-center">
                            <p className="text-base font-medium text-white">Không tìm thấy tài nguyên phù hợp.</p>
                            <p className="max-w-md text-sm text-white/65">
                                Thử thay đổi bộ lọc phần mềm hoặc giá để xem thêm các tài nguyên khác.
                            </p>
                            <Button
                                variant="outline"
                                className="rounded-lg border-white/15 bg-white/[0.04] text-xs font-medium uppercase tracking-wider text-white/70 hover:border-[#f5c542]/50 hover:bg-[#f5c542]/20 hover:text-[#f8d37f]"
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
