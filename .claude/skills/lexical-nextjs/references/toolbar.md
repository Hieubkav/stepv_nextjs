# Toolbar Implementation

Complete guide to building editor toolbars with Lexical.

## Basic Toolbar

```tsx
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
import { $createHeadingNode, $createQuoteNode, HeadingTagType } from "@lexical/rich-text";
import { INSERT_UNORDERED_LIST_COMMAND, INSERT_ORDERED_LIST_COMMAND } from "@lexical/list";
import {
  Bold,
  Italic,
  Underline,
  List,
  ListOrdered,
  Quote,
  Undo,
  Redo,
  Heading1,
  Heading2,
} from "lucide-react";

export function Toolbar() {
  const [editor] = useLexicalComposerContext();
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [isUnderline, setIsUnderline] = useState(false);

  // Update toolbar state when selection changes
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

  // Block formatting
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
      <ToolbarButton
        onClick={() => editor.dispatchCommand(UNDO_COMMAND, undefined)}
        icon={<Undo className="h-4 w-4" />}
        label="Undo"
      />
      <ToolbarButton
        onClick={() => editor.dispatchCommand(REDO_COMMAND, undefined)}
        icon={<Redo className="h-4 w-4" />}
        label="Redo"
      />

      <Separator />

      {/* Headings */}
      <ToolbarButton
        onClick={() => formatHeading("h1")}
        icon={<Heading1 className="h-4 w-4" />}
        label="Heading 1"
      />
      <ToolbarButton
        onClick={() => formatHeading("h2")}
        icon={<Heading2 className="h-4 w-4" />}
        label="Heading 2"
      />

      <Separator />

      {/* Text Format */}
      <ToolbarButton
        onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, "bold")}
        icon={<Bold className="h-4 w-4" />}
        label="Bold"
        active={isBold}
      />
      <ToolbarButton
        onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, "italic")}
        icon={<Italic className="h-4 w-4" />}
        label="Italic"
        active={isItalic}
      />
      <ToolbarButton
        onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, "underline")}
        icon={<Underline className="h-4 w-4" />}
        label="Underline"
        active={isUnderline}
      />

      <Separator />

      {/* Lists */}
      <ToolbarButton
        onClick={() => editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined)}
        icon={<List className="h-4 w-4" />}
        label="Bullet List"
      />
      <ToolbarButton
        onClick={() => editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, undefined)}
        icon={<ListOrdered className="h-4 w-4" />}
        label="Numbered List"
      />

      <Separator />

      {/* Quote */}
      <ToolbarButton
        onClick={formatQuote}
        icon={<Quote className="h-4 w-4" />}
        label="Quote"
      />
    </div>
  );
}

function ToolbarButton({
  onClick,
  icon,
  label,
  active = false,
}: {
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
  active?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`p-2 rounded hover:bg-muted transition-colors ${
        active ? "bg-muted text-primary" : ""
      }`}
      aria-label={label}
      title={label}
    >
      {icon}
    </button>
  );
}

function Separator() {
  return <div className="w-px h-6 bg-border mx-1" />;
}
```

## Block Type Dropdown

```tsx
import { $createParagraphNode } from "lexical";
import { $isHeadingNode, $isQuoteNode } from "@lexical/rich-text";
import { $isListNode } from "@lexical/list";

type BlockType = "paragraph" | "h1" | "h2" | "h3" | "quote" | "ul" | "ol";

function BlockTypeDropdown() {
  const [editor] = useLexicalComposerContext();
  const [blockType, setBlockType] = useState<BlockType>("paragraph");

  useEffect(() => {
    return editor.registerUpdateListener(({ editorState }) => {
      editorState.read(() => {
        const selection = $getSelection();
        if (!$isRangeSelection(selection)) return;

        const anchorNode = selection.anchor.getNode();
        const element = anchorNode.getTopLevelElement();

        if (element === null) {
          setBlockType("paragraph");
        } else if ($isHeadingNode(element)) {
          setBlockType(element.getTag() as BlockType);
        } else if ($isQuoteNode(element)) {
          setBlockType("quote");
        } else if ($isListNode(element)) {
          setBlockType(element.getListType() === "bullet" ? "ul" : "ol");
        } else {
          setBlockType("paragraph");
        }
      });
    });
  }, [editor]);

  const formatBlock = (type: BlockType) => {
    editor.update(() => {
      const selection = $getSelection();
      if (!$isRangeSelection(selection)) return;

      switch (type) {
        case "paragraph":
          $setBlocksType(selection, () => $createParagraphNode());
          break;
        case "h1":
        case "h2":
        case "h3":
          $setBlocksType(selection, () => $createHeadingNode(type));
          break;
        case "quote":
          $setBlocksType(selection, () => $createQuoteNode());
          break;
        case "ul":
          editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined);
          break;
        case "ol":
          editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, undefined);
          break;
      }
    });
  };

  const blockTypeLabels: Record<BlockType, string> = {
    paragraph: "Paragraph",
    h1: "Heading 1",
    h2: "Heading 2",
    h3: "Heading 3",
    quote: "Quote",
    ul: "Bullet List",
    ol: "Numbered List",
  };

  return (
    <select
      value={blockType}
      onChange={(e) => formatBlock(e.target.value as BlockType)}
      className="px-2 py-1 border rounded text-sm"
    >
      {Object.entries(blockTypeLabels).map(([value, label]) => (
        <option key={value} value={value}>
          {label}
        </option>
      ))}
    </select>
  );
}
```

## Font Size Dropdown

```tsx
function FontSizeDropdown() {
  const [editor] = useLexicalComposerContext();
  const [fontSize, setFontSize] = useState("16px");

  const fontSizes = ["12px", "14px", "16px", "18px", "20px", "24px", "30px"];

  const applyFontSize = (size: string) => {
    editor.update(() => {
      const selection = $getSelection();
      if ($isRangeSelection(selection)) {
        selection.getNodes().forEach((node) => {
          if ($isTextNode(node)) {
            node.setStyle(`font-size: ${size}`);
          }
        });
      }
    });
    setFontSize(size);
  };

  return (
    <select
      value={fontSize}
      onChange={(e) => applyFontSize(e.target.value)}
      className="px-2 py-1 border rounded text-sm"
    >
      {fontSizes.map((size) => (
        <option key={size} value={size}>
          {size}
        </option>
      ))}
    </select>
  );
}
```

## Color Picker

```tsx
function TextColorPicker() {
  const [editor] = useLexicalComposerContext();
  const [color, setColor] = useState("#000000");

  const applyColor = (newColor: string) => {
    editor.update(() => {
      const selection = $getSelection();
      if ($isRangeSelection(selection)) {
        selection.getNodes().forEach((node) => {
          if ($isTextNode(node)) {
            node.setStyle(`color: ${newColor}`);
          }
        });
      }
    });
    setColor(newColor);
  };

  return (
    <input
      type="color"
      value={color}
      onChange={(e) => applyColor(e.target.value)}
      className="w-8 h-8 p-0 border-0 cursor-pointer"
      title="Text Color"
    />
  );
}
```

## Link Button

```tsx
import { $isLinkNode, TOGGLE_LINK_COMMAND } from "@lexical/link";

function LinkButton() {
  const [editor] = useLexicalComposerContext();
  const [isLink, setIsLink] = useState(false);

  useEffect(() => {
    return editor.registerUpdateListener(({ editorState }) => {
      editorState.read(() => {
        const selection = $getSelection();
        if ($isRangeSelection(selection)) {
          const node = selection.anchor.getNode();
          const parent = node.getParent();
          setIsLink($isLinkNode(parent) || $isLinkNode(node));
        }
      });
    });
  }, [editor]);

  const insertLink = () => {
    if (isLink) {
      editor.dispatchCommand(TOGGLE_LINK_COMMAND, null);
    } else {
      const url = prompt("Enter URL:");
      if (url) {
        editor.dispatchCommand(TOGGLE_LINK_COMMAND, url);
      }
    }
  };

  return (
    <ToolbarButton
      onClick={insertLink}
      icon={<Link className="h-4 w-4" />}
      label={isLink ? "Remove Link" : "Insert Link"}
      active={isLink}
    />
  );
}
```

## Floating Toolbar

```tsx
import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

function FloatingToolbar() {
  const [editor] = useLexicalComposerContext();
  const toolbarRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });

  const updatePosition = useCallback(() => {
    const domSelection = window.getSelection();
    if (!domSelection || domSelection.rangeCount === 0) {
      setIsVisible(false);
      return;
    }

    const range = domSelection.getRangeAt(0);
    if (range.collapsed) {
      setIsVisible(false);
      return;
    }

    const rect = range.getBoundingClientRect();
    setPosition({
      top: rect.top + window.scrollY - 50,
      left: rect.left + window.scrollX + rect.width / 2,
    });
    setIsVisible(true);
  }, []);

  useEffect(() => {
    return editor.registerUpdateListener(({ editorState }) => {
      editorState.read(() => {
        const selection = $getSelection();
        if ($isRangeSelection(selection) && !selection.isCollapsed()) {
          updatePosition();
        } else {
          setIsVisible(false);
        }
      });
    });
  }, [editor, updatePosition]);

  if (!isVisible) return null;

  return createPortal(
    <div
      ref={toolbarRef}
      className="fixed z-50 bg-white shadow-lg rounded-lg p-1 flex gap-1 transform -translate-x-1/2"
      style={{ top: position.top, left: position.left }}
    >
      <ToolbarButton
        onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, "bold")}
        icon={<Bold className="h-4 w-4" />}
        label="Bold"
      />
      <ToolbarButton
        onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, "italic")}
        icon={<Italic className="h-4 w-4" />}
        label="Italic"
      />
      <ToolbarButton
        onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, "underline")}
        icon={<Underline className="h-4 w-4" />}
        label="Underline"
      />
    </div>,
    document.body
  );
}
```

## Keyboard Shortcuts

```tsx
function KeyboardShortcutsPlugin() {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    return editor.registerCommand(
      KEY_MODIFIER_COMMAND,
      (event: KeyboardEvent) => {
        const { key, ctrlKey, metaKey } = event;
        const modifier = ctrlKey || metaKey;

        if (!modifier) return false;

        switch (key.toLowerCase()) {
          case "b":
            event.preventDefault();
            editor.dispatchCommand(FORMAT_TEXT_COMMAND, "bold");
            return true;
          case "i":
            event.preventDefault();
            editor.dispatchCommand(FORMAT_TEXT_COMMAND, "italic");
            return true;
          case "u":
            event.preventDefault();
            editor.dispatchCommand(FORMAT_TEXT_COMMAND, "underline");
            return true;
          case "z":
            event.preventDefault();
            if (event.shiftKey) {
              editor.dispatchCommand(REDO_COMMAND, undefined);
            } else {
              editor.dispatchCommand(UNDO_COMMAND, undefined);
            }
            return true;
        }

        return false;
      },
      COMMAND_PRIORITY_CRITICAL
    );
  }, [editor]);

  return null;
}
```

## Complete Toolbar Example

```tsx
export function EditorToolbar() {
  return (
    <div className="border-b">
      {/* Main toolbar row */}
      <div className="flex flex-wrap items-center gap-1 p-2">
        <HistoryButtons />
        <Separator />
        <BlockTypeDropdown />
        <Separator />
        <TextFormatButtons />
        <Separator />
        <ListButtons />
        <Separator />
        <LinkButton />
        <TextColorPicker />
      </div>

      {/* Floating toolbar for selection */}
      <FloatingToolbar />

      {/* Keyboard shortcuts */}
      <KeyboardShortcutsPlugin />
    </div>
  );
}
```
