import { ConvexHttpClient } from "convex/browser";
import { NextRequest, NextResponse } from "next/server";
import { api } from "@dohy/backend/convex/_generated/api";

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json();
    const convexUrl = process.env.CONVEX_URL ?? process.env.NEXT_PUBLIC_CONVEX_URL;
    if (!convexUrl) {
      return NextResponse.json({ error: "Thiếu cấu hình Convex" }, { status: 500 });
    }

    const client = new ConvexHttpClient(convexUrl);
    const bootstrap = await client.mutation(api.adminAuth.ensureBootstrapAdminsFromEnv, {});
    if (!bootstrap.success) {
      return NextResponse.json({ error: bootstrap.message }, { status: 500 });
    }
    const result = await client.mutation(api.adminAuth.loginWithPassword, {
      username,
      password,
    });

    if (!result.success || !result.token) {
      return NextResponse.json({ error: result.message }, { status: 401 });
    }

    const ttlHours = Number(process.env.ADMIN_SESSION_TTL_HOURS ?? 8);
    const maxAge = (Number.isFinite(ttlHours) && ttlHours > 0 ? ttlHours : 8) * 60 * 60;
    const response = NextResponse.json({ success: true });
    response.cookies.set("admin_session_token", result.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge,
    });
    return response;
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
