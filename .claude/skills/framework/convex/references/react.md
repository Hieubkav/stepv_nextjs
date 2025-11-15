# React Integration Patterns

React hooks usage, client libraries, và frontend integration.

## Setup in main.tsx/index.tsx
```typescript
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { ConvexProvider, ConvexReactClient } from "convex/react";

const convex = new ConvexReactClient(import.meta.env.VITE_CONVEX_URL);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ConvexProvider client={convex}>
      <App />
    </ConvexProvider>
  </React.StrictMode>
);
```

## useQuery Hook (Reading Data)
```typescript
import { useQuery } from "convex/react";
import { api } from "../convex/_generated/api";

export function MessageList({ channelId }: { channelId: string }) {
  // useQuery returns data or undefined while loading
  const messages = useQuery(api.messages.getMessages, { channelId });

  if (messages === undefined) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      {messages.map((msg) => (
        <div key={msg._id}>{msg.content}</div>
      ))}
    </div>
  );
}
```

## useMutation Hook (Writing Data)
```typescript
import { useMutation } from "convex/react";
import { api } from "../convex/_generated/api";

export function SendMessage({ channelId }: { channelId: string }) {
  const sendMessage = useMutation(api.messages.sendMessage);

  const handleClick = async () => {
    try {
      await sendMessage({
        channelId,
        content: "Hello, World!",
      });
    } catch (error) {
      console.error("Failed to send message:", error);
    }
  };

  return <button onClick={handleClick}>Send</button>;
}
```

## useAction Hook (Side Effects)
```typescript
import { useAction } from "convex/react";
import { api } from "../convex/_generated/api";

export function GenerateImage({ prompt }: { prompt: string }) {
  const generateImage = useAction(api.ai.generateImage);
  const [imageUrl, setImageUrl] = React.useState<string | null>(null);

  const handleGenerate = async () => {
    const url = await generateImage({ prompt });
    setImageUrl(url);
  };

  return (
    <>
      <button onClick={handleGenerate}>Generate</button>
      {imageUrl && <img src={imageUrl} alt="Generated" />}
    </>
  );
}
```

## usePaginatedQuery Hook
```typescript
import { usePaginatedQuery } from "convex/react";
import { Pagination } from "convex/react";
import { api } from "../convex/_generated/api";

export function PaginatedMessages() {
  const { results, status, loadMore } = usePaginatedQuery(
    api.messages.listPaginatedMessages,
    {},
    { initialNumItems: 20 }
  );

  return (
    <div>
      {results?.map((msg) => (
        <div key={msg._id}>{msg.content}</div>
      ))}
      {status === "CanLoadMore" && (
        <button onClick={() => loadMore(10)}>Load More</button>
      )}
    </div>
  );
}
```

## Optimistic Updates Pattern
```typescript
import { useMutation } from "convex/react";
import { useState } from "react";
import { api } from "../convex/_generated/api";

export function UpdateUserName({ userId, initialName }: any) {
  const [name, setName] = useState(initialName);
  const [isPending, setIsPending] = useState(false);
  const updateName = useMutation(api.users.updateName);

  const handleUpdate = async (newName: string) => {
    // Optimistic update
    setName(newName);
    setIsPending(true);

    try {
      await updateName({ userId, name: newName });
    } catch (error) {
      // Revert on error
      setName(initialName);
      console.error("Update failed:", error);
    } finally {
      setIsPending(false);
    }
  };

  return (
    <input
      value={name}
      onChange={(e) => handleUpdate(e.target.value)}
      disabled={isPending}
    />
  );
}
```

## Error Handling
```typescript
import { useMutation } from "convex/react";
import { api } from "../convex/_generated/api";

export function CreateChannel({ name }: { name: string }) {
  const createChannel = useMutation(api.channels.create);
  const [error, setError] = useState<string | null>(null);

  const handleCreate = async () => {
    setError(null);
    try {
      await createChannel({ name });
    } catch (err: any) {
      if (err.message.includes("already exists")) {
        setError("Channel name is already taken");
      } else {
        setError("Failed to create channel");
      }
    }
  };

  return (
    <>
      <button onClick={handleCreate}>Create</button>
      {error && <div className="error">{error}</div>}
    </>
  );
}
```

## Type-Safe Queries
```typescript
import { useQuery } from "convex/react";
import { Doc } from "../convex/_generated/dataModel";
import { api } from "../convex/_generated/api";

interface MessageProps {
  message: Doc<"messages">;  // Type-safe!
}

export function MessageCard({ message }: MessageProps) {
  return (
    <div>
      <p>{message.content}</p>
      <time>{new Date(message.createdAt).toLocaleString()}</time>
    </div>
  );
}
```

## Custom Hooks
```typescript
import { useQuery } from "convex/react";
import { api } from "../convex/_generated/api";

// Custom hook for message list
export function useChannelMessages(channelId: string) {
  const messages = useQuery(api.messages.getMessages, { channelId });
  const isLoading = messages === undefined;

  return { messages: messages ?? [], isLoading };
}

// Usage
export function Chat({ channelId }: { channelId: string }) {
  const { messages, isLoading } = useChannelMessages(channelId);

  if (isLoading) return <div>Loading...</div>;

  return (
    <div>
      {messages.map((msg) => (
        <div key={msg._id}>{msg.content}</div>
      ))}
    </div>
  );
}
```

## Conditional Queries
```typescript
import { useQuery } from "convex/react";
import { api } from "../convex/_generated/api";

export function UserMessages({ userId }: { userId?: string }) {
  // Pass `null` to skip query
  const messages = useQuery(
    api.messages.getByUser,
    userId ? { userId } : "skip"
  );

  return (
    <div>
      {messages?.map((msg) => (
        <div key={msg._id}>{msg.content}</div>
      ))}
    </div>
  );
}
```
