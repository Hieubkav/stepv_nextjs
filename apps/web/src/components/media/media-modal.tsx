"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import { ImagePlus } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
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
  storageId?: string;
  sizeBytes?: number;
  externalUrl?: string;
  format?: string;
};

type MediaTriggerProps = {
  onOpen: () => void;
};

export function MediaTrigger({ onOpen }: MediaTriggerProps) {
  return (
    <Button type="button" variant="secondary" size="sm" className="h-9 gap-2" onClick={onOpen}>
      <ImagePlus className="size-4" aria-hidden />
      <span className="hidden sm:inline">Thêm media</span>
      <span className="sm:hidden">Media</span>
    </Button>
  );
}

export function MediaModal({ open, onOpenChange }: Props) {
  const [tab, setTab] = useState<"image" | "video">("image");

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageTitle, setImageTitle] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [videoMode, setVideoMode] = useState<"upload" | "link">("upload");
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoPreview, setVideoPreview] = useState<string | null>(null);
  const [videoUrl, setVideoUrl] = useState("");
  const [videoTitle, setVideoTitle] = useState("");
  const [isVideoDragging, setIsVideoDragging] = useState(false);
  const videoFileInputRef = useRef<HTMLInputElement | null>(null);

  const [submitting, setSubmitting] = useState(false);

  const createVideoLink = useMutation(api.media.createVideo);
  const removeMedia = useMutation(api.media.remove);
  const mediaList = useQuery(api.media.list, {});

  const recentList = useMemo(() => {
    const arr = Array.isArray(mediaList) ? [...(mediaList as MediaRecord[])] : [];
    arr.sort((a, b) => (b?.createdAt ?? 0) - (a?.createdAt ?? 0));
    return arr;
  }, [mediaList]);

  const canSubmitImage = useMemo(() => Boolean(imageFile), [imageFile]);
  const canSubmitVideo = useMemo(() => {
    if (videoMode === "upload") return Boolean(videoFile);
    return /^https?:\/\/.+/i.test(videoUrl);
  }, [videoMode, videoFile, videoUrl]);

  useEffect(() => {
    if (!imageFile) {
      setImagePreview(null);
      return;
    }
    const url = URL.createObjectURL(imageFile);
    setImagePreview(url);
    return () => URL.revokeObjectURL(url);
  }, [imageFile]);

  useEffect(() => {
    if (!videoFile) {
      setVideoPreview(null);
      return;
    }
    const url = URL.createObjectURL(videoFile);
    setVideoPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [videoFile]);

  function handleImageSelection(file: File | null | undefined) {
    if (!file) {
      setImageFile(null);
      return;
    }
    if (!file.type.startsWith("image/")) {
      toast.error("Chỉ hỗ trợ tệp ảnh");
      return;
    }
    // Giới hạn 10MB cho ảnh
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      toast.error(`Ảnh quá lớn! Giới hạn ${(maxSize / (1024 * 1024)).toFixed(0)}MB (file bạn: ${(file.size / (1024 * 1024)).toFixed(2)}MB)`);
      return;
    }
    setImageFile(file);
  }

  function handleVideoSelection(file: File | null | undefined) {
    if (!file) {
      setVideoFile(null);
      return;
    }
    if (!file.type.startsWith("video/")) {
      toast.error("Chỉ hỗ trợ tệp video");
      return;
    }
    // Giới hạn 32MB cho video
    const maxSize = 32 * 1024 * 1024; // 32MB
    if (file.size > maxSize) {
      toast.error(`Video quá lớn! Giới hạn ${(maxSize / (1024 * 1024)).toFixed(0)}MB (file bạn: ${(file.size / (1024 * 1024)).toFixed(2)}MB)`);
      return;
    }
    setVideoFile(file);
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

  async function submitVideoUpload() {
    if (!videoFile) return;
    try {
      setSubmitting(true);
      const fd = new FormData();
      fd.append("file", videoFile);
      if (videoTitle) fd.append("title", videoTitle);
      const res = await fetch("/api/media/upload-video", { method: "POST", body: fd });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || "Upload failed");
      toast.success("Đã tải video lên storage");
      setVideoFile(null);
      setVideoPreview(null);
      setVideoTitle("");
    } catch (error: any) {
      toast.error(error?.message ?? "Lỗi upload video");
    } finally {
      setSubmitting(false);
    }
  }

  async function submitVideoLink() {
    try {
      setSubmitting(true);
      await createVideoLink({ externalUrl: videoUrl, title: videoTitle || undefined });
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
          <DialogDescription>
            Tải ảnh và video lên hoặc thêm link video từ nguồn bên ngoài
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 flex flex-col gap-6 md:grid md:grid-cols-[minmax(0,1fr)_minmax(0,1.5fr)] md:gap-8 overflow-hidden">
          <div className="flex flex-col gap-4 md:overflow-y-auto md:pr-2">
            <div className="flex gap-2 flex-shrink-0">
              <Button variant={tab === "image" ? "default" : "outline"} onClick={() => setTab("image")}>
                Ảnh
              </Button>
              <Button variant={tab === "video" ? "default" : "outline"} onClick={() => setTab("video")}>
                Video
              </Button>
            </div>

            {tab === "image" ? (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Chọn ảnh</Label>
                  <div
                    className={`flex flex-col items-center justify-center gap-2 rounded-md border border-dashed p-8 text-center transition-colors cursor-pointer hover:border-primary ${
                      isDragging ? "border-primary bg-primary/5" : ""
                    }`}
                    onDragOver={(event) => {
                      event.preventDefault();
                      setIsDragging(true);
                    }}
                    onDragLeave={(event) => {
                      event.preventDefault();
                      setIsDragging(false);
                    }}
                    onDrop={(event) => {
                      event.preventDefault();
                      setIsDragging(false);
                      handleImageSelection(event.dataTransfer?.files?.[0]);
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
                    <p className="text-sm font-medium">Thả tệp ảnh vào đây hoặc bấm để chọn</p>
                    <p className="text-xs text-muted-foreground">Hỗ trợ PNG, JPG, WebP...</p>
                    <Input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(event) => handleImageSelection(event.target.files?.[0])}
                    />
                  </div>
                </div>

                {imagePreview ? (
                  <div className="space-y-2">
                    <div className="text-xs text-muted-foreground">Xem trước</div>
                    <div className="flex items-center justify-center rounded bg-background p-2">
                      <img src={imagePreview} alt="Xem trước ảnh" className="max-h-40 w-full object-contain" />
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground">Chưa chọn ảnh</p>
                )}

                <div className="space-y-2">
                  <Label>Tiêu đề (tùy chọn)</Label>
                  <Input placeholder="Nhập tiêu đề" value={imageTitle} onChange={(e) => setImageTitle(e.target.value)} />
                </div>

                <Button disabled={!canSubmitImage || submitting} onClick={submitImage}>
                  Tải ảnh
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex gap-2">
                  <Button variant={videoMode === "upload" ? "default" : "outline"} onClick={() => setVideoMode("upload")}>
                    Upload file
                  </Button>
                  <Button variant={videoMode === "link" ? "default" : "outline"} onClick={() => setVideoMode("link")}>
                    Link ngoài
                  </Button>
                </div>

                {videoMode === "upload" ? (
                  <>
                    <div className="space-y-2">
                      <Label>Chọn video</Label>
                      <div
                        className={`flex flex-col items-center justify-center gap-2 rounded-md border border-dashed p-8 text-center transition-colors cursor-pointer hover:border-primary ${
                          isVideoDragging ? "border-primary bg-primary/5" : ""
                        }`}
                        onDragOver={(event) => {
                          event.preventDefault();
                          setIsVideoDragging(true);
                        }}
                        onDragLeave={(event) => {
                          event.preventDefault();
                          setIsVideoDragging(false);
                        }}
                        onDrop={(event) => {
                          event.preventDefault();
                          setIsVideoDragging(false);
                          handleVideoSelection(event.dataTransfer?.files?.[0]);
                        }}
                        onClick={() => videoFileInputRef.current?.click()}
                        role="button"
                        tabIndex={0}
                        aria-label="Kéo thả video vào đây hoặc bấm để chọn"
                        onKeyDown={(event) => {
                          if (event.key === "Enter" || event.key === " ") {
                            event.preventDefault();
                            videoFileInputRef.current?.click();
                          }
                        }}
                      >
                        <p className="text-sm font-medium">Thả file video vào đây hoặc bấm để chọn</p>
                        <p className="text-xs text-muted-foreground">Khuyến nghị video ≤ 32MB (MP4, MOV, ...)</p>
                        <Input
                          ref={videoFileInputRef}
                          type="file"
                          accept="video/*"
                          className="hidden"
                          onChange={(event) => handleVideoSelection(event.target.files?.[0])}
                        />
                      </div>
                    </div>

                    {videoFile ? (
                      <div className="space-y-3 rounded border p-3 text-sm">
                        <div className="flex items-center justify-between gap-2">
                          <div>
                            <p className="font-medium">{videoFile.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {(videoFile.size / (1024 * 1024)).toFixed(2)} MB · {videoFile.type || "video"}
                            </p>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setVideoFile(null);
                              setVideoPreview(null);
                            }}
                          >
                            Xóa
                          </Button>
                        </div>
                        {videoPreview && (
                          <div className="rounded bg-black/80">
                            <video src={videoPreview} controls className="w-full rounded" preload="metadata" height={200} />
                          </div>
                        )}
                      </div>
                    ) : (
                      <p className="text-xs text-muted-foreground">Chưa chọn video</p>
                    )}

                    <div className="space-y-2">
                      <Label>Tiêu đề (tùy chọn)</Label>
                      <Input placeholder="Nhập tiêu đề" value={videoTitle} onChange={(e) => setVideoTitle(e.target.value)} />
                    </div>

                    <Button disabled={!canSubmitVideo || submitting} onClick={submitVideoUpload}>
                      Tải video
                    </Button>
                  </>
                ) : (
                  <>
                    <div className="space-y-2">
                      <Label>Link video</Label>
                      <Input type="url" placeholder="https://..." value={videoUrl} onChange={(e) => setVideoUrl(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <Label>Tiêu đề (tùy chọn)</Label>
                      <Input placeholder="Nhập tiêu đề" value={videoTitle} onChange={(e) => setVideoTitle(e.target.value)} />
                    </div>
                    <Button disabled={!canSubmitVideo || submitting} onClick={submitVideoLink}>
                      Thêm video
                    </Button>
                  </>
                )}
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
                <p className="text-sm text-muted-foreground">Chưa có media nào</p>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {recentList.map((item) => (
                    <div key={item._id} className="rounded-lg border bg-card flex flex-col">
                      <div className="aspect-square w-full overflow-hidden rounded bg-muted">
                        {item.kind === "image" && item.url ? (
                          <img src={item.url} alt={item.title || "Ảnh"} className="h-full w-full object-cover" loading="lazy" />
                        ) : item.kind === "video" && item.url ? (
                          <video src={item.url} className="h-full w-full object-cover" preload="metadata" controls muted />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-xs text-muted-foreground">
                            {item.kind === "video" && item.externalUrl ? "Video (link)" : "Không có preview"}
                          </div>
                        )}
                      </div>
                      <div className="p-3 space-y-2 flex flex-col flex-1">
                        <div>
                          <p className="text-sm font-semibold">{item.title || "Không tên"}</p>
                          <p className="text-xs text-muted-foreground break-all">
                            {item.kind === "image" ? "Ảnh" : item.externalUrl ? "Video (link)" : "Video upload"}
                            {item.sizeBytes ? ` · ${(item.sizeBytes / (1024 * 1024)).toFixed(2)} MB` : ""}
                          </p>
                          {item.createdAt && (
                            <p className="text-xs text-muted-foreground">
                              {new Date(item.createdAt).toLocaleString("vi-VN")}
                            </p>
                          )}
                        </div>
                        {item.storageId && (
                          <div className="text-[10px] font-mono break-all text-muted-foreground">ID: {item.storageId}</div>
                        )}
                        <Button variant="destructive" size="sm" onClick={() => onDelete(item._id as any)}>
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
