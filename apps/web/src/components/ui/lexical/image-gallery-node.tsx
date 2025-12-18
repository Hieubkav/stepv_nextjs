"use client";

import { $applyNodeReplacement, DecoratorNode } from "lexical";
import type {
  DOMConversionMap,
  DOMExportOutput,
  EditorConfig,
  LexicalNode,
  NodeKey,
  SerializedLexicalNode,
  Spread,
} from "lexical";
import type { JSX } from "react";
import * as React from "react";

const ImageGalleryComponent = React.lazy(() => import("./image-gallery-component"));

export type GalleryAlignment = "left" | "center" | "right";

export interface GalleryImage {
  src: string;
  altText: string;
  width?: number;
  height?: number;
}

export interface ImageGalleryPayload {
  columns: number;
  images: GalleryImage[];
  alignment?: GalleryAlignment;
  caption?: string;
  key?: NodeKey;
}

export type SerializedImageGalleryNode = Spread<
  {
    columns: number;
    images: GalleryImage[];
    alignment: GalleryAlignment;
    caption: string;
    type: "image-gallery";
    version: 1;
  },
  SerializedLexicalNode
>;

export class ImageGalleryNode extends DecoratorNode<JSX.Element> {
  __columns: number;
  __images: GalleryImage[];
  __alignment: GalleryAlignment;
  __caption: string;

  static getType(): string {
    return "image-gallery";
  }

  static clone(node: ImageGalleryNode): ImageGalleryNode {
    return new ImageGalleryNode(node.__columns, [...node.__images], node.__alignment, node.__caption, node.__key);
  }

  constructor(columns: number, images: GalleryImage[], alignment?: GalleryAlignment, caption?: string, key?: NodeKey) {
    super(key);
    this.__columns = columns;
    this.__images = images;
    this.__alignment = alignment || "left";
    this.__caption = caption || "";
  }

  static importJSON(serializedNode: SerializedImageGalleryNode): ImageGalleryNode {
    const { columns, images, alignment, caption } = serializedNode;
    return $createImageGalleryNode({ columns, images, alignment: alignment || "left", caption: caption || "" });
  }

  exportJSON(): SerializedImageGalleryNode {
    return {
      type: "image-gallery",
      version: 1,
      columns: this.__columns,
      images: this.__images,
      alignment: this.__alignment,
      caption: this.__caption,
    };
  }

  static importDOM(): DOMConversionMap | null {
    return {
      div: (domNode: HTMLElement) => {
        if (!domNode.hasAttribute("data-lexical-image-gallery")) {
          return null;
        }
        return {
          conversion: (element: HTMLElement) => {
            const dataStr = element.getAttribute("data-lexical-image-gallery");
            if (!dataStr) return null;
            try {
              const data = JSON.parse(dataStr);
              const node = $createImageGalleryNode({
                columns: data.columns || 3,
                images: data.images || [],
                alignment: data.alignment || "left",
                caption: data.caption || "",
              });
              return { node };
            } catch {
              return null;
            }
          },
          priority: 2,
        };
      },
    };
  }

  exportDOM(): DOMExportOutput {
    const container = document.createElement("div");
    container.className = `image-gallery grid gap-2`;
    container.style.gridTemplateColumns = `repeat(${this.__columns}, 1fr)`;
    container.style.display = "grid";
    container.style.gap = "0.5rem";
    
    // Apply alignment
    if (this.__alignment === "center") {
      container.style.marginLeft = "auto";
      container.style.marginRight = "auto";
    } else if (this.__alignment === "right") {
      container.style.marginLeft = "auto";
    }
    
    // Store data for reimport (including alignment and caption)
    container.setAttribute(
      "data-lexical-image-gallery",
      JSON.stringify({ columns: this.__columns, images: this.__images, alignment: this.__alignment, caption: this.__caption })
    );

    for (const image of this.__images) {
      const img = document.createElement("img");
      img.setAttribute("src", image.src);
      img.setAttribute("alt", image.altText);
      img.className = "w-full h-auto rounded-lg object-cover";
      container.appendChild(img);
    }

    // Add caption if exists
    if (this.__caption) {
      const captionEl = document.createElement("p");
      captionEl.className = "text-sm text-muted-foreground text-center mt-2 italic";
      captionEl.style.gridColumn = `1 / -1`;
      captionEl.textContent = this.__caption;
      container.appendChild(captionEl);
    }

    return { element: container };
  }

  createDOM(config: EditorConfig): HTMLElement {
    const div = document.createElement("div");
    const theme = config.theme;
    const className = theme.imageGallery;
    if (className !== undefined) {
      div.className = className;
    }
    return div;
  }

  updateDOM(): boolean {
    return false;
  }

  getColumns(): number {
    return this.__columns;
  }

  getImages(): GalleryImage[] {
    return this.__images;
  }

  setColumns(columns: number): void {
    const writable = this.getWritable();
    writable.__columns = columns;
  }

  addImage(image: GalleryImage): void {
    const writable = this.getWritable();
    writable.__images = [...writable.__images, image];
  }

  removeImage(index: number): void {
    const writable = this.getWritable();
    writable.__images = writable.__images.filter((_, i) => i !== index);
  }

  updateImage(index: number, image: GalleryImage): void {
    const writable = this.getWritable();
    writable.__images = writable.__images.map((img, i) => (i === index ? image : img));
  }

  getAlignment(): GalleryAlignment {
    return this.__alignment;
  }

  setAlignment(alignment: GalleryAlignment): void {
    const writable = this.getWritable();
    writable.__alignment = alignment;
  }

  getCaption(): string {
    return this.__caption;
  }

  setCaption(caption: string): void {
    const writable = this.getWritable();
    writable.__caption = caption;
  }

  decorate(): JSX.Element {
    return (
      <React.Suspense fallback={<div className="h-32 bg-muted animate-pulse rounded-lg" />}>
        <ImageGalleryComponent
          columns={this.__columns}
          images={this.__images}
          nodeKey={this.getKey()}
          alignment={this.__alignment}
          caption={this.__caption}
        />
      </React.Suspense>
    );
  }

  isInline(): boolean {
    return false;
  }
}

export function $createImageGalleryNode({
  columns = 3,
  images = [],
  alignment = "left",
  caption = "",
  key,
}: ImageGalleryPayload): ImageGalleryNode {
  return $applyNodeReplacement(new ImageGalleryNode(columns, images, alignment, caption, key));
}

export function $isImageGalleryNode(node: LexicalNode | null | undefined): node is ImageGalleryNode {
  return node instanceof ImageGalleryNode;
}
