"use client";

import { useEffect } from "react";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { $getSelection, COMMAND_PRIORITY_EDITOR, createCommand } from "lexical";
import type { LexicalCommand } from "lexical";
import { $createVideoNode, VideoNode } from "./video-node";
import type { VideoPayload } from "./video-node";

export type InsertVideoPayload = Readonly<VideoPayload>;

export const INSERT_VIDEO_COMMAND: LexicalCommand<InsertVideoPayload> = 
  createCommand("INSERT_VIDEO_COMMAND");

export function VideoPlugin(): null {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    if (!editor.hasNodes([VideoNode])) {
      throw new Error("VideoPlugin: VideoNode not registered on editor");
    }

    return editor.registerCommand<InsertVideoPayload>(
      INSERT_VIDEO_COMMAND,
      (payload) => {
        const selection = $getSelection();
        if (selection !== null) {
          const videoNode = $createVideoNode(payload);
          selection.insertNodes([videoNode]);
        }
        return true;
      },
      COMMAND_PRIORITY_EDITOR
    );
  }, [editor]);

  return null;
}
