import { NextRequest, NextResponse } from "next/server";
import sharp from "sharp";
import { ConvexHttpClient } from "convex/browser";
import { api } from "@dohy/backend/convex/_generated/api";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
    if (!convexUrl) {
      return NextResponse.json({ error: "Missing NEXT_PUBLIC_CONVEX_URL" }, { status: 500 });
    }

    const formData = await req.formData();
    const file = formData.get("file");
    const title = formData.get("title")?.toString();

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "Missing file" }, { status: 400 });
    }

    // Convert to webp using sharp (keep size, strip metadata)
    const inputArrayBuffer = await file.arrayBuffer();
    const inputBuffer = Buffer.from(inputArrayBuffer);
    const image = sharp(inputBuffer, { failOn: "none" });
    const metadata = await image.metadata();
    const webp = await image.webp({ quality: 82 }).toBuffer();
    const webpMeta = await sharp(webp).metadata();
    const webpUint8 = Uint8Array.from(webp);

    const client = new ConvexHttpClient(convexUrl);
    // 1) Get upload URL
    const { uploadUrl } = await client.action(api.media.generateUploadUrl, {});
    // 2) Upload the processed webp buffer
    const uploadRes = await fetch(uploadUrl, {
      method: "POST",
      headers: {
        "Content-Type": "image/webp",
      },
      body: webpUint8,
    });
    if (!uploadRes.ok) {
      const t = await uploadRes.text();
      return NextResponse.json({ error: `Upload failed: ${t}` }, { status: 500 });
    }
    const { storageId } = (await uploadRes.json()) as { storageId: string };
    // 3) Save image record
    let id: string | undefined;
    try {
      id = (await client.mutation(api.media.saveImage as any, {
        title,
        storageId: storageId as any,
        width: webpMeta.width ?? metadata.width ?? undefined,
        height: webpMeta.height ?? metadata.height ?? undefined,
        format: "webp",
        sizeBytes: webp.length,
      })) as any;
    } catch (e: any) {
      // Fallback for older backend without `sizeBytes` arg
      id = (await client.mutation(api.media.saveImage as any, {
        title,
        storageId: storageId as any,
        width: webpMeta.width ?? metadata.width ?? undefined,
        height: webpMeta.height ?? metadata.height ?? undefined,
        format: "webp",
      })) as any;
    }

    return NextResponse.json({ id, storageId });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message ?? "Unknown error" }, { status: 500 });
  }
}
