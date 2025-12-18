# HTML Serialization

Complete guide to converting between HTML and Lexical editor state.

## Overview

Lexical provides utilities for:
- **Exporting**: Convert Lexical nodes → HTML string
- **Importing**: Parse HTML string → Lexical nodes

## Exporting to HTML

### Basic Export

```tsx
import { $generateHtmlFromNodes } from "@lexical/html";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";

function ExportPlugin() {
  const [editor] = useLexicalComposerContext();

  const getHtml = () => {
    let html = "";
    editor.getEditorState().read(() => {
      html = $generateHtmlFromNodes(editor, null);
    });
    return html;
  };

  return <button onClick={() => console.log(getHtml())}>Export</button>;
}
```

### Export with Selection

```tsx
// Export only selected content
editor.getEditorState().read(() => {
  const selection = $getSelection();
  if ($isRangeSelection(selection)) {
    // Export selected nodes only
    const html = $generateHtmlFromNodes(editor, selection);
  }
});
```

### OnChange Plugin Pattern

```tsx
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

// Usage
<OnChangePlugin onChange={(html) => setContent(html)} />
```

## Importing from HTML

### Basic Import

```tsx
import { $generateNodesFromDOM } from "@lexical/html";
import { $getRoot, $insertNodes } from "lexical";

function setEditorContent(editor: LexicalEditor, html: string) {
  editor.update(() => {
    // Parse HTML
    const parser = new DOMParser();
    const dom = parser.parseFromString(html, "text/html");

    // Convert to Lexical nodes
    const nodes = $generateNodesFromDOM(editor, dom);

    // Clear and insert
    const root = $getRoot();
    root.clear();
    root.append(...nodes);
  });
}
```

### InitialValue Plugin Pattern

```tsx
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

      // Filter out standalone text nodes (common issue)
      const validNodes = nodes.filter((node) => {
        const type = node.getType?.() || node.__type;
        return type !== "text";
      });

      if (validNodes.length > 0) {
        root.append(...validNodes);
      }
    });
  }, []); // Only run once on mount

  return null;
}
```

### Handling Edge Cases

```tsx
function safeImportHtml(editor: LexicalEditor, html: string) {
  editor.update(() => {
    const parser = new DOMParser();
    const dom = parser.parseFromString(html, "text/html");
    const nodes = $generateNodesFromDOM(editor, dom);

    const root = $getRoot();
    root.clear();

    // Filter valid nodes
    const validNodes = nodes.filter((node) => {
      // Skip standalone text nodes
      if (node.getType() === "text") return false;
      // Skip line breaks at root level
      if (node.getType() === "linebreak") return false;
      return true;
    });

    if (validNodes.length > 0) {
      root.append(...validNodes);
    } else if (html.trim()) {
      // Fallback: wrap text in paragraph
      const paragraph = $createParagraphNode();
      paragraph.append($createTextNode(html));
      root.append(paragraph);
    }
  });
}
```

## Custom Node Serialization

### Export DOM (Node → HTML)

```tsx
import { DOMExportOutput, LexicalNode } from "lexical";

export class CalloutNode extends ElementNode {
  exportDOM(): DOMExportOutput {
    const element = document.createElement("div");
    element.className = "callout";
    element.setAttribute("data-type", "callout");
    return { element };
  }
}
```

### Import DOM (HTML → Node)

```tsx
import { DOMConversionMap, DOMConversionOutput } from "lexical";

export class CalloutNode extends ElementNode {
  static importDOM(): DOMConversionMap | null {
    return {
      div: (node: HTMLElement) => {
        // Match by class or data attribute
        if (node.classList.contains("callout") ||
            node.getAttribute("data-type") === "callout") {
          return {
            conversion: convertCalloutElement,
            priority: 1,
          };
        }
        return null;
      },
    };
  }
}

function convertCalloutElement(): DOMConversionOutput {
  const node = $createCalloutNode();
  return { node };
}
```

### Complex Node with Children

```tsx
export class CardNode extends ElementNode {
  __title: string;

  exportDOM(): DOMExportOutput {
    const element = document.createElement("div");
    element.className = "card";

    const title = document.createElement("h3");
    title.textContent = this.__title;
    element.appendChild(title);

    const content = document.createElement("div");
    content.className = "card-content";
    // Children will be appended here by Lexical
    element.appendChild(content);

    return { element };
  }

  static importDOM(): DOMConversionMap | null {
    return {
      div: (node: HTMLElement) => {
        if (node.classList.contains("card")) {
          return {
            conversion: (element: HTMLElement): DOMConversionOutput => {
              const title = element.querySelector("h3")?.textContent || "";
              return { node: $createCardNode(title) };
            },
            priority: 2,
          };
        }
        return null;
      },
    };
  }
}
```

## JSON Serialization

### Export to JSON

```tsx
// Get serialized state
const editorState = editor.getEditorState();
const json = editorState.toJSON();
const jsonString = JSON.stringify(json);

// Save to database
await saveContent(jsonString);
```

### Import from JSON

```tsx
// Load from database
const jsonString = await loadContent();
const json = JSON.parse(jsonString);

// Create editor state
const editorState = editor.parseEditorState(json);
editor.setEditorState(editorState);
```

### Custom Node JSON

```tsx
import { SerializedElementNode, Spread } from "lexical";

type SerializedCalloutNode = Spread<
  {
    variant: "info" | "warning" | "error";
    type: "callout";
    version: 1;
  },
  SerializedElementNode
>;

export class CalloutNode extends ElementNode {
  __variant: "info" | "warning" | "error";

  static importJSON(serializedNode: SerializedCalloutNode): CalloutNode {
    const node = $createCalloutNode(serializedNode.variant);
    return node;
  }

  exportJSON(): SerializedCalloutNode {
    return {
      ...super.exportJSON(),
      variant: this.__variant,
      type: "callout",
      version: 1,
    };
  }
}
```

## Server-Side Rendering

### Using JSDOM

```tsx
// server-only.ts
import { JSDOM } from "jsdom";
import { createHeadlessEditor } from "@lexical/headless";
import { $generateNodesFromDOM, $generateHtmlFromNodes } from "@lexical/html";

export async function renderHtmlFromJson(json: string): Promise<string> {
  const editor = createHeadlessEditor({
    nodes: [HeadingNode, QuoteNode, ListNode, ListItemNode],
  });

  const state = editor.parseEditorState(JSON.parse(json));

  let html = "";
  state.read(() => {
    html = $generateHtmlFromNodes(editor, null);
  });

  return html;
}

export async function parseHtmlToJson(html: string): Promise<string> {
  const dom = new JSDOM(html);
  const editor = createHeadlessEditor({
    nodes: [HeadingNode, QuoteNode, ListNode, ListItemNode],
  });

  editor.update(() => {
    const nodes = $generateNodesFromDOM(editor, dom.window.document);
    const root = $getRoot();
    root.clear();
    root.append(...nodes);
  });

  return JSON.stringify(editor.getEditorState().toJSON());
}
```

## Common Issues

### TextNode at Root Level

```tsx
// Problem: Standalone text nodes cause errors
// Solution: Filter them out
const validNodes = nodes.filter((node) => node.getType() !== "text");
```

### Empty Content

```tsx
// Check for empty before processing
if (!html || html === "<p></p>" || html === "<p><br></p>") {
  return; // Skip empty content
}
```

### Whitespace Nodes

```tsx
// Filter whitespace-only text nodes
const validNodes = nodes.filter((node) => {
  if (node.getType() === "text") {
    const text = node.getTextContent();
    return text.trim().length > 0;
  }
  return true;
});
```

## Best Practices

1. **Always filter imported nodes**: Text nodes at root level cause errors
2. **Handle empty content**: Check for empty/whitespace before processing
3. **Use version field**: For future migration of serialized data
4. **Test both directions**: Ensure export → import round-trips correctly
5. **Sanitize HTML**: Clean untrusted HTML before importing
6. **Debounce exports**: Don't export on every keystroke
