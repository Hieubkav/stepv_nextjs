import { ConvexHttpClient } from "convex/browser";
import { api } from "@dohy/backend/convex/_generated/api";
import type { Doc } from "@dohy/backend/convex/_generated/dataModel";

const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;

export async function GET(
  request: Request,
  { params }: { params: any }
) {
  const id = params.id;

  try {
    if (!convexUrl) {
      return new Response("Convex URL not configured", { status: 500 });
    }

    const client = new ConvexHttpClient(convexUrl);

    // Get all media and find by ID
    const media = (await client.query(api.media.list, {
      kind: "image",
    })) as (Doc<"media"> & { url?: string | null })[];
    const mediaRecord = media.find((m) => m._id === id);

    if (!mediaRecord) {
      return new Response("Image not found", { status: 404 });
    }

    // If URL is already available (from the list query), use it directly
    if (mediaRecord.url) {
      return Response.redirect(mediaRecord.url, 307);
    }

    // Otherwise, get the URL using the storageId
    if (!mediaRecord.storageId) {
      return new Response("Image storage not found", { status: 404 });
    }

    const result = await client.action(api.media.getImageUrl, {
      storageId: mediaRecord.storageId as any,
    });

    if (!result?.url) {
      return new Response("Could not generate image URL", { status: 404 });
    }

    return Response.redirect(result.url, 307);
  } catch (error) {
    console.error("Error fetching image URL:", error);
    return new Response("Error fetching image", { status: 500 });
  }
}
