import { NextResponse } from "next/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "@dohy/backend/convex/_generated/api";

export const dynamic = "force-dynamic";

export async function GET() {
  const convexUrl = process.env.CONVEX_URL ?? process.env.NEXT_PUBLIC_CONVEX_URL;
  if (!convexUrl) {
    return NextResponse.json({ error: "Missing CONVEX_URL" }, { status: 500 });
  }

  try {
    const client = new ConvexHttpClient(convexUrl);
    const result = await client.mutation(api.web_demos.migrateLegacyStats, {});
    return NextResponse.json({ success: true, result });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message ?? "Unknown error" }, { status: 500 });
  }
}
