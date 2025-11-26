"use client";

import Link from "next/link";
import type { Route } from "next";
import { useEffect, useMemo, useState } from "react";
import { useQuery } from "convex/react";
import { ArrowUpRight } from "lucide-react";
import { api } from "@dohy/backend/convex/_generated/api";
import { Skeleton } from "@/components/ui/skeleton";
import type { MediaDoc, ProjectCategoryDoc, ProjectDoc } from "./types";

type TabValue = "all" | string;

type TabButtonProps = {
  label: string;
  isActive: boolean;
  onClick: () => void;
};

type FiltersProps = {
  categories: ProjectCategoryDoc[];
  activeTab: TabValue;
  onChange: (value: TabValue) => void;
  loading: boolean;
};

type ProjectCardProps = {
  project: ProjectDoc;
  imageUrl?: string;
  categoryName?: string;
};

const TabButton = ({ label, isActive, onClick }: TabButtonProps) => (
  <button
    onClick={onClick}
    className={`relative rounded-full px-5 py-2 text-sm font-semibold transition-all duration-300 ease-out ${
      isActive
        ? "bg-amber-500 text-slate-900 shadow-[0_0_20px_rgba(245,158,11,0.35)] scale-105"
        : "border border-white/10 bg-white/5 text-slate-300 hover:border-amber-200/60 hover:text-white hover:bg-white/10"
    }`}
  >
    {label}
  </button>
);

const Filters = ({ categories, activeTab, onChange, loading }: FiltersProps) => {
  if (loading) {
    return (
      <div className="mb-10 flex flex-wrap items-center justify-center gap-3">
        {Array.from({ length: 4 }).map((_, idx) => (
          <Skeleton
            key={idx}
            className="h-9 w-24 rounded-full border border-white/5 bg-white/5"
          />
        ))}
      </div>
    );
  }

  return (
    <div className="mb-10 flex flex-wrap items-center justify-center gap-3">
      <TabButton label="Tất cả" isActive={activeTab === "all"} onClick={() => onChange("all")} />
      {categories.map((cat) => (
        <TabButton
          key={cat.slug}
          label={cat.name}
          isActive={activeTab === cat.slug}
          onClick={() => onChange(cat.slug)}
        />
      ))}
    </div>
  );
};

const CardSkeleton = () => (
  <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/5">
    <Skeleton className="aspect-[4/3] w-full rounded-none bg-slate-800/70" />
    <div className="absolute inset-x-0 bottom-0 space-y-3 p-6">
      <Skeleton className="h-5 w-2/3 rounded bg-slate-700/60" />
      <Skeleton className="h-1 w-1/3 rounded bg-slate-700/60" />
    </div>
  </div>
);

const ProjectCard = ({ project, imageUrl, categoryName }: ProjectCardProps) => {
  const detailHref = `/project/${project.slug}` as Route;

  return (
    <Link
      href={detailHref}
      className="group relative block overflow-hidden rounded-2xl border border-white/10 bg-[#0c1428] shadow-[0_25px_70px_rgba(0,0,0,0.55)] transition-all duration-500 hover:-translate-y-1.5 hover:border-amber-400/70"
    >
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-slate-900/60">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={project.title}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-xs uppercase tracking-[0.3em] text-amber-200/80">
            Chưa có ảnh
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/30 to-transparent opacity-70 transition-opacity duration-500 group-hover:opacity-90" />
        {categoryName ? (
          <div className="absolute left-3 top-3 rounded-full border border-white/10 bg-black/40 px-3 py-1 text-xs font-semibold text-amber-200 backdrop-blur-md">
            {categoryName}
          </div>
        ) : null}
      </div>

      <div className="pointer-events-none absolute inset-x-0 bottom-0 p-6">
        <div className="flex items-center justify-between gap-4 translate-y-2 transition-transform duration-500 group-hover:translate-y-0">
          <h3 className="text-xl font-semibold leading-tight text-slate-100 line-clamp-2 group-hover:text-white">
            {project.title}
          </h3>
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/10 backdrop-blur-md opacity-0 translate-y-2 transition-all duration-500 group-hover:opacity-100 group-hover:translate-y-0">
            <ArrowUpRight className="h-5 w-5 text-amber-400" />
          </span>
        </div>
        <div className="mt-4 h-0.5 w-0 bg-gradient-to-r from-amber-400 via-yellow-300 to-white opacity-0 transition-all duration-500 group-hover:w-full group-hover:opacity-100" />
      </div>
    </Link>
  );
};

export default function ProjectListView() {
  const categories = useQuery(api.projects.listCategories, { includeInactive: false }) as
    | ProjectCategoryDoc[]
    | undefined;
  const projects = useQuery(api.projects.listProjects, { includeInactive: false }) as
    | ProjectDoc[]
    | undefined;
  const media = useQuery(api.media.list, { kind: "image" }) as MediaDoc[] | undefined;

  const [activeTab, setActiveTab] = useState<TabValue>("all");

  const categoryBySlug = useMemo(
    () => new Map((categories ?? []).map((cat) => [cat.slug, cat])),
    [categories],
  );

  const categoryById = useMemo(
    () => new Map((categories ?? []).map((cat) => [String(cat._id), cat])),
    [categories],
  );

  const mediaMap = useMemo(
    () => new Map((media ?? []).map((item) => [String(item._id), item])),
    [media],
  );

  const sortedCategories = useMemo(
    () => [...(categories ?? [])].sort((a, b) => a.order - b.order),
    [categories],
  );

  const sortedProjects = useMemo(
    () =>
      [...(projects ?? [])]
        .filter((project) => project.active)
        .sort((a, b) => a.order - b.order),
    [projects],
  );

  useEffect(() => {
    if (activeTab === "all" || categoryBySlug.size === 0) return;
    if (!categoryBySlug.has(activeTab)) {
      const first = sortedCategories[0];
      if (first) setActiveTab(first.slug);
    }
  }, [activeTab, categoryBySlug, sortedCategories]);

  const filteredProjects = useMemo(() => {
    if (activeTab === "all") return sortedProjects;
    const selected = categoryBySlug.get(activeTab);
    if (!selected) return [];
    return sortedProjects.filter(
      (project) => project.categoryId && String(project.categoryId) === String(selected._id),
    );
  }, [activeTab, categoryBySlug, sortedProjects]);

  return (
    <section className="relative min-h-screen w-full overflow-hidden bg-[#020617] text-slate-100">
      <div className="pointer-events-none absolute left-1/2 top-[-6rem] h-[420px] w-[780px] -translate-x-1/2 rounded-full bg-amber-500/15 blur-[140px]" />
      <div className="pointer-events-none absolute bottom-[-12rem] right-[-8rem] h-[520px] w-[520px] rounded-full bg-blue-900/25 blur-[130px]" />

      <div className="relative mx-auto max-w-7xl px-6 pb-16 pt-28 sm:px-10 sm:pt-32">
        <div className="mb-10 space-y-3 text-center animate-fade-in">
          <p className="text-sm uppercase tracking-[0.3em] text-amber-300/80">Projects</p>
          <h1 className="text-4xl font-bold tracking-tight text-white md:text-5xl font-serif">
            Dự án
            {" "}
            <span className="bg-gradient-to-r from-amber-400 to-yellow-200 bg-clip-text text-transparent">
              tiêu biểu
            </span>
          </h1>
          <p className="mx-auto max-w-2xl text-base text-slate-400">
            Những dự án sáng tạo tiêu biểu từ DOHY Studio. Lọc theo danh mục để xem đúng lĩnh vực bạn quan tâm.
          </p>
        </div>

        <Filters
          categories={sortedCategories}
          activeTab={activeTab}
          onChange={setActiveTab}
          loading={categories === undefined}
        />

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {projects === undefined ? (
            Array.from({ length: 6 }).map((_, idx) => <CardSkeleton key={idx} />)
          ) : filteredProjects.length === 0 ? (
            <div className="col-span-full rounded-2xl border border-white/10 bg-white/5 p-10 text-center text-slate-300">
              Chưa có dự án trong danh mục này.
            </div>
          ) : (
            filteredProjects.map((project) => (
              <ProjectCard
                key={String(project._id)}
                project={project}
                categoryName={
                  project.categoryId
                    ? categoryById.get(String(project.categoryId))?.name ?? undefined
                    : undefined
                }
                imageUrl={
                  project.thumbnailId ? mediaMap.get(String(project.thumbnailId))?.url : undefined
                }
              />
            ))
          )}
        </div>
      </div>
    </section>
  );
}
