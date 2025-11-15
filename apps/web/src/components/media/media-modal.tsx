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
      <DialogContent className="max-w-4xl md:max-w-5xl h-[80vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle>Quản lý media</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-6 md:grid md:h-full md:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)] md:gap-8">
          <div className="flex min-h-0 flex-col gap-4">
            <div className="flex gap-2">
              <Button variant={tab === "image" ? "default" : "outline"} onClick={() => setTab("image")}>
                Ảnh
              </Button>
              <Button variant={tab === "video" ? "default" : "outline"} onClick={() => setTab("video")}>
                Video (link)
              </Button>
            </div>

            {tab === "image" ? (
              <div className="flex flex-1 min-h-0 flex-col gap-4">
                <div className="space-y-2">
                  <Label>Chọn ảnh</Label>
                  <div
                    className={`flex flex-1 flex-col items-center justify-center gap-2 rounded-md border border-dashed p-6 text-center transition hover:border-primary ${
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
                    aria-label="Kéo thả ảnh vào đây hoặc bấm để chọn"
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
                      <img src={imagePreview} alt="Xem trước ảnh" className="max-h-48 w-full object-contain" />
                    </div>
                  </div>
                )}
                <div className="space-y-2">
                  <Label>Tiêu đề (tùy chọn)</Label>
                  <Input type="text" value={imageTitle} onChange={(event) => setImageTitle(event.target.value)} />
                </div>
                <div className="pt-1">
                  <Button className="w-full md:w-auto" disabled={!canSubmitImage || submitting} onClick={submitImage}>
                    Tải lên ảnh (tự chuyển WebP)
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex flex-1 flex-col gap-4">
                <div className="space-y-2">
                  <Label>Link video</Label>
                  <Input type="text" placeholder="https://..." value={videoUrl} onChange={(event) => setVideoUrl(event.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Tiêu đề (tùy chọn)</Label>
                  <Input type="text" value={videoTitle} onChange={(event) => setVideoTitle(event.target.value)} />
                </div>
                <div className="pt-1">
                  <Button className="w-full md:w-auto" disabled={!canSubmitVideo || submitting} onClick={submitVideo}>
                    Thêm video
                  </Button>
                </div>
              </div>
            )}
          </div>

          <div className="flex h-full min-h-0 flex-col gap-3 rounded-md border bg-muted/10 p-3 md:bg-muted/20 md:p-4">
            <div className="flex items-center justify-between">
              <h3 className="font-medium">Danh sach gan day</h3>
              <span className="text-xs text-muted-foreground">{recentList.length} muc</span>
            </div>
            <div className="flex-1 overflow-y-auto pr-1">
              {recentList.length === 0 ? (
                <p className="text-sm text-muted-foreground">Chưa có media nào.</p>
              ) : (
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {recentList.map((item) => (
                    <div key={item._id} className="flex items-center gap-3 rounded-md border bg-background p-2 shadow-sm">
                      {item.kind === "image" ? (
                        <img src={item.url} alt={item.title || "Ảnh"} className="h-12 w-12 rounded object-cover" />
                      ) : (
                        <div className="flex h-12 w-12 items-center justify-center rounded bg-muted text-xs">Video</div>
                      )}
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-sm">{item.title || (item.kind === "image" ? "Ảnh" : "Video")}</div>
                      </div>
                      <Button size="sm" variant="destructive" onClick={() => onDelete(item._id)}>
                        Xóa
                      </Button>
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

