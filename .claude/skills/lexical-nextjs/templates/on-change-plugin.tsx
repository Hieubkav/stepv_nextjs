"use client";

import { useEffect } from "react";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { $generateHtmlFromNodes } from "@lexical/html";

type OnChangePluginProps = {
  onChange: (html: string) => void;
  /** Debounce delay in milliseconds. Default: 0 (no debounce) */
  debounceMs?: number;
};

/**
 * OnChangePlugin - Syncs Lexical editor state to parent component
 *
 * Usage:
 * ```tsx
 * <LexicalComposer initialConfig={config}>
 *   <RichTextPlugin ... />
 *   <OnChangePlugin onChange={(html) => setContent(html)} />
 * </LexicalComposer>
 * ```
 */
export function OnChangePlugin({
  onChange,
  debounceMs = 0,
}: OnChangePluginProps) {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    let timeoutId: NodeJS.Timeout | null = null;

    const unregister = editor.registerUpdateListener(({ editorState }) => {
      // Clear any pending timeout
      if (timeoutId) {
        clearTimeout(timeoutId);
      }

      const emitChange = () => {
        editorState.read(() => {
          const html = $generateHtmlFromNodes(editor, null);
          onChange(html || "<p></p>");
        });
      };

      if (debounceMs > 0) {
        timeoutId = setTimeout(emitChange, debounceMs);
      } else {
        emitChange();
      }
    });

    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      unregister();
    };
  }, [editor, onChange, debounceMs]);

  return null;
}

/**
 * OnChangeJsonPlugin - Syncs Lexical editor state as JSON
 *
 * Usage:
 * ```tsx
 * <LexicalComposer initialConfig={config}>
 *   <RichTextPlugin ... />
 *   <OnChangeJsonPlugin onChange={(json) => saveToDb(json)} />
 * </LexicalComposer>
 * ```
 */
type OnChangeJsonPluginProps = {
  onChange: (json: string) => void;
  debounceMs?: number;
};

export function OnChangeJsonPlugin({
  onChange,
  debounceMs = 0,
}: OnChangeJsonPluginProps) {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    let timeoutId: NodeJS.Timeout | null = null;

    const unregister = editor.registerUpdateListener(({ editorState }) => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }

      const emitChange = () => {
        const json = JSON.stringify(editorState.toJSON());
        onChange(json);
      };

      if (debounceMs > 0) {
        timeoutId = setTimeout(emitChange, debounceMs);
      } else {
        emitChange();
      }
    });

    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      unregister();
    };
  }, [editor, onChange, debounceMs]);

  return null;
}

/**
 * OnBlurPlugin - Emits content only when editor loses focus
 *
 * More efficient for saving - only saves when user is done editing
 */
type OnBlurPluginProps = {
  onBlur: (html: string) => void;
};

export function OnBlurPlugin({ onBlur }: OnBlurPluginProps) {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    return editor.registerCommand(
      BLUR_COMMAND,
      () => {
        editor.getEditorState().read(() => {
          const html = $generateHtmlFromNodes(editor, null);
          onBlur(html || "<p></p>");
        });
        return false; // Don't stop propagation
      },
      COMMAND_PRIORITY_LOW
    );
  }, [editor, onBlur]);

  return null;
}

import { BLUR_COMMAND, COMMAND_PRIORITY_LOW } from "lexical";
