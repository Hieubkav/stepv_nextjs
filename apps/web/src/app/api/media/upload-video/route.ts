import { NextRequest, NextResponse } from "next/server";
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
    const title = formData.get("title")?.toString().trim();

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "Missing file" }, { status: 400 });
    }

    if (!file.type.startsWith("video/")) {
      return NextResponse.json({ error: "Chỉ hỗ trợ tệp video" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    if (buffer.length === 0) {
      return NextResponse.json({ error: "File trống" }, { status: 400 });
    }

    const client = new ConvexHttpClient(convexUrl);
    const { uploadUrl } = await client.action(api.media.generateUploadUrl, {});

    const uploadRes = await fetch(uploadUrl, {
      method: "POST",
      headers: {
        "Content-Type": file.type || "application/octet-stream",
      },
      body: buffer,
    });

    if (!uploadRes.ok) {
      const message = await uploadRes.text();
      return NextResponse.json({ error: `Upload failed: ${message}` }, { status: 500 });
    }

    const { storageId } = (await uploadRes.json()) as { storageId: string };

    const id = await client.mutation(api.media.saveVideo as any, {
      title: title || undefined,
      storageId: storageId as any,
      format: file.type,
      sizeBytes: buffer.length,
    });

    return NextResponse.json({ id, storageId });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message ?? "Unknown error" }, { status: 500 });
  }
}

