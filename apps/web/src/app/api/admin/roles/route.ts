import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "@dohy/backend/convex/_generated/api";

function getConvexClient() {
  const convexUrl = process.env.CONVEX_URL ?? process.env.NEXT_PUBLIC_CONVEX_URL;
  if (!convexUrl) {
    throw new Error("Thiếu cấu hình Convex");
  }
  return new ConvexHttpClient(convexUrl);
}

async function getToken() {
  const store = await cookies();
  return store.get("admin_session_token")?.value ?? "";
}

export async function GET() {
  try {
    const token = await getToken();
    if (!token) {
      return NextResponse.json({ error: "Chưa đăng nhập" }, { status: 401 });
    }
    const client = getConvexClient();
    const roles = await client.query(api.adminRoles.listAll, { token });
    return NextResponse.json({ roles });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message ?? "Lỗi hệ thống" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = await getToken();
    if (!token) {
      return NextResponse.json({ error: "Chưa đăng nhập" }, { status: 401 });
    }
    const payload = await request.json();
    const client = getConvexClient();
    const id = await client.mutation(api.adminRoles.create, { ...payload, token });
    return NextResponse.json({ id });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message ?? "Lỗi hệ thống" }, { status: 400 });
  }
}
