---
name: lexical-nextjs
description: Build rich text editors with Lexical in Next.js/React. Use when implementing WYSIWYG editors, creating custom nodes, handling editor state, serializing HTML, or when user mentions lexical, rich text editor, contenteditable, editor plugins in React/Next.js projects.
version: 1.0.0
---

# Lexical Editor for Next.js

Comprehensive guide for building rich text editors with Lexical in Next.js/React applications.

## Overview

Lexical is an extensible JavaScript text-editor framework by Meta with:
- **Dependency-free core**: Lightweight and performant
- **Immutable state model**: Predictable updates with efficient DOM reconciliation
- **Plugin-based architecture**: Compose functionality incrementally
- **React-first bindings**: Native React integration via `@lexical/react`

## Quick Start

### Installation

```bash
npm install lexical @lexical/react @lexical/rich-text @lexical/list @lexical/link @lexical/code @lexical/html @lexical/selection
# or
bun add lexical @lexical/react @lexical/rich-text @lexical/list @lexical/link @lexical/code @lexical/html @lexical/selection
```

### Basic Editor Setup

```tsx
"use client";

import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary";

const theme = {
  paragraph: "mb-2",
  heading: {
    h1: "text-3xl font-bold mb-3",
    h2: "text-2xl font-bold mb-3",
  },
  list: {
    ul: "list-disc list-inside mb-2",
    ol: "list-decimal list-inside mb-2",
  },
};

function onError(error: Error) {
  console.error(error);
}

export function Editor() {
  const initialConfig = {
    namespace: "MyEditor",
    theme,
    onError,
    nodes: [], // Register custom nodes here
  };

  return (
    <LexicalComposer initialConfig={initialConfig}>
      <RichTextPlugin
        contentEditable={<ContentEditable className="min-h-[200px] p-3 outline-none" />}
        placeholder={<div className="text-gray-400">Start typing...</div>}
        ErrorBoundary={LexicalErrorBoundary}
      />
      <HistoryPlugin />
    </LexicalComposer>
  );
}
```

## Core Concepts

### 1. LexicalComposer

The root component that provides editor context:

```tsx
<LexicalComposer initialConfig={{
  namespace: "EditorName",
  theme: editorTheme,
  onError: handleError,
  nodes: [HeadingNode, QuoteNode, ListNode, ListItemNode, LinkNode],
}}>
  {/* Plugins and ContentEditable */}
</LexicalComposer>
```

### 2. Editor State

Lexical separates source of truth from DOM via `EditorState`:

```tsx
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";

function MyPlugin() {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    return editor.registerUpdateListener(({ editorState }) => {
      editorState.read(() => {
        // Read state here
      });
    });
  }, [editor]);

  return null;
}
```

### 3. Commands

Communication system for editor interactions:

```tsx
import { FORMAT_TEXT_COMMAND, UNDO_COMMAND, REDO_COMMAND } from "lexical";
import { INSERT_UNORDERED_LIST_COMMAND } from "@lexical/list";

// Dispatch commands
editor.dispatchCommand(FORMAT_TEXT_COMMAND, "bold");
editor.dispatchCommand(UNDO_COMMAND, undefined);
editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined);

// Register custom command
import { createCommand } from "lexical";

export const INSERT_IMAGE_COMMAND = createCommand<string>();

editor.registerCommand(
  INSERT_IMAGE_COMMAND,
  (payload) => {
    // Handle command
    return true; // Stop propagation
  },
  COMMAND_PRIORITY_LOW
);
```

### 4. Nodes

Built-in nodes and custom node creation:

```tsx
import { HeadingNode, QuoteNode } from "@lexical/rich-text";
import { ListNode, ListItemNode } from "@lexical/list";
import { LinkNode } from "@lexical/link";
import { CodeNode } from "@lexical/code";

// Register in initialConfig
nodes: [HeadingNode, QuoteNode, ListNode, ListItemNode, LinkNode, CodeNode]
```

### 5. Selection

Handle text selection and cursor:

```tsx
import { $getSelection, $isRangeSelection } from "lexical";
import { $setBlocksType } from "@lexical/selection";
import { $createHeadingNode } from "@lexical/rich-text";

editor.update(() => {
  const selection = $getSelection();
  if ($isRangeSelection(selection)) {
    // Check text format
    const isBold = selection.hasFormat("bold");

    // Transform block type
    $setBlocksType(selection, () => $createHeadingNode("h1"));
  }
});
```

## Essential Plugins

### OnChangePlugin - State Sync

```tsx
import { $generateHtmlFromNodes } from "@lexical/html";

function OnChangePlugin({ onChange }: { onChange: (html: string) => void }) {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    return editor.registerUpdateListener(({ editorState }) => {
      editorState.read(() => {
        const html = $generateHtmlFromNodes(editor, null);
        onChange(html);
      });
    });
  }, [editor, onChange]);

  return null;
}
```

### InitialValuePlugin - Load HTML

```tsx
import { $generateNodesFromDOM } from "@lexical/html";
import { $getRoot, $insertNodes } from "lexical";

function InitialValuePlugin({ value }: { value: string }) {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    if (!value) return;

    editor.update(() => {
      const parser = new DOMParser();
      const dom = parser.parseFromString(value, "text/html");
      const nodes = $generateNodesFromDOM(editor, dom);
      const root = $getRoot();
      root.clear();
      root.append(...nodes.filter(n => n.getType() !== "text"));
    });
  }, []); // Only run once on mount

  return null;
}
```

### ToolbarPlugin - Format Controls

```tsx
function ToolbarPlugin() {
  const [editor] = useLexicalComposerContext();
  const [isBold, setIsBold] = useState(false);

  useEffect(() => {
    return editor.registerUpdateListener(({ editorState }) => {
      editorState.read(() => {
        const selection = $getSelection();
        if ($isRangeSelection(selection)) {
          setIsBold(selection.hasFormat("bold"));
        }
      });
    });
  }, [editor]);

  return (
    <button
      onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, "bold")}
      className={isBold ? "active" : ""}
    >
      Bold
    </button>
  );
}
```

## HTML Serialization

### Export to HTML

```tsx
import { $generateHtmlFromNodes } from "@lexical/html";

function getEditorHtml(editor: LexicalEditor): string {
  let html = "";
  editor.getEditorState().read(() => {
    html = $generateHtmlFromNodes(editor, null);
  });
  return html;
}
```

### Import from HTML

```tsx
import { $generateNodesFromDOM } from "@lexical/html";

function setEditorHtml(editor: LexicalEditor, html: string) {
  editor.update(() => {
    const parser = new DOMParser();
    const dom = parser.parseFromString(html, "text/html");
    const nodes = $generateNodesFromDOM(editor, dom);
    const root = $getRoot();
    root.clear();
    root.append(...nodes);
  });
}
```

## Common Patterns

### Block Type Formatting

```tsx
import { $createHeadingNode, $createQuoteNode } from "@lexical/rich-text";
import { $createParagraphNode } from "lexical";

const formatHeading = (tag: "h1" | "h2" | "h3") => {
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
```

### Text Format Commands

```tsx
// Bold, Italic, Underline, Strikethrough
editor.dispatchCommand(FORMAT_TEXT_COMMAND, "bold");
editor.dispatchCommand(FORMAT_TEXT_COMMAND, "italic");
editor.dispatchCommand(FORMAT_TEXT_COMMAND, "underline");
editor.dispatchCommand(FORMAT_TEXT_COMMAND, "strikethrough");
```

### List Commands

```tsx
import { INSERT_UNORDERED_LIST_COMMAND, INSERT_ORDERED_LIST_COMMAND } from "@lexical/list";
import { ListPlugin } from "@lexical/react/LexicalListPlugin";

// Add ListPlugin to editor
<ListPlugin />

// Dispatch list commands
editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined);
editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, undefined);
```

## Best Practices

1. **Use "use client"**: Lexical requires client-side rendering in Next.js
2. **Register all node types**: Include all used nodes in `initialConfig.nodes`
3. **Handle errors**: Always provide `onError` callback
4. **Clean up listeners**: Use return value from `registerUpdateListener`
5. **Read state safely**: Always read inside `editorState.read()` or `editor.update()`
6. **Filter text nodes**: When importing HTML, filter out standalone text nodes

## Common Issues

### Hydration Mismatch
```tsx
// Use dynamic import with ssr: false
import dynamic from "next/dynamic";

const Editor = dynamic(() => import("./Editor"), { ssr: false });
```

### TextNode Import Error
```tsx
// Filter text nodes when importing HTML
const validNodes = nodes.filter(node => node.getType() !== "text");
root.append(...validNodes);
```

## Detailed Documentation

- [React Integration Patterns](./references/react-integration.md)
- [Custom Nodes Guide](./references/custom-nodes.md)
- [Commands Reference](./references/commands.md)
- [HTML Serialization](./references/html-serialization.md)
- [Toolbar Implementation](./references/toolbar.md)

## Templates

- [Basic Editor](./templates/basic-editor.tsx)
- [Rich Editor with Toolbar](./templates/rich-editor.tsx)
- [OnChange Plugin](./templates/on-change-plugin.tsx)
