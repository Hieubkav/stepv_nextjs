"use client";

import { $applyNodeReplacement, DecoratorNode } from "lexical";
import type {
  DOMConversionMap,
  DOMConversionOutput,
  DOMExportOutput,
  EditorConfig,
  LexicalNode,
  NodeKey,
  SerializedLexicalNode,
  Spread,
} from "lexical";
import type { JSX } from "react";
import * as React from "react";

const ImageComponent = React.lazy(() => import("./image-component"));

export type ImageAlignment = "left" | "center" | "right";

export interface ImagePayload {
  src: string;
  altText: string;
  width?: number;
  height?: number;
  maxWidth?: number;
  alignment?: ImageAlignment;
  key?: NodeKey;
}

export type SerializedImageNode = Spread<
  {
    src: string;
    altText: string;
    width: number;
    height: number;
    maxWidth: number;
    alignment: ImageAlignment;
    type: "image";
    version: 1;
  },
  SerializedLexicalNode
>;

function convertImageElement(domNode: HTMLElement): DOMConversionOutput | null {
  const img = domNode as HTMLImageElement;
  const src = img.getAttribute("src");
  const altText = img.getAttribute("alt") || "";

  if (!src) return null;

  const width = img.width || undefined;
  const height = img.height || undefined;

  const node = $createImageNode({ src, altText, width, height });
  return { node };
}

function convertImageWrapperElement(domNode: HTMLElement): DOMConversionOutput | null {
  const img = domNode.querySelector("img");
  if (!img) return null;
  
  const src = img.getAttribute("src");
  const altText = img.getAttribute("alt") || "";
  if (!src) return null;

  const width = img.width || undefined;
  const height = img.height || undefined;
  const alignment = (domNode.getAttribute("data-image-alignment") as ImageAlignment) || "left";

  const node = $createImageNode({ src, altText, width, height, alignment });
  return { node };
}

export class ImageNode extends DecoratorNode<JSX.Element> {
  __src: string;
  __altText: string;
  __width: "inherit" | number;
  __height: "inherit" | number;
  __maxWidth: number;
  __alignment: ImageAlignment;

  static getType(): string {
    return "image";
  }

  static clone(node: ImageNode): ImageNode {
    return new ImageNode(
      node.__src,
      node.__altText,
      node.__maxWidth,
      node.__width,
      node.__height,
      node.__alignment,
      node.__key
    );
  }

  constructor(
    src: string,
    altText: string,
    maxWidth: number,
    width?: "inherit" | number,
    height?: "inherit" | number,
    alignment?: ImageAlignment,
    key?: NodeKey
  ) {
    super(key);
    this.__src = src;
    this.__altText = altText;
    this.__maxWidth = maxWidth;
    this.__width = width || "inherit";
    this.__height = height || "inherit";
    this.__alignment = alignment || "left";
  }

  static importJSON(serializedNode: SerializedImageNode): ImageNode {
    const { src, altText, width, height, maxWidth, alignment } = serializedNode;
    return $createImageNode({
      src,
      altText,
      width: width === 0 ? undefined : width,
      height: height === 0 ? undefined : height,
      maxWidth,
      alignment: alignment || "left",
    });
  }

  exportJSON(): SerializedImageNode {
    return {
      type: "image",
      version: 1,
      src: this.__src,
      altText: this.__altText,
      width: this.__width === "inherit" ? 0 : this.__width,
      height: this.__height === "inherit" ? 0 : this.__height,
      maxWidth: this.__maxWidth,
      alignment: this.__alignment,
    };
  }

  static importDOM(): DOMConversionMap | null {
    return {
      img: () => ({
        conversion: convertImageElement,
        priority: 0,
      }),
      div: (domNode: HTMLElement) => {
        if (!domNode.hasAttribute("data-image-alignment")) {
          return null;
        }
        return {
          conversion: convertImageWrapperElement,
          priority: 1,
        };
      },
    };
  }

  exportDOM(): DOMExportOutput {
    const wrapper = document.createElement("div");
    const img = document.createElement("img");
    img.setAttribute("src", this.__src);
    img.setAttribute("alt", this.__altText);
    if (this.__width !== "inherit") {
      img.setAttribute("width", String(this.__width));
    }
    if (this.__height !== "inherit") {
      img.setAttribute("height", String(this.__height));
    }
    img.className = "max-w-full h-auto rounded-lg";
    img.style.maxWidth = `${this.__maxWidth}px`;
    
    // Apply alignment to wrapper
    wrapper.style.display = "block";
    wrapper.style.width = "fit-content";
    wrapper.setAttribute("data-image-alignment", this.__alignment);
    if (this.__alignment === "center") {
      wrapper.style.marginLeft = "auto";
      wrapper.style.marginRight = "auto";
    } else if (this.__alignment === "right") {
      wrapper.style.marginLeft = "auto";
    }
    
    wrapper.appendChild(img);
    return { element: wrapper };
  }

  createDOM(config: EditorConfig): HTMLElement {
    const span = document.createElement("span");
    const theme = config.theme;
    const className = theme.image;
    if (className !== undefined) {
      span.className = className;
    }
    return span;
  }

  updateDOM(): boolean {
    return false;
  }

  getSrc(): string {
    return this.__src;
  }

  getAltText(): string {
    return this.__altText;
  }

  setWidthAndHeight(width: "inherit" | number, height: "inherit" | number): void {
    const writable = this.getWritable();
    writable.__width = width;
    writable.__height = height;
  }

  getAlignment(): ImageAlignment {
    return this.__alignment;
  }

  setAlignment(alignment: ImageAlignment): void {
    const writable = this.getWritable();
    writable.__alignment = alignment;
  }

  decorate(): JSX.Element {
    return (
      <React.Suspense fallback={<div className="h-32 bg-muted animate-pulse rounded-lg" />}>
        <ImageComponent
          src={this.__src}
          altText={this.__altText}
          width={this.__width}
          height={this.__height}
          maxWidth={this.__maxWidth}
          nodeKey={this.getKey()}
          resizable={true}
          alignment={this.__alignment}
        />
      </React.Suspense>
    );
  }

  isInline(): boolean {
    return false;
  }
}

export function $createImageNode({
  src,
  altText,
  width,
  height,
  maxWidth = 800,
  alignment = "left",
  key,
}: ImagePayload): ImageNode {
  return $applyNodeReplacement(
    new ImageNode(src, altText, maxWidth, width, height, alignment, key)
  );
}

export function $isImageNode(node: LexicalNode | null | undefined): node is ImageNode {
  return node instanceof ImageNode;
}
