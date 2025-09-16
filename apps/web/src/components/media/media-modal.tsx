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
  const [visibleCount, setVisibleCount] = useState(12);
  const recentList = useMemo(() => {
    const arr = Array.isArray(mediaList) ? [...mediaList] : [];
    arr.sort((a: any, b: any) => (b?.createdAt ?? 0) - (a?.createdAt ?? 0));
    return arr;
  }, [mediaList]);

  const canSubmitImage = useMemo(() => !!imageFile, [imageFile]);
  const canSubmitVideo = useMemo(() => /^https?:\/\/.+/i.test(videoUrl), [videoUrl]);

  // Preview ảnh đã chọn
  useEffect(() => {
    if (!imageFile) {
      setImagePreview(null);
      return;
    }
    const url = URL.createObjectURL(imageFile);
    setImagePreview(url);
    return () => URL.revokeObjectURL(url);
  }, [imageFile]);

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
    } catch (e: any) {
      toast.error(e?.message ?? "Lỗi upload ảnh");
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
    } catch (e: any) {
      toast.error(e?.message ?? "Lỗi thêm video");
    } finally {
      setSubmitting(false);
    }
  }

  async function onDelete(id: string) {
    try {
      await removeMedia({ id: id as any });
      toast.success("Đã xóa media");
    } catch (e: any) {
      toast.error(e?.message ?? "Lỗi xóa media");
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Quản lý media</DialogTitle>
        </DialogHeader>

        <div className="flex gap-2 mb-4">
          <Button variant={tab === "image" ? "default" : "outline"} onClick={() => setTab("image")}>Ảnh</Button>
          <Button variant={tab === "video" ? "default" : "outline"} onClick={() => setTab("video")}>Video (link)</Button>
        </div>

        {tab === "image" ? (
          <div key="image" className="space-y-3">
            <div className="space-y-2">
              <Label>Chọn ảnh</Label>
              <div
                className={
                  "flex flex-col items-center justify-center gap-2 rounded border p-6 text-center cursor-pointer select-none " +
                  (isDragging ? "border-primary bg-primary/5" : "border-dashed")
                }
                onDragEnter={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setIsDragging(true);
                }}
                onDragOver={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setIsDragging(true);
                }}
                onDragLeave={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setIsDragging(false);
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setIsDragging(false);
                  const f = e.dataTransfer?.files?.[0];
                  if (!f) return;
                  if (!f.type.startsWith("image/")) {
                    toast.error("Chỉ hỗ trợ kéo-thả ảnh");
                    return;
                  }
                  setImageFile(f);
                }}
                onClick={() => fileInputRef.current?.click()}
                role="button"
                aria-label="Kéo thả ảnh vào đây hoặc bấm để chọn"
              >
                <div className="text-sm text-muted-foreground">
                  Kéo thả ảnh vào đây hoặc <span className="text-primary underline">bấm để chọn</span>
                </div>
              </div>
              <Input ref={fileInputRef as any} type="file" accept="image/*" className="hidden" onChange={(e) => setImageFile(e.target.files?.[0] ?? null)} />
            {imagePreview && (
              <div className="rounded border p-2">
                <div className="text-xs text-muted-foreground mb-1">Xem trước</div>
                <img src={imagePreview} alt="Xem trước ảnh" className="max-h-48 w-auto rounded object-contain" />
              </div>
            )}
            </div>
            <div className="space-y-2">
              <Label>Tiêu đề (tùy chọn)</Label>
              <Input type="text" value={imageTitle} onChange={(e) => setImageTitle(e.target.value)} />
            </div>
            <Button disabled={!canSubmitImage || submitting} onClick={submitImage}>Tải lên ảnh (tự chuyển WebP)</Button>
          </div>
        ) : (
          <div key="video" className="space-y-3">
            <div className="space-y-2">
              <Label>Link video</Label>
              <Input type="text" placeholder="https://..." value={videoUrl} onChange={(e) => setVideoUrl(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Tiêu đề (tùy chọn)</Label>
              <Input type="text" value={videoTitle} onChange={(e) => setVideoTitle(e.target.value)} />
            </div>
            <Button disabled={!canSubmitVideo || submitting} onClick={submitVideo}>Thêm video</Button>
          </div>
        )}

        <div className="mt-6">
          <h3 className="font-medium mb-2">Danh sách gần đây</h3>
          <div className="grid grid-cols-2 gap-3 max-h-64 overflow-y-auto pr-1">
            {recentList.slice(0, visibleCount).map((m: any) => (
              <div key={m._id} className="border rounded p-2 flex items-center gap-2">
                {m.kind === "image" ? (
                  <img src={m.url} alt={m.title || "image"} className="size-12 object-cover rounded" />
                ) : (
                  <div className="size-12 flex items-center justify-center bg-muted rounded text-xs">Video</div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="truncate text-sm">{m.title || (m.kind === "image" ? "Ảnh" : "Video")}</div>
                </div>
                <Button size="sm" variant="destructive" onClick={() => onDelete(m._id)}>
                  Xóa
                </Button>
              </div>
            ))}
          </div>
          {recentList.length > 12 && (
            <div className="flex justify-center mt-3">
              {visibleCount < recentList.length ? (
                <Button variant="ghost" size="sm" onClick={() => setVisibleCount((c) => Math.min(c + 12, recentList.length))}>Xem th�m</Button>
              ) : (
                <Button variant="ghost" size="sm" onClick={() => setVisibleCount(12)}>Thu g?n</Button>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function MediaTrigger({ onOpen }: { onOpen: () => void }) {
  return (
    <Button variant="outline" onClick={onOpen}>Thêm media</Button>
  );
}
