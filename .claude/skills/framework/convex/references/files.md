# File Storage Upload & Download Workflows

Handle file uploads, storage, serving files từ Convex.

## Setup File Storage in Schema
```typescript
// convex/schema.ts
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  documents: defineTable({
    userId: v.id("users"),
    fileName: v.string(),
    fileSize: v.number(),
    storageId: v.id("_storage"),
    uploadedAt: v.number(),
  }).index("by_userId", ["userId"]),
});
```

## Upload File via HTTP Action (Multipart Form)
```typescript
// convex/http.ts
import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { internal } from "./_generated/api";

const http = httpRouter();

http.route({
  path: "/upload",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    // Get FormData from request
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const userId = formData.get("userId") as string;

    if (!file) {
      return new Response("No file provided", { status: 400 });
    }

    // Store file
    const blob = await file.arrayBuffer();
    const storageId = await ctx.storage.store(new Blob([blob]));

    // Save metadata to database
    const docId = await ctx.runMutation(internal.documents.saveUpload, {
      userId: userId as any,
      fileName: file.name,
      fileSize: file.size,
      storageId,
    });

    return new Response(JSON.stringify({ docId, storageId }), {
      headers: { "Content-Type": "application/json" },
    });
  }),
});

export default http;
```

## Generate Download URL
```typescript
// convex/documents.ts
import { query } from "./_generated/server";
import { v } from "convex/values";

export const getDownloadUrl = query({
  args: { documentId: v.id("documents") },
  handler: async (ctx, { documentId }) => {
    const doc = await ctx.db.get(documentId);
    if (!doc) {
      throw new Error("Document not found");
    }

    // Generate download URL
    const url = await ctx.storage.getUrl(doc.storageId);
    return { url, fileName: doc.fileName };
  },
});
```

## Upload from Frontend
```typescript
// src/components/FileUpload.tsx
import { useCallback, useState } from "react";

export function FileUpload() {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleUpload = useCallback(
    async (file: File) => {
      setIsUploading(true);
      setError(null);

      const formData = new FormData();
      formData.append("file", file);
      formData.append("userId", "user_123");

      try {
        const response = await fetch(
          `${import.meta.env.VITE_CONVEX_URL}/upload`,
          {
            method: "POST",
            body: formData,
          }
        );

        if (!response.ok) {
          throw new Error(`Upload failed: ${response.statusText}`);
        }

        const { docId } = await response.json();
        console.log("File uploaded:", docId);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Upload failed");
      } finally {
        setIsUploading(false);
      }
    },
    []
  );

  return (
    <>
      <input
        type="file"
        onChange={(e) => e.target.files?.[0] && handleUpload(e.target.files[0])}
        disabled={isUploading}
      />
      {error && <div className="error">{error}</div>}
      {isUploading && <div>Uploading...</div>}
    </>
  );
}
```

## Serve File from HTTP Action
```typescript
// convex/http.ts
http.route({
  path: "/download/:storageId",
  method: "GET",
  handler: httpAction(async (ctx, request) => {
    // Extract storageId from URL
    const url = new URL(request.url);
    const storageId = url.pathname.split("/").pop() as string;

    // Get file blob
    const blob = await ctx.storage.get(storageId as any);
    if (!blob) {
      return new Response("File not found", { status: 404 });
    }

    return new Response(blob, {
      headers: {
        "Content-Type": "application/octet-stream",
        "Content-Disposition": 'attachment; filename="file"',
      },
    });
  }),
});
```

## Delete File
```typescript
// convex/documents.ts
import { mutation } from "./_generated/server";

export const deleteDocument = mutation({
  args: { documentId: v.id("documents") },
  handler: async (ctx, { documentId }) => {
    const doc = await ctx.db.get(documentId);
    if (!doc) {
      throw new Error("Document not found");
    }

    // Delete from storage
    await ctx.storage.delete(doc.storageId);

    // Delete from database
    await ctx.db.delete(documentId);

    return { deleted: true };
  },
});
```

## File Storage Limits
- **Max file size**: 512 MB per file
- **Max concurrent uploads**: Depends on your plan
- **Storage quotas**: Depends on your subscription
- **Retention**: Files kept as long as referenced in database

## Best Practices
- Validate file type before upload
- Implement progress tracking for large files
- Store metadata (name, size, type) in database
- Use appropriate content-type headers
- Implement access control checks
- Clean up orphaned files periodically
