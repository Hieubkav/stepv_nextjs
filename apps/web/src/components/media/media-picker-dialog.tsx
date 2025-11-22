"use client";

import { useMemo, useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@dohy/backend/convex/_generated/api";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Image as ImageIcon, Video as VideoIcon, Link as LinkIcon, X } from "lucide-react";

export type MediaItem = {
  _id: string;
  kind?: "image" | "video";
  url?: string;
  externalUrl?: string;
  title?: string;
  createdAt?: number;
};

type MediaPickerDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (item: MediaItem) => void;
  selectedId?: string | null;
  title?: string;
  autoCloseOnSelect?: boolean;
  kind?: "image" | "video" | "all";
};

export function MediaPickerDialog({
  open,
  onOpenChange,
  onSelect,
  selectedId,
  title = "Chọn media",
  autoCloseOnSelect = true,
  kind = "image",
}: MediaPickerDialogProps) {
  const media = useQuery(api.media.list, kind === "all" ? {} : { kind }) as MediaItem[] | undefined;
  const [searchQuery, setSearchQuery] = useState("");

  const sortedMedia = useMemo(() => {
    if (!Array.isArray(media)) return [];
    return [...media].sort((a, b) => (b.createdAt ?? 0) - (a.createdAt ?? 0));
  }, [media]);

  const filteredMedia = useMemo(() => {
    const keyword = searchQuery.trim().toLowerCase();
    if (!keyword) return sortedMedia;
    return sortedMedia.filter((item) => {
      const title = item.title?.toLowerCase() ?? "";
      const id = String(item._id).toLowerCase();
      return title.includes(keyword) || id.includes(keyword);
    });
  }, [sortedMedia, searchQuery]);

  const isLoading = media === undefined;
  const isEmpty = !isLoading && sortedMedia.length === 0;
  const hasNoResults = !isLoading && filteredMedia.length === 0 && !!searchQuery;

  function handleSelect(item: MediaItem) {
    onSelect(item);
    if (autoCloseOnSelect) {
      onOpenChange(false);
    }
  }

  function renderPreview(item: MediaItem) {
    if (item.kind === "video") {
      if (item.url) {
        return <video src={item.url} className="h-full w-full object-cover" preload="metadata" muted />;
      }
      if (item.externalUrl) {
        return (
          <div className="flex h-full w-full items-center justify-center gap-2 text-xs text-muted-foreground px-3 text-center">
            <VideoIcon className="h-4 w-4" />
            <span>Video link</span>
          </div>
        );
      }
      return (
        <div className="flex h-full w-full items-center justify-center text-xs text-muted-foreground">
          <VideoIcon className="h-4 w-4" />
        </div>
      );
    }

    if (item.url) {
      return <img src={item.url} alt={item.title || "media"} className="h-full w-full object-contain p-2" loading="lazy" />;
    }

    return (
      <div className="flex h-full w-full items-center justify-center text-xs text-muted-foreground">
        <ImageIcon className="h-4 w-4" />
      </div>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[calc(100vw-2rem)] md:max-w-6xl lg:max-w-7xl max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-xl">{title}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 flex-1 min-h-0 flex flex-col">
          <div className="relative">
            <Input
              type="text"
              placeholder="Tìm kiếm media..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pr-8"
              aria-label="Tìm kiếm media"
            />
            {searchQuery && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 p-0"
                onClick={() => setSearchQuery("")}
                aria-label="Xóa tìm kiếm"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>

          <div className="flex-1 min-h-0 overflow-y-auto pr-2">
            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {Array.from({ length: 8 }).map((_, index) => (
                  <Skeleton key={index} className="h-48 w-full rounded-xl" />
                ))}
              </div>
            ) : isEmpty ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <ImageIcon className="h-16 w-16 text-muted-foreground/40 mb-4" />
                <p className="text-lg font-medium text-muted-foreground mb-2">Chưa có media nào</p>
                <p className="text-sm text-muted-foreground">Hãy tải media tại trang Media trước.</p>
              </div>
            ) : hasNoResults ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <ImageIcon className="h-16 w-16 text-muted-foreground/40 mb-4" />
                <p className="text-lg font-medium text-muted-foreground mb-2">Không tìm thấy kết quả</p>
                <p className="text-sm text-muted-foreground">Thử tìm kiếm với từ khóa khác</p>
                <Button type="button" variant="outline" size="sm" className="mt-4" onClick={() => setSearchQuery("")}>
                  Xóa bộ lọc
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {filteredMedia.map((item) => {
                  const id = String(item._id);
                  const active = selectedId ? id === selectedId : false;
                  return (
                    <button
                      key={id}
                      type="button"
                      className={`group rounded-lg border bg-card text-left transition-all hover:border-primary focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ${
                        active ? "border-primary ring-2 ring-primary" : ""
                      }`}
                      onClick={() => handleSelect(item)}
                      aria-label={`Chọn ${item.title || "media"}`}
                    >
                      <div className="relative h-40 w-full overflow-hidden rounded-t-lg bg-[repeating-conic-gradient(#d4d4d4_0%_25%,_white_0%_50%)] [background-size:20px_20px]">
                        {renderPreview(item)}
                        <div
                          className={`absolute inset-0 transition-colors ${
                            active ? "bg-primary/20" : "bg-black/0 group-hover:bg-black/10"
                          }`}
                        />
                        <div className="absolute left-2 top-2 rounded bg-background/80 px-2 py-0.5 text-[11px] font-medium capitalize shadow">
                          {item.kind ?? "media"}
                        </div>
                        {item.externalUrl && (
                          <div className="absolute right-2 top-2 flex items-center gap-1 rounded bg-background/90 px-2 py-0.5 text-[11px] text-muted-foreground shadow">
                            <LinkIcon className="h-3 w-3" />
                            <span>Link</span>
                          </div>
                        )}
                      </div>
                      <div className="p-3">
                        <p className="text-sm font-medium truncate group-hover:text-primary transition-colors">
                          {item.title || id}
                        </p>
                        <p className="text-xs text-muted-foreground truncate mt-0.5">{id}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {!isLoading && !isEmpty && filteredMedia.length > 0 && (
            <div className="text-sm text-muted-foreground text-center pt-2 border-t">
              Hiển thị {filteredMedia.length} media
              {searchQuery && ` (từ ${sortedMedia.length} tổng cộng)`}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
