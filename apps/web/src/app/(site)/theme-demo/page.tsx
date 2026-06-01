"use client";

import { useMemo, useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@dohy/backend/convex/_generated/api";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Globe, ChevronRight, Layout, FileText, CheckSquare, MessageSquare } from "lucide-react";

const TAGS_FILTER = [
  "Tất cả",
  "Spa & Làm đẹp",
  "Nha khoa & Y tế",
  "Khóa học & Giáo dục",
  "Nhà hàng & Quán cafe",
  "Bất động sản",
  "Giới thiệu công ty",
  "Bán hàng & E-commerce",
  "Khác",
];

export default function ThemeDemoPage() {
  const demos = useQuery(api.web_demos.list, { active: "true" }) as any[] | any | undefined;
  const media = useQuery(api.media.list, { kind: "image" }) as any[] | undefined;

  const [selectedTag, setSelectedTag] = useState("Tất cả");
  const [searchQuery, setSearchQuery] = useState("");

  const items = useMemo(() => {
    return demos?.items ?? [];
  }, [demos]);

  const mediaMap = useMemo(() => {
    const map = new Map<string, any>();
    if (Array.isArray(media)) {
      for (const item of media) {
        map.set(String(item._id), item);
      }
    }
    return map;
  }, [media]);

  // Lọc danh sách theo tag và ô tìm kiếm
  const filteredDemos = useMemo(() => {
    let result = [...items];

    if (selectedTag !== "Tất cả") {
      result = result.filter((item: any) => item.tags && item.tags.includes(selectedTag));
    }

    if (searchQuery.trim().length > 0) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (item: any) =>
          item.title.toLowerCase().includes(q) ||
          (item.summary && item.summary.toLowerCase().includes(q))
      );
    }

    return result;
  }, [items, selectedTag, searchQuery]);

  return (
    <main className="min-h-screen bg-slate-50/50 py-12 px-4 sm:px-6 lg:px-8">
      {/* SEO Title & Semantic H1 */}
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <Badge variant="outline" className="px-3 py-1 text-xs border-indigo-200 text-indigo-700 bg-indigo-50/50 rounded-full">
            Kho Giao Diện Độc Quyền
          </Badge>
          <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl">
            Chọn giao diện cho website
          </h1>
          <p className="text-base text-slate-500 max-w-2xl mx-auto">
            Hệ thống mẫu giao diện cao cấp được DOHY thiết kế chuẩn SEO, tối ưu tốc độ và tương thích 100% mọi thiết bị.
          </p>
        </div>

        {/* Search & Tabs Filter */}
        <div className="space-y-6">
          {/* Thanh tìm kiếm */}
          <div className="max-w-md mx-auto relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
            <Input
              id="search-theme-input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm kiếm giao diện..."
              className="pl-10 h-10 w-full rounded-full border-slate-200 shadow-sm focus-visible:ring-indigo-500 bg-white"
            />
          </div>

          {/* Hàng bộ lọc tabs */}
          <div className="flex flex-wrap items-center justify-center gap-1.5 overflow-x-auto pb-2">
            {TAGS_FILTER.map((tag) => {
              const isSelected = selectedTag === tag;
              return (
                <button
                  key={tag}
                  id={`tag-filter-${tag.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`}
                  onClick={() => setSelectedTag(tag)}
                  className={`px-4 py-2 text-xs font-semibold rounded-full transition-all duration-200 cursor-pointer whitespace-nowrap ${
                    isSelected
                      ? "bg-indigo-600 text-white shadow-sm"
                      : "bg-white text-slate-600 border border-slate-200/80 hover:bg-slate-50"
                  }`}
                >
                  {tag}
                </button>
              );
            })}
          </div>
        </div>

        {/* Lưới sản phẩm */}
        {demos === undefined ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 pt-6">
            {[1, 2, 3].map((n) => (
              <div key={n} className="h-96 rounded-2xl border bg-slate-100/50 animate-pulse" />
            ))}
          </div>
        ) : filteredDemos.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-slate-150 shadow-sm">
            <Layout className="size-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500 text-sm">Không tìm thấy mẫu giao diện nào phù hợp.</p>
          </div>
        ) : (
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 pt-6">
            {filteredDemos.map((item: any) => {
              const thumb = item.thumbnailId ? mediaMap.get(item.thumbnailId) : null;
              return (
                <article
                  key={String(item._id)}
                  className="group relative flex flex-col overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:shadow-lg hover:border-slate-200"
                >
                  {/* Aspect ratio container cho thumbnail */}
                  <div className="relative aspect-[16/10] w-full overflow-hidden bg-slate-100 border-b">
                    {thumb?.url ? (
                      <img
                        src={thumb.url}
                        alt={item.title}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                        loading="lazy"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-slate-50">
                        <Layout className="size-10 text-slate-300" />
                      </div>
                    )}
                    {/* Badge tag góc card */}
                    {item.tags && item.tags.length > 0 && (
                      <span className="absolute left-3 top-3 inline-flex items-center rounded-full bg-slate-900/85 px-2.5 py-0.5 text-[10px] font-semibold text-white backdrop-blur-xs">
                        {item.tags[0]}
                      </span>
                    )}
                  </div>

                  {/* Body Content */}
                  <div className="flex flex-1 flex-col p-5 space-y-4">
                    <div className="space-y-1.5 flex-1">
                      <h2 className="text-lg font-bold text-slate-900 line-clamp-1 group-hover:text-indigo-600 transition-colors">
                        <Link href={`/theme-demo/${item.slug}`}>
                          {item.title}
                        </Link>
                      </h2>
                      <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                        {item.summary || "Giao diện cao cấp được tối ưu mượt mà và chuẩn SEO."}
                      </p>
                    </div>

                    {/* Stats Icons */}
                    <div className="flex items-center gap-4 text-xs text-slate-400 border-t border-slate-50 pt-3">
                      <span className="flex items-center gap-1">
                        <Layout className="size-3.5 text-indigo-500" />
                        <strong>{item.sections ?? 0}</strong> Blocks
                      </span>
                      <span className="flex items-center gap-1">
                        <FileText className="size-3.5 text-indigo-500" />
                        <strong>{item.pages ?? 0}</strong> Trang
                      </span>
                      {item.forms !== undefined && item.forms > 0 && (
                        <span className="flex items-center gap-1">
                          <CheckSquare className="size-3.5 text-indigo-500" />
                          <strong>{item.forms}</strong> Form
                        </span>
                      )}
                    </div>

                    {/* Buttons */}
                    <div className="grid grid-cols-2 gap-2 pt-1">
                      <Button asChild size="sm" variant="outline" className="text-slate-700 border-slate-200 hover:bg-slate-50 text-xs font-semibold rounded-lg h-9">
                        <Link href={`/theme-demo/${item.slug}`}>
                          Xem chi tiết
                        </Link>
                      </Button>
                      {item.previewUrl ? (
                        <Button asChild size="sm" className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg h-9">
                          <a href={item.previewUrl} target="_blank" rel="noopener noreferrer">
                            <Globe className="mr-1.5 size-3.5" /> Demo
                          </a>
                        </Button>
                      ) : (
                        <Button size="sm" disabled className="bg-slate-100 text-slate-400 text-xs font-semibold rounded-lg h-9 border-0">
                          <Globe className="mr-1.5 size-3.5" /> No Demo
                        </Button>
                      )}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
