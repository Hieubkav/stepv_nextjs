"use client";

import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  $getSelection,
  $isRangeSelection,
  FORMAT_TEXT_COMMAND,
  FORMAT_ELEMENT_COMMAND,
  UNDO_COMMAND,
  REDO_COMMAND,
} from "lexical";
import { $setBlocksType } from "@lexical/selection";
import { $createHeadingNode, $createQuoteNode } from "@lexical/rich-text";
import type { HeadingTagType } from "@lexical/rich-text";
import { INSERT_UNORDERED_LIST_COMMAND, INSERT_ORDERED_LIST_COMMAND } from "@lexical/list";
import { Bold, Italic, Underline, List, ListOrdered, Quote, Undo, Redo, Heading1, Heading2, ImageIcon, Loader2, LayoutGrid, AlignLeft, AlignCenter, AlignRight, Video } from "lucide-react";
import { Toggle } from "@/components/ui/toggle";
import { Separator } from "@/components/ui/separator";
import { useAction } from "convex/react";
import { api } from "@dohy/backend/convex/_generated/api";
import { toast } from "sonner";
import { INSERT_IMAGE_COMMAND } from "./lexical/image-plugin";
import { INSERT_IMAGE_GALLERY_COMMAND } from "./lexical/image-gallery-plugin";
import { INSERT_VIDEO_COMMAND } from "./lexical/video-plugin";
import { detectVideoType } from "./lexical/video-node";

export function FullRichEditorToolbar() {
  const [editor] = useLexicalComposerContext();
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [isUnderline, setIsUnderline] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const getImageUrl = useAction(api.media.getImageUrl);

  const updateToolbar = useCallback(() => {
    const selection = $getSelection();
    if ($isRangeSelection(selection)) {
      setIsBold(selection.hasFormat("bold"));
      setIsItalic(selection.hasFormat("italic"));
      setIsUnderline(selection.hasFormat("underline"));
    }
  }, []);

  const handleImageUpload = useCallback(async (file: File) => {
    if (!file.type.startsWith("image/")) {
      toast.error("Vui lòng chọn file ảnh");
      return;
    }

    const maxSize = 10 * 1024 * 1024; // 10MB (Sharp sẽ nén)
    if (file.size > maxSize) {
      toast.error("Kích thước ảnh tối đa 10MB");
      return;
    }

    setIsUploading(true);
    try {
      // Upload via Sharp API route (converts to WebP)
      const formData = new FormData();
      formData.append("file", file);
      formData.append("title", file.name.replace(/\.[^/.]+$/, "")); // Remove extension

      const response = await fetch("/api/media/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Upload failed");
      }

      const { storageId } = await response.json();

      // Get the actual URL from Convex storage
      const { url: imageUrl } = await getImageUrl({ storageId: storageId as any });
      
      if (!imageUrl) {
        throw new Error("Failed to get image URL");
      }

      // Get image dimensions from loaded image
      const img = new window.Image();
      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = reject;
        img.src = imageUrl;
      });

      const width = img.naturalWidth;
      const height = img.naturalHeight;

      // Insert image into editor with proper dimensions
      const displayWidth = Math.min(width, 800);
      const displayHeight = Math.round((displayWidth / width) * height);

      editor.dispatchCommand(INSERT_IMAGE_COMMAND, {
        src: imageUrl,
        altText: file.name.replace(/\.[^/.]+$/, ""),
        width: displayWidth,
        height: displayHeight,
        maxWidth: 800,
      });

      toast.success("Đã tải ảnh lên (WebP)");
    } catch (error) {
      console.error("Image upload error:", error);
      toast.error(error instanceof Error ? error.message : "Không thể tải ảnh lên");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  }, [editor, getImageUrl]);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleImageUpload(file);
    }
  }, [handleImageUpload]);

  useEffect(() => {
    return editor.registerUpdateListener(({ editorState }) => {
      editorState.read(() => {
        updateToolbar();
      });
    });
  }, [editor, updateToolbar]);

  const formatHeading = (tag: HeadingTagType) => {
    editor.update(() => {
      const selection = $getSelection();
      if ($isRangeSelection(selection)) {
        $setBlocksType(selection, () => $createHeadingNode(tag));
      }
    });
  };

  const formatQuote = () => {
    editor.update(() => {
      const selection = $getSelection();
      if ($isRangeSelection(selection)) {
        $setBlocksType(selection, () => $createQuoteNode());
      }
    });
  };

  const insertImageGallery = () => {
    editor.dispatchCommand(INSERT_IMAGE_GALLERY_COMMAND, {
      columns: 3,
      images: [],
    });
  };

  const insertVideo = () => {
    const url = window.prompt("Nhập link YouTube hoặc Google Drive:");
    if (!url) return;

    const detected = detectVideoType(url.trim());
    if (!detected) {
      toast.error("Link không hợp lệ. Vui lòng nhập link YouTube hoặc Google Drive.");
      return;
    }

    editor.dispatchCommand(INSERT_VIDEO_COMMAND, {
      videoType: detected.type,
      videoUrl: url.trim(),
      videoId: detected.id,
    });

    toast.success(`Đã chèn video ${detected.type === "youtube" ? "YouTube" : "Google Drive"}`);
  };

  return (
    <div className="flex flex-wrap items-center gap-1 p-2 border-b bg-muted/30">
      {/* History */}
      <Toggle
        size="sm"
        onPressedChange={() => editor.dispatchCommand(UNDO_COMMAND, undefined)}
        aria-label="Undo"
      >
        <Undo className="h-4 w-4" />
      </Toggle>
      <Toggle
        size="sm"
        onPressedChange={() => editor.dispatchCommand(REDO_COMMAND, undefined)}
        aria-label="Redo"
      >
        <Redo className="h-4 w-4" />
      </Toggle>

      <Separator orientation="vertical" className="h-6 mx-1" />

      {/* Headings */}
      <Toggle size="sm" onPressedChange={() => formatHeading("h1")} aria-label="Heading 1">
        <Heading1 className="h-4 w-4" />
      </Toggle>
      <Toggle size="sm" onPressedChange={() => formatHeading("h2")} aria-label="Heading 2">
        <Heading2 className="h-4 w-4" />
      </Toggle>

      <Separator orientation="vertical" className="h-6 mx-1" />

      {/* Text Format */}
      <Toggle
        size="sm"
        pressed={isBold}
        onPressedChange={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, "bold")}
        aria-label="Bold"
      >
        <Bold className="h-4 w-4" />
      </Toggle>
      <Toggle
        size="sm"
        pressed={isItalic}
        onPressedChange={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, "italic")}
        aria-label="Italic"
      >
        <Italic className="h-4 w-4" />
      </Toggle>
      <Toggle
        size="sm"
        pressed={isUnderline}
        onPressedChange={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, "underline")}
        aria-label="Underline"
      >
        <Underline className="h-4 w-4" />
      </Toggle>

      <Separator orientation="vertical" className="h-6 mx-1" />

      {/* Lists */}
      <Toggle
        size="sm"
        onPressedChange={() => editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined)}
        aria-label="Bullet List"
      >
        <List className="h-4 w-4" />
      </Toggle>
      <Toggle
        size="sm"
        onPressedChange={() => editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, undefined)}
        aria-label="Numbered List"
      >
        <ListOrdered className="h-4 w-4" />
      </Toggle>

      <Separator orientation="vertical" className="h-6 mx-1" />

      {/* Quote */}
      <Toggle size="sm" onPressedChange={formatQuote} aria-label="Quote">
        <Quote className="h-4 w-4" />
      </Toggle>

      <Separator orientation="vertical" className="h-6 mx-1" />

      {/* Alignment */}
      <Toggle
        size="sm"
        onPressedChange={() => editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, "left")}
        aria-label="Align Left"
        title="Căn trái"
      >
        <AlignLeft className="h-4 w-4" />
      </Toggle>
      <Toggle
        size="sm"
        onPressedChange={() => editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, "center")}
        aria-label="Align Center"
        title="Căn giữa"
      >
        <AlignCenter className="h-4 w-4" />
      </Toggle>
      <Toggle
        size="sm"
        onPressedChange={() => editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, "right")}
        aria-label="Align Right"
        title="Căn phải"
      >
        <AlignRight className="h-4 w-4" />
      </Toggle>

      <Separator orientation="vertical" className="h-6 mx-1" />

      {/* Image Upload */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
        aria-label="Upload image"
      />
      <Toggle
        size="sm"
        onPressedChange={() => fileInputRef.current?.click()}
        disabled={isUploading}
        aria-label="Insert Image"
        title="Chèn ảnh đơn"
      >
        {isUploading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <ImageIcon className="h-4 w-4" />
        )}
      </Toggle>

      {/* Image Gallery */}
      <Toggle
        size="sm"
        onPressedChange={insertImageGallery}
        aria-label="Insert Image Gallery"
        title="Chèn gallery ảnh (grid)"
      >
        <LayoutGrid className="h-4 w-4" />
      </Toggle>

      {/* Video Embed */}
      <Toggle
        size="sm"
        onPressedChange={insertVideo}
        aria-label="Insert Video"
        title="Chèn video YouTube/Drive"
      >
        <Video className="h-4 w-4" />
      </Toggle>
    </div>
  );
}
