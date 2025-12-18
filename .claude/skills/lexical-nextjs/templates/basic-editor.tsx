"use client";

import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { AutoFocusPlugin } from "@lexical/react/LexicalAutoFocusPlugin";
import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary";

const theme = {
  paragraph: "mb-2",
  text: {
    bold: "font-bold",
    italic: "italic",
    underline: "underline",
    strikethrough: "line-through",
    code: "bg-gray-100 dark:bg-gray-800 rounded px-1 font-mono text-sm",
  },
};

function onError(error: Error) {
  console.error("Lexical error:", error);
}

type BasicEditorProps = {
  placeholder?: string;
  className?: string;
};

export function BasicEditor({
  placeholder = "Start typing...",
  className = "",
}: BasicEditorProps) {
  const initialConfig = {
    namespace: "BasicEditor",
    theme,
    onError,
    nodes: [],
  };

  return (
    <LexicalComposer initialConfig={initialConfig}>
      <div className={`relative border rounded-md bg-background ${className}`}>
        <RichTextPlugin
          contentEditable={
            <ContentEditable
              className="min-h-[150px] px-3 py-2 outline-none prose prose-sm max-w-none"
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
        <HistoryPlugin />
        <AutoFocusPlugin />
      </div>
    </LexicalComposer>
  );
}
