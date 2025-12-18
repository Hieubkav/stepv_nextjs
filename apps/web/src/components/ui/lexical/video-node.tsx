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

const VideoComponent = React.lazy(() => import("./video-component"));

export type VideoType = "youtube" | "drive";

export interface VideoPayload {
  videoType: VideoType;
  videoUrl: string;
  videoId: string;
  key?: NodeKey;
}

export type SerializedVideoNode = Spread<
  {
    videoType: VideoType;
    videoUrl: string;
    videoId: string;
    type: "video";
    version: 1;
  },
  SerializedLexicalNode
>;

// Helper functions
export function extractYoutubeVideoId(url: string): string | null {
  try {
    const parsed = new URL(url);
    const host = parsed.hostname.replace(/^www\./, "");
    let videoId = "";
    if (host.includes("youtube.com")) {
      if (parsed.pathname.startsWith("/shorts/")) {
        videoId = parsed.pathname.split("/shorts/")[1]?.split(/[/?#&]/)[0] ?? "";
      } else if (parsed.pathname.startsWith("/embed/")) {
        videoId = parsed.pathname.split("/embed/")[1]?.split(/[/?#&]/)[0] ?? "";
      } else if (parsed.searchParams.get("v")) {
        videoId = parsed.searchParams.get("v") ?? "";
      }
    } else if (host.includes("youtu.be")) {
      videoId = parsed.pathname.replace("/", "").split(/[/?#&]/)[0] ?? "";
    }
    return videoId || null;
  } catch {
    return null;
  }
}

export function extractDriveFileId(url: string): string | null {
  const match = url.match(/\/d\/([a-zA-Z0-9-_]+)/);
  return match ? match[1] : null;
}

export function detectVideoType(url: string): { type: VideoType; id: string } | null {
  // Check YouTube
  const youtubeId = extractYoutubeVideoId(url);
  if (youtubeId) {
    return { type: "youtube", id: youtubeId };
  }
  
  // Check Google Drive
  const driveId = extractDriveFileId(url);
  if (driveId) {
    return { type: "drive", id: driveId };
  }
  
  return null;
}

export class VideoNode extends DecoratorNode<JSX.Element> {
  __videoType: VideoType;
  __videoUrl: string;
  __videoId: string;

  static getType(): string {
    return "video";
  }

  static clone(node: VideoNode): VideoNode {
    return new VideoNode(node.__videoType, node.__videoUrl, node.__videoId, node.__key);
  }

  constructor(videoType: VideoType, videoUrl: string, videoId: string, key?: NodeKey) {
    super(key);
    this.__videoType = videoType;
    this.__videoUrl = videoUrl;
    this.__videoId = videoId;
  }

  static importJSON(serializedNode: SerializedVideoNode): VideoNode {
    const { videoType, videoUrl, videoId } = serializedNode;
    return $createVideoNode({ videoType, videoUrl, videoId });
  }

  exportJSON(): SerializedVideoNode {
    return {
      type: "video",
      version: 1,
      videoType: this.__videoType,
      videoUrl: this.__videoUrl,
      videoId: this.__videoId,
    };
  }

  static importDOM(): DOMConversionMap | null {
    return {
      div: (domNode: HTMLElement) => {
        if (!domNode.hasAttribute("data-lexical-video")) {
          return null;
        }
        return {
          conversion: (element: HTMLElement) => {
            const dataStr = element.getAttribute("data-lexical-video");
            if (!dataStr) return null;
            try {
              const data = JSON.parse(dataStr);
              const node = $createVideoNode({
                videoType: data.videoType,
                videoUrl: data.videoUrl,
                videoId: data.videoId,
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
    container.className = "video-embed my-4";
    container.setAttribute(
      "data-lexical-video",
      JSON.stringify({
        videoType: this.__videoType,
        videoUrl: this.__videoUrl,
        videoId: this.__videoId,
      })
    );

    const wrapper = document.createElement("div");
    wrapper.className = "relative aspect-video rounded-lg overflow-hidden";

    const iframe = document.createElement("iframe");
    iframe.className = "w-full h-full";
    iframe.setAttribute("allowfullscreen", "true");
    iframe.setAttribute("frameborder", "0");
    
    if (this.__videoType === "youtube") {
      iframe.src = `https://www.youtube-nocookie.com/embed/${this.__videoId}`;
      iframe.setAttribute("allow", "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture");
    } else {
      // Google Drive
      iframe.src = `https://drive.google.com/file/d/${this.__videoId}/preview`;
      iframe.setAttribute("allow", "autoplay");
    }

    wrapper.appendChild(iframe);
    container.appendChild(wrapper);

    return { element: container };
  }

  createDOM(config: EditorConfig): HTMLElement {
    const div = document.createElement("div");
    const theme = config.theme;
    const className = theme.video;
    if (className !== undefined) {
      div.className = className;
    }
    return div;
  }

  updateDOM(): boolean {
    return false;
  }

  getVideoType(): VideoType {
    return this.__videoType;
  }

  getVideoUrl(): string {
    return this.__videoUrl;
  }

  getVideoId(): string {
    return this.__videoId;
  }

  decorate(): JSX.Element {
    return (
      <React.Suspense fallback={<div className="aspect-video bg-muted animate-pulse rounded-lg" />}>
        <VideoComponent
          videoType={this.__videoType}
          videoUrl={this.__videoUrl}
          videoId={this.__videoId}
          nodeKey={this.getKey()}
        />
      </React.Suspense>
    );
  }

  isInline(): boolean {
    return false;
  }
}

export function $createVideoNode({ videoType, videoUrl, videoId, key }: VideoPayload): VideoNode {
  return $applyNodeReplacement(new VideoNode(videoType, videoUrl, videoId, key));
}

export function $isVideoNode(node: LexicalNode | null | undefined): node is VideoNode {
  return node instanceof VideoNode;
}
