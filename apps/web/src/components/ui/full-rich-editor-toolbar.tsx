"use client";

import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { useCallback, useEffect, useState } from "react";
import {
  $getSelection,
  $isRangeSelection,
  FORMAT_TEXT_COMMAND,
  UNDO_COMMAND,
  REDO_COMMAND,
} from "lexical";
import { $setBlocksType } from "@lexical/selection";
import { $createHeadingNode, $createQuoteNode } from "@lexical/rich-text";
import type { HeadingTagType } from "@lexical/rich-text";
import { $createParagraphNode } from "lexical";
import { INSERT_UNORDERED_LIST_COMMAND, INSERT_ORDERED_LIST_COMMAND } from "@lexical/list";
import { Bold, Italic, Underline, List, ListOrdered, Quote, Undo, Redo, Heading1, Heading2 } from "lucide-react";
import { Toggle } from "@/components/ui/toggle";
import { Separator } from "@/components/ui/separator";

export function FullRichEditorToolbar() {
  const [editor] = useLexicalComposerContext();
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [isUnderline, setIsUnderline] = useState(false);

  const updateToolbar = useCallback(() => {
    const selection = $getSelection();
    if ($isRangeSelection(selection)) {
      setIsBold(selection.hasFormat("bold"));
      setIsItalic(selection.hasFormat("italic"));
      setIsUnderline(selection.hasFormat("underline"));
    }
  }, []);

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
    </div>
  );
}
