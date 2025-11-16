"use client";

import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { AutoFocusPlugin } from "@lexical/react/LexicalAutoFocusPlugin";
import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary";
import { HeadingNode, QuoteNode } from "@lexical/rich-text";
import { ListItemNode, ListNode } from "@lexical/list";
import { CodeNode } from "@lexical/code";
import { LinkNode } from "@lexical/link";
import { $getRoot, $insertNodes, ParagraphNode as LexicalParagraphNode, TextNode } from "lexical";
import type { EditorState, LexicalEditor, SerializedEditorState } from "lexical";
import { $generateNodesFromDOM } from "@lexical/html";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { useEffect } from "react";
import { cn } from "@/lib/utils";
import { FullRichEditorToolbar } from "./full-rich-editor-toolbar";

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
};

function onError(error: Error) {
  console.error(error);
}

type Props = {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  className?: string;
};

function OnChangePlugin({ onChange }: { onChange: (html: string) => void }) {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    return editor.registerUpdateListener(({ editorState }) => {
      editorState.read(() => {
        const htmlString = editor.getEditorState().read(() => {
          const root = $getRoot();
          return root.getTextContent() ? editor.getEditorState().toJSON() : "";
        });
        
        // Convert Lexical state to HTML for storage
        const parser = new DOMParser();
        const dom = parser.parseFromString("<div></div>", "text/html");
        const container = dom.querySelector("div")!;
        
        editor.getEditorState().read(() => {
          const root = $getRoot();
          const children = root.getChildren();
          children.forEach((child: any) => {
            const el = document.createElement("div");
            el.textContent = child.getTextContent();
            container.appendChild(el);
          });
        });
        
        onChange(container.innerHTML || "<p></p>");
      });
    });
  }, [editor, onChange]);

  return null;
}

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
        const para = new LexicalParagraphNode();
        para.append(new TextNode(value));
        root.append(para);
      }
    });
  }, []); // Only run once on mount

  return null;
}

export function FullRichEditor({ value, onChange, placeholder = "Nhập nội dung...", className }: Props) {
  const initialConfig = {
    namespace: "FullRichEditor",
    theme,
    onError,
    nodes: [HeadingNode, QuoteNode, ListNode, ListItemNode, CodeNode, LinkNode],
  };

  return (
    <LexicalComposer initialConfig={initialConfig}>
      <div className={cn("border rounded-md bg-background", className)}>
        <FullRichEditorToolbar />
        <div className="relative">
          <RichTextPlugin
            contentEditable={
              <ContentEditable className="min-h-[200px] px-3 py-2 focus:outline-none prose prose-sm max-w-none" />
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
        <OnChangePlugin onChange={onChange} />
        <InitialValuePlugin value={value} />
      </div>
    </LexicalComposer>
  );
}
