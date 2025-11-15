"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useMutation, useQuery } from "convex/react";
import { api } from "@dohy/backend/convex/_generated/api";
import { toast } from "sonner";

type Props = {
  open: boolean;
  onOpenChange: (v: boolean) => void;
};

type MediaRecord = {
  _id: string;
  kind: "image" | "video";
  url?: string;
  title?: string;
  createdAt?: number;
};

export function MediaModal({ open, onOpenChange }: Props) {
  const [tab, setTab] = useState<"image" | "video">("image");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageTitle, setImageTitle] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [videoTitle, setVideoTitle] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const createVideo = useMutation(api.media.createVideo);
  const removeMedia = useMutation(api.media.remove);
  const mediaList = useQuery(api.media.list, {});

  const recentList = useMemo(() => {
    const arr = Array.isArray(mediaList) ? [...(mediaList as MediaRecord[])] : [];
    arr.sort((a, b) => (b?.createdAt ?? 0) - (a?.createdAt ?? 0));
    return arr;
  }, [mediaList]);

  const canSubmitImage = useMemo(() => Boolean(imageFile), [imageFile]);
  const canSubmitVideo = useMemo(() => /^https?:\/\/.+/i.test(videoUrl), [videoUrl]);

  useEffect(() => {
    if (!imageFile) {
      setImagePreview(null);
      return;
    }
    const url = URL.createObjectURL(imageFile);
    setImagePreview(url);
    return () => URL.revokeObjectURL(url);
  }, [imageFile]);

  function handleFileSelection(file: File | null | undefined) {
    if (!file) {
      setImageFile(null);
      return;
    }
    if (!file.type.startsWith("image/")) {
      toast.error("Chỉ hỗ trợ tệp ảnh");
      return;
    }
    setImageFile(file);
  }

  async function submitImage() {
    if (!imageFile) return;
    try {
      setSubmitting(true);
      const fd = new FormData();
      fd.append("file", imageFile);
      if (imageTitle) fd.append("title", imageTitle);
      const res = await fetch("/api/media/upload", { method: "POST", body: fd });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || "Upload failed");
      toast.success("Đã thêm ảnh");
      setImageFile(null);
      setImageTitle("");
    } catch (error: any) {
      toast.error(error?.message ?? "Lỗi upload ảnh");
    } finally {
      setSubmitting(false);
    }
  }

  async function submitVideo() {
    try {
      setSubmitting(true);
      await createVideo({ externalUrl: videoUrl, title: videoTitle || undefined });
      toast.success("Đã thêm video");
      setVideoUrl("");
      setVideoTitle("");
    } catch (error: any) {
      toast.error(error?.message ?? "Lỗi thêm video");
    } finally {
      setSubmitting(false);
    }
  }

  async function onDelete(id: string) {
    try {
      await removeMedia({ id: id as any });
      toast.success("Đã xóa media");
    } catch (error: any) {
      toast.error(error?.message ?? "Lỗi xóa media");
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl md:max-w-7xl h-[90vh] flex flex-col overflow-hidden">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle>Quản lý media</DialogTitle>
        </DialogHeader>

        <div className="flex-1 flex flex-col gap-6 md:grid md:grid-cols-[minmax(0,1fr)_minmax(0,1.5fr)] md:gap-8 overflow-hidden">
          <div className="flex flex-col gap-4 md:overflow-y-auto md:pr-2">
            <div className="flex gap-2 flex-shrink-0">
              <Button variant={tab === "image" ? "default" : "outline"} onClick={() => setTab("image")}>
                Ảnh
              </Button>
              <Button variant={tab === "video" ? "default" : "outline"} onClick={() => setTab("video")}>
                Video (link)
              </Button>
            </div>

            {tab === "image" ? (
              <div className="flex flex-col gap-4">
                <div className="space-y-2">
                  <Label>Chọn ảnh</Label>
                  <div
                    className={`flex flex-col items-center justify-center gap-2 rounded-md border border-dashed p-8 text-center transition-colors cursor-pointer hover:border-primary ${
                      isDragging ? "border-primary bg-primary/5" : "border-border bg-muted/20"
                    }`}
                    onDragEnter={(event) => {
                      event.preventDefault();
                      event.stopPropagation();
                      setIsDragging(true);
                    }}
                    onDragOver={(event) => {
                      event.preventDefault();
                      event.stopPropagation();
                      setIsDragging(true);
                    }}
                    onDragLeave={(event) => {
                      event.preventDefault();
                      event.stopPropagation();
                      setIsDragging(false);
                    }}
                    onDrop={(event) => {
                      event.preventDefault();
                      event.stopPropagation();
                      setIsDragging(false);
                      const file = event.dataTransfer?.files?.[0];
                      handleFileSelection(file ?? null);
                    }}
                    onClick={() => fileInputRef.current?.click()}
                    role="button"
                    tabIndex={0}
                    aria-label="Kéo thả ảnh vào đây hoặc bấm để chọn"
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        fileInputRef.current?.click();
                      }
                    }}
                  >
                    <div className="text-sm text-muted-foreground">
                      Kéo thả ảnh vào đây hoặc <span className="text-primary underline">bấm để chọn</span>
                    </div>
                  </div>
                  <Input
                    ref={fileInputRef as any}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(event) => handleFileSelection(event.target.files?.[0])}
                  />
                </div>
                {imagePreview && (
                  <div className="rounded-md border bg-muted/20 p-3">
                    <div className="mb-2 text-xs text-muted-foreground">Xem trước</div>
                    <div className="flex items-center justify-center rounded bg-background p-2">
                      <img src={imagePreview} alt="Xem trước ảnh" className="max-h-40 w-full object-contain" />
                    </div>
                  </div>
                )}
                <div className="space-y-2">
                  <Label htmlFor="image-title">Tiêu đề (tùy chọn)</Label>
                  <Input id="image-title" type="text" value={imageTitle} onChange={(event) => setImageTitle(event.target.value)} />
                </div>
                <div className="sticky bottom-0 bg-background pt-2 pb-1">
                  <Button className="w-full min-h-[44px]" disabled={!canSubmitImage || submitting} onClick={submitImage}>
                    {submitting ? "Đang tải lên..." : "Tải lên ảnh (tự chuyển WebP)"}
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                <div className="space-y-2">
                  <Label htmlFor="video-url">Link video</Label>
                  <Input
                    id="video-url"
                    type="text"
                    placeholder="https://..."
                    value={videoUrl}
                    onChange={(event) => setVideoUrl(event.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="video-title">Tiêu đề (tùy chọn)</Label>
                  <Input id="video-title" type="text" value={videoTitle} onChange={(event) => setVideoTitle(event.target.value)} />
                </div>
                <div className="sticky bottom-0 bg-background pt-2 pb-1">
                  <Button className="w-full min-h-[44px]" disabled={!canSubmitVideo || submitting} onClick={submitVideo}>
                    {submitting ? "Đang thêm..." : "Thêm video"}
                  </Button>
                </div>
              </div>
            )}
          </div>

          <div className="flex flex-col gap-3 rounded-md border bg-muted/10 p-4 md:bg-muted/20 overflow-hidden">
            <div className="flex items-center justify-between flex-shrink-0">
              <h3 className="font-medium">Danh sách gần đây</h3>
              <span className="text-xs text-muted-foreground">{recentList.length} mục</span>
            </div>
            <div className="flex-1 overflow-y-auto pr-2 scroll-smooth">
              {recentList.length === 0 ? (
                <p className="text-sm text-muted-foreground">Chưa có media nào.</p>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-3">
                  {recentList.map((item) => (
                    <div
                      key={item._id}
                      className="flex flex-col gap-2 rounded-md border bg-background p-3 transition-shadow hover:shadow-md"
                    >
                      <div className="aspect-square w-full overflow-hidden rounded bg-muted">
                        {item.kind === "image" ? (
                          <img src={item.url} alt={item.title || "Ảnh"} className="h-full w-full object-cover" loading="lazy" />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-xs text-muted-foreground">Video</div>
                        )}
                      </div>
                      <div className="flex items-center justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <div className="truncate text-sm font-medium">{item.title || (item.kind === "image" ? "Ảnh" : "Video")}</div>
                        </div>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => onDelete(item._id)}
                          className="flex-shrink-0 min-h-[44px] min-w-[44px]"
                          aria-label={`Xóa ${item.title || (item.kind === "image" ? "ảnh" : "video")}`}
                        >
                          Xóa
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function MediaTrigger({ onOpen }: { onOpen: () => void }) {
  return (
    <Button variant="outline" onClick={onOpen}>
      Thêm media
    </Button>
  );
}
