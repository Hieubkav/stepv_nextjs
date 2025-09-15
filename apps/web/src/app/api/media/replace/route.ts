import { NextRequest, NextResponse } from "next/server";
import sharp from "sharp";
import { ConvexHttpClient } from "convex/browser";
import { api } from "@dohy/backend/convex/_generated/api";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
    if (!convexUrl) return NextResponse.json({ error: "Missing NEXT_PUBLIC_CONVEX_URL" }, { status: 500 });

    const form = await req.formData();
    const file = form.get("file");
    const id = form.get("id");
    if (!(file instanceof File) || typeof id !== "string") {
      return NextResponse.json({ error: "Missing file or id" }, { status: 400 });
    }

    const buf = Buffer.from(await file.arrayBuffer());
    const img = sharp(buf, { failOn: "none" });
    const webp = await img.webp({ quality: 82 }).toBuffer();
    const webpMeta = await sharp(webp).metadata();
    const webpUint8 = Uint8Array.from(webp);

    const client = new ConvexHttpClient(convexUrl);
    const { uploadUrl } = await client.action(api.media.generateUploadUrl, {});
    const uploadRes = await fetch(uploadUrl, {
      method: "POST",
      headers: { "Content-Type": "image/webp" },
      body: webpUint8,
    });
    if (!uploadRes.ok) {
      const t = await uploadRes.text();
      return NextResponse.json({ error: `Upload failed: ${t}` }, { status: 500 });
    }
    const { storageId } = (await uploadRes.json()) as { storageId: string };

    try {
      await client.mutation(api.media.replaceImage as any, {
        id: id as any,
        storageId: storageId as any,
        width: webpMeta.width ?? undefined,
        height: webpMeta.height ?? undefined,
        format: "webp",
        sizeBytes: webp.length,
      });
    } catch (e: any) {
      // Fallback for older backend without `sizeBytes` arg
      await client.mutation(api.media.replaceImage as any, {
        id: id as any,
        storageId: storageId as any,
        width: webpMeta.width ?? undefined,
        height: webpMeta.height ?? undefined,
        format: "webp",
      });
    }

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? "Unknown error" }, { status: 500 });
  }
}
