"use client";

import type { NodeKey } from "lexical";
import type { JSX } from "react";

import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { useLexicalNodeSelection } from "@lexical/react/useLexicalNodeSelection";
import { useLexicalEditable } from "@lexical/react/useLexicalEditable";
import { mergeRegister } from "@lexical/utils";
import {
  $getNodeByKey,
  $getSelection,
  $isNodeSelection,
  CLICK_COMMAND,
  COMMAND_PRIORITY_LOW,
  KEY_BACKSPACE_COMMAND,
  KEY_DELETE_COMMAND,
} from "lexical";
import { useCallback, useEffect, useRef, useState } from "react";
import { ImagePlus, X, Columns2, Columns3, Grid2X2 } from "lucide-react";
import { useAction } from "convex/react";
import { api } from "@dohy/backend/convex/_generated/api";
import { toast } from "sonner";

import { $isImageGalleryNode, type GalleryAlignment } from "./image-gallery-node";
import type { GalleryImage } from "./image-gallery-node";

export default function ImageGalleryComponent({
  columns,
  images,
  nodeKey,
  alignment = "left",
  caption = "",
}: {
  columns: number;
  images: GalleryImage[];
  nodeKey: NodeKey;
  alignment?: GalleryAlignment;
  caption?: string;
}): JSX.Element {
  const [editor] = useLexicalComposerContext();
  const [isSelected, setSelected, clearSelection] = useLexicalNodeSelection(nodeKey);
  const isEditable = useLexicalEditable();
  const containerRef = useRef<HTMLDivElement>(null);
  const [uploadingIndex, setUploadingIndex] = useState<number | null>(null);
  const getImageUrl = useAction(api.media.getImageUrl);

  const isFocused = isSelected && isEditable;

  const onDelete = useCallback(
    (payload: KeyboardEvent) => {
      if (isSelected && $isNodeSelection($getSelection())) {
        const event: KeyboardEvent = payload;
        event.preventDefault();
        editor.update(() => {
          const node = $getNodeByKey(nodeKey);
          if ($isImageGalleryNode(node)) {
            node.remove();
          }
        });
      }
      return false;
    },
    [editor, isSelected, nodeKey]
  );

  const onClick = useCallback(
    (payload: MouseEvent) => {
      const event = payload;
      if (containerRef.current?.contains(event.target as Node)) {
        if (event.shiftKey) {
          setSelected(!isSelected);
        } else {
          clearSelection();
          setSelected(true);
        }
        return true;
      }
      return false;
    },
    [isSelected, setSelected, clearSelection]
  );

  useEffect(() => {
    return mergeRegister(
      editor.registerCommand<MouseEvent>(CLICK_COMMAND, onClick, COMMAND_PRIORITY_LOW),
      editor.registerCommand(KEY_DELETE_COMMAND, onDelete, COMMAND_PRIORITY_LOW),
      editor.registerCommand(KEY_BACKSPACE_COMMAND, onDelete, COMMAND_PRIORITY_LOW)
    );
  }, [editor, onClick, onDelete]);

  const handleUpload = async (file: File, index: number) => {
    if (!file.type.startsWith("image/")) {
      toast.error("Vui lòng chọn file ảnh");
      return;
    }

    setUploadingIndex(index);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("title", file.name.replace(/\.[^/.]+$/, ""));

      const response = await fetch("/api/media/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Upload failed");
      }

      const { storageId } = await response.json();
      const { url: imageUrl } = await getImageUrl({ storageId: storageId as any });

      if (!imageUrl) {
        throw new Error("Failed to get image URL");
      }

      // Get dimensions
      const img = new window.Image();
      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = reject;
        img.src = imageUrl;
      });

      const newImage: GalleryImage = {
        src: imageUrl,
        altText: file.name.replace(/\.[^/.]+$/, ""),
        width: img.naturalWidth,
        height: img.naturalHeight,
      };

      editor.update(() => {
        const node = $getNodeByKey(nodeKey);
        if ($isImageGalleryNode(node)) {
          if (index < images.length) {
            node.updateImage(index, newImage);
          } else {
            node.addImage(newImage);
          }
        }
      });

      toast.success("Đã tải ảnh lên");
    } catch (error) {
      console.error("Upload error:", error);
      toast.error(error instanceof Error ? error.message : "Không thể tải ảnh");
    } finally {
      setUploadingIndex(null);
    }
  };

  const handleRemoveImage = (index: number) => {
    editor.update(() => {
      const node = $getNodeByKey(nodeKey);
      if ($isImageGalleryNode(node)) {
        node.removeImage(index);
      }
    });
  };

  const handleChangeColumns = (newColumns: number) => {
    editor.update(() => {
      const node = $getNodeByKey(nodeKey);
      if ($isImageGalleryNode(node)) {
        node.setColumns(newColumns);
      }
    });
  };

  const handleCaptionChange = (newCaption: string) => {
    editor.update(() => {
      const node = $getNodeByKey(nodeKey);
      if ($isImageGalleryNode(node)) {
        node.setCaption(newCaption);
      }
    });
  };

  const handleDrop = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleUpload(files[0], index);
    }
  };

  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOverIndex(index);
  };

  const handleDragLeave = () => {
    setDragOverIndex(null);
  };

  const handleDropOnCell = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOverIndex(null);
    handleDrop(e, index);
  };

  // Generate cells (filled + empty up to columns count)
  const cells = [];
  const maxCells = Math.max(columns, images.length);
  
  for (let i = 0; i < maxCells; i++) {
    const image = images[i];
    const isDragOver = dragOverIndex === i;
    
    cells.push(
      <div
        key={i}
        className={`group relative aspect-video rounded-lg overflow-hidden border-2 border-dashed transition-all ${
          isDragOver 
            ? "border-primary bg-primary/10" 
            : image 
              ? "border-transparent hover:border-muted-foreground/50" 
              : "border-muted-foreground/30 hover:border-primary/50"
        } ${uploadingIndex === i ? "opacity-50" : ""}`}
        onDrop={(e) => handleDropOnCell(e, i)}
        onDragOver={(e) => handleDragOver(e, i)}
        onDragLeave={handleDragLeave}
      >
        {image ? (
          <>
            <img
              src={image.src}
              alt={image.altText}
              className="w-full h-full object-cover"
            />
            {isEditable && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemoveImage(i);
                }}
                className="absolute top-1 right-1 p-1.5 bg-destructive hover:bg-destructive/90 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-md"
                title="Xóa ảnh"
              >
                <X className="w-3 h-3" />
              </button>
            )}
            {/* Drag overlay for replacing */}
            {isDragOver && (
              <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                <span className="text-sm font-medium text-primary">Thả để thay thế</span>
              </div>
            )}
          </>
        ) : (
          <label className={`absolute inset-0 flex flex-col items-center justify-center cursor-pointer transition-colors ${
            isDragOver ? "bg-primary/10" : "bg-muted/50 hover:bg-muted"
          }`}>
            {uploadingIndex === i ? (
              <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <ImagePlus className={`w-8 h-8 mb-1 ${isDragOver ? "text-primary" : "text-muted-foreground"}`} />
                <span className={`text-xs ${isDragOver ? "text-primary font-medium" : "text-muted-foreground"}`}>
                  {isDragOver ? "Thả ảnh vào đây" : "Kéo thả hoặc click"}
                </span>
              </>
            )}
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleUpload(file, i);
                e.target.value = "";
              }}
              disabled={uploadingIndex !== null}
            />
          </label>
        )}
      </div>
    );
  }

  const alignmentClass = {
    left: "",
    center: "mx-auto",
    right: "ml-auto",
  }[alignment];

  return (
    <div
      ref={containerRef}
      className={`relative my-4 p-2 rounded-lg transition-all select-none ${alignmentClass} ${
        isFocused ? "ring-2 ring-primary bg-muted/30" : ""
      }`}
      contentEditable={false}
      style={{ userSelect: "none" }}
    >
      {/* Column selector */}
      {isFocused && isEditable && (
        <div className="absolute -top-10 left-0 flex items-center gap-1 bg-background border rounded-lg p-1 shadow-sm z-10">
          <button
            type="button"
            onClick={() => handleChangeColumns(2)}
            className={`p-1.5 rounded ${columns === 2 ? "bg-primary text-white" : "hover:bg-muted"}`}
            title="2 cột"
          >
            <Columns2 className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => handleChangeColumns(3)}
            className={`p-1.5 rounded ${columns === 3 ? "bg-primary text-white" : "hover:bg-muted"}`}
            title="3 cột"
          >
            <Columns3 className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => handleChangeColumns(4)}
            className={`p-1.5 rounded ${columns === 4 ? "bg-primary text-white" : "hover:bg-muted"}`}
            title="4 cột"
          >
            <Grid2X2 className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Grid */}
      <div
        className="grid gap-2"
        style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}
      >
        {cells}
      </div>

      {/* Caption input */}
      {isEditable ? (
        <input
          type="text"
          value={caption}
          onChange={(e) => handleCaptionChange(e.target.value)}
          placeholder="Nhập mô tả cho gallery..."
          className="mt-2 w-full px-3 py-2 text-sm text-center border border-dashed border-muted-foreground/30 rounded-lg bg-transparent placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/50 transition-colors"
        />
      ) : caption ? (
        <p className="mt-2 text-sm text-muted-foreground text-center italic">{caption}</p>
      ) : null}
    </div>
  );
}
