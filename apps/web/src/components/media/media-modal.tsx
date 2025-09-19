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
      toast.error("Chi ho tro tep anh");
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
      toast.success("Da them anh");
      setImageFile(null);
      setImageTitle("");
    } catch (error: any) {
      toast.error(error?.message ?? "Loi upload anh");
    } finally {
      setSubmitting(false);
    }
  }

  async function submitVideo() {
    try {
      setSubmitting(true);
      await createVideo({ externalUrl: videoUrl, title: videoTitle || undefined });
      toast.success("Da them video");
      setVideoUrl("");
      setVideoTitle("");
    } catch (error: any) {
      toast.error(error?.message ?? "Loi them video");
    } finally {
      setSubmitting(false);
    }
  }

  async function onDelete(id: string) {
    try {
      await removeMedia({ id: id as any });
      toast.success("Da xoa media");
    } catch (error: any) {
      toast.error(error?.message ?? "Loi xoa media");
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl md:max-w-5xl h-[80vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle>Quan ly media</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-6 md:grid md:h-full md:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)] md:gap-8">
          <div className="flex min-h-0 flex-col gap-4">
            <div className="flex gap-2">
              <Button variant={tab === "image" ? "default" : "outline"} onClick={() => setTab("image")}>
                Anh
              </Button>
              <Button variant={tab === "video" ? "default" : "outline"} onClick={() => setTab("video")}>
                Video (link)
              </Button>
            </div>

            {tab === "image" ? (
              <div className="flex flex-1 min-h-0 flex-col gap-4">
                <div className="space-y-2">
                  <Label>Chon anh</Label>
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
                    aria-label="Keo tha anh vao day hoac bam de chon"
                  >
                    <div className="text-sm text-muted-foreground">
                      Keo tha anh vao day hoac <span className="text-primary underline">bam de chon</span>
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
                    <div className="mb-2 text-xs text-muted-foreground">Xem truoc</div>
                    <div className="flex items-center justify-center rounded bg-background p-2">
                      <img src={imagePreview} alt="Xem truoc anh" className="max-h-48 w-full object-contain" />
                    </div>
                  </div>
                )}
                <div className="space-y-2">
                  <Label>Tieu de (tuy chon)</Label>
                  <Input type="text" value={imageTitle} onChange={(event) => setImageTitle(event.target.value)} />
                </div>
                <div className="pt-1">
                  <Button className="w-full md:w-auto" disabled={!canSubmitImage || submitting} onClick={submitImage}>
                    Tai len anh (tu chuyen WebP)
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
                  <Label>Tieu de (tuy chon)</Label>
                  <Input type="text" value={videoTitle} onChange={(event) => setVideoTitle(event.target.value)} />
                </div>
                <div className="pt-1">
                  <Button className="w-full md:w-auto" disabled={!canSubmitVideo || submitting} onClick={submitVideo}>
                    Them video
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
                <p className="text-sm text-muted-foreground">Chua co media nao.</p>
              ) : (
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {recentList.map((item) => (
                    <div key={item._id} className="flex items-center gap-3 rounded-md border bg-background p-2 shadow-sm">
                      {item.kind === "image" ? (
                        <img src={item.url} alt={item.title || "Anh"} className="h-12 w-12 rounded object-cover" />
                      ) : (
                        <div className="flex h-12 w-12 items-center justify-center rounded bg-muted text-xs">Video</div>
                      )}
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-sm">{item.title || (item.kind === "image" ? "Anh" : "Video")}</div>
                      </div>
                      <Button size="sm" variant="destructive" onClick={() => onDelete(item._id)}>
                        Xoa
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
      Them media
    </Button>
  );
}

