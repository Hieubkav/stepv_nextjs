# React Integration Patterns

Comprehensive guide for integrating Lexical with React/Next.js applications.

## Core Components

### LexicalComposer

The root provider component that initializes the editor:

```tsx
import { LexicalComposer } from "@lexical/react/LexicalComposer";

const initialConfig = {
  namespace: "MyEditor",
  theme: {
    paragraph: "mb-2",
    heading: {
      h1: "text-3xl font-bold",
      h2: "text-2xl font-bold",
    },
    text: {
      bold: "font-bold",
      italic: "italic",
      underline: "underline",
    },
  },
  onError: (error: Error) => console.error(error),
  nodes: [HeadingNode, QuoteNode, ListNode, ListItemNode],
};

<LexicalComposer initialConfig={initialConfig}>
  {/* Editor plugins */}
</LexicalComposer>
```

### ContentEditable

The editable area where users type:

```tsx
import { ContentEditable } from "@lexical/react/LexicalContentEditable";

<ContentEditable
  className="min-h-[200px] px-3 py-2 outline-none"
  aria-placeholder="Start typing..."
/>
```

### RichTextPlugin vs PlainTextPlugin

```tsx
// Rich text with formatting
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";

<RichTextPlugin
  contentEditable={<ContentEditable />}
  placeholder={<div>Enter text...</div>}
  ErrorBoundary={LexicalErrorBoundary}
/>

// Plain text only
import { PlainTextPlugin } from "@lexical/react/LexicalPlainTextPlugin";

<PlainTextPlugin
  contentEditable={<ContentEditable />}
  placeholder={<div>Enter text...</div>}
  ErrorBoundary={LexicalErrorBoundary}
/>
```

## Hooks

### useLexicalComposerContext

Access the editor instance from any plugin:

```tsx
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";

function MyPlugin() {
  const [editor] = useLexicalComposerContext();

  const handleClick = () => {
    editor.update(() => {
      // Modify editor state
    });
  };

  return <button onClick={handleClick}>Do Something</button>;
}
```

### useEffect with Editor Listeners

Register and clean up listeners properly:

```tsx
function StateWatcher() {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    // registerUpdateListener returns cleanup function
    return editor.registerUpdateListener(({ editorState }) => {
      editorState.read(() => {
        // React to state changes
      });
    });
  }, [editor]);

  return null;
}
```

## Built-in Plugins

### HistoryPlugin

Enables undo/redo:

```tsx
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";

<HistoryPlugin />

// Dispatch undo/redo commands
import { UNDO_COMMAND, REDO_COMMAND } from "lexical";

editor.dispatchCommand(UNDO_COMMAND, undefined);
editor.dispatchCommand(REDO_COMMAND, undefined);
```

### AutoFocusPlugin

Auto-focus on mount:

```tsx
import { AutoFocusPlugin } from "@lexical/react/LexicalAutoFocusPlugin";

<AutoFocusPlugin />
```

### ListPlugin

Enable list functionality:

```tsx
import { ListPlugin } from "@lexical/react/LexicalListPlugin";
import { ListNode, ListItemNode } from "@lexical/list";

// Add nodes to config
nodes: [ListNode, ListItemNode]

// Add plugin
<ListPlugin />
```

### LinkPlugin

Enable links:

```tsx
import { LinkPlugin } from "@lexical/react/LexicalLinkPlugin";
import { LinkNode } from "@lexical/link";

// Add node to config
nodes: [LinkNode]

// Add plugin
<LinkPlugin />
```

### MarkdownShortcutPlugin

Enable markdown-style shortcuts:

```tsx
import { MarkdownShortcutPlugin } from "@lexical/react/LexicalMarkdownShortcutPlugin";
import { TRANSFORMERS } from "@lexical/markdown";

<MarkdownShortcutPlugin transformers={TRANSFORMERS} />
```

## Custom Plugin Pattern

### Basic Plugin Structure

```tsx
function MyCustomPlugin({ onSave }: { onSave: (content: string) => void }) {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    // Setup - register listeners, commands, etc.
    const unregister = editor.registerCommand(
      KEY_ENTER_COMMAND,
      (event) => {
        if (event?.ctrlKey) {
          const html = $generateHtmlFromNodes(editor, null);
          onSave(html);
          return true;
        }
        return false;
      },
      COMMAND_PRIORITY_HIGH
    );

    // Cleanup
    return () => {
      unregister();
    };
  }, [editor, onSave]);

  return null; // Plugins typically render nothing
}
```

### Plugin with UI

```tsx
function FloatingToolbar() {
  const [editor] = useLexicalComposerContext();
  const [isVisible, setIsVisible] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });

  useEffect(() => {
    return editor.registerUpdateListener(({ editorState }) => {
      editorState.read(() => {
        const selection = $getSelection();
        if ($isRangeSelection(selection) && !selection.isCollapsed()) {
          // Show toolbar at selection position
          const domSelection = window.getSelection();
          if (domSelection && domSelection.rangeCount > 0) {
            const range = domSelection.getRangeAt(0);
            const rect = range.getBoundingClientRect();
            setPosition({ top: rect.top - 40, left: rect.left });
            setIsVisible(true);
          }
        } else {
          setIsVisible(false);
        }
      });
    });
  }, [editor]);

  if (!isVisible) return null;

  return (
    <div
      className="fixed z-50 bg-white shadow-lg rounded p-2"
      style={{ top: position.top, left: position.left }}
    >
      <button onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, "bold")}>
        Bold
      </button>
    </div>
  );
}
```

## Next.js Specific

### Client Component Requirement

```tsx
// components/Editor.tsx
"use client";

import { LexicalComposer } from "@lexical/react/LexicalComposer";
// ... rest of editor
```

### Dynamic Import for SSR

```tsx
// page.tsx
import dynamic from "next/dynamic";

const Editor = dynamic(() => import("@/components/Editor"), {
  ssr: false,
  loading: () => <div>Loading editor...</div>,
});

export default function Page() {
  return <Editor />;
}
```

### Hydration Safety

```tsx
"use client";

import { useState, useEffect } from "react";

export function EditorWrapper() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="min-h-[200px] border rounded animate-pulse" />;
  }

  return <Editor />;
}
```

## Complete Example

```tsx
"use client";

import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { AutoFocusPlugin } from "@lexical/react/LexicalAutoFocusPlugin";
import { ListPlugin } from "@lexical/react/LexicalListPlugin";
import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary";
import { HeadingNode, QuoteNode } from "@lexical/rich-text";
import { ListNode, ListItemNode } from "@lexical/list";
import { LinkNode } from "@lexical/link";
import { CodeNode } from "@lexical/code";

const theme = {
  paragraph: "mb-2",
  heading: {
    h1: "text-3xl font-bold mb-3",
    h2: "text-2xl font-bold mb-2",
  },
  list: {
    ul: "list-disc list-inside mb-2",
    ol: "list-decimal list-inside mb-2",
  },
  quote: "border-l-4 border-gray-300 pl-4 italic",
  code: "bg-gray-100 rounded px-1 font-mono text-sm",
};

type EditorProps = {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
};

export function RichEditor({ value, onChange, placeholder }: EditorProps) {
  const initialConfig = {
    namespace: "RichEditor",
    theme,
    onError: (error: Error) => console.error(error),
    nodes: [HeadingNode, QuoteNode, ListNode, ListItemNode, LinkNode, CodeNode],
  };

  return (
    <LexicalComposer initialConfig={initialConfig}>
      <div className="border rounded-md">
        <Toolbar />
        <RichTextPlugin
          contentEditable={
            <ContentEditable className="min-h-[200px] px-3 py-2 outline-none" />
          }
          placeholder={
            <div className="absolute top-2 left-3 text-gray-400 pointer-events-none">
              {placeholder || "Start typing..."}
            </div>
          }
          ErrorBoundary={LexicalErrorBoundary}
        />
        <HistoryPlugin />
        <AutoFocusPlugin />
        <ListPlugin />
        <OnChangePlugin onChange={onChange} />
        <InitialValuePlugin value={value} />
      </div>
    </LexicalComposer>
  );
}
```
