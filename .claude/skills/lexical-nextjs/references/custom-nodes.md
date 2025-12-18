# Custom Nodes Guide

Learn how to create custom nodes in Lexical for specialized content types.

## Node Types Overview

Lexical has several base node classes:

| Node Type | Use Case | Renders |
|-----------|----------|---------|
| `ElementNode` | Container nodes (paragraphs, headings) | HTML elements |
| `TextNode` | Text content with formatting | Text spans |
| `DecoratorNode` | React components | Custom React components |
| `LineBreakNode` | Line breaks | `<br>` |

## Built-in Nodes

```tsx
// Rich text nodes
import { HeadingNode, QuoteNode } from "@lexical/rich-text";
import { ParagraphNode, TextNode, LineBreakNode } from "lexical";

// List nodes
import { ListNode, ListItemNode } from "@lexical/list";

// Other nodes
import { LinkNode, AutoLinkNode } from "@lexical/link";
import { CodeNode, CodeHighlightNode } from "@lexical/code";
import { TableNode, TableRowNode, TableCellNode } from "@lexical/table";
```

## Creating Custom Nodes

### Basic Element Node

```tsx
import {
  ElementNode,
  SerializedElementNode,
  Spread,
  DOMConversionMap,
  DOMExportOutput,
  LexicalNode,
} from "lexical";

type SerializedCalloutNode = Spread<
  { type: string; version: 1 },
  SerializedElementNode
>;

export class CalloutNode extends ElementNode {
  static getType(): string {
    return "callout";
  }

  static clone(node: CalloutNode): CalloutNode {
    return new CalloutNode(node.__key);
  }

  createDOM(): HTMLElement {
    const div = document.createElement("div");
    div.className = "callout bg-blue-50 border-l-4 border-blue-500 p-4 my-2";
    return div;
  }

  updateDOM(): boolean {
    return false; // Return true if DOM needs update
  }

  // HTML Import
  static importDOM(): DOMConversionMap | null {
    return {
      div: (node: HTMLElement) => {
        if (node.classList.contains("callout")) {
          return {
            conversion: () => ({ node: $createCalloutNode() }),
            priority: 1,
          };
        }
        return null;
      },
    };
  }

  // HTML Export
  exportDOM(): DOMExportOutput {
    const element = document.createElement("div");
    element.className = "callout";
    return { element };
  }

  // JSON Serialization
  static importJSON(serializedNode: SerializedCalloutNode): CalloutNode {
    return $createCalloutNode();
  }

  exportJSON(): SerializedCalloutNode {
    return {
      ...super.exportJSON(),
      type: "callout",
      version: 1,
    };
  }
}

export function $createCalloutNode(): CalloutNode {
  return new CalloutNode();
}

export function $isCalloutNode(
  node: LexicalNode | null | undefined
): node is CalloutNode {
  return node instanceof CalloutNode;
}
```

### Text Node with Custom Styling

```tsx
import { TextNode, SerializedTextNode, Spread, NodeKey } from "lexical";

type SerializedColoredTextNode = Spread<
  { color: string; type: "colored-text"; version: 1 },
  SerializedTextNode
>;

export class ColoredTextNode extends TextNode {
  __color: string;

  constructor(text: string, color: string, key?: NodeKey) {
    super(text, key);
    this.__color = color;
  }

  static getType(): string {
    return "colored-text";
  }

  static clone(node: ColoredTextNode): ColoredTextNode {
    return new ColoredTextNode(node.__text, node.__color, node.__key);
  }

  createDOM(config: EditorConfig): HTMLElement {
    const element = super.createDOM(config);
    element.style.color = this.__color;
    return element;
  }

  updateDOM(
    prevNode: ColoredTextNode,
    dom: HTMLElement,
    config: EditorConfig
  ): boolean {
    const isUpdated = super.updateDOM(prevNode, dom, config);
    if (prevNode.__color !== this.__color) {
      dom.style.color = this.__color;
    }
    return isUpdated;
  }

  getColor(): string {
    return this.getLatest().__color;
  }

  setColor(color: string): this {
    const self = this.getWritable();
    self.__color = color;
    return self;
  }

  static importJSON(serializedNode: SerializedColoredTextNode): ColoredTextNode {
    return $createColoredTextNode(serializedNode.text, serializedNode.color);
  }

  exportJSON(): SerializedColoredTextNode {
    return {
      ...super.exportJSON(),
      color: this.__color,
      type: "colored-text",
      version: 1,
    };
  }
}

export function $createColoredTextNode(
  text: string,
  color: string
): ColoredTextNode {
  return new ColoredTextNode(text, color);
}
```

### Decorator Node (React Component)

```tsx
import {
  DecoratorNode,
  SerializedLexicalNode,
  Spread,
  NodeKey,
  LexicalNode,
} from "lexical";
import { ReactNode } from "react";

type SerializedImageNode = Spread<
  {
    src: string;
    alt: string;
    width?: number;
    height?: number;
    type: "image";
    version: 1;
  },
  SerializedLexicalNode
>;

export class ImageNode extends DecoratorNode<ReactNode> {
  __src: string;
  __alt: string;
  __width?: number;
  __height?: number;

  constructor(
    src: string,
    alt: string,
    width?: number,
    height?: number,
    key?: NodeKey
  ) {
    super(key);
    this.__src = src;
    this.__alt = alt;
    this.__width = width;
    this.__height = height;
  }

  static getType(): string {
    return "image";
  }

  static clone(node: ImageNode): ImageNode {
    return new ImageNode(
      node.__src,
      node.__alt,
      node.__width,
      node.__height,
      node.__key
    );
  }

  createDOM(): HTMLElement {
    const span = document.createElement("span");
    return span;
  }

  updateDOM(): boolean {
    return false;
  }

  // Render React component
  decorate(): ReactNode {
    return (
      <img
        src={this.__src}
        alt={this.__alt}
        width={this.__width}
        height={this.__height}
        className="max-w-full h-auto rounded"
      />
    );
  }

  static importJSON(serializedNode: SerializedImageNode): ImageNode {
    return $createImageNode(
      serializedNode.src,
      serializedNode.alt,
      serializedNode.width,
      serializedNode.height
    );
  }

  exportJSON(): SerializedImageNode {
    return {
      src: this.__src,
      alt: this.__alt,
      width: this.__width,
      height: this.__height,
      type: "image",
      version: 1,
    };
  }
}

export function $createImageNode(
  src: string,
  alt: string,
  width?: number,
  height?: number
): ImageNode {
  return new ImageNode(src, alt, width, height);
}

export function $isImageNode(
  node: LexicalNode | null | undefined
): node is ImageNode {
  return node instanceof ImageNode;
}
```

## Registering Custom Nodes

```tsx
const initialConfig = {
  namespace: "MyEditor",
  theme,
  onError,
  nodes: [
    HeadingNode,
    QuoteNode,
    ListNode,
    ListItemNode,
    // Custom nodes
    CalloutNode,
    ColoredTextNode,
    ImageNode,
  ],
};
```

## Node Transforms

React to node changes automatically:

```tsx
useEffect(() => {
  return editor.registerNodeTransform(TextNode, (textNode) => {
    const text = textNode.getTextContent();

    // Auto-link URLs
    if (text.match(/https?:\/\/[^\s]+/)) {
      // Transform to link
    }

    // Auto-replace patterns
    if (text === "---") {
      textNode.replace($createHorizontalRuleNode());
    }
  });
}, [editor]);
```

## Node Commands

Create commands for inserting nodes:

```tsx
import { createCommand, LexicalCommand } from "lexical";

export const INSERT_IMAGE_COMMAND: LexicalCommand<{
  src: string;
  alt: string;
}> = createCommand();

// Register command handler
editor.registerCommand(
  INSERT_IMAGE_COMMAND,
  (payload) => {
    const { src, alt } = payload;
    const imageNode = $createImageNode(src, alt);
    $insertNodes([imageNode]);
    return true;
  },
  COMMAND_PRIORITY_EDITOR
);

// Dispatch command
editor.dispatchCommand(INSERT_IMAGE_COMMAND, {
  src: "https://example.com/image.jpg",
  alt: "Example image",
});
```

## Node Replacement

Replace built-in nodes with custom versions:

```tsx
const initialConfig = {
  // ...
  nodes: [
    {
      replace: ParagraphNode,
      with: (node: ParagraphNode) => new CustomParagraphNode(),
    },
  ],
};
```

## Best Practices

1. **Always implement serialization**: `importJSON` and `exportJSON` for persistence
2. **Handle DOM conversion**: `importDOM` and `exportDOM` for HTML compatibility
3. **Use getWritable()**: For mutations inside node methods
4. **Use getLatest()**: For reading current values
5. **Avoid key reuse**: Use `$copyNode()` for duplication
6. **Register all nodes**: In `initialConfig.nodes` array
