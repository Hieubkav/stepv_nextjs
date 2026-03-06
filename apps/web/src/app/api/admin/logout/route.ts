import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "@dohy/backend/convex/_generated/api";

export async function POST() {
  const cookieStore = await cookies();
  const token = cookieStore.get("admin_session_token")?.value;
  const convexUrl = process.env.CONVEX_URL ?? process.env.NEXT_PUBLIC_CONVEX_URL;
  if (token && convexUrl) {
    const client = new ConvexHttpClient(convexUrl);
    await client.mutation(api.adminAuth.logout, { token });
  }
  cookieStore.delete("admin_session_token");
  
  return NextResponse.json({ success: true });
}
