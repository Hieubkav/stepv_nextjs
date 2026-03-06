import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "@dohy/backend/convex/_generated/api";

export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get("admin_session_token")?.value;
  if (!token) {
    return NextResponse.json({ error: "Chưa đăng nhập" }, { status: 401 });
  }

  const convexUrl = process.env.CONVEX_URL ?? process.env.NEXT_PUBLIC_CONVEX_URL;
  if (!convexUrl) {
    return NextResponse.json({ error: "Thiếu cấu hình Convex" }, { status: 500 });
  }

  const client = new ConvexHttpClient(convexUrl);
  const result = await client.query(api.adminAuth.verifySession, { token });
  if (!result.valid || !result.user) {
    const response = NextResponse.json({ error: result.message }, { status: 401 });
    response.cookies.delete("admin_session_token");
    return response;
  }

  return NextResponse.json({ user: result.user });
}
