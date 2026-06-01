"use client";

import React, { useState, useRef, useCallback, useEffect } from "react";
import { useMutation, useAction } from "convex/react";
import { api } from "@dohy/backend/convex/_generated/api";
import { Image as ImageIcon, Loader2, Trash2, Upload, ClipboardPaste, Crop, FolderOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { ImageEditorDialog } from "../../../../../components/media/image-editor-dialog";

type WebDemoImageUploaderProps = {
  value?: string; // ID của media
  imageUrl?: string | null; // URL của media (nếu có để render preview)
  onChange: (mediaId: string) => void;
  onRemove: () => void;
  onOpenPicker: () => void;
  label?: string;
  className?: string;
  aspectRatio?: number; // Tỷ lệ crop gợi ý
};

export function WebDemoImageUploader({
  value,
  imageUrl,
  onChange,
  onRemove,
  onOpenPicker,
  label,
  className,
  aspectRatio,
}: WebDemoImageUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Convex actions/mutations
  const generateUploadUrl = useAction(api.media.generateUploadUrl);
  const saveImage = useMutation(api.media.saveImage);

  // Xử lý upload file
  const handleUploadFile = useCallback(
    async (file: File) => {
      // Validate file size (tối đa 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error("File quá lớn. Vui lòng chọn ảnh dưới 5MB.");
        return;
      }

      if (!file.type.startsWith("image/")) {
        toast.error("Vui lòng chỉ chọn file hình ảnh.");
        return;
      }

      setIsUploading(true);
      try {
        // 1. Lấy URL upload từ Convex
        const { uploadUrl } = await generateUploadUrl();

        // 2. POST file lên storage
        const response = await fetch(uploadUrl, {
          method: "POST",
          headers: { "Content-Type": file.type },
          body: file,
        });

        if (!response.ok) {
          throw new Error("Tải file lên storage thất bại");
        }

        const { storageId } = await response.json();

        // 3. Lưu thông tin media vào DB Convex
        const mediaDoc = await saveImage({
          title: file.name,
          storageId,
          format: file.type.split("/")[1] || "webp",
          sizeBytes: file.size,
        });

        if (mediaDoc) {
          onChange(String(mediaDoc));
          toast.success("Tải hình ảnh lên thành công!");
        } else {
          throw new Error("Không thể lưu thông tin hình ảnh");
        }
      } catch (err) {
        console.error(err);
        toast.error(err instanceof Error ? err.message : "Có lỗi xảy ra khi tải ảnh lên.");
      } finally {
        setIsUploading(false);
      }
    },
    [generateUploadUrl, saveImage, onChange]
  );

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        handleUploadFile(file);
      }
    },
    [handleUploadFile]
  );

  // Drag & drop handlers
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files?.[0];
      if (file) {
        handleUploadFile(file);
      }
    },
    [handleUploadFile]
  );

  // Clipboard Paste handler
  const handlePaste = useCallback(async () => {
    if (isUploading) return;

    try {
      const clipboardItems = await navigator.clipboard.read();

      for (const item of clipboardItems) {
        const imageType = item.types.find((t) => t.startsWith("image/"));
        if (imageType) {
          const blob = await item.getType(imageType);
          const ext = imageType.split("/")[1] || "png";
          const file = new File(
            [blob],
            `clipboard-${Date.now()}.${ext}`,
            { type: imageType }
          );
          await handleUploadFile(file);
          return;
        }
      }
      toast.error("Clipboard không chứa dữ liệu ảnh. Hãy sao chép ảnh trước.");
    } catch (err) {
      if (err instanceof DOMException && err.name === "NotAllowedError") {
        toast.error("Trình duyệt không được cấp quyền đọc clipboard. Hãy bật quyền truy cập.");
      } else {
        toast.error("Không thể đọc clipboard. Vui lòng kiểm tra lại.");
      }
    }
  }, [isUploading, handleUploadFile]);

  return (
    <div className={cn("space-y-2", className)}>
      {label && <label className="text-xs font-semibold text-muted-foreground">{label}</label>}

      {/* Toolbar actions */}
      <div className="flex flex-wrap gap-2 mb-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-8 text-xs gap-1.5"
          onClick={onOpenPicker}
          disabled={isUploading}
        >
          <FolderOpen className="h-3.5 w-3.5" /> Thư viện
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-8 text-xs gap-1.5"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
        >
          <Upload className="h-3.5 w-3.5" /> Upload
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-8 text-xs gap-1.5 bg-muted/30 hover:bg-emerald-50 hover:text-emerald-700 dark:hover:bg-emerald-950/30"
          onClick={handlePaste}
          disabled={isUploading}
          title="Copy/chụp ảnh rồi click vào đây"
        >
          <ClipboardPaste className="h-3.5 w-3.5" /> Dán
        </Button>
        {imageUrl && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-8 text-xs gap-1.5 bg-amber-50/50 text-amber-700 hover:bg-amber-100 dark:bg-amber-950/20"
            onClick={() => setIsEditorOpen(true)}
            disabled={isUploading}
          >
            <Crop className="h-3.5 w-3.5" /> Cắt ảnh
          </Button>
        )}
      </div>

      <input
        type="file"
        ref={fileInputRef}
        onChange={handleInputChange}
        accept="image/*"
        className="hidden"
      />

      {/* Image Preview & Drag Drop Zone */}
      {imageUrl ? (
        <div className="relative aspect-[4/3] w-full overflow-hidden rounded-lg border border-border group bg-muted/20">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={imageUrl}
            alt="Preview"
            className="h-full w-full object-cover transition-transform group-hover:scale-105 duration-200"
          />
          {isUploading && (
            <div className="absolute inset-0 bg-background/80 flex flex-col items-center justify-center gap-2">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
              <span className="text-xs text-muted-foreground">Đang xử lý tải lên...</span>
            </div>
          )}
          {/* Overlay hover xóa ảnh */}
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity gap-2">
            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={onRemove}
              disabled={isUploading}
              className="gap-1.5 shadow-lg"
            >
              <Trash2 className="h-4 w-4" /> Xóa
            </Button>
          </div>
        </div>
      ) : (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={cn(
            "flex aspect-[4/3] w-full cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed bg-muted/20 hover:bg-muted/40 transition-colors",
            isDragging
              ? "border-primary bg-primary/5"
              : "border-muted-foreground/20 hover:border-primary/50",
            isUploading && "pointer-events-none opacity-60"
          )}
        >
          {isUploading ? (
            <>
              <Loader2 className="h-8 w-8 animate-spin text-primary mb-1" />
              <span className="text-xs text-muted-foreground">Đang tải hình ảnh lên...</span>
            </>
          ) : (
            <>
              <ImageIcon className="h-8 w-8 text-muted-foreground/40 mb-1 group-hover:scale-110 transition-transform" />
              <span className="text-xs text-muted-foreground font-medium">Kéo thả hoặc click để upload</span>
              <span className="text-[10px] text-muted-foreground/60">Hỗ trợ dán ảnh từ Clipboard (Ctrl + V)</span>
            </>
          )}
        </div>
      )}

      {/* Editor Dialog */}
      {isEditorOpen && imageUrl && (
        <ImageEditorDialog
          imageUrl={imageUrl}
          preferredCropAspectRatio={aspectRatio}
          onClose={() => setIsEditorOpen(false)}
          onApply={async (croppedFile) => {
            setIsEditorOpen(false);
            await handleUploadFile(croppedFile);
          }}
        />
      )}
    </div>
  );
}
