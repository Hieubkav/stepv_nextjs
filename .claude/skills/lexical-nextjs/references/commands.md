# Commands Reference

Complete guide to Lexical's command system for editor interactions.

## Command System Overview

Lexical uses a command-based architecture for all editor interactions:
- **Commands**: Typed events that can be dispatched
- **Listeners**: Handlers that respond to commands
- **Priority**: Controls order of listener execution

## Built-in Commands

### Text Formatting

```tsx
import {
  FORMAT_TEXT_COMMAND,
  FORMAT_ELEMENT_COMMAND,
} from "lexical";

// Text formatting
editor.dispatchCommand(FORMAT_TEXT_COMMAND, "bold");
editor.dispatchCommand(FORMAT_TEXT_COMMAND, "italic");
editor.dispatchCommand(FORMAT_TEXT_COMMAND, "underline");
editor.dispatchCommand(FORMAT_TEXT_COMMAND, "strikethrough");
editor.dispatchCommand(FORMAT_TEXT_COMMAND, "code");
editor.dispatchCommand(FORMAT_TEXT_COMMAND, "subscript");
editor.dispatchCommand(FORMAT_TEXT_COMMAND, "superscript");

// Element alignment
editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, "left");
editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, "center");
editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, "right");
editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, "justify");
```

### History Commands

```tsx
import { UNDO_COMMAND, REDO_COMMAND, CLEAR_HISTORY_COMMAND } from "lexical";

editor.dispatchCommand(UNDO_COMMAND, undefined);
editor.dispatchCommand(REDO_COMMAND, undefined);
editor.dispatchCommand(CLEAR_HISTORY_COMMAND, undefined);
```

### List Commands

```tsx
import {
  INSERT_UNORDERED_LIST_COMMAND,
  INSERT_ORDERED_LIST_COMMAND,
  INSERT_CHECK_LIST_COMMAND,
  REMOVE_LIST_COMMAND,
} from "@lexical/list";

editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined);
editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, undefined);
editor.dispatchCommand(INSERT_CHECK_LIST_COMMAND, undefined);
editor.dispatchCommand(REMOVE_LIST_COMMAND, undefined);
```

### Selection Commands

```tsx
import {
  SELECTION_CHANGE_COMMAND,
  CLICK_COMMAND,
  DELETE_CHARACTER_COMMAND,
  DELETE_WORD_COMMAND,
  DELETE_LINE_COMMAND,
} from "lexical";
```

### Keyboard Commands

```tsx
import {
  KEY_ARROW_LEFT_COMMAND,
  KEY_ARROW_RIGHT_COMMAND,
  KEY_ARROW_UP_COMMAND,
  KEY_ARROW_DOWN_COMMAND,
  KEY_ENTER_COMMAND,
  KEY_ESCAPE_COMMAND,
  KEY_BACKSPACE_COMMAND,
  KEY_DELETE_COMMAND,
  KEY_TAB_COMMAND,
} from "lexical";
```

### Clipboard Commands

```tsx
import {
  COPY_COMMAND,
  CUT_COMMAND,
  PASTE_COMMAND,
} from "lexical";
```

### Focus Commands

```tsx
import {
  FOCUS_COMMAND,
  BLUR_COMMAND,
} from "lexical";
```

## Creating Custom Commands

### Define Command

```tsx
import { createCommand, LexicalCommand } from "lexical";

// Command without payload
export const CLEAR_EDITOR_COMMAND: LexicalCommand<void> = createCommand();

// Command with payload
export const INSERT_IMAGE_COMMAND: LexicalCommand<{
  src: string;
  alt: string;
}> = createCommand();

// Command with optional payload
export const TOGGLE_LINK_COMMAND: LexicalCommand<string | null> = createCommand();
```

### Register Command Handler

```tsx
import { COMMAND_PRIORITY_LOW, COMMAND_PRIORITY_EDITOR } from "lexical";

// Priority levels (higher = executed first)
// COMMAND_PRIORITY_CRITICAL = 4
// COMMAND_PRIORITY_HIGH = 3
// COMMAND_PRIORITY_NORMAL = 2
// COMMAND_PRIORITY_LOW = 1
// COMMAND_PRIORITY_EDITOR = 0

// In a plugin
function MyPlugin() {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    const unregister = editor.registerCommand(
      INSERT_IMAGE_COMMAND,
      (payload) => {
        const { src, alt } = payload;

        editor.update(() => {
          const imageNode = $createImageNode(src, alt);
          const selection = $getSelection();

          if ($isRangeSelection(selection)) {
            selection.insertNodes([imageNode]);
          }
        });

        return true; // Command handled, stop propagation
      },
      COMMAND_PRIORITY_EDITOR
    );

    return unregister;
  }, [editor]);

  return null;
}
```

### Dispatch Command

```tsx
// Dispatch from UI
function Toolbar() {
  const [editor] = useLexicalComposerContext();

  const insertImage = () => {
    editor.dispatchCommand(INSERT_IMAGE_COMMAND, {
      src: "https://example.com/image.jpg",
      alt: "Example",
    });
  };

  return <button onClick={insertImage}>Insert Image</button>;
}
```

## Command Patterns

### Toggle Pattern

```tsx
const TOGGLE_BOLD_COMMAND: LexicalCommand<void> = createCommand();

editor.registerCommand(
  TOGGLE_BOLD_COMMAND,
  () => {
    editor.update(() => {
      const selection = $getSelection();
      if ($isRangeSelection(selection)) {
        // Toggle bold format
        selection.formatText("bold");
      }
    });
    return true;
  },
  COMMAND_PRIORITY_LOW
);
```

### Insert Pattern

```tsx
const INSERT_HORIZONTAL_RULE_COMMAND: LexicalCommand<void> = createCommand();

editor.registerCommand(
  INSERT_HORIZONTAL_RULE_COMMAND,
  () => {
    editor.update(() => {
      const selection = $getSelection();
      if ($isRangeSelection(selection)) {
        const hrNode = $createHorizontalRuleNode();
        selection.insertNodes([hrNode]);
      }
    });
    return true;
  },
  COMMAND_PRIORITY_EDITOR
);
```

### Transform Pattern

```tsx
const CONVERT_TO_HEADING_COMMAND: LexicalCommand<"h1" | "h2" | "h3"> = createCommand();

editor.registerCommand(
  CONVERT_TO_HEADING_COMMAND,
  (headingTag) => {
    editor.update(() => {
      const selection = $getSelection();
      if ($isRangeSelection(selection)) {
        $setBlocksType(selection, () => $createHeadingNode(headingTag));
      }
    });
    return true;
  },
  COMMAND_PRIORITY_LOW
);
```

### Keyboard Shortcut Pattern

```tsx
editor.registerCommand(
  KEY_ENTER_COMMAND,
  (event: KeyboardEvent | null) => {
    if (event?.ctrlKey) {
      // Ctrl+Enter: Submit content
      handleSubmit();
      event.preventDefault();
      return true;
    }
    return false; // Let other handlers process normal Enter
  },
  COMMAND_PRIORITY_HIGH
);
```

## Multiple Command Handlers

```tsx
// Multiple handlers can respond to same command
// Executed in priority order until one returns true

editor.registerCommand(
  KEY_ENTER_COMMAND,
  (event) => {
    // High priority: handle special cases
    if (isInsideTable()) {
      handleTableNavigation();
      return true;
    }
    return false;
  },
  COMMAND_PRIORITY_HIGH
);

editor.registerCommand(
  KEY_ENTER_COMMAND,
  (event) => {
    // Low priority: default behavior
    handleDefaultEnter();
    return true;
  },
  COMMAND_PRIORITY_LOW
);
```

## Command Composition

```tsx
// Compose multiple commands
const APPLY_HEADING_STYLE_COMMAND: LexicalCommand<"h1" | "h2"> = createCommand();

editor.registerCommand(
  APPLY_HEADING_STYLE_COMMAND,
  (headingType) => {
    // First, convert to heading
    editor.dispatchCommand(CONVERT_TO_HEADING_COMMAND, headingType);

    // Then, apply bold
    editor.dispatchCommand(FORMAT_TEXT_COMMAND, "bold");

    return true;
  },
  COMMAND_PRIORITY_LOW
);
```

## Best Practices

1. **Use appropriate priority**: Critical for intercepting, low for extending
2. **Return true to stop propagation**: Only when command is fully handled
3. **Return false to allow propagation**: Let other handlers process
4. **Clean up listeners**: Always return unregister function in useEffect
5. **Type your commands**: Use `LexicalCommand<T>` for type safety
6. **Avoid side effects**: Keep command handlers focused on editor state
