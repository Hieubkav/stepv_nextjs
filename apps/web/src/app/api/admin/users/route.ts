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

export async function GET(request: NextRequest) {
  try {
    const token = await getToken();
    if (!token) {
      return NextResponse.json({ error: "Chưa đăng nhập" }, { status: 401 });
    }
    const search = request.nextUrl.searchParams.get("search") ?? undefined;
    const statusParam = request.nextUrl.searchParams.get("status");
    const status = statusParam === "Active" || statusParam === "Inactive" ? statusParam : undefined;
    const client = getConvexClient();
    const users = await client.query(api.adminUsers.list, { search, status, token });
    return NextResponse.json({ users });
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
    const id = await client.mutation(api.adminUsers.create, { ...payload, token });
    return NextResponse.json({ id });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message ?? "Lỗi hệ thống" }, { status: 400 });
  }
}
