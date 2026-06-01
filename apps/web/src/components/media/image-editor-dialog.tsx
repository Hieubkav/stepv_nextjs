"use client";

import React, { useState, useRef, useCallback } from "react";
import ReactCrop, { type Crop, type PixelCrop } from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";
import { X, Crop as CropIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

type ImageEditorDialogProps = {
  imageUrl: string;
  onApply: (editedFile: File) => void;
  onClose: () => void;
  preferredCropAspectRatio?: number;
};

const CROP_RATIOS = [
  { label: "Tự do", value: undefined },
  { label: "1:1 (Vuông)", value: 1 },
  { label: "4:3 (Card)", value: 4 / 3 },
  { label: "16:9 (Ngang)", value: 16 / 9 },
  { label: "9:16 (Dọc)", value: 9 / 16 },
];

function makeCenteredAspectCrop(image: HTMLImageElement, aspect: number): Crop {
  const imageAspect = image.naturalWidth / image.naturalHeight;
  const width = imageAspect > aspect ? 80 * (aspect / imageAspect) : 80;
  const height = imageAspect > aspect ? 80 : 80 * (imageAspect / aspect);

  return {
    height,
    unit: "%",
    width,
    x: (100 - width) / 2,
    y: (100 - height) / 2,
  };
}

function getCroppedCanvas(
  image: HTMLImageElement,
  crop: PixelCrop
): HTMLCanvasElement | null {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  const scaleX = image.naturalWidth / image.width;
  const scaleY = image.naturalHeight / image.height;

  canvas.width = Math.round(crop.width * scaleX);
  canvas.height = Math.round(crop.height * scaleY);

  ctx.drawImage(
    image,
    crop.x * scaleX,
    crop.y * scaleY,
    crop.width * scaleX,
    crop.height * scaleY,
    0,
    0,
    canvas.width,
    canvas.height
  );

  return canvas;
}

export function ImageEditorDialog({
  imageUrl,
  onApply,
  onClose,
  preferredCropAspectRatio,
}: ImageEditorDialogProps) {
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
  const [aspect, setAspect] = useState<number | undefined>(preferredCropAspectRatio);
  const [isApplying, setIsApplying] = useState(false);
  const imgRef = useRef<HTMLImageElement | null>(null);

  // Helper để tạo crop mặc định ở giữa ảnh
  const onImageLoad = useCallback(
    (e: React.SyntheticEvent<HTMLImageElement>) => {
      const { width, height } = e.currentTarget;
      imgRef.current = e.currentTarget;

      if (aspect) {
        const initialCrop = makeCenteredAspectCrop(e.currentTarget, aspect);
        setCrop(initialCrop);
        // Thiết lập completedCrop ban đầu
        setCompletedCrop({
          unit: "px",
          x: (initialCrop.x * width) / 100,
          y: (initialCrop.y * height) / 100,
          width: (initialCrop.width * width) / 100,
          height: (initialCrop.height * height) / 100,
        });
      } else {
        const initialCrop: Crop = {
          unit: "%",
          x: 10,
          y: 10,
          width: 80,
          height: 80,
        };
        setCrop(initialCrop);
        setCompletedCrop({
          unit: "px",
          x: (10 * width) / 100,
          y: (10 * height) / 100,
          width: (80 * width) / 100,
          height: (80 * height) / 100,
        });
      }
    },
    [aspect]
  );

  const handleSetAspect = useCallback((newAspect: number | undefined) => {
    setAspect(newAspect);
    setCompletedCrop(undefined);

    if (!imgRef.current) return;
    const { width, height } = imgRef.current;

    if (newAspect) {
      const newCrop = makeCenteredAspectCrop(imgRef.current, newAspect);
      setCrop(newCrop);
      setCompletedCrop({
        unit: "px",
        x: (newCrop.x * width) / 100,
        y: (newCrop.y * height) / 100,
        width: (newCrop.width * width) / 100,
        height: (newCrop.height * height) / 100,
      });
    } else {
      setCrop({
        unit: "%",
        x: 10,
        y: 10,
        width: 80,
        height: 80,
      });
      setCompletedCrop({
        unit: "px",
        x: (10 * width) / 100,
        y: (10 * height) / 100,
        width: (80 * width) / 100,
        height: (80 * height) / 100,
      });
    }
  }, []);

  const handleApply = useCallback(() => {
    if (!completedCrop || !imgRef.current) {
      toast.error("Vui lòng chọn vùng cần cắt trên ảnh");
      return;
    }

    setIsApplying(true);
    try {
      const canvas = getCroppedCanvas(imgRef.current, completedCrop);
      if (!canvas) {
        toast.error("Không thể xử lý cắt ảnh");
        setIsApplying(false);
        return;
      }

      canvas.toBlob(
        (blob) => {
          setIsApplying(false);
          if (!blob) {
            toast.error("Lỗi trích xuất ảnh đã cắt");
            return;
          }
          const file = new File(
            [blob],
            `cropped-${Date.now()}.png`,
            { type: "image/png" }
          );
          onApply(file);
        },
        "image/png",
        1.0
      );
    } catch (err) {
      console.error(err);
      setIsApplying(false);
      toast.error("Đã xảy ra lỗi khi cắt ảnh");
    }
  }, [completedCrop, onApply]);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-background border border-border rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border bg-muted/40">
          <div className="flex items-center gap-2">
            <CropIcon className="h-5 w-5 text-primary animate-pulse" />
            <h3 className="text-base font-semibold text-foreground">
              Cắt tỉa hình ảnh
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Toolbar */}
        <div className="flex flex-wrap items-center gap-2 px-5 py-3 border-b border-border bg-muted/20">
          <span className="text-xs font-medium text-muted-foreground mr-1">Tỷ lệ khung:</span>
          {CROP_RATIOS.map((ratio) => {
            const isSelected = aspect === ratio.value;
            return (
              <Button
                key={ratio.label}
                type="button"
                variant={isSelected ? "default" : "outline"}
                size="sm"
                className="h-8 text-xs px-3"
                onClick={() => handleSetAspect(ratio.value)}
              >
                {ratio.label}
              </Button>
            );
          })}
        </div>

        {/* Workspace */}
        <div className="flex-1 overflow-auto p-6 flex flex-col items-center justify-center bg-muted/10 min-h-[300px]">
          <div className="max-w-full max-h-[50vh] overflow-hidden rounded-lg border border-border shadow-md bg-[repeating-conic-gradient(#e2e8f0_0%_25%,_white_0%_50%)] dark:bg-[repeating-conic-gradient(#334155_0%_25%,_transparent_0%_50%)] bg-[length:16px_16px]">
            <ReactCrop
              crop={crop}
              onChange={(c) => setCrop(c)}
              onComplete={(c) => setCompletedCrop(c)}
              aspect={aspect}
              className="max-w-full max-h-full"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                ref={imgRef}
                src={imageUrl}
                alt="Chỉnh sửa ảnh"
                crossOrigin="anonymous"
                onLoad={onImageLoad}
                className="max-h-[45vh] object-contain block select-none"
              />
            </ReactCrop>
          </div>
          <p className="text-xs text-muted-foreground mt-3 text-center">
            Kéo thả các góc hoặc di chuyển khung để chọn vùng ảnh mong muốn.
          </p>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 px-5 py-4 border-t border-border bg-muted/40">
          <Button type="button" variant="outline" onClick={onClose} disabled={isApplying}>
            Hủy
          </Button>
          <Button type="button" onClick={handleApply} disabled={isApplying}>
            {isApplying ? "Đang xử lý..." : "Áp dụng"}
          </Button>
        </div>
      </div>
    </div>
  );
}
