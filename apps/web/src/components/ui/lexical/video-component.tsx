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
import { useCallback, useEffect, useRef } from "react";
import { Trash2, Youtube, HardDrive } from "lucide-react";

import { $isVideoNode, type VideoType } from "./video-node";

export default function VideoComponent({
  videoType,
  videoUrl,
  videoId,
  nodeKey,
}: {
  videoType: VideoType;
  videoUrl: string;
  videoId: string;
  nodeKey: NodeKey;
}): JSX.Element {
  const [editor] = useLexicalComposerContext();
  const [isSelected, setSelected, clearSelection] = useLexicalNodeSelection(nodeKey);
  const isEditable = useLexicalEditable();
  const containerRef = useRef<HTMLDivElement>(null);

  const isFocused = isSelected && isEditable;

  const onDelete = useCallback(
    (payload: KeyboardEvent) => {
      if (isSelected && $isNodeSelection($getSelection())) {
        const event: KeyboardEvent = payload;
        event.preventDefault();
        editor.update(() => {
          const node = $getNodeByKey(nodeKey);
          if ($isVideoNode(node)) {
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

  const handleRemove = () => {
    editor.update(() => {
      const node = $getNodeByKey(nodeKey);
      if ($isVideoNode(node)) {
        node.remove();
      }
    });
  };

  const embedUrl =
    videoType === "youtube"
      ? `https://www.youtube-nocookie.com/embed/${videoId}`
      : `https://drive.google.com/file/d/${videoId}/preview`;

  return (
    <div
      ref={containerRef}
      className={`relative my-4 select-none ${isFocused ? "ring-2 ring-primary rounded-lg" : ""}`}
      contentEditable={false}
      style={{ userSelect: "none" }}
    >
      {/* Video type badge */}
      <div className="absolute top-2 left-2 z-10 flex items-center gap-1 px-2 py-1 bg-black/70 text-white text-xs rounded-md">
        {videoType === "youtube" ? (
          <>
            <Youtube className="w-3 h-3 text-red-500" />
            YouTube
          </>
        ) : (
          <>
            <HardDrive className="w-3 h-3 text-blue-400" />
            Drive
          </>
        )}
      </div>

      {/* Delete button */}
      {isEditable && isFocused && (
        <button
          type="button"
          onClick={handleRemove}
          className="absolute top-2 right-2 z-10 p-2 bg-destructive hover:bg-destructive/90 text-white rounded-md shadow-md transition-colors"
          title="Xóa video"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      )}

      {/* Video iframe */}
      <div className="aspect-video rounded-lg overflow-hidden bg-black">
        <iframe
          src={embedUrl}
          className="w-full h-full"
          allow={
            videoType === "youtube"
              ? "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              : "autoplay"
          }
          allowFullScreen
          title={videoType === "youtube" ? "YouTube video" : "Google Drive video"}
        />
      </div>

      {/* URL display */}
      {isFocused && (
        <div className="mt-2 text-xs text-muted-foreground truncate px-1">
          {videoUrl}
        </div>
      )}
    </div>
  );
}
