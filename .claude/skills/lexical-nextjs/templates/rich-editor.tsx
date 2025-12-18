"use client";

import { useEffect, useCallback, useState } from "react";
import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { AutoFocusPlugin } from "@lexical/react/LexicalAutoFocusPlugin";
import { ListPlugin } from "@lexical/react/LexicalListPlugin";
import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { HeadingNode, QuoteNode } from "@lexical/rich-text";
import { ListNode, ListItemNode } from "@lexical/list";
import { LinkNode } from "@lexical/link";
import { CodeNode } from "@lexical/code";
import { $generateHtmlFromNodes, $generateNodesFromDOM } from "@lexical/html";
import { $getRoot, $getSelection, $isRangeSelection, FORMAT_TEXT_COMMAND, UNDO_COMMAND, REDO_COMMAND, ParagraphNode, TextNode } from "lexical";
import { $setBlocksType } from "@lexical/selection";
import { $createHeadingNode, $createQuoteNode, HeadingTagType } from "@lexical/rich-text";
import { INSERT_UNORDERED_LIST_COMMAND, INSERT_ORDERED_LIST_COMMAND } from "@lexical/list";
import { Bold, Italic, Underline, List, ListOrdered, Quote, Undo, Redo, Heading1, Heading2 } from "lucide-react";

// Theme configuration
const theme = {
  paragraph: "mb-2",
  heading: {
    h1: "text-3xl font-bold mb-3",
    h2: "text-2xl font-bold mb-3",
    h3: "text-xl font-bold mb-2",
  },
  list: {
    ul: "list-disc list-inside mb-2",
    ol: "list-decimal list-inside mb-2",
  },
  quote: "border-l-4 border-gray-300 pl-4 italic my-2",
  code: "bg-gray-100 dark:bg-gray-800 rounded px-1 py-0.5 font-mono text-sm",
  text: {
    bold: "font-bold",
    italic: "italic",
    underline: "underline",
    strikethrough: "line-through",
  },
};

function onError(error: Error) {
  console.error("Lexical error:", error);
}

// OnChange Plugin - Syncs editor state to parent
function OnChangePlugin({ onChange }: { onChange: (html: string) => void }) {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    return editor.registerUpdateListener(({ editorState }) => {
      editorState.read(() => {
        const html = $generateHtmlFromNodes(editor, null);
        onChange(html || "<p></p>");
      });
    });
  }, [editor, onChange]);

  return null;
}

// InitialValue Plugin - Loads initial HTML content
function InitialValuePlugin({ value }: { value: string }) {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    if (!value || value === "<p></p>") return;

    editor.update(() => {
      const parser = new DOMParser();
      const dom = parser.parseFromString(value, "text/html");
      const nodes = $generateNodesFromDOM(editor, dom);
      const root = $getRoot();
      root.clear();

      // Filter to keep only valid element/decorator nodes
      const validNodes = nodes.filter((node: any) => {
        const type = node.getType?.() || node.__type;
        return type !== "text";
      });

      if (validNodes.length > 0) {
        root.append(...validNodes);
      } else if (value.trim()) {
        // Fallback: create paragraph with text content
        const para = new ParagraphNode();
        para.append(new TextNode(value));
        root.append(para);
      }
    });
  }, []); // Only run once on mount

  return null;
}

// Toolbar Component
function Toolbar() {
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

// Main Editor Props
type RichEditorProps = {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  className?: string;
};

// Main Rich Editor Component
export function RichEditor({
  value,
  onChange,
  placeholder = "Start typing...",
  className = "",
}: RichEditorProps) {
  const initialConfig = {
    namespace: "RichEditor",
    theme,
    onError,
    nodes: [HeadingNode, QuoteNode, ListNode, ListItemNode, LinkNode, CodeNode],
  };

  return (
    <LexicalComposer initialConfig={initialConfig}>
      <div className={`border rounded-md bg-background ${className}`}>
        <Toolbar />
        <div className="relative">
          <RichTextPlugin
            contentEditable={
              <ContentEditable
                className="min-h-[200px] px-3 py-2 outline-none prose prose-sm max-w-none"
                aria-placeholder={placeholder}
              />
            }
            placeholder={
              <div className="absolute top-2 left-3 text-muted-foreground pointer-events-none">
                {placeholder}
              </div>
            }
            ErrorBoundary={LexicalErrorBoundary}
          />
        </div>
        <HistoryPlugin />
        <AutoFocusPlugin />
        <ListPlugin />
        <OnChangePlugin onChange={onChange} />
        <InitialValuePlugin value={value} />
      </div>
    </LexicalComposer>
  );
}
