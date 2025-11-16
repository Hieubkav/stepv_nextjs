"use client";

import { useMemo, useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@dohy/backend/convex/_generated/api";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Image as ImageIcon, X } from "lucide-react";

export type MediaItem = {
  _id: string;
  url?: string;
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
};

export function MediaPickerDialog({
  open,
  onOpenChange,
  onSelect,
  selectedId,
  title = "Chon media",
  autoCloseOnSelect = true,
}: MediaPickerDialogProps) {
  const images = useQuery(api.media.list, { kind: "image" }) as MediaItem[] | undefined;
  const [searchQuery, setSearchQuery] = useState("");

  const sortedImages = useMemo(() => {
    if (!Array.isArray(images)) return [];
    return [...images].sort((a, b) => (b.createdAt ?? 0) - (a.createdAt ?? 0));
  }, [images]);

  const filteredImages = useMemo(() => {
    const keyword = searchQuery.trim().toLowerCase();
    if (!keyword) return sortedImages;
    return sortedImages.filter((item) => {
      const title = item.title?.toLowerCase() ?? "";
      const id = String(item._id).toLowerCase();
      return title.includes(keyword) || id.includes(keyword);
    });
  }, [sortedImages, searchQuery]);

  const isLoading = images === undefined;
  const isEmpty = !isLoading && sortedImages.length === 0;
  const hasNoResults = !isLoading && filteredImages.length === 0 && !!searchQuery;

  function handleSelect(item: MediaItem) {
    onSelect(item);
    if (autoCloseOnSelect) {
      onOpenChange(false);
    }
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
              placeholder="Tim kiem media..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pr-8"
              aria-label="Tim kiem media"
            />
            {searchQuery && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 p-0"
                onClick={() => setSearchQuery("")}
                aria-label="Xoa tim kiem"
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
                <p className="text-lg font-medium text-muted-foreground mb-2">Chua co media nao</p>
                <p className="text-sm text-muted-foreground">Hay tai media tai trang Media truoc.</p>
              </div>
            ) : hasNoResults ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <ImageIcon className="h-16 w-16 text-muted-foreground/40 mb-4" />
                <p className="text-lg font-medium text-muted-foreground mb-2">Khong tim thay ket qua</p>
                <p className="text-sm text-muted-foreground">Thu tim kiem voi tu khoa khac</p>
                <Button type="button" variant="outline" size="sm" className="mt-4" onClick={() => setSearchQuery("")}>
                  Xoa bo loc
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {filteredImages.map((item) => {
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
                      aria-label={`Chon ${item.title || "media"}`}
                    >
                      {item.url ? (
                        <div className="relative h-40 w-full overflow-hidden rounded-t-lg bg-[repeating-conic-gradient(#d4d4d4_0%_25%,_white_0%_50%)] [background-size:20px_20px]">
                          <img src={item.url} alt={item.title || "media"} className="h-full w-full object-contain p-2" loading="lazy" />
                          <div
                            className={`absolute inset-0 transition-colors ${
                              active ? "bg-primary/20" : "bg-black/0 group-hover:bg-black/10"
                            }`}
                          />
                        </div>
                      ) : (
                        <div className="flex h-40 w-full items-center justify-center rounded-t-lg bg-muted">
                          <ImageIcon className="h-8 w-8 text-muted-foreground/40" />
                        </div>
                      )}
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

          {!isLoading && !isEmpty && filteredImages.length > 0 && (
            <div className="text-sm text-muted-foreground text-center pt-2 border-t">
              Hien thi {filteredImages.length} media
              {searchQuery && ` (tu ${sortedImages.length} tong cong)`}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
