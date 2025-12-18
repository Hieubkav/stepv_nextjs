"use client";

import { useEffect } from "react";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { mergeRegister } from "@lexical/utils";
import { 
  $getSelection, 
  $isNodeSelection,
  COMMAND_PRIORITY_EDITOR, 
  COMMAND_PRIORITY_LOW,
  FORMAT_ELEMENT_COMMAND,
  createCommand 
} from "lexical";
import type { LexicalCommand } from "lexical";
import { $createImageGalleryNode, $isImageGalleryNode, ImageGalleryNode, type GalleryAlignment } from "./image-gallery-node";
import type { ImageGalleryPayload } from "./image-gallery-node";

export type InsertImageGalleryPayload = Readonly<ImageGalleryPayload>;

export const INSERT_IMAGE_GALLERY_COMMAND: LexicalCommand<InsertImageGalleryPayload> = 
  createCommand("INSERT_IMAGE_GALLERY_COMMAND");

export function ImageGalleryPlugin(): null {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    if (!editor.hasNodes([ImageGalleryNode])) {
      throw new Error("ImageGalleryPlugin: ImageGalleryNode not registered on editor");
    }

    return mergeRegister(
      editor.registerCommand<InsertImageGalleryPayload>(
        INSERT_IMAGE_GALLERY_COMMAND,
        (payload) => {
          const selection = $getSelection();
          if (selection !== null) {
            const galleryNode = $createImageGalleryNode(payload);
            selection.insertNodes([galleryNode]);
          }
          return true;
        },
        COMMAND_PRIORITY_EDITOR
      ),
      editor.registerCommand(
        FORMAT_ELEMENT_COMMAND,
        (formatType) => {
          const selection = $getSelection();
          if ($isNodeSelection(selection)) {
            const nodes = selection.getNodes();
            for (const node of nodes) {
              if ($isImageGalleryNode(node)) {
                const validAlignments = ["left", "center", "right"];
                if (validAlignments.includes(formatType)) {
                  node.setAlignment(formatType as GalleryAlignment);
                }
              }
            }
            return true;
          }
          return false;
        },
        COMMAND_PRIORITY_LOW
      )
    );
  }, [editor]);

  return null;
}
